export const TAX_TYPES = ['PND51', 'WHT_PND1', 'WHT_PND3', 'WHT_PND53', 'VAT_PP30'] as const;
export type TaxType = (typeof TAX_TYPES)[number];

export const BILLING_STATUSES = [
  'ADVANCED',
  'WAITING_TRANSFER',
  'PAID',
  'PENDING',
  'UNBILLED',
  'BILLED',
] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

export const FOLLOW_UP_CHANNELS = ['PHONE', 'LINE', 'EMAIL', 'IN_PERSON', 'OTHER'] as const;
export const FOLLOW_UP_RESULTS = ['PROMISED', 'NO_ANSWER', 'REJECTED', 'PAID'] as const;

export function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === 'string' && values.includes(value as T[number]);
}

export function permissionForTaxType(taxType: TaxType, action: 'view' | 'create' | 'edit' | 'delete') {
  if (taxType.startsWith('WHT_')) return `wht:${action}`;
  if (taxType === 'VAT_PP30') return `vat:${action}`;
  return `pnd51:${action}`;
}

export function parsePositiveId(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function normalizeMoney(value: unknown): string | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(raw) || Number(raw) <= 0) return null;
  return Number(raw).toFixed(2);
}

export function normalizeTaxYear(value: unknown): string | null {
  const year = typeof value === 'string' ? value.trim() : String(value ?? '');
  return /^(?:25|26)\d{2}$/.test(year) ? year : null;
}

export function normalizeTaxMonth(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  const month = String(value).padStart(2, '0');
  return /^(0[1-9]|1[0-2])$/.test(month) ? month : null;
}

export function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function asTrimmedText(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text.slice(0, maxLength) : null;
}
