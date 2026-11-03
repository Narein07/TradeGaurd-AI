// Helper utility for Indian Rupee (INR) formatting in Crores and Lakhs

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10_000_000) {
    // 1 Crore = 10,000,000 (100 Lakhs)
    return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`;
  } else if (abs >= 100_000) {
    // 1 Lakh = 100,000
    return `${sign}₹${(abs / 100_000).toFixed(2)} L`;
  } else if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1)}k`;
  }

  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatIndianNumber(num: number): string {
  return num.toLocaleString('en-IN');
}
