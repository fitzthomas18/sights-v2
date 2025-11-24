import React from "react";

export const SpeedIndicator = ({ speed }: { speed: number }) => (
  <div>
    <div className="bg-gray-100 dark:bg-neutral-800 rounded-md px-6 py-3 h-auto">
      <span className="text-base font-medium text-gray-900 dark:text-white">
        Speed
      </span>
      <div className="w-full bg-gray-200 rounded-full dark:bg-neutral-700 relative mt-1">
        <div className="absolute inset-0 z-10 grid grid-cols-8 text-center py-1.5">
          {Array.from({ length: 8 }, (_, index) => (
            <span
              key={index + 1}
              className={`font-medium ${
                index + 1 <= speed ? "text-white" : "text-transparent"
              }`}
              style={{
                transitionDelay:
                  index + 1 <= speed ? `${(index + 1 - 1) * 32}ms` : "0ms",
                transitionProperty: "color",
                transitionDuration: "50ms",
              }}
            >
              {index + 1}
            </span>
          ))}
        </div>
        <div
          className="bg-sky-600 dark:bg-sky-500 h-8 z-0 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(100 * speed) / 8}%` }}
        ></div>
      </div>
    </div>
  </div>
);
