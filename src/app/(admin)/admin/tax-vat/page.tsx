import TaxPaymentsWorkspace from '@/components/admin/TaxPaymentsWorkspace';

export default function VatPage() {
  return <TaxPaymentsWorkspace config={{ eyebrow: 'ภาษีรายเดือน', title: 'ภาษีมูลค่าเพิ่ม ภ.พ. 30', description: 'ติดตามยอดชำระ การวางบิล และยอดรับคืนแยกตามเดือน', monthly: true, types: [{ value: 'VAT_PP30', label: 'ภ.พ. 30' }] }} />;
}
