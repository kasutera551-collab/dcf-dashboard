"use client";

import { DcfInputs } from "@/lib/types";

interface InputsTabProps {
  inputs: DcfInputs;
  onChange: (inputs: DcfInputs) => void;
}

function NumberInput({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value}
        step={step ?? "any"}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

export default function InputsTab({ inputs, onChange }: InputsTabProps) {
  const update = <K extends keyof DcfInputs>(key: K, value: DcfInputs[K]) => {
    onChange({ ...inputs, [key]: value });
  };

  const updateGrowth = (index: number, value: number) => {
    const newGrowth = [...inputs.revenueGrowth] as DcfInputs["revenueGrowth"];
    newGrowth[index] = value;
    update("revenueGrowth", newGrowth);
  };

  return (
    <div className="space-y-8">
      {/* 基本情報 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          基本情報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberInput
            label="Base Year Sales（百万円）"
            value={inputs.baseYearSales}
            onChange={(v) => update("baseYearSales", v)}
          />
          <NumberInput
            label="Net Debt（百万円）"
            value={inputs.netDebt}
            onChange={(v) => update("netDebt", v)}
          />
          <NumberInput
            label="Shares Outstanding（千株）"
            value={inputs.sharesOutstanding}
            onChange={(v) => update("sharesOutstanding", v)}
          />
          <NumberInput
            label="Current Stock Price（円）"
            value={inputs.currentStockPrice}
            onChange={(v) => update("currentStockPrice", v)}
          />
        </div>
      </section>

      {/* 成長率 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          Revenue Growth（Year1〜Year5）
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {inputs.revenueGrowth.map((g, i) => (
            <NumberInput
              key={i}
              label={`Year ${i + 1}`}
              value={g}
              step="0.01"
              onChange={(v) => updateGrowth(i, v)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ※ 小数で入力（例：10% → 0.10）
        </p>
      </section>

      {/* 収益性 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          収益性
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <NumberInput
            label="EBITDA Margin"
            value={inputs.ebitdaMargin}
            step="0.01"
            onChange={(v) => update("ebitdaMargin", v)}
          />
          <NumberInput
            label="D&A / Sales"
            value={inputs.daToSales}
            step="0.01"
            onChange={(v) => update("daToSales", v)}
          />
          <NumberInput
            label="CapEx / Sales"
            value={inputs.capexToSales}
            step="0.01"
            onChange={(v) => update("capexToSales", v)}
          />
          <NumberInput
            label="NWC / Sales"
            value={inputs.nwcToSales}
            step="0.01"
            onChange={(v) => update("nwcToSales", v)}
          />
          <NumberInput
            label="Tax Rate"
            value={inputs.taxRate}
            step="0.01"
            onChange={(v) => update("taxRate", v)}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ※ すべて小数で入力（例：15% → 0.15）
        </p>
      </section>

      {/* 割引関連 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          割引率
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          <NumberInput
            label="WACC"
            value={inputs.wacc}
            step="0.01"
            onChange={(v) => update("wacc", v)}
          />
          <NumberInput
            label="LTG（Terminal Growth）"
            value={inputs.ltg}
            step="0.005"
            onChange={(v) => update("ltg", v)}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ※ 小数で入力（例：8% → 0.08）
        </p>
      </section>
    </div>
  );
}
