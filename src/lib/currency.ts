// Currency formatting utilities for Indonesian Rupiah

export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatIDRCompact = (amount: number): string => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`;
  }
  return formatIDR(amount);
};

// Mock exchange rates (1 IDR = x foreign currency)
export const exchangeRates: Record<string, number> = {
  USD: 0.000063, // 1 USD = ~15,873 IDR
  SGD: 0.000085, // 1 SGD = ~11,765 IDR
  EUR: 0.000058, // 1 EUR = ~17,241 IDR
  MYR: 0.00028,  // 1 MYR = ~3,571 IDR
  JPY: 0.0095,   // 1 JPY = ~105 IDR
  AUD: 0.000097, // 1 AUD = ~10,309 IDR
};

export const currencySymbols: Record<string, string> = {
  IDR: 'Rp',
  USD: '$',
  SGD: 'S$',
  EUR: '€',
  MYR: 'RM',
  JPY: '¥',
  AUD: 'A$',
};

export const convertFromIDR = (amountIDR: number, targetCurrency: string): number => {
  const rate = exchangeRates[targetCurrency];
  if (!rate) return amountIDR;
  return amountIDR * rate;
};

export const parseIDRInput = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
};

export const currencies = [
  { code: 'IDR', name: 'Rupiah', symbol: 'Rp' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];
