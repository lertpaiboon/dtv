import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, ChevronRight, Clock3, PhoneCall, ReceiptText, WalletCards } from 'lucide-react';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const taxLabels: Record<string, string> = {
  PND51: 'ภ.ง.ด. 51', WHT_PND1: 'ภ.ง.ด. 1', WHT_PND3: 'ภ.ง.ด. 3', WHT_PND53: 'ภ.ง.ด. 53', VAT_PP30: 'ภ.พ. 30',
};

function money(value: unknown) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value || 0));
}

function displayDate(value: Date) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(value);
}

const statusLabels: Record<string, string> = {
  ADVANCED: 'สำรอง',
  WAITING_TRANSFER: 'รอโอน',
  PAID: 'จ่ายแล้ว',
  PENDING: 'รอดำเนินการ',
  UNBILLED: 'รอวางบิล',
  BILLED: 'วางบิลแล้ว',
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const allowedTypes = [
    hasPermission(session, 'pnd51:view') ? 'PND51' : null,
    hasPermission(session, 'wht:view') ? ['WHT_PND1', 'WHT_PND3', 'WHT_PND53'] : null,
    hasPermission(session, 'vat:view') ? 'VAT_PP30' : null,
  ].flat().filter((value): value is string => Boolean(value));

  const paymentWhere = allowedTypes.length ? { taxType: { in: allowedTypes } } : { id: -1 };
  const [grouped, companies, followUpCount, recentPayments] = await Promise.all([
    prisma.taxPayment.groupBy({ by: ['billingStatus'], where: paymentWhere, _sum: { amount: true }, _count: true }),
    hasPermission(session, 'companies:view') ? prisma.company.count({ where: { isActive: true } }) : Promise.resolve(0),
    hasPermission(session, 'followup:view') ? prisma.followUpLog.count() : Promise.resolve(0),
    prisma.taxPayment.findMany({
      where: paymentWhere,
      take: 8,
      orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
      include: { company: { select: { name: true } }, paymentMethod: { select: { name: true } } },
    }),
  ]);

  const summary = Object.fromEntries(grouped.map((item) => [item.billingStatus, { amount: item._sum.amount?.toString() || '0', count: item._count }]));
  const advancedAmount = Number(summary.ADVANCED?.amount || 0) + Number(summary.UNBILLED?.amount || 0) + Number(summary.BILLED?.amount || 0);
  const advancedCount = (summary.ADVANCED?.count || 0) + (summary.UNBILLED?.count || 0) + (summary.BILLED?.count || 0);
  const waitingAmount = Number(summary.WAITING_TRANSFER?.amount || 0);
  const waitingCount = summary.WAITING_TRANSFER?.count || 0;
  const paidAmount = Number(summary.PAID?.amount || 0);
  const registerLink = hasPermission(session, 'vat:view')
    ? { href: '/admin/tax-vat', label: 'เปิดรายการภาษีมูลค่าเพิ่ม' }
    : hasPermission(session, 'wht:view')
      ? { href: '/admin/tax-wht', label: 'เปิดรายการภาษีหัก ณ ที่จ่าย' }
      : hasPermission(session, 'pnd51:view')
        ? { href: '/admin/tax-pnd51', label: 'เปิดรายการ ภ.ง.ด. 51' }
        : null;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-head">
        <div>
          <p>ภาพรวมสำนักงาน</p>
          <h1>งานภาษีที่ต้องติดตาม</h1>
          <span>ดูเงินทดรองและสถานะรับคืนจากทุกแบบภาษีในหน้าจอเดียว</span>
        </div>
        <time dateTime={new Date().toISOString().slice(0, 10)}>{new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeZone: 'Asia/Bangkok' }).format(new Date())}</time>
      </header>

      <section className="dashboard-priority" aria-label="ยอดที่ต้องติดตาม">
        <div className="dashboard-priority__main">
          <span>ยอดเงินสำรองจ่ายที่ต้องตามเก็บ</span>
          <strong>{money(advancedAmount)}</strong>
          <small>{advancedCount} รายการสำรองจ่ายที่รอเคลียร์</small>
        </div>
        <div className="dashboard-priority__split">
          <article>
            <ReceiptText aria-hidden="true" size={20} />
            <span>สำรองจ่าย</span>
            <strong style={{ color: '#ff6b81' }}>{money(advancedAmount)}</strong>
            <small>{advancedCount} รายการ (สนง. จ่ายแทน)</small>
          </article>
          <article>
            <Clock3 aria-hidden="true" size={20} />
            <span>รอโอน</span>
            <strong style={{ color: '#fbbf24' }}>{money(waitingAmount)}</strong>
            <small>{waitingCount} รายการ (ลูกค้ารอโอน)</small>
          </article>
        </div>
      </section>

      <section className="dashboard-facts" aria-label="ข้อมูลระบบ">
        <article><Building2 aria-hidden="true" size={19} /><span><small>บริษัทที่ใช้งาน</small><strong>{companies.toLocaleString('th-TH')} บริษัท</strong></span></article>
        <article><PhoneCall aria-hidden="true" size={19} /><span><small>บันทึกการติดตาม</small><strong>{followUpCount.toLocaleString('th-TH')} ครั้ง</strong></span></article>
        <article><WalletCards aria-hidden="true" size={19} /><span><small>ยอดชำระ/รับคืนแล้ว</small><strong>{money(paidAmount)}</strong></span></article>
      </section>

      <section className="dashboard-ledger">
        <header><div><p>รายการล่าสุด</p><h2>การชำระภาษีทุกประเภท</h2></div>{registerLink && <Link href={registerLink.href}>{registerLink.label} <ChevronRight aria-hidden="true" size={16} /></Link>}</header>
        <div className="tax-table-wrap">
          <table className="tax-table">
            <thead><tr><th>บริษัท</th><th>แบบภาษี</th><th>วันที่ชำระ</th><th>ช่องทาง</th><th className="is-number">จำนวนเงิน</th><th>สถานะ</th></tr></thead>
            <tbody>{recentPayments.map((payment) => <tr key={payment.id}><td><strong>{payment.company.name}</strong></td><td>{taxLabels[payment.taxType] || payment.taxType}</td><td>{displayDate(payment.paymentDate)}</td><td>{payment.paymentMethod.name}</td><td className="is-number"><strong>{money(payment.amount)}</strong></td><td><span className={`tax-status ${payment.billingStatus === 'ADVANCED' ? 'tax-status--advanced' : payment.billingStatus === 'WAITING_TRANSFER' ? 'tax-status--waiting_transfer' : payment.billingStatus === 'PAID' ? 'tax-status--paid' : `tax-status--${payment.billingStatus.toLowerCase()}`}`}>{statusLabels[payment.billingStatus] || payment.billingStatus}</span></td></tr>)}</tbody>
          </table>
          {recentPayments.length === 0 && <div className="tax-state"><ReceiptText aria-hidden="true" size={30} /><strong>ยังไม่มีรายการชำระภาษี</strong><span>รายการใหม่จะแสดงที่นี่โดยอัตโนมัติ</span></div>}
        </div>
      </section>
    </div>
  );
}
