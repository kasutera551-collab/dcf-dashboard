const FMP_BASE = "https://financialmodelingprep.com/stable";

export interface HistoricalYear {
  year: string;
  revenue: number;       // $M
  ebitda: number;        // $M
  da: number;            // $M
  capex: number;         // $M
  fcff: number;          // $M
  revenueYoY: number | null;  // YoY growth rate (null for first year)
  capexToRevenue: number;     // CapEx / Revenue
  ebitdaMargin: number;       // EBITDA / Revenue
}

export interface CompanyData {
  ticker: string;
  name: string;
  currentPrice: number;
  sharesOutstanding: number; // millions
  netDebt: number;           // $M
  historicalYears: HistoricalYear[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      "Invalid API key. Get a free key at https://site.financialmodelingprep.com/register",
    );
  }
  if (res.status === 429) {
    throw new Error("API rate limit reached. Free tier allows 250 calls/day.");
  }
  if (!res.ok) throw new Error(`API error (${res.status})`);
  const data = await res.json();
  if (data && typeof data === "object" && "Error Message" in data) {
    throw new Error(data["Error Message"]);
  }
  if (typeof data === "string") throw new Error(data);
  return data as T;
}

interface FmpQuote {
  symbol: string;
  name: string;
  price: number;
  sharesOutstanding?: number;
  marketCap?: number;
}

interface FmpIncome {
  calendarYear?: string;
  fiscalYear?: string;
  date: string;
  revenue: number;
  ebitda: number;
  depreciationAndAmortization: number;
  interestExpense: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
}

interface FmpCashFlow {
  calendarYear?: string;
  fiscalYear?: string;
  date: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
}

interface FmpBalance {
  netDebt: number;
}

export async function fetchCompanyData(
  ticker: string,
  apiKey: string,
): Promise<CompanyData> {
  const sym = encodeURIComponent(ticker.toUpperCase().trim());
  const q = `apikey=${apiKey}`;

  const [quotes, incomes, cashFlows, balanceSheets] = await Promise.all([
    fetchJson<FmpQuote[]>(`${FMP_BASE}/quote?symbol=${sym}&${q}`),
    fetchJson<FmpIncome[]>(`${FMP_BASE}/income-statement?symbol=${sym}&limit=5&${q}`),
    fetchJson<FmpCashFlow[]>(`${FMP_BASE}/cash-flow-statement?symbol=${sym}&limit=5&${q}`),
    fetchJson<FmpBalance[]>(`${FMP_BASE}/balance-sheet-statement?symbol=${sym}&limit=1&${q}`),
  ]);

  if (!Array.isArray(quotes) || quotes.length === 0) {
    throw new Error(`Ticker "${ticker.toUpperCase()}" not found`);
  }

  const quote = quotes[0];
  const bs = balanceSheets?.[0];
  const toM = (v: number | null | undefined) => (v ?? 0) / 1_000_000;

  const getYear = (r: { calendarYear?: string; fiscalYear?: string; date: string }) =>
    r.calendarYear ?? r.fiscalYear ?? r.date.slice(0, 4);

  const cfMap = new Map<string, FmpCashFlow>();
  for (const cf of cashFlows) cfMap.set(getYear(cf), cf);

  const sorted = incomes
    .map((inc) => {
      const cf = cfMap.get(getYear(inc));
      const taxRate =
        inc.incomeBeforeTax > 0
          ? inc.incomeTaxExpense / inc.incomeBeforeTax
          : 0.21;
      const ocf = cf?.operatingCashFlow ?? 0;
      const capexRaw = cf?.capitalExpenditure ?? 0; // negative in FMP
      const interest = inc.interestExpense ?? 0;
      const rev = toM(inc.revenue);
      const capex = toM(Math.abs(capexRaw));
      const ebitda = toM(inc.ebitda);

      return {
        year: getYear(inc),
        revenue: rev,
        ebitda,
        da: toM(inc.depreciationAndAmortization),
        capex,
        fcff: toM(ocf + interest * (1 - taxRate) + capexRaw),
        revenueYoY: null as number | null,
        capexToRevenue: rev > 0 ? capex / rev : 0,
        ebitdaMargin: rev > 0 ? ebitda / rev : 0,
      };
    })
    .sort((a, b) => a.year.localeCompare(b.year));

  // Compute YoY revenue growth
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].revenue;
    if (prev > 0) {
      sorted[i].revenueYoY = (sorted[i].revenue - prev) / prev;
    }
  }

  const historicalYears: HistoricalYear[] = sorted;

  return {
    ticker: ticker.toUpperCase().trim(),
    name: quote.name,
    currentPrice: quote.price,
    sharesOutstanding:
      quote.sharesOutstanding
        ? quote.sharesOutstanding / 1_000_000
        : quote.marketCap && quote.price
          ? quote.marketCap / quote.price / 1_000_000
          : 0,
    netDebt: bs ? toM(bs.netDebt) : 0,
    historicalYears,
  };
}
