export interface DcfInputs {
  // 基本情報
  baseYearSales: number;
  netDebt: number;
  sharesOutstanding: number;
  currentStockPrice: number;

  // 成長率 (Year1〜Year5)
  revenueGrowth: [number, number, number, number, number];

  // 収益性
  ebitdaMargin: number;
  daToSales: number;
  capexToSales: number;
  nwcToSales: number;
  taxRate: number;

  // 割引関連
  wacc: number;
  ltg: number;
}

export interface YearData {
  year: number;
  sales: number;
  ebitda: number;
  da: number;
  ebit: number;
  nopat: number;
  capex: number;
  deltaNwc: number;
  fcff: number;
  discountFactor: number;
  pvFcff: number;
}

export interface DcfResult {
  yearData: YearData[];
  terminalValue: number | null;
  pvTerminalValue: number | null;
  enterpriseValue: number;
  equityValue: number;
  impliedPrice: number;
  tvEvRatio: number | null;
  waccExceedsLtg: boolean;
}

export const DEFAULT_INPUTS: DcfInputs = {
  baseYearSales: 1000000,
  netDebt: 200000,
  sharesOutstanding: 100000,
  currentStockPrice: 5000,
  revenueGrowth: [0.05, 0.05, 0.04, 0.04, 0.03],
  ebitdaMargin: 0.15,
  daToSales: 0.03,
  capexToSales: 0.04,
  nwcToSales: 0.05,
  taxRate: 0.30,
  wacc: 0.08,
  ltg: 0.02,
};
