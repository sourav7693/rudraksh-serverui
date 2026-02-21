"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";

type Props = {
  title: "Monthly" | "Yearly";
  data: number[];
  categories: string[];
};

function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return { percent: 0, isIncrease: true };
  }

  const diff = ((current - previous) / previous) * 100;

  return {
    percent: Math.abs(diff).toFixed(1),
    isIncrease: diff >= 0,
  };
}

export default function AnalyticsGraph({title, data, categories }: Props) {
    const currentValue = data[data.length - 1];
    const previousValue = data[data.length - 2] ?? data[data.length - 1];

    const change = useMemo(
      () => calculateChange(currentValue, previousValue),
      [currentValue, previousValue]
    );

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,        
        speed: 800,
      },
    },

    stroke: {
      curve: "smooth",
      width: 2,
      colors: ["#111"],
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },

    dataLabels: {
      enabled: false,
    },

    grid: {
      show: false,
    },

    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#666",
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      show: false,
    },

    tooltip: {
      enabled: true,
      theme: "light",
    },
  };

  const series = [
    {
      name: "Analytics",
      data,
    },
  ];

  return (
    <div className="w-full rounded-xl bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-semibold">{currentValue}</h2>

            <span
              className={`text-sm font-medium ${
                change.isIncrease ? "text-green-600" : "text-red-600"
              }`}
            >
              {change.isIncrease ? "+" : "-"}
              {change.percent}%
            </span>
          </div>

          <p className="text-xs text-gray-400">
            {title === "Monthly" ? "Last 30 days" : "Last 12 months"}
          </p>
        </div>
      </div>
      <Chart options={options} series={series} type="area" height={220} />;
    </div>
  ); 
}
