import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Editor from "react-simple-code-editor";

import prismDarkCss from "prism-themes/themes/prism-one-dark.css?inline";
import prismLightCss from "prism-themes/themes/prism-one-light.css?inline";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-toml";

import { AppClient, OpenAPI } from "../../api";
import { useTheme } from "../../hooks/useTheme";
import { Loader } from "../ui/Loader";

interface TomlEditorProps {
  onSave?: (saveCallback: () => Promise<void>) => void;
}

const TomlEditor: React.FC<TomlEditorProps> = ({ onSave }) => {
  const client = new AppClient(OpenAPI);
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const existingStyle = document.getElementById("prism-dynamic-theme");
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement("style");
    styleElement.id = "prism-dynamic-theme";
    styleElement.textContent = `
      ${isDark ? prismDarkCss : prismLightCss}
      .language-toml .token.punctuation { display: inline !important; }
      .language-toml .token.table { display: inline !important; }
      .language-toml .token { display: inline !important; }
      .language-toml > span { display: inline !important; }
    `;
    document.head.appendChild(styleElement);

    return () => {
      const style = document.getElementById("prism-dynamic-theme");
      if (style) {
        style.remove();
      }
    };
  }, [isDark]);

  const loadSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await client.default.getSettingsSettingsGet();
      setCode(data as string);
    } catch (error) {
      toast.error("Failed to load settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (onSave) {
      onSave(saveSettings);
    }
  }, [code, onSave]);

  const saveSettings = async (): Promise<void> => {
    try {
      await toast.promise(
        client.default.setSettingsSettingsPost({ content: code }),
        {
          loading: "Saving...",
          success: <b>Settings saved!</b>,
          error: <b>Could not save.</b>,
        },
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  if (loading) {
    return (
      <div className="col-span-2 bg-gray-100 dark:bg-neutral-800 rounded-lg p-6">
        <div className="h-175 flex items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-2 bg-gray-100 dark:bg-neutral-800 rounded-lg p-6">
      <div className="h-175 overflow-auto" style={{ whiteSpace: "pre" }}>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={(code) => highlight(code, languages.toml, "toml")}
          padding={10}
          preClassName="language-toml"
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            minHeight: "100%",
            background: "none",
            color: isDark ? "#fff" : "#000",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
};

export default TomlEditor;
