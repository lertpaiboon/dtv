import TaxPaymentsWorkspace from '@/components/admin/TaxPaymentsWorkspace';

export default function Pnd51Page() {
  return <TaxPaymentsWorkspace config={{ eyebrow: 'ภาษีเงินได้นิติบุคคล', title: 'ภ.ง.ด. 51', description: 'ติดตามเงินทดรอง การวางบิล และยอดรับคืนของภาษีครึ่งปี', types: [{ value: 'PND51', label: 'ภ.ง.ด. 51' }] }} />;
}
