import React, { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaCaretDown, FaCheck } from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import toast from "react-hot-toast";
import { AppClient, OpenAPI } from "../../api";

interface Config {
  filename: string;
  name: string;
  modified: string;
}

interface ConfigSwitcherBasicProps {
  onConfigChange?: () => void;
}

export const ConfigSwitcherBasic: React.FC<ConfigSwitcherBasicProps> = ({ onConfigChange }) => {
  const client = new AppClient(OpenAPI);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [currentConfig, setCurrentConfig] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [switching, setSwitching] = useState<boolean>(false);

  useEffect(() => {
    loadConfigs();
    loadCurrentConfig();

    // Listen for config changes from other switchers
    const handleExternalConfigChange = (event: CustomEvent<{ filename?: string }>) => {
      if (event.detail?.filename) {
        setCurrentConfig(event.detail.filename);
        loadConfigs();
      }
    };

    window.addEventListener('configChanged', handleExternalConfigChange as EventListener);
    return () => {
      window.removeEventListener('configChanged', handleExternalConfigChange as EventListener);
    };
  }, []);

  const loadConfigs = async (): Promise<void> => {
    try {
      setLoading(true);
      const configList = await client.default.listAvailableConfigsConfigsListGet();
      setConfigs(configList as Config[]);
    } catch (error) {
      console.error("Failed to load configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentConfig = async (): Promise<void> => {
    try {
      const current = await client.default.getCurrentConfigConfigsCurrentGet();
      setCurrentConfig((current as any).filename);
    } catch (error) {
      console.error("Failed to load current config:", error);
    }
  };

  const switchConfig = async (config: Config): Promise<void> => {
    if (config.filename === currentConfig) {
      return;
    }

    try {
      setSwitching(true);
      const result = await toast.promise(
        client.default.switchToConfigConfigsSwitchPost({ filename: config.filename }),
        {
          loading: "Switching configuration...",
          success: <b>Configuration switched!</b>,
          error: <b>Failed to switch configuration.</b>,
        }
      );

      if ((result as any).switched) {
        setCurrentConfig(config.filename);
        await loadConfigs();

        // Notify all other config switchers (don't include filename to prevent echo)
        window.dispatchEvent(new CustomEvent('configChanged', {
          detail: { filename: config.filename, source: 'nav' }
        }));

        // Notify parent to refresh data
        if (onConfigChange) {
          onConfigChange();
        }
      }
    } catch (error) {
      console.error("Failed to switch config:", error);
    } finally {
      setSwitching(false);
    }
  };

  const getCurrentConfigName = (): string => {
    const config = configs.find(c => c.filename === currentConfig);
    return config ? config.name : currentConfig || "default.toml";
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        disabled={switching}
        className="flex items-center focus:outline-none font-medium rounded-lg space-x-1 text-sm px-4 py-2.5 tracking-wide capitalize transition-colors duration-300 transform text-center text-gray-700 hover:text-white dark:text-white border border-gray-800 dark:border-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Switch Configuration"
      >
        <FaFilePen />
        <span className="ml-0.3 normal-case">
          {switching ? "Switching..." : getCurrentConfigName()}
        </span>
        <FaCaretDown />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black dark:ring-neutral-600 ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : configs.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No configurations found
              </div>
            ) : (
              configs.map((config) => {
                const isActive = config.filename === currentConfig;
                return (
                  <MenuItem key={config.filename}>
                    {({ focus }) => (
                      <button
                        onClick={() => switchConfig(config)}
                        disabled={isActive || switching}
                        className={`
                          ${focus ? "bg-gray-100 dark:bg-neutral-700" : ""}
                          ${isActive ? "font-semibold" : ""}
                          w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white
                          disabled:cursor-default flex items-center justify-between
                        `}
                      >
                        <div>
                          <div>{config.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {config.modified}
                          </div>
                        </div>
                        {isActive && <FaCheck className="text-sky-500" />}
                      </button>
                    )}
                  </MenuItem>
                );
              })
            )}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};
