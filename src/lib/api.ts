const FMP_BASE = "https://financialmodelingprep.com/stable";

export interface HistoricalYear {
  year: string;
  revenue: number;  // $M
  ebitda: number;   // $M
  da: number;       // $M
  capex: number;    // $M
  fcff: number;     // $M
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
  sharesOutstanding: number;
}

interface FmpIncome {
  calendarYear: string;
  revenue: number;
  ebitda: number;
  depreciationAndAmortization: number;
  interestExpense: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
}

interface FmpCashFlow {
  calendarYear: string;
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
    fetchJson<FmpIncome[]>(`${FMP_BASE}/income-statement?symbol=${sym}&limit=3&${q}`),
    fetchJson<FmpCashFlow[]>(`${FMP_BASE}/cash-flow-statement?symbol=${sym}&limit=3&${q}`),
    fetchJson<FmpBalance[]>(`${FMP_BASE}/balance-sheet-statement?symbol=${sym}&limit=1&${q}`),
  ]);

  if (!Array.isArray(quotes) || quotes.length === 0) {
    throw new Error(`Ticker "${ticker.toUpperCase()}" not found`);
  }

  const quote = quotes[0];
  const bs = balanceSheets?.[0];
  const toM = (v: number | null | undefined) => (v ?? 0) / 1_000_000;

  const cfMap = new Map<string, FmpCashFlow>();
  for (const cf of cashFlows) cfMap.set(cf.calendarYear, cf);

  const historicalYears: HistoricalYear[] = incomes
    .map((inc) => {
      const cf = cfMap.get(inc.calendarYear);
      const taxRate =
        inc.incomeBeforeTax > 0
          ? inc.incomeTaxExpense / inc.incomeBeforeTax
          : 0.21;
      const ocf = cf?.operatingCashFlow ?? 0;
      const capexRaw = cf?.capitalExpenditure ?? 0; // negative in FMP
      const interest = inc.interestExpense ?? 0;

      return {
        year: inc.calendarYear,
        revenue: toM(inc.revenue),
        ebitda: toM(inc.ebitda),
        da: toM(inc.depreciationAndAmortization),
        capex: toM(Math.abs(capexRaw)),
        fcff: toM(ocf + interest * (1 - taxRate) + capexRaw),
      };
    })
    .sort((a, b) => a.year.localeCompare(b.year));

  return {
    ticker: ticker.toUpperCase().trim(),
    name: quote.name,
    currentPrice: quote.price,
    sharesOutstanding: (quote.sharesOutstanding ?? 0) / 1_000_000,
    netDebt: bs ? toM(bs.netDebt) : 0,
    historicalYears,
  };
}
