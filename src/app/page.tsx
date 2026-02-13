"use client";

import { useState, useMemo } from "react";
import { DcfInputs, DEFAULT_INPUTS } from "@/lib/types";
import { calculateDcf } from "@/lib/dcf";
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [inputs, setInputs] = useState<DcfInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => calculateDcf(inputs), [inputs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">
            DCF Valuation Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            DCF法（FCFF）による理論株価算出ツール
          </p>
        </div>
      </header>

      {/* タブナビゲーション */}
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

      {/* コンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && (
          <DashboardTab inputs={inputs} result={result} />
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
