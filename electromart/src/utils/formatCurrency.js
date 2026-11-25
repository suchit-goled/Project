/**
 * Format numeric amounts in INR using en-IN locale grouping.
 * Preserves tabular-nums compatibility.
 */
export const formatINR = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDateIN = (dateInput, options = {}) => {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
};
