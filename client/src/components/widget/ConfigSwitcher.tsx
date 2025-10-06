import React from "react";
import { FaSync } from "react-icons/fa";
import { Loader } from "../ui/Loader";

interface Config {
  filename: string;
  name: string;
  modified: string;
}

interface ConfigSwitcherProps {
  configs: Config[];
  currentConfig: string | null;
  selectedConfig: string | null;
  loadingConfigs: boolean;
  switchingConfig: boolean;
  onRefresh: () => void;
  onSwitch: (config: Config) => void | Promise<void>;
}

const ConfigSwitcher: React.FC<ConfigSwitcherProps> = ({
  configs,
  currentConfig,
  selectedConfig,
  loadingConfigs,
  switchingConfig,
  onRefresh,
  onSwitch
}) => {
  return (
    <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-6 mt-4 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-semibold dark:text-white text-xl">
          Available Configurations
        </div>
        <button
          onClick={onRefresh}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 rounded transition-colors"
          disabled={loadingConfigs}
          title="Refresh configurations"
        >
          <FaSync className={`w-4 h-4 ${loadingConfigs ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {loadingConfigs ? (
        <div className="flex justify-center py-4">
          <Loader />
        </div>
      ) : (
        <div className="h-128 overflow-y-auto pr-2 space-y-2">
          {configs.map((config) => {
            const isActive = config.filename === currentConfig;
            const isSelected = config.filename === selectedConfig;
            return (
              <button
                key={config.filename}
                onClick={() => onSwitch(config)}
                disabled={switchingConfig || isActive}
                className={`
                  w-full text-left rounded-lg px-4 py-3 transition-all
                  ${isActive
                    ? 'bg-sky-500/20 border-2 border-sky-500'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }
                  ${switchingConfig ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{config.name}</p>
                      {isActive && (
                        <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/50 mt-1">
                      {config.modified}
                    </div>
                  </div>
                  {switchingConfig && isSelected && (
                    <div className="ml-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {configs.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No additional configurations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigSwitcher;
