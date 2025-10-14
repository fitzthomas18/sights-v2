import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import "react-circular-progressbar/dist/styles.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import colors from "tailwindcss/colors";
import { useInterval } from "usehooks-ts";

import { CancelablePromise } from "../../api";
import { useTheme } from "../../hooks/useTheme";

interface Dictionary<T> {
  [Key: string]: T;
}

export const LineGraphCard = ({
  title,
  updatePeriod,
  promiseGenerator,
  length,
  series,
}: {
  title: string;
  updatePeriod: number;
  length: number;
  series: string[];
  promiseGenerator: () => CancelablePromise<any>;
}) => {
  const [data, setData] = useState<Dictionary<Array<number>>>();
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme(); // Fix: destructure isDark from the hook

  useInterval(
    () => {
      setLoading(true);
      promiseGenerator()
        .then((response) => response)
        .then((newValue: { [key: string]: number }) => {
          setLoading(false);
          const newState: Dictionary<Array<number>> = {};
          series.forEach((s, i) => {
            newState[s] = data ? [...data[s], newValue[s]] : [newValue[s]];
            if (newState[s].length > length) {
              newState[s].shift();
            }
          });
          setData(newState);
        });
    },
    loading ? null : updatePeriod,
  );

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
  );

  if (!data)
    return (
      <div className={"bg-gray-200 dark:text-white w-full rounded-md"}></div>
    );

  // Theme-aware chart options
  const options = {
    responsive: true,
    animation: false as const,
    tension: 0.4,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: isDark ? colors.white : colors.gray["900"],
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? colors.gray["300"] : colors.gray["600"],
        },
        grid: {
          color: isDark ? colors.gray["600"] : colors.gray["300"],
        },
      },
      y: {
        ticks: {
          color: isDark ? colors.gray["300"] : colors.gray["600"],
        },
        grid: {
          color: isDark ? colors.gray["600"] : colors.gray["300"],
        },
      },
    },
  };

  // Theme-aware data with dynamic colors
  const getData = () => {
    return {
      labels: Array.from(data[series[0]].keys()),
      datasets: [
        {
          label: series[0],
          data: data[series[0]],
          borderColor: isDark ? colors.emerald["400"] : colors.emerald["600"],
          backgroundColor: isDark
            ? colors.emerald["900"]
            : colors.emerald["100"],
        },
        {
          label: series[1],
          data: data[series[1]],
          borderColor: isDark ? colors.sky["400"] : colors.sky["600"],
          backgroundColor: isDark ? colors.sky["900"] : colors.sky["100"],
        },
      ],
    };
  };

  return (
    <div className="bg-gray-100 dark:bg-neutral-800 dark:text-white px-6 py-4 rounded-md flex divide-y flex-col h-full">
      <h5 className="text-md text-gray-900 dark:text-white pb-3">{title}</h5>
      <Line
        key={`chart-${isDark ? "dark" : "light"}`} // Force re-render on theme change
        options={options}
        data={getData()}
        className={"pt-2 rounded-md"}
      />
    </div>
  );
};
