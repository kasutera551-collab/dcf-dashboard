export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number, decimals = 2): string {
  return "$" + formatNumber(value, decimals);
}

export function formatPercent(value: number, decimals = 2): string {
  return (value * 100).toFixed(decimals) + "%";
}
