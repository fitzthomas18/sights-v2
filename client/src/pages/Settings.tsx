import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useHotkeys } from "react-hotkeys-hook";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { Link } from "react-router-dom";

import { AppClient, OpenAPI } from "../api";
import { Button } from "../components/ui/Button";
import TomlEditor from "../components/widget/TomlEditor";
import BackupHistoryMenu from "../components/widget/BackupHistoryMenu";
import ConfigSwitcher from "../components/widget/ConfigSwitcher";
import BackupRestoreDialog from "../components/widget/BackupRestoreDialog";

interface Config {
  filename: string;
  name: string;
  modified: string;
}

interface Backup {
  filename: string;
  timestamp: string;
  size: number;
}

interface KeybindIconProps {
  keys?: string[];
  className?: string;
}

const KeybindIcon: React.FC<KeybindIconProps> = ({ keys = ["Ctrl", "S"], className = "" }) => (
  <div className={`inline-flex items-center ml-2 ${className}`}>
    {keys.map((key, index) => (
      <React.Fragment key={index}>
        <div className="inline-flex items-center justify-center px-2 h-6 border-2 border-current rounded text-xs font-mono font-bold">
          {key}
        </div>
        {index < keys.length - 1 && <span className="mx-1 text-xs">+</span>}
      </React.Fragment>
    ))}
  </div>
);

function Settings(): JSX.Element {
  const client = new AppClient(OpenAPI);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<string | null>(null);
  const [loadingConfigs, setLoadingConfigs] = useState<boolean>(true);
  const [switchingConfig, setSwitchingConfig] = useState<boolean>(false);
  const [editorKey, setEditorKey] = useState<number>(0);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(false);
  const [showDiffDialog, setShowDiffDialog] = useState<boolean>(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [backupContent, setBackupContent] = useState<string>("");
  const [currentContent, setCurrentContent] = useState<string>("");
  const [loadingDiff, setLoadingDiff] = useState<boolean>(false);

  // Global save shortcut
  useHotkeys("ctrl+s", (event) => {
    event.preventDefault();
    if ((window as any).saveEditorCallback) {
      (window as any).saveEditorCallback();
    }
  }, { enableOnFormTags: true });

  useEffect(() => {
    loadConfigs();
    loadCurrentConfig();

    // Listen for config changes from nav switcher
    const handleExternalConfigChange = (event: CustomEvent<{ source?: string; filename?: string }>) => {
      // Only update if the change came from nav, not from settings itself
      if (event.detail?.source === 'nav' && event.detail?.filename) {
        setCurrentConfig(event.detail.filename);
        setSelectedConfig(event.detail.filename);
        loadConfigs();
        setEditorKey(prev => prev + 1);
      }
    };

    window.addEventListener('configChanged', handleExternalConfigChange as EventListener);
    return () => {
      window.removeEventListener('configChanged', handleExternalConfigChange as EventListener);
    };
  }, []);

  const loadConfigs = async (): Promise<void> => {
    try {
      setLoadingConfigs(true);
      const configList = await client.default.listAvailableConfigsConfigsListGet();
      setConfigs(configList as Config[]);
    } catch (error) {
      toast.error("Failed to load configurations");
      console.error(error);
    } finally {
      setLoadingConfigs(false);
    }
  };

  const loadCurrentConfig = async (): Promise<void> => {
    try {
      const current = await client.default.getCurrentConfigConfigsCurrentGet();
      setCurrentConfig((current as any).filename);
      setSelectedConfig((current as any).filename);
    } catch (error) {
      console.error("Failed to load current config:", error);
    }
  };

  const loadBackups = async (): Promise<void> => {
    try {
      setLoadingBackups(true);
      const backupList = await client.default.listBackupsConfigsBackupsGet();
      setBackups(backupList as Backup[]);
    } catch (error) {
      toast.error("Failed to load backups");
      console.error(error);
    } finally {
      setLoadingBackups(false);
    }
  };

  const switchConfiguration = async (config: Config): Promise<void> => {
    if (config.filename === currentConfig) {
      toast("Already using this configuration", { icon: "ℹ️" });
      return;
    }

    try {
      setSwitchingConfig(true);
      const result = await toast.promise(
        client.default.switchToConfigConfigsSwitchPost({ filename: config.filename }),
        {
          loading: "Switching configuration...",
          success: (data: any) => data.switched
            ? <b>Configuration switched!</b>
            : <b>Already using this configuration</b>,
          error: <b>Failed to switch configuration.</b>,
        }
      );

      if ((result as any).switched) {
        setCurrentConfig(config.filename);
        setSelectedConfig(config.filename);
        await loadConfigs();
        setEditorKey(prev => prev + 1);

        // Notify nav switcher
        window.dispatchEvent(new CustomEvent('configChanged', {
          detail: { filename: config.filename }
        }));
      }
    } catch (error) {
      console.error("Failed to switch config:", error);
      setSelectedConfig(currentConfig);
    } finally {
      setSwitchingConfig(false);
    }
  };

  const handleBackupSelect = async (backup: Backup): Promise<void> => {
    try {
      setLoadingDiff(true);
      setSelectedBackup(backup);

      const [current, backupData] = await Promise.all([
        client.default.getSettingsSettingsGet(),
        client.default.getBackupContentConfigsBackupBackupFilenameGet(backup.filename)
      ]);

      setCurrentContent(current as string);
      setBackupContent(backupData as string);
      setShowDiffDialog(true);
    } catch (error) {
      toast.error("Failed to load backup content");
      console.error(error);
    } finally {
      setLoadingDiff(false);
    }
  };

  const confirmRestore = async (): Promise<void> => {
    if (!selectedBackup) return;

    try {
      const result = await toast.promise(
        client.default.restoreBackupConfigsRestorePost({ backup_filename: selectedBackup.filename }),
        {
          loading: "Restoring backup...",
          success: <b>Backup restored!</b>,
          error: <b>Failed to restore backup.</b>,
        }
      );

      if ((result as any).reloaded) {
        setEditorKey(prev => prev + 1);
      }

      setShowDiffDialog(false);
      await loadBackups();
    } catch (error) {
      console.error("Failed to restore backup:", error);
    }
  };

  return (
    <div className="container mx-auto w-2/3 my-6">
      <p className="text-semibold dark:text-white text-xl my-6 inline-flex">
        <Link to="/" className="rounded-md mr-2 px-2 pt-1">
          <FaArrowLeft />
        </Link>
        Settings Editor
      </p>

      <div className="grid grid-cols-3 auto-cols-max gap-8">
        <TomlEditor key={editorKey} onSave={(saveCallback) => {
          (window as any).saveEditorCallback = saveCallback;
        }} />

        <div>
          <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-6 sticky top-4 z-10">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if ((window as any).saveEditorCallback) {
                    (window as any).saveEditorCallback();
                  }
                }}
                color="text-sky-600 dark:text-sky-500 hover:text-white dark:hover:text-white border border-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500"
                className="flex-1"
              >
                <FaSave className="mr-2" /> Save Settings
                <KeybindIcon />
              </Button>

              <BackupHistoryMenu
                backups={backups}
                loadingBackups={loadingBackups}
                onLoadBackups={loadBackups}
                onSelectBackup={handleBackupSelect}
                loadingDiff={loadingDiff}
              />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {currentConfig ? (
                <>Currently using: <span className="font-semibold">{currentConfig}</span></>
              ) : (
                'No configuration loaded'
              )}
            </div>
          </div>

          <ConfigSwitcher
            configs={configs}
            currentConfig={currentConfig}
            selectedConfig={selectedConfig}
            loadingConfigs={loadingConfigs}
            switchingConfig={switchingConfig}
            onRefresh={() => {
              loadConfigs();
              loadCurrentConfig();
            }}
            onSwitch={switchConfiguration}
          />
        </div>
      </div>

      <BackupRestoreDialog
        isOpen={showDiffDialog}
        onClose={() => setShowDiffDialog(false)}
        backup={selectedBackup}
        currentContent={currentContent}
        backupContent={backupContent}
        onConfirm={confirmRestore}
      />
    </div>
  );
}

export default Settings;
