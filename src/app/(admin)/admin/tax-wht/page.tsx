import TaxPaymentsWorkspace from '@/components/admin/TaxPaymentsWorkspace';

export default function WithholdingTaxPage() {
  return <TaxPaymentsWorkspace config={{ eyebrow: 'ภาษีรายเดือน', title: 'ภาษีหัก ณ ที่จ่าย', description: 'บันทึกและติดตามยอด ภ.ง.ด. 1, 3 และ 53 แยกตามงวด', monthly: true, types: [{ value: 'WHT_PND1', label: 'ภ.ง.ด. 1' }, { value: 'WHT_PND3', label: 'ภ.ง.ด. 3' }, { value: 'WHT_PND53', label: 'ภ.ง.ด. 53' }] }} />;
}
