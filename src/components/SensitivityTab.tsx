"use client";

import { DcfInputs } from "@/lib/types";
import { calculateSensitivity } from "@/lib/dcf";
import { formatNumber, formatPercent } from "@/lib/format";
import { useMemo } from "react";

interface SensitivityTabProps {
  inputs: DcfInputs;
  currentImpliedPrice: number;
}

export default function SensitivityTab({
  inputs,
  currentImpliedPrice,
}: SensitivityTabProps) {
  // WACC: 8%〜14%（1%刻み）
  const waccRange = useMemo(
    () => [0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14],
    []
  );

  // LTG: 2%〜5%（0.5%刻み）
  const ltgRange = useMemo(
    () => [0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05],
    []
  );

  const matrix = useMemo(
    () => calculateSensitivity(inputs, waccRange, ltgRange),
    [inputs, waccRange, ltgRange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          感度分析：WACC × LTG
        </h3>
        <span className="text-sm text-gray-500">
          現在の理論株価: ¥{formatNumber(currentImpliedPrice)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-3 bg-gray-100 border border-gray-300 text-xs text-gray-500">
                LTG ＼ WACC
              </th>
              {waccRange.map((w) => (
                <th
                  key={w}
                  className={`py-2 px-3 border border-gray-300 text-center font-semibold text-xs ${
                    Math.abs(w - inputs.wacc) < 0.001
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {formatPercent(w, 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ltgRange.map((ltg, ri) => (
              <tr key={ltg}>
                <td
                  className={`py-2 px-3 border border-gray-300 font-semibold text-xs text-center ${
                    Math.abs(ltg - inputs.ltg) < 0.001
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {formatPercent(ltg, 1)}
                </td>
                {waccRange.map((wacc, ci) => {
                  const val = matrix[ri][ci];
                  const isCurrent =
                    Math.abs(wacc - inputs.wacc) < 0.001 &&
                    Math.abs(ltg - inputs.ltg) < 0.001;

                  if (val === null) {
                    return (
                      <td
                        key={ci}
                        className="py-2 px-3 border border-gray-300 text-center text-gray-400 bg-gray-200"
                      >
                        N/A
                      </td>
                    );
                  }

                  const bgColor = isCurrent
                    ? "bg-blue-200 font-bold text-blue-900"
                    : val > inputs.currentStockPrice
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800";

                  return (
                    <td
                      key={ci}
                      className={`py-2 px-3 border border-gray-300 text-center font-mono text-xs ${bgColor}`}
                    >
                      {formatNumber(val, 0)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-6 text-xs text-gray-500 mt-2">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-50 border border-green-200 rounded" />
          現在株価以上
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-red-50 border border-red-200 rounded" />
          現在株価未満
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-blue-200 border border-blue-300 rounded" />
          現在の前提
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-gray-200 border border-gray-300 rounded" />
          N/A（WACC ≤ LTG）
        </span>
      </div>
    </div>
  );
}
