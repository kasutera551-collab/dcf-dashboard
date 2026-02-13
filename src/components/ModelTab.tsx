"use client";

import { DcfInputs } from "@/lib/types";
import { DcfResult } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/format";

interface ModelTabProps {
  inputs: DcfInputs;
  result: DcfResult;
}

export default function ModelTab({ inputs, result }: ModelTabProps) {
  const { yearData, terminalValue, pvTerminalValue, enterpriseValue, equityValue, impliedPrice } = result;

  const rows: { label: string; values: (string | number)[] }[] = [
    {
      label: "Sales",
      values: [
        formatNumber(inputs.baseYearSales),
        ...yearData.map((y) => formatNumber(y.sales)),
      ],
    },
    {
      label: "EBITDA",
      values: ["—", ...yearData.map((y) => formatNumber(y.ebitda))],
    },
    {
      label: "D&A",
      values: ["—", ...yearData.map((y) => formatNumber(y.da))],
    },
    {
      label: "EBIT",
      values: ["—", ...yearData.map((y) => formatNumber(y.ebit))],
    },
    {
      label: "NOPAT",
      values: ["—", ...yearData.map((y) => formatNumber(y.nopat))],
    },
    {
      label: "CapEx",
      values: ["—", ...yearData.map((y) => formatNumber(y.capex))],
    },
    {
      label: "ΔNWC",
      values: ["—", ...yearData.map((y) => formatNumber(y.deltaNwc))],
    },
    {
      label: "FCFF",
      values: ["—", ...yearData.map((y) => formatNumber(y.fcff))],
    },
    {
      label: "Discount Factor",
      values: [
        "—",
        ...yearData.map((y) => y.discountFactor.toFixed(4)),
      ],
    },
    {
      label: "PV(FCFF)",
      values: ["—", ...yearData.map((y) => formatNumber(y.pvFcff))],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 px-3 font-semibold text-gray-700 bg-gray-50 min-w-[120px]">
                Item
              </th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700 bg-gray-50">
                Year 0
              </th>
              {yearData.map((y) => (
                <th
                  key={y.year}
                  className="text-right py-2 px-3 font-semibold text-gray-700 bg-gray-50"
                >
                  Year {y.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={`border-b border-gray-200 ${
                  row.label === "FCFF" || row.label === "PV(FCFF)"
                    ? "bg-blue-50 font-semibold"
                    : i % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50"
                }`}
              >
                <td className="py-2 px-3 text-gray-700">{row.label}</td>
                {row.values.map((v, j) => (
                  <td key={j} className="text-right py-2 px-3 text-gray-900">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500">All figures in $M unless otherwise noted.</div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Valuation Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryRow
            label="Terminal Value"
            value={
              terminalValue !== null ? formatNumber(terminalValue) : "N/A"
            }
          />
          <SummaryRow
            label="PV(Terminal Value)"
            value={
              pvTerminalValue !== null
                ? formatNumber(pvTerminalValue)
                : "N/A"
            }
          />
          <SummaryRow
            label="Enterprise Value"
            value={formatNumber(enterpriseValue)}
            highlight
          />
          <SummaryRow
            label="Net Debt"
            value={formatNumber(inputs.netDebt)}
          />
          <SummaryRow
            label="Equity Value"
            value={formatNumber(equityValue)}
            highlight
          />
          <SummaryRow
            label="Shares Outstanding (M)"
            value={formatNumber(inputs.sharesOutstanding, 0)}
          />
          <SummaryRow
            label="Implied Price ($)"
            value={formatNumber(impliedPrice)}
            highlight
          />
          <SummaryRow
            label="WACC"
            value={formatPercent(inputs.wacc)}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-sm font-mono ${
          highlight ? "font-bold text-blue-700" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
