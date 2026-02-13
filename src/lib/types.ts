export interface DcfInputs {
  baseYearSales: number;       // $M
  netDebt: number;             // $M
  sharesOutstanding: number;   // millions of shares
  currentStockPrice: number;   // $ per share

  revenueGrowth: [number, number, number, number, number];

  ebitdaMargin: number;
  daToSales: number;
  capexToSales: number;
  nwcToSales: number;
  taxRate: number;

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
  baseYearSales: 50000,        // $50B
  netDebt: 10000,              // $10B
  sharesOutstanding: 1000,     // 1B shares
  currentStockPrice: 150,      // $150
  revenueGrowth: [0.05, 0.05, 0.04, 0.04, 0.03],
  ebitdaMargin: 0.15,
  daToSales: 0.03,
  capexToSales: 0.04,
  nwcToSales: 0.05,
  taxRate: 0.21,               // US corporate tax rate
  wacc: 0.09,
  ltg: 0.025,
};
