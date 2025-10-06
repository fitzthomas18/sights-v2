import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FaTimes } from "react-icons/fa";
import DiffViewer from "./DiffViewer";

interface Backup {
  filename: string;
  timestamp: string;
  size: number;
}

interface BackupRestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  backup: Backup | null;
  currentContent: string;
  backupContent: string;
  onConfirm: () => void;
}

const BackupRestoreDialog: React.FC<BackupRestoreDialogProps> = ({
  isOpen,
  onClose,
  backup,
  currentContent,
  backupContent,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-5xl w-full bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Restore Backup: {backup?.timestamp}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Showing changes between current and backup configuration
            </div>
            <DiffViewer oldText={currentContent} newText={backupContent} />
          </div>
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-neutral-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
            >
              Confirm Restore
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default BackupRestoreDialog;
