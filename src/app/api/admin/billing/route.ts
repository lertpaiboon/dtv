import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { normalizeTaxMonth, normalizeTaxYear } from '@/lib/admin-domain';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Permission check
  const canView =
    hasPermission(session, '*') ||
    hasPermission(session, 'vat:view') ||
    hasPermission(session, 'wht:view') ||
    hasPermission(session, 'pnd51:view');

  if (!canView) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const currentGregorianYear = new Date().getUTCFullYear();
  const taxYear = normalizeTaxYear(searchParams.get('taxYear')) || String(currentGregorianYear + 543);
  const taxMonth = normalizeTaxMonth(searchParams.get('taxMonth')) || String(new Date().getUTCMonth() + 1).padStart(2, '0');
  const statusFilter = searchParams.get('status') || '';
  const search = searchParams.get('search')?.trim().toLowerCase() || '';

  try {
    // 1. Find all tax payments for the given year and month (and PND51 for the year if requested)
    const paymentWhere: Prisma.TaxPaymentWhereInput = {
      taxYear,
      OR: [
        { taxMonth },
        { taxType: 'PND51' }, // PND51 is annual half-year
      ],
    };

    const allPaymentsInPeriod = await prisma.taxPayment.findMany({
      where: paymentWhere,
      include: {
        company: {
          include: {
            contacts: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        paymentMethod: true,
      },
      orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
    });

    // 2. Fetch recent follow-up logs for companies in this period
    const companyIds = Array.from(new Set(allPaymentsInPeriod.map((p) => p.companyId)));
    const followUpLogs = await prisma.followUpLog.findMany({
      where: { companyId: { in: companyIds } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const followUpMapByCompany: Record<number, typeof followUpLogs[number]> = {};
    const followUpCountByCompany: Record<number, number> = {};
    for (const log of followUpLogs) {
      if (!followUpMapByCompany[log.companyId]) {
        followUpMapByCompany[log.companyId] = log;
      }
      followUpCountByCompany[log.companyId] = (followUpCountByCompany[log.companyId] || 0) + 1;
    }

    // 3. Group payments by company
    const groupedByCompany = new Map<number, {
      company: {
        id: number;
        name: string;
        taxId: string | null;
        phone: string | null;
        email: string | null;
        primaryContact: {
          name: string;
          roleTitle: string | null;
          phone: string | null;
          email: string | null;
          lineId: string | null;
        } | null;
      };
      payments: typeof allPaymentsInPeriod;
    }>();

    for (const p of allPaymentsInPeriod) {
      if (!groupedByCompany.has(p.companyId)) {
        const contact = p.company.contacts[0] || null;
        groupedByCompany.set(p.companyId, {
          company: {
            id: p.company.id,
            name: p.company.name,
            taxId: p.company.taxId,
            phone: p.company.phone,
            email: p.company.email,
            primaryContact: contact
              ? {
                  name: contact.name,
                  roleTitle: contact.roleTitle,
                  phone: contact.phone,
                  email: contact.email,
                  lineId: contact.lineId,
                }
              : null,
          },
          payments: [],
        });
      }
      groupedByCompany.get(p.companyId)!.payments.push(p);
    }

    // 4. Format each company's consolidated billing statement
    const billingStatements = [];
    let grandTotal = 0;
    let totalUnbilled = 0;
    let unbilledCount = 0;
    let totalBilled = 0;
    let billedCount = 0;
    let totalPaid = 0;
    let paidCount = 0;
    let totalPending = 0;
    let pendingCount = 0;

    for (const [, item] of groupedByCompany.entries()) {
      const { company, payments } = item;

      let companyTotal = 0;
      let vatPayment: { id: number; amount: number; status: string } | null = null;
      let pnd1Payment: { id: number; amount: number; status: string } | null = null;
      let pnd3Payment: { id: number; amount: number; status: string } | null = null;
      let pnd53Payment: { id: number; amount: number; status: string } | null = null;
      let pnd51Payment: { id: number; amount: number; status: string } | null = null;

      const paymentIds: number[] = [];
      const paymentStatuses = new Set<string>();

      for (const p of payments) {
        const amt = Number(p.amount);
        companyTotal += amt;
        paymentIds.push(p.id);
        paymentStatuses.add(p.billingStatus);

        const summaryItem = { id: p.id, amount: amt, status: p.billingStatus };
        if (p.taxType === 'VAT_PP30') vatPayment = summaryItem;
        else if (p.taxType === 'WHT_PND1') pnd1Payment = summaryItem;
        else if (p.taxType === 'WHT_PND3') pnd3Payment = summaryItem;
        else if (p.taxType === 'WHT_PND53') pnd53Payment = summaryItem;
        else if (p.taxType === 'PND51') pnd51Payment = summaryItem;
      }

      // Determine overall company status for this period
      let overallStatus: 'UNBILLED' | 'BILLED' | 'PAID' | 'PENDING' = 'UNBILLED';
      if (Array.from(paymentStatuses).every((s) => s === 'PAID')) {
        overallStatus = 'PAID';
        totalPaid += companyTotal;
        paidCount++;
      } else if (paymentStatuses.has('PENDING')) {
        overallStatus = 'PENDING';
        totalPending += companyTotal;
        pendingCount++;
      } else if (paymentStatuses.has('BILLED') || paymentStatuses.has('WAITING_TRANSFER')) {
        overallStatus = 'BILLED';
        totalBilled += companyTotal;
        billedCount++;
      } else {
        overallStatus = 'UNBILLED'; // ADVANCED or UNBILLED
        totalUnbilled += companyTotal;
        unbilledCount++;
      }

      grandTotal += companyTotal;

      // Filter by search query if present
      if (search) {
        const matchName = company.name.toLowerCase().includes(search);
        const matchTaxId = (company.taxId || '').includes(search);
        const matchContact = (company.primaryContact?.name || '').toLowerCase().includes(search);
        if (!matchName && !matchTaxId && !matchContact) continue;
      }

      // Filter by status if present
      if (statusFilter) {
        if (statusFilter === 'UNBILLED' && overallStatus !== 'UNBILLED') continue;
        if (statusFilter === 'BILLED' && overallStatus !== 'BILLED') continue;
        if (statusFilter === 'PAID' && overallStatus !== 'PAID') continue;
        if (statusFilter === 'PENDING' && overallStatus !== 'PENDING') continue;
      }

      const lastLog = followUpMapByCompany[company.id];

      billingStatements.push({
        company,
        taxes: {
          vat: vatPayment,
          pnd1: pnd1Payment,
          pnd3: pnd3Payment,
          pnd53: pnd53Payment,
          pnd51: pnd51Payment,
        },
        totalAmount: companyTotal,
        overallStatus,
        slipUrl: payments.find((p) => p.slipUrl)?.slipUrl || null,
        reimbursementRef: payments.find((p) => p.reimbursementRef)?.reimbursementRef || null,
        paymentIds,
        payments: payments.map((p) => ({
          id: p.id,
          taxType: p.taxType,
          taxYear: p.taxYear,
          taxMonth: p.taxMonth,
          paymentDate: p.paymentDate.toISOString().slice(0, 10),
          amount: Number(p.amount),
          billingStatus: p.billingStatus,
          paymentMethod: p.paymentMethod.name,
          referenceNo: p.referenceNo,
          reimbursementRef: p.reimbursementRef,
          slipUrl: p.slipUrl,
          slipFileName: p.slipFileName,
          reimbursedAt: p.reimbursedAt ? p.reimbursedAt.toISOString().slice(0, 10) : null,
          note: p.note,
        })),
        followUpCount: followUpCountByCompany[company.id] || 0,
        lastFollowUp: lastLog
          ? {
              channel: lastLog.channel,
              result: lastLog.result,
              promisedDate: lastLog.promisedDate ? lastLog.promisedDate.toISOString().slice(0, 10) : null,
              notes: lastLog.notes,
              createdAt: lastLog.createdAt.toISOString(),
            }
          : null,
      });
    }

    // Sort: Unbilled first, then Billed, then Pending, then Paid; then by totalAmount desc
    const statusOrder: Record<string, number> = { UNBILLED: 1, BILLED: 2, PENDING: 3, PAID: 4 };
    billingStatements.sort((a, b) => {
      const orderA = statusOrder[a.overallStatus] || 99;
      const orderB = statusOrder[b.overallStatus] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return b.totalAmount - a.totalAmount;
    });

    return NextResponse.json({
      success: true,
      data: billingStatements,
      meta: {
        taxYear,
        taxMonth,
        totalCompanies: billingStatements.length,
        grandTotal,
        unbilled: { count: unbilledCount, amount: totalUnbilled },
        billed: { count: billedCount, amount: totalBilled },
        paid: { count: paidCount, amount: totalPaid },
        pending: { count: pendingCount, amount: totalPending },
      },
    });
  } catch (error) {
    console.error('Error fetching billing statement:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถโหลดข้อมูลยอดวางบิลได้' }, { status: 500 });
  }
}
