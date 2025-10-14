import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/Button";
import TomlEditor from "../components/widget/TomlEditor";

interface KeybindIconProps {
  keys?: string[];
  className?: string;
}

const KeybindIcon: React.FC<KeybindIconProps> = ({
  keys = ["Ctrl", "S"],
  className = "",
}) => (
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
  // Global save shortcut
  useHotkeys(
    "ctrl+s",
    (event) => {
      event.preventDefault();
      if ((window as any).saveEditorCallback) {
        (window as any).saveEditorCallback();
      }
    },
    { enableOnFormTags: true },
  );

  return (
    <div className="container mx-auto w-2/3 my-6">
      <p className="text-semibold dark:text-white text-xl my-6 inline-flex">
        <Link to="/" className="rounded-md mr-2 px-2 pt-1">
          <FaArrowLeft />
        </Link>
        Settings Editor
      </p>

      <div className="grid grid-cols-3 auto-cols-max gap-8">
        <TomlEditor
          onSave={(saveCallback) => {
            (window as any).saveEditorCallback = saveCallback;
          }}
        />

        <div>
          <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-6 sticky top-4 z-10">
            <Button
              onClick={() => {
                if ((window as any).saveEditorCallback) {
                  (window as any).saveEditorCallback();
                }
              }}
              color="text-sky-600 dark:text-sky-500 hover:text-white dark:hover:text-white border border-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500"
              className="w-full"
            >
              <FaSave className="mr-2" /> Save Settings
              <KeybindIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
