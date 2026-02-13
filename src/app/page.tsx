"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DcfInputs, DEFAULT_INPUTS } from "@/lib/types";
import { calculateDcf } from "@/lib/dcf";
import { fetchCompanyData, CompanyData } from "@/lib/api";
import DashboardTab from "@/components/DashboardTab";
import InputsTab from "@/components/InputsTab";
import ModelTab from "@/components/ModelTab";
import SensitivityTab from "@/components/SensitivityTab";

type Tab = "dashboard" | "inputs" | "model" | "sensitivity";

const TABS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "inputs", label: "Inputs" },
  { key: "model", label: "Model" },
  { key: "sensitivity", label: "Sensitivity" },
];

const API_KEY_KEY = "fmp_api_key";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [inputs, setInputs] = useState<DcfInputs>(DEFAULT_INPUTS);

  const [ticker, setTicker] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_KEY);
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_KEY, key);
  };

  const result = useMemo(() => calculateDcf(inputs), [inputs]);

  const handleFetch = useCallback(async () => {
    const t = ticker.trim();
    if (!t) return;
    if (!apiKey.trim()) {
      setError("Please set your FMP API key first.");
      setShowApiKey(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCompanyData(t, apiKey);
      setCompanyData(data);

      const latest = data.historicalYears[data.historicalYears.length - 1];
      if (latest) {
        const years = data.historicalYears;
        const growths: number[] = [];
        for (let i = 1; i < years.length; i++) {
          if (years[i - 1].revenue > 0) {
            growths.push(
              (years[i].revenue - years[i - 1].revenue) / years[i - 1].revenue,
            );
          }
        }
        const avg =
          growths.length > 0
            ? growths.reduce((a, b) => a + b, 0) / growths.length
            : 0.05;
        const g = Math.max(-0.1, Math.min(0.5, avg));
        const r3 = (v: number) => Math.round(v * 1000) / 1000;

        const margin =
          latest.revenue > 0 ? latest.ebitda / latest.revenue : 0.15;
        const da = latest.revenue > 0 ? latest.da / latest.revenue : 0.03;
        const cx = latest.revenue > 0 ? latest.capex / latest.revenue : 0.04;

        setInputs((prev) => ({
          ...prev,
          baseYearSales: Math.round(latest.revenue),
          currentStockPrice: Math.round(data.currentPrice * 100) / 100,
          sharesOutstanding: Math.round(data.sharesOutstanding),
          netDebt: Math.round(data.netDebt),
          revenueGrowth: [
            r3(g),
            r3(g),
            r3(g * 0.8),
            r3(g * 0.6),
            r3(g * 0.4),
          ],
          ebitdaMargin: r3(margin),
          daToSales: r3(da),
          capexToSales: r3(cx),
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [ticker, apiKey]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                DCF Valuation Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Intrinsic value calculator using FCFF-based DCF analysis
              </p>
            </div>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md"
            >
              API Key
            </button>
          </div>

          {showApiKey && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="Paste your FMP API key here"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowApiKey(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Done
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Free key:{" "}
                <a
                  href="https://site.financialmodelingprep.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  site.financialmodelingprep.com/register
                </a>
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="Ticker (e.g. AAPL)"
              className="w-44 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleFetch}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Fetch"}
            </button>
            {companyData && (
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{companyData.name}</span>
                {" | $"}
                {companyData.currentPrice.toFixed(2)}
              </span>
            )}
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && (
          <DashboardTab
            inputs={inputs}
            result={result}
            companyData={companyData}
          />
        )}
        {activeTab === "inputs" && (
          <InputsTab inputs={inputs} onChange={setInputs} />
        )}
        {activeTab === "model" && (
          <ModelTab inputs={inputs} result={result} />
        )}
        {activeTab === "sensitivity" && (
          <SensitivityTab
            inputs={inputs}
            currentImpliedPrice={result.impliedPrice}
          />
        )}
      </main>
    </div>
  );
}
