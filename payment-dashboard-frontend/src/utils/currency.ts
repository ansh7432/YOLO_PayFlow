/**
 * Utility functions for currency formatting
 */

/**
 * Format amount in Indian Rupees with proper formatting
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format amount in Indian number system (lakhs, crores)
 * @param amount - The amount to format
 * @returns Formatted number string with ₹ symbol
 */
export const formatIndianCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    // Crores
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    // Lakhs
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) {
    // Thousands
    return `₹${(amount / 1000).toFixed(2)} K`;
  }
  return `₹${amount.toFixed(2)}`;
};

/**
 * Parse Indian currency string to number
 * @param currencyString - The currency string to parse
 * @returns Parsed number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and commas
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (): string => '₹';

/**
 * Get currency code
 */
export const getCurrencyCode = (): string => 'INR';
