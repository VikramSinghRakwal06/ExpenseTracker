/**
 * Formats a number as Indian Rupees, keeping the minus sign in front of the
 * symbol (-₹2,500) rather than after it (₹-2,500).
 */
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString('en-IN')}`;
};
