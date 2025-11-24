import { useState, useEffect } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import colors from "tailwindcss/colors";
import { useInterval } from "usehooks-ts";

import { CancelablePromise } from "../../api";
import { useTheme } from "../../hooks/useTheme";

interface CircleGraphProps {
  suffix?: string;
  title: string;
  updatePeriod: number;
  // Either direct value mode
  value?: number;
  // Or promise generator mode (legacy)
  promiseGenerator?: () => CancelablePromise<any>;
  valueExtractor?: (json: any) => number;
}

export const CircleGraph = ({
  suffix = "%",
  title,
  updatePeriod,
  value: directValue,
  promiseGenerator,
  valueExtractor = (res) => res,
}: CircleGraphProps) => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  // Handle direct value updates
  useEffect(() => {
    if (directValue !== undefined) {
      setValue(directValue);
    }
  }, [directValue]);

  // Handle legacy promise generator mode
  useInterval(
    () => {
      if (promiseGenerator && directValue === undefined) {
        setLoading(true);
        promiseGenerator()
          .then((response) => response)
          .then((val) => {
            console.log(val);
            setLoading(false);
            setValue(valueExtractor(val));
          })
          .catch((error) => {
            console.error("CircleGraph fetch failed:", error);
            setLoading(false);
          });
      }
    },
    // Only use interval for promise generator mode, and when not loading
    promiseGenerator && directValue === undefined && !loading
      ? updatePeriod
      : null,
  );

  return (
    <div className="bg-gray-100 dark:bg-neutral-800 px-6 py-4 rounded-md grid grid-cols-1 divide-y">
      <h5 className="text-md text-gray-900 dark:text-white mb-3">{title}</h5>
      <div className={"pt-4"}>
        <CircularProgressbar
          value={value || 0}
          text={`${value || 0}${suffix}`}
          styles={buildStyles({
            rotation: 0,
            strokeLinecap: "round",
            textSize: "16px",
            pathTransitionDuration: 0.5,
            pathColor: isDark ? colors.sky["500"] : colors.sky["600"],
            textColor: isDark ? colors.sky["500"] : colors.sky["600"],
            trailColor: isDark ? colors.neutral["700"] : colors.gray["300"],
          })}
        />
      </div>
    </div>
  );
};
