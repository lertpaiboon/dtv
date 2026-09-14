import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Phone,
  PhoneCall,
  ReceiptText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import QuickLineCopy from '@/components/admin/QuickLineCopy';

const taxLabels: Record<string, string> = {
  PND51: 'ภ.ง.ด. 51',
  WHT_PND1: 'ภ.ง.ด. 1',
  WHT_PND3: 'ภ.ง.ด. 3',
  WHT_PND53: 'ภ.ง.ด. 53',
  VAT_PP30: 'ภ.พ. 30',
};

const statusLabels: Record<string, string> = {
  ADVANCED: 'สำรองจ่าย',
  WAITING_TRANSFER: 'รอโอนเงิน',
  PAID: 'จ่ายแล้ว',
  PENDING: 'รอดำเนินการ',
  UNBILLED: 'สำรองจ่าย',
  BILLED: 'รอโอนเงิน',
};

function money(value: unknown) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value || 0));
}

function displayDate(value: Date) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(value);
}

function formatPromisedDate(value: Date, now: Date) {
  const d = new Date(value);
  const targetDateStr = d.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);

  if (targetDateStr === todayStr) {
    return 'นัดชำระวันนี้';
  } else if (d.getTime() < now.getTime()) {
    const diffDays = Math.max(1, Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
    return `เลยกำหนด ${diffDays} วัน`;
  }
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' }).format(d);
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const allowedTypes = [
    hasPermission(session, 'pnd51:view') || hasPermission(session, '*') ? 'PND51' : null,
    hasPermission(session, 'wht:view') || hasPermission(session, '*') ? ['WHT_PND1', 'WHT_PND3', 'WHT_PND53'] : null,
    hasPermission(session, 'vat:view') || hasPermission(session, '*') ? 'VAT_PP30' : null,
  ].flat().filter((value): value is string => Boolean(value));

  const paymentWhere = allowedTypes.length ? { taxType: { in: allowedTypes } } : { id: -1 };
  const unpaidWhere = {
    ...paymentWhere,
    billingStatus: { in: ['ADVANCED', 'WAITING_TRANSFER', 'PENDING', 'UNBILLED', 'BILLED'] },
  };

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Parallel database queries
  const [
    unpaidPayments,
    recoveredMonthAgg,
    totalCompaniesCount,
    recentPayments,
  ] = await Promise.all([
    // 1. All unpaid tax payments with company, primary contact, payment method
    prisma.taxPayment.findMany({
      where: unpaidWhere,
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
      orderBy: { paymentDate: 'asc' },
    }),

    // 2. Recovered / reimbursed this month
    prisma.taxPayment.aggregate({
      where: {
        ...paymentWhere,
        billingStatus: 'PAID',
        OR: [
          { reimbursedAt: { gte: startOfMonth } },
          { reimbursedAt: null, paymentDate: { gte: startOfMonth } },
        ],
      },
      _sum: { amount: true },
      _count: true,
    }),

    // 3. Total active companies
    hasPermission(session, 'companies:view') || hasPermission(session, '*')
      ? prisma.company.count({ where: { isActive: true } })
      : Promise.resolve(0),

    // 4. Recent payments (audit ledger)
    prisma.taxPayment.findMany({
      where: paymentWhere,
      take: 6,
      orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
      include: { company: { select: { name: true } }, paymentMethod: { select: { name: true } } },
    }),
  ]);

  // Aggregate unpaid totals
  const totalUnpaidAmount = unpaidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalUnpaidCount = unpaidPayments.length;

  // 1. Calculate Top Debtors & Aging
  interface DebtorSummary {
    companyId: number;
    companyName: string;
    taxId: string | null;
    contactName: string | null;
    contactPhone: string | null;
    contactRole: string | null;
    totalAmount: number;
    oldestPaymentDate: Date;
    agingDays: number;
    itemCount: number;
  }

  const debtorMap = new Map<number, DebtorSummary>();
  for (const p of unpaidPayments) {
    const amt = Number(p.amount);
    const existing = debtorMap.get(p.companyId);
    const contact = p.company.contacts[0] || null;
    const contactPhone = contact?.phone || p.company.phone || null;

    if (!existing) {
      const diffTime = Math.max(0, now.getTime() - new Date(p.paymentDate).getTime());
      const agingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      debtorMap.set(p.companyId, {
        companyId: p.companyId,
        companyName: p.company.name,
        taxId: p.company.taxId,
        contactName: contact?.name || null,
        contactPhone,
        contactRole: contact?.roleTitle || null,
        totalAmount: amt,
        oldestPaymentDate: p.paymentDate,
        agingDays,
        itemCount: 1,
      });
    } else {
      existing.totalAmount += amt;
      existing.itemCount += 1;
      if (new Date(p.paymentDate).getTime() < new Date(existing.oldestPaymentDate).getTime()) {
        existing.oldestPaymentDate = p.paymentDate;
        const diffTime = Math.max(0, now.getTime() - new Date(p.paymentDate).getTime());
        existing.agingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
    }
  }

  const allDebtors = Array.from(debtorMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  const top5Debtors = allDebtors.slice(0, 5);
  const totalDebtorsCount = allDebtors.length;
  const unpaidCompanyIds = Array.from(debtorMap.keys());

  // 2. Query Action Items (Follow-ups promised today or overdue for companies that still owe money)
  const actionItems = (hasPermission(session, 'followup:view') || hasPermission(session, '*')) && unpaidCompanyIds.length > 0
    ? await prisma.followUpLog.findMany({
        where: {
          companyId: { in: unpaidCompanyIds },
          promisedDate: { lte: todayEnd },
        },
        orderBy: [{ promisedDate: 'asc' }, { createdAt: 'desc' }],
        take: 6,
        include: {
          company: {
            include: {
              contacts: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          contact: true,
        },
      })
    : [];

  // 3. Credit Card / Payment Method Exposure
  interface ExposureSummary {
    methodId: number;
    methodName: string;
    code: string;
    cardLastDigits: string | null;
    amount: number;
    count: number;
    percentage: number;
  }

  const exposureMap = new Map<number, ExposureSummary>();
  for (const p of unpaidPayments) {
    const amt = Number(p.amount);
    const existing = exposureMap.get(p.paymentMethodId);
    if (!existing) {
      exposureMap.set(p.paymentMethodId, {
        methodId: p.paymentMethodId,
        methodName: p.paymentMethod.name,
        code: p.paymentMethod.code,
        cardLastDigits: p.paymentMethod.cardLastDigits,
        amount: amt,
        count: 1,
        percentage: 0,
      });
    } else {
      existing.amount += amt;
      existing.count += 1;
    }
  }

  const exposures = Array.from(exposureMap.values()).sort((a, b) => b.amount - a.amount);
  for (const exp of exposures) {
    exp.percentage = totalUnpaidAmount > 0 ? (exp.amount / totalUnpaidAmount) * 100 : 0;
  }

  // 4. Aging Distribution Breakdown
  let agingNormalAmount = 0;
  let agingNormalCompanies = 0;
  let agingWarningAmount = 0;
  let agingWarningCompanies = 0;
  let agingDangerAmount = 0;
  let agingDangerCompanies = 0;

  for (const d of allDebtors) {
    if (d.agingDays < 15) {
      agingNormalAmount += d.totalAmount;
      agingNormalCompanies += 1;
    } else if (d.agingDays <= 30) {
      agingWarningAmount += d.totalAmount;
      agingWarningCompanies += 1;
    } else {
      agingDangerAmount += d.totalAmount;
      agingDangerCompanies += 1;
    }
  }

  const normalPct = totalUnpaidAmount > 0 ? (agingNormalAmount / totalUnpaidAmount) * 100 : 0;
  const warningPct = totalUnpaidAmount > 0 ? (agingWarningAmount / totalUnpaidAmount) * 100 : 0;
  const dangerPct = totalUnpaidAmount > 0 ? (agingDangerAmount / totalUnpaidAmount) * 100 : 0;

  // 5. Recovery Rate
  const recoveredMonthAmount = Number(recoveredMonthAgg._sum.amount || 0);
  const recoveredMonthCount = recoveredMonthAgg._count || 0;
  const totalInPlay = recoveredMonthAmount + totalUnpaidAmount;
  const recoveryRate = totalInPlay > 0 ? Math.round((recoveredMonthAmount / totalInPlay) * 100) : 0;

  const registerLink = hasPermission(session, 'vat:view')
    ? { href: '/admin/tax-vat', label: 'เปิดรายการภาษีมูลค่าเพิ่ม' }
    : hasPermission(session, 'wht:view')
      ? { href: '/admin/tax-wht', label: 'เปิดรายการภาษีหัก ณ ที่จ่าย' }
      : hasPermission(session, 'pnd51:view')
        ? { href: '/admin/tax-pnd51', label: 'เปิดรายการ ภ.ง.ด. 51' }
        : null;

  return (
    <div className="admin-dashboard">
      {/* Header Bar */}
      <header className="dashboard-head">
        <div>
          <div className="dashboard-head__badge">
            <TrendingUp size={14} />
            <span>Executive Cash Flow & Debt Recovery</span>
          </div>
          <h1>ภาพรวมการเงิน & ติดตามหนี้ภาษี</h1>
          <span>รายงานสภาพคล่องเงินสำรองจ่ายบัตรเครดิตสำนักงาน ลูกหนี้ค้างชำระ และการติดตามเรียกเก็บเงินคืน</span>
        </div>
        <div className="dashboard-head__actions">
          <Link href="/admin/billing" className="btn-head-billing">
            <ReceiptText size={16} />
            <span>ระบบรวมยอดวางบิล</span>
            <ChevronRight size={15} />
          </Link>
          <time dateTime={now.toISOString().slice(0, 10)}>
            {new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeZone: 'Asia/Bangkok' }).format(now)}
          </time>
        </div>
      </header>

      {/* KPI Ribbon (4 Main Metrics) */}
      <section className="dashboard-kpi-ribbon" aria-label="ดัชนีชี้วัดหลัก">
        {/* KPI 1: ยอดค้างชำระรวม */}
        <article className="kpi-card kpi-card--primary">
          <div className="kpi-card__top">
            <span className="kpi-card__label">ยอดค้างชำระรวม (AR Outstanding)</span>
            <div className="kpi-card__icon kpi-card__icon--navy">
              <ReceiptText size={20} />
            </div>
          </div>
          <strong className="kpi-card__value">{money(totalUnpaidAmount)}</strong>
          <div className="kpi-card__meta">
            <span>{totalDebtorsCount} บริษัทค้างชำระ</span>
            <span className="kpi-card__dot">•</span>
            <span>{totalUnpaidCount} รายการภาษี</span>
          </div>
        </article>

        {/* KPI 2: หนี้เกิน 30 วัน เสี่ยงสูง */}
        <article className="kpi-card kpi-card--danger">
          <div className="kpi-card__top">
            <span className="kpi-card__label">หนี้เสี่ยงสูงเกิน 30 วัน</span>
            <div className="kpi-card__icon kpi-card__icon--danger">
              <AlertTriangle size={20} />
            </div>
          </div>
          <strong className="kpi-card__value kpi-card__value--danger">{money(agingDangerAmount)}</strong>
          <div className="kpi-card__meta">
            <span>{agingDangerCompanies} บริษัทค้างนาน</span>
            <span className="kpi-card__dot">•</span>
            <span>{dangerPct.toFixed(1)}% ของยอดหนี้ทั้งหมด</span>
          </div>
        </article>

        {/* KPI 3: งานนัดชำระวันนี้ / เลยกำหนด */}
        <article className="kpi-card kpi-card--warning">
          <div className="kpi-card__top">
            <span className="kpi-card__label">นัดชำระวันนี้ & เลยกำหนด</span>
            <div className="kpi-card__icon kpi-card__icon--warning">
              <Clock size={20} />
            </div>
          </div>
          <strong className="kpi-card__value kpi-card__value--warning">{actionItems.length} งาน</strong>
          <div className="kpi-card__meta">
            <span>{actionItems.length > 0 ? 'ต้องติดตามเร่งด่วน' : 'ไม่มีรายการค้างติดตาม'}</span>
            <span className="kpi-card__dot">•</span>
            <span>บันทึกล่าสุด</span>
          </div>
        </article>

        {/* KPI 4: ยอดเรียกเก็บสำเร็จเดือนนี้ */}
        <article className="kpi-card kpi-card--success">
          <div className="kpi-card__top">
            <span className="kpi-card__label">เรียกเก็บสำเร็จเดือนนี้</span>
            <div className="kpi-card__icon kpi-card__icon--success">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <strong className="kpi-card__value kpi-card__value--success">{money(recoveredMonthAmount)}</strong>
          <div className="kpi-card__meta">
            <span>{recoveredMonthCount} รายการรับชำระ</span>
            <span className="kpi-card__dot">•</span>
            <span>อัตราเก็บเงิน {recoveryRate}%</span>
          </div>
        </article>
      </section>

      {/* 2-Column Executive Action Grid */}
      <section className="dashboard-executive-grid">
        {/* Left Column: Top 5 Debtors & Credit Card Exposure */}
        <div className="dashboard-col dashboard-col--left">
          {/* Widget 1: Top 5 Debtors */}
          <article className="dashboard-panel">
            <header className="dashboard-panel__head">
              <div>
                <div className="panel-title-wrap">
                  <Users size={18} className="panel-icon" />
                  <h2>5 อันดับลูกหนี้ค้างชำระสูงสุด</h2>
                </div>
                <p>เรียงตามยอดเงินสำรองจ่ายคงค้าง พร้อมช่องทางติดต่อและข้อความทวงถามด่วน</p>
              </div>
              <Link href="/admin/billing" className="panel-head-link">
                ดูทั้งหมด ({totalDebtorsCount}) <ChevronRight size={14} />
              </Link>
            </header>

            <div className="top-debtors-table-wrap">
              {top5Debtors.length > 0 ? (
                <table className="top-debtors-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}>#</th>
                      <th>บริษัท / ผู้ติดต่อ</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>อายุหนี้</th>
                      <th style={{ width: '115px', textAlign: 'right' }}>ยอดค้างชำระ</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top5Debtors.map((debtor, index) => {
                      const agingClass =
                        debtor.agingDays > 30
                          ? 'aging-pill--danger'
                          : debtor.agingDays >= 15
                            ? 'aging-pill--warning'
                            : 'aging-pill--normal';

                      return (
                        <tr key={debtor.companyId} className="top-debtor-row">
                          <td style={{ textAlign: 'center' }}>
                            <span className={`rank-badge rank-badge--${index + 1}`}>{index + 1}</span>
                          </td>
                          <td>
                            <div className="debtor-info">
                              <Link href={`/admin/billing?search=${encodeURIComponent(debtor.companyName)}`} className="debtor-name">
                                {debtor.companyName}
                              </Link>
                              <div className="debtor-contact">
                                <span>{debtor.contactName ? `คุณ${debtor.contactName}` : 'ฝ่ายบัญชี/การเงิน'}</span>
                                {debtor.contactRole && <span className="debtor-role">({debtor.contactRole})</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`aging-pill ${agingClass}`}>
                              {debtor.agingDays} วัน
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong className="debtor-amount">{money(debtor.totalAmount)}</strong>
                            <span className="debtor-count">{debtor.itemCount} รายการ</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="debtor-actions">
                              {debtor.contactPhone ? (
                                <a
                                  href={`tel:${debtor.contactPhone.replace(/\s+/g, '')}`}
                                  className="btn-debtor-phone"
                                  title={`โทร: ${debtor.contactPhone}`}
                                >
                                  <Phone size={12} />
                                  <span>โทร</span>
                                </a>
                              ) : (
                                <span className="btn-debtor-phone btn-debtor-phone--disabled" title="ไม่มีเบอร์โทร">
                                  <Phone size={12} />
                                </span>
                              )}
                              <QuickLineCopy
                                companyName={debtor.companyName}
                                contactName={debtor.contactName}
                                totalAmount={debtor.totalAmount}
                                agingDays={debtor.agingDays}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="panel-empty-state">
                  <CheckCircle2 size={32} />
                  <strong>ไม่มียอดลูกหนี้ค้างชำระ</strong>
                  <span>ยอดสำรองจ่ายได้รับการเคลียร์ครบถ้วนแล้ว</span>
                </div>
              )}
            </div>

            {totalDebtorsCount > 5 && (
              <footer className="panel-footer">
                <Link href="/admin/billing" className="panel-footer-link">
                  ยังมีอีกลูกหนี้อีก {totalDebtorsCount - 5} บริษัทในระบบรวมยอดวางบิล <ExternalLink size={13} />
                </Link>
              </footer>
            )}
          </article>

          {/* Widget 2: Office Credit Card Exposure */}
          <article className="dashboard-panel">
            <header className="dashboard-panel__head">
              <div>
                <div className="panel-title-wrap">
                  <CreditCard size={18} className="panel-icon" />
                  <h2>ภาระรอบบิลบัตรเครดิตสำนักงาน</h2>
                </div>
                <p>สรุปยอดเงินสำรองจ่ายแยกตามหน้าบัตร เพื่อวางแผนตัดรอบชำระของสำนักงาน</p>
              </div>
              <span className="panel-badge-navy">{money(totalUnpaidAmount)} รวมทั้งสิ้น</span>
            </header>

            <div className="exposure-list">
              {exposures.length > 0 ? (
                exposures.map((exp) => (
                  <div key={exp.methodId} className="exposure-item">
                    <div className="exposure-item__header">
                      <div className="exposure-item__title">
                        <span className={`method-dot method-dot--${exp.code.toLowerCase().includes('scb') ? 'scb' : exp.code.toLowerCase().includes('kbank') ? 'kbank' : exp.code.toLowerCase().includes('bbl') ? 'bbl' : 'other'}`} />
                        <strong>{exp.methodName}</strong>
                        {exp.cardLastDigits && <span className="card-digits">• {exp.cardLastDigits}</span>}
                      </div>
                      <div className="exposure-item__numbers">
                        <strong className="exposure-amount">{money(exp.amount)}</strong>
                        <span className="exposure-pct">{exp.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="exposure-progress-bg">
                      <div
                        className={`exposure-progress-fill exposure-progress-fill--${exp.code.toLowerCase().includes('scb') ? 'scb' : exp.code.toLowerCase().includes('kbank') ? 'kbank' : exp.code.toLowerCase().includes('bbl') ? 'bbl' : 'other'}`}
                        style={{ width: `${Math.min(100, Math.max(3, exp.percentage))}%` }}
                      />
                    </div>
                    <div className="exposure-item__sub">
                      <span>{exp.count} รายการภาษีที่สำรองจ่ายผ่านช่องทางนี้</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="panel-empty-state">
                  <CreditCard size={32} />
                  <strong>ไม่มีภาระสำรองจ่ายผ่านบัตรเครดิตสำนักงาน</strong>
                </div>
              )}
            </div>

            <footer className="exposure-notice">
              <Clock size={14} />
              <span>แนะนำให้ติดตามเก็บเงินคืนจากลูกค้าก่อนถึงวันตัดรอบบิลบัตรเครดิตเพื่อรักษาสภาพคล่องสำนักงาน</span>
            </footer>
          </article>
        </div>

        {/* Right Column: Aging Breakdown & Action Items */}
        <div className="dashboard-col dashboard-col--right">
          {/* Widget 3: AR Aging Distribution */}
          <article className="dashboard-panel">
            <header className="dashboard-panel__head">
              <div>
                <div className="panel-title-wrap">
                  <Clock size={18} className="panel-icon" />
                  <h2>การกระจายตัวตามอายุหนี้</h2>
                </div>
                <p>วิเคราะห์ความเสี่ยงของลูกหนี้คงค้างตามระยะเวลา</p>
              </div>
            </header>

            <div className="aging-overview-wrap">
              {/* Stacked Bar Meter */}
              <div className="aging-stacked-meter" title="สัดส่วนอายุหนี้ทั้งหมด">
                <div
                  className="meter-seg meter-seg--normal"
                  style={{ width: `${normalPct}%` }}
                  title={`ปกติ (<15 วัน): ${normalPct.toFixed(1)}%`}
                />
                <div
                  className="meter-seg meter-seg--warning"
                  style={{ width: `${warningPct}%` }}
                  title={`เริ่มเตือน (15-30 วัน): ${warningPct.toFixed(1)}%`}
                />
                <div
                  className="meter-seg meter-seg--danger"
                  style={{ width: `${dangerPct}%` }}
                  title={`เสี่ยงสูง (>30 วัน): ${dangerPct.toFixed(1)}%`}
                />
              </div>

              {/* 3 Tier Cards */}
              <div className="aging-tiers-list">
                {/* Normal */}
                <div className="aging-tier-card aging-tier-card--normal">
                  <div className="aging-tier-card__left">
                    <span className="aging-tier-indicator aging-tier-indicator--normal" />
                    <div>
                      <strong>ปกติ (&lt; 15 วัน)</strong>
                      <small>{agingNormalCompanies} บริษัท ({normalPct.toFixed(1)}%)</small>
                    </div>
                  </div>
                  <strong className="aging-tier-amount">{money(agingNormalAmount)}</strong>
                </div>

                {/* Warning */}
                <div className="aging-tier-card aging-tier-card--warning">
                  <div className="aging-tier-card__left">
                    <span className="aging-tier-indicator aging-tier-indicator--warning" />
                    <div>
                      <strong>เริ่มเตือน (15–30 วัน)</strong>
                      <small>{agingWarningCompanies} บริษัท ({warningPct.toFixed(1)}%)</small>
                    </div>
                  </div>
                  <strong className="aging-tier-amount aging-tier-amount--warning">{money(agingWarningAmount)}</strong>
                </div>

                {/* Danger */}
                <div className="aging-tier-card aging-tier-card--danger">
                  <div className="aging-tier-card__left">
                    <span className="aging-tier-indicator aging-tier-indicator--danger" />
                    <div>
                      <strong>เสี่ยงสูง (&gt; 30 วัน)</strong>
                      <small>{agingDangerCompanies} บริษัท ({dangerPct.toFixed(1)}%)</small>
                    </div>
                  </div>
                  <strong className="aging-tier-amount aging-tier-amount--danger">{money(agingDangerAmount)}</strong>
                </div>
              </div>
            </div>
          </article>

          {/* Widget 4: Today's Action Items & Broken Promises */}
          <article className="dashboard-panel">
            <header className="dashboard-panel__head">
              <div>
                <div className="panel-title-wrap">
                  <PhoneCall size={18} className="panel-icon" />
                  <h2>งานนัดชำระวันนี้ & เลยกำหนด</h2>
                </div>
                <p>รายการที่ลูกค้ารับปากจะโอนชำระ หรือผิดนัดที่ต้องโทรติดตามด่วน</p>
              </div>
              <span className={`badge-counter ${actionItems.length > 0 ? 'badge-counter--danger' : 'badge-counter--zero'}`}>
                {actionItems.length} งาน
              </span>
            </header>

            <div className="action-items-list">
              {actionItems.length > 0 ? (
                actionItems.map((item) => {
                  const isOverdue = item.promisedDate ? new Date(item.promisedDate).getTime() < now.getTime() : false;
                  const contactName = item.contact?.name || item.company.contacts[0]?.name;
                  const phone = item.contact?.phone || item.company.contacts[0]?.phone || item.company.phone;

                  return (
                    <div key={item.id} className="action-item-card">
                      <div className="action-item-card__header">
                        <div className="action-item-company-wrap">
                          <Link href={`/admin/billing?search=${encodeURIComponent(item.company.name)}`} className="action-item-company">
                            {item.company.name}
                          </Link>
                          {contactName && (
                            <span className="action-item-person">ติดต่อ: คุณ{contactName}</span>
                          )}
                        </div>
                        <span className={`action-item-date ${isOverdue ? 'action-item-date--overdue' : 'action-item-date--today'}`}>
                          {item.promisedDate ? formatPromisedDate(item.promisedDate, now) : 'นัดหมาย'}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="action-item-notes">"{item.notes}"</p>
                      )}

                      <div className="action-item-card__footer">
                        <div className="action-channel-badge">
                          {item.channel === 'LINE' ? <MessageSquare size={12} /> : <PhoneCall size={12} />}
                          <span>{item.channel === 'LINE' ? 'คุยทาง LINE' : 'โทรติดต่อ'}</span>
                        </div>
                        {phone && (
                          <a href={`tel:${phone.replace(/\s+/g, '')}`} className="btn-action-phone">
                            <Phone size={12} />
                            <span>โทร {phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="panel-empty-state">
                  <CheckCircle2 size={30} style={{ color: '#10b981' }} />
                  <strong>ไม่มีงานนัดชำระที่ค้างหรือผิดนัดวันนี้</strong>
                  <span>การติดตามเงินทดรองเป็นไปตามกำหนดนัดหมาย</span>
                </div>
              )}
            </div>

            <footer className="panel-footer">
              <Link href="/admin/billing" className="panel-footer-link">
                บันทึกการทวงถามเพิ่มเติมในระบบวางบิล <ChevronRight size={13} />
              </Link>
            </footer>
          </article>
        </div>
      </section>

      {/* System Facts Summary Bar */}
      <section className="dashboard-facts" aria-label="ข้อมูลระบบ">
        <article>
          <Building2 aria-hidden="true" size={19} />
          <span>
            <small>บริษัทที่ดูแลทั้งหมด</small>
            <strong>{totalCompaniesCount.toLocaleString('th-TH')} บริษัท</strong>
          </span>
        </article>
        <article>
          <ReceiptText aria-hidden="true" size={19} />
          <span>
            <small>บริษัทที่มีหนี้ค้างชำระ</small>
            <strong style={{ color: totalDebtorsCount > 0 ? '#b91c1c' : '#15803d' }}>
              {totalDebtorsCount.toLocaleString('th-TH')} บริษัท
            </strong>
          </span>
        </article>
        <article>
          <TrendingUp aria-hidden="true" size={19} />
          <span>
            <small>รับชำระคืนแล้วในเดือนนี้</small>
            <strong style={{ color: '#15803d' }}>{money(recoveredMonthAmount)}</strong>
          </span>
        </article>
      </section>

      {/* Audit Ledger: Recent Tax Transactions */}
      <section className="dashboard-ledger">
        <header>
          <div>
            <p>บันทึกล่าสุดในระบบ</p>
            <h2>รายการภาษีที่สำรองจ่ายล่าสุด</h2>
          </div>
          {registerLink && (
            <Link href={registerLink.href}>
              {registerLink.label} <ChevronRight aria-hidden="true" size={16} />
            </Link>
          )}
        </header>
        <div className="tax-table-wrap">
          <table className="tax-table">
            <thead>
              <tr>
                <th>บริษัท</th>
                <th>แบบภาษี</th>
                <th>วันที่ชำระ</th>
                <th>ช่องทางสำรองจ่าย</th>
                <th className="is-number">จำนวนเงิน</th>
                <th>สถานะการเรียกเก็บ</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong>{payment.company.name}</strong>
                  </td>
                  <td>{taxLabels[payment.taxType] || payment.taxType}</td>
                  <td>{displayDate(payment.paymentDate)}</td>
                  <td>{payment.paymentMethod.name}</td>
                  <td className="is-number">
                    <strong>{money(payment.amount)}</strong>
                  </td>
                  <td>
                    <span
                      className={`tax-status ${
                        payment.billingStatus === 'ADVANCED'
                          ? 'tax-status--advanced'
                          : payment.billingStatus === 'WAITING_TRANSFER'
                            ? 'tax-status--waiting_transfer'
                            : payment.billingStatus === 'PAID'
                              ? 'tax-status--paid'
                              : `tax-status--${payment.billingStatus.toLowerCase()}`
                      }`}
                    >
                      {statusLabels[payment.billingStatus] || payment.billingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentPayments.length === 0 && (
            <div className="tax-state">
              <ReceiptText aria-hidden="true" size={30} />
              <strong>ยังไม่มีรายการชำระภาษี</strong>
              <span>รายการใหม่จะแสดงที่นี่โดยอัตโนมัติ</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
