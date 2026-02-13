import { DcfInputs, DcfResult, YearData } from "./types";

export function calculateDcf(inputs: DcfInputs): DcfResult {
  const {
    baseYearSales,
    netDebt,
    sharesOutstanding,
    revenueGrowth,
    ebitdaMargin,
    daToSales,
    capexToSales,
    nwcToSales,
    taxRate,
    wacc,
    ltg,
  } = inputs;

  const waccExceedsLtg = wacc > ltg;

  // Year0のSalesを基準にYear1〜Year5を計算
  const yearData: YearData[] = [];
  let prevSales = baseYearSales;

  for (let i = 0; i < 5; i++) {
    const year = i + 1;
    const sales = prevSales * (1 + revenueGrowth[i]);
    const ebitda = sales * ebitdaMargin;
    const da = sales * daToSales;
    const ebit = ebitda - da;
    const nopat = ebit * (1 - taxRate);
    const capex = sales * capexToSales;
    const deltaNwc = (sales - prevSales) * nwcToSales;
    const fcff = nopat + da - capex - deltaNwc;
    const discountFactor = 1 / Math.pow(1 + wacc, year);
    const pvFcff = fcff * discountFactor;

    yearData.push({
      year,
      sales,
      ebitda,
      da,
      ebit,
      nopat,
      capex,
      deltaNwc,
      fcff,
      discountFactor,
      pvFcff,
    });

    prevSales = sales;
  }

  // Terminal Value (Gordon Growth Model)
  let terminalValue: number | null = null;
  let pvTerminalValue: number | null = null;

  if (waccExceedsLtg) {
    const fcff5 = yearData[4].fcff;
    terminalValue = (fcff5 * (1 + ltg)) / (wacc - ltg);
    pvTerminalValue = terminalValue / Math.pow(1 + wacc, 5);
  }

  // Enterprise Value
  const sumPvFcff = yearData.reduce((sum, y) => sum + y.pvFcff, 0);
  const enterpriseValue = sumPvFcff + (pvTerminalValue ?? 0);

  // Equity Value & Implied Price
  const equityValue = enterpriseValue - netDebt;
  const impliedPrice =
    sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;

  // TV/EV ratio
  const tvEvRatio =
    pvTerminalValue !== null && enterpriseValue !== 0
      ? pvTerminalValue / enterpriseValue
      : null;

  return {
    yearData,
    terminalValue,
    pvTerminalValue,
    enterpriseValue,
    equityValue,
    impliedPrice,
    tvEvRatio,
    waccExceedsLtg,
  };
}

/**
 * 感度分析: WACC × LTG のマトリクスでImplied Priceを計算
 */
export function calculateSensitivity(
  inputs: DcfInputs,
  waccRange: number[],
  ltgRange: number[]
): (number | null)[][] {
  return ltgRange.map((ltg) =>
    waccRange.map((wacc) => {
      if (wacc <= ltg) return null;
      const result = calculateDcf({ ...inputs, wacc, ltg });
      return result.impliedPrice;
    })
  );
}
