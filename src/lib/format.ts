/**
 * 数値をカンマ区切り＋小数点2桁で表示
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * パーセンテージ表示
 */
export function formatPercent(value: number, decimals = 2): string {
  return (value * 100).toFixed(decimals) + "%";
}
