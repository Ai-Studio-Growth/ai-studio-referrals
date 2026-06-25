/** Supported display currencies (advertiser-selectable per workspace). */
export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

/** Format integer cents into a localized currency string. */
export function money(cents: number, currency = 'USD'): string {
  const zeroDecimal = currency === 'JPY';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2,
    }).format(cents / (zeroDecimal ? 1 : 100));
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
