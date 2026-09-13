import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';
import {
  FOLLOW_UP_CHANNELS,
  FOLLOW_UP_RESULTS,
  asTrimmedText,
  isOneOf,
  parseDateOnly,
  parsePositiveId,
} from '@/lib/admin-domain';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'followup:view')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const taxPaymentId = searchParams.get('taxPaymentId');
  const channel = searchParams.get('channel');
  const result = searchParams.get('result');
  const search = asTrimmedText(searchParams.get('search'), 120);
  const requestedPage = Number(searchParams.get('page') || '1');
  const requestedPageSize = Number(searchParams.get('pageSize') || '100');
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isInteger(requestedPageSize) && requestedPageSize > 0
    ? Math.min(requestedPageSize, 100)
    : 100;

  try {
    const where: Prisma.FollowUpLogWhereInput = {};
    if (companyId) {
      const parsed = parsePositiveId(companyId);
      if (!parsed) return NextResponse.json({ success: false, error: 'รหัสบริษัทไม่ถูกต้อง' }, { status: 400 });
      where.companyId = parsed;
    }
    if (taxPaymentId) {
      const parsed = parsePositiveId(taxPaymentId);
      if (!parsed) return NextResponse.json({ success: false, error: 'รหัสรายการภาษีไม่ถูกต้อง' }, { status: 400 });
      where.taxPaymentId = parsed;
    }
    if (channel && isOneOf(channel, FOLLOW_UP_CHANNELS)) where.channel = channel;
    if (result === 'PROMISED') where.result = { in: ['PROMISED', 'PROMISED_TO_PAY'] };
    else if (result && isOneOf(result, FOLLOW_UP_RESULTS)) where.result = result;
    if (search) {
      where.OR = [
        { company: { name: { contains: search } } },
        { createdBy: { fullName: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const [logs, totalItems] = await Promise.all([
      prisma.followUpLog.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, phone: true, email: true },
          },
          contact: true,
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
          taxPayment: {
            select: { id: true, taxType: true, taxYear: true, taxMonth: true, amount: true, billingStatus: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.followUpLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
    });
  } catch (error) {
    console.error('Error fetching follow up logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch follow-up logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'followup:create')) {
    return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ในการบันทึกการติดตาม' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      companyId,
      contactId,
      taxPaymentId,
      channel = 'PHONE', // PHONE, LINE, EMAIL, IN_PERSON
      result,
      outcome,
      promisedDate,
      note,
      notes,
    } = body;

    const finalNotes = asTrimmedText(notes ?? note, 2000);
    const legacyResult = outcome === 'PROMISED_TO_PAY' ? 'PROMISED' : outcome;
    const finalResult = result ?? legacyResult ?? 'PROMISED';
    const parsedCompanyId = parsePositiveId(companyId);
    const parsedContactId = contactId ? parsePositiveId(contactId) : null;
    const parsedTaxPaymentId = taxPaymentId ? parsePositiveId(taxPaymentId) : null;
    const parsedPromisedDate = promisedDate ? parseDateOnly(promisedDate) : null;

    if (!parsedCompanyId) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุบริษัทที่ติดต่อ' }, { status: 400 });
    }

    if (!finalNotes) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกบันทึกรายละเอียดการพูดคุย' }, { status: 400 });
    }

    if (!isOneOf(channel, FOLLOW_UP_CHANNELS) || !isOneOf(finalResult, FOLLOW_UP_RESULTS)) {
      return NextResponse.json({ success: false, error: 'ช่องทางหรือผลการติดตามไม่ถูกต้อง' }, { status: 400 });
    }
    if (promisedDate && !parsedPromisedDate) {
      return NextResponse.json({ success: false, error: 'วันที่นัดชำระไม่ถูกต้อง' }, { status: 400 });
    }

    const [company, contact, payment] = await Promise.all([
      prisma.company.findUnique({ where: { id: parsedCompanyId }, select: { id: true } }),
      parsedContactId ? prisma.companyContact.findFirst({ where: { id: parsedContactId, companyId: parsedCompanyId }, select: { id: true } }) : null,
      parsedTaxPaymentId ? prisma.taxPayment.findFirst({ where: { id: parsedTaxPaymentId, companyId: parsedCompanyId }, select: { id: true } }) : null,
    ]);
    if (!company) return NextResponse.json({ success: false, error: 'ไม่พบบริษัทในระบบ' }, { status: 400 });
    if (parsedContactId && !contact) return NextResponse.json({ success: false, error: 'ผู้ติดต่อไม่ได้อยู่ในบริษัทนี้' }, { status: 400 });
    if (parsedTaxPaymentId && !payment) return NextResponse.json({ success: false, error: 'รายการภาษีไม่ได้อยู่ในบริษัทนี้' }, { status: 400 });

    const newLog = await prisma.followUpLog.create({
      data: {
        companyId: parsedCompanyId,
        contactId: parsedContactId,
        taxPaymentId: parsedTaxPaymentId,
        channel,
        result: finalResult,
        promisedDate: parsedPromisedDate,
        notes: finalNotes,
        createdById: session.id,
      },
      include: {
        company: true,
        contact: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: newLog });
  } catch (error) {
    console.error('Error logging follow-up:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถบันทึกประวัติการทวงถามได้' }, { status: 500 });
  }
}
