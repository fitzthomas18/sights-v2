import React from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { FaHistory } from "react-icons/fa";

interface Backup {
  filename: string;
  timestamp: string;
  size: number;
}

interface BackupHistoryMenuProps {
  backups: Backup[];
  loadingBackups: boolean;
  onLoadBackups: () => void;
  onSelectBackup: (backup: Backup) => void;
  loadingDiff: boolean;
}

const BackupHistoryMenu: React.FC<BackupHistoryMenuProps> = ({
  backups,
  loadingBackups,
  onLoadBackups,
  onSelectBackup,
  loadingDiff
}) => {
  return (
    <Menu as="div" className="relative">
      <MenuButton
        onClick={onLoadBackups}
        className="inline-flex items-center h-10.5 justify-center gap-2 rounded-md py-2 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="View backup history"
      >
        <FaHistory className="w-4 h-4" />
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-96 overflow-y-auto">
        <div className="p-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
            <span>Backup History</span>
            {loadingBackups && (
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
            )}
          </div>
          {backups.length === 0 && !loadingBackups && (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No backups available
            </div>
          )}
          {backups.map((backup) => (
            <MenuItem key={backup.filename}>
              {({ focus }) => (
                <button
                  onClick={() => onSelectBackup(backup)}
                  disabled={loadingDiff}
                  className={`${
                    focus ? 'bg-gray-100 dark:bg-neutral-700' : ''
                  } group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50`}
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium">{backup.timestamp}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(backup.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default BackupHistoryMenu;
