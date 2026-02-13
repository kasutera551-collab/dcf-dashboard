"use client";

import { DcfInputs, DcfResult } from "@/lib/types";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/format";

interface DashboardTabProps {
  inputs: DcfInputs;
  result: DcfResult;
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ?? "text-gray-900"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({
  title,
  labels,
  values,
  color,
}: {
  title: string;
  labels: string[];
  values: number[];
  color: string;
}) {
  const maxVal = Math.max(...values.map(Math.abs), 1);
  const barWidth = 48;
  const gap = 16;
  const chartHeight = 180;
  const svgWidth = labels.length * (barWidth + gap) + gap;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={chartHeight + 40}
          className="block mx-auto"
        >
          <line
            x1={0}
            y1={chartHeight}
            x2={svgWidth}
            y2={chartHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
          {values.map((val, i) => {
            const barHeight = (Math.abs(val) / maxVal) * (chartHeight - 20);
            const x = gap + i * (barWidth + gap);
            const y = chartHeight - barHeight;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx={3}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-gray-500"
                >
                  {formatNumber(val, 0)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="text-[11px] fill-gray-600"
                >
                  {labels[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function DashboardTab({ inputs, result }: DashboardTabProps) {
  const { impliedPrice, enterpriseValue, tvEvRatio, waccExceedsLtg, yearData } =
    result;
  const upside =
    inputs.currentStockPrice > 0
      ? (impliedPrice - inputs.currentStockPrice) / inputs.currentStockPrice
      : 0;

  const upsideColor =
    upside > 0 ? "text-green-600" : upside < 0 ? "text-red-600" : "text-gray-900";

  const salesLabels = ["Y0", "Y1", "Y2", "Y3", "Y4", "Y5"];
  const salesValues = [inputs.baseYearSales, ...yearData.map((y) => y.sales)];

  const fcffLabels = ["Y1", "Y2", "Y3", "Y4", "Y5"];
  const fcffValues = yearData.map((y) => y.fcff);

  return (
    <div className="space-y-6">
      {!waccExceedsLtg && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg p-4 text-sm">
          WACC is less than or equal to LTG. Terminal Value cannot be calculated. Please review your WACC or LTG assumptions.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Implied Price"
          value={formatCurrency(impliedPrice)}
          color="text-blue-700"
        />
        <KpiCard
          label="Current Price"
          value={formatCurrency(inputs.currentStockPrice)}
        />
        <KpiCard
          label="Upside"
          value={formatPercent(upside)}
          color={upsideColor}
        />
        <KpiCard
          label="Enterprise Value"
          value={formatCurrency(enterpriseValue, 0)}
          sub="$M"
        />
        <KpiCard
          label="TV / EV"
          value={tvEvRatio !== null ? formatPercent(tvEvRatio) : "N/A"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Sales ($M) — Year 0 to Year 5"
          labels={salesLabels}
          values={salesValues}
          color="#3b82f6"
        />
        <BarChart
          title="FCFF ($M) — Year 1 to Year 5"
          labels={fcffLabels}
          values={fcffValues}
          color="#10b981"
        />
      </div>
    </div>
  );
}
