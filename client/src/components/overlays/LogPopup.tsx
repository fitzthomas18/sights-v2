import React, { useState, useEffect } from "react";

import { Popup } from "../ui/Popup";

interface LogPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogPopup({ isOpen, onClose }: LogPopupProps) {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/logs"); // Adjust this URL as needed
      console.log("Response headers:", response.headers.get("content-type"));

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const logText = await response.text();
      console.log(
        "Response content type:",
        response.headers.get("content-type"),
      );
      console.log("Response preview:", logText.substring(0, 200));

      // Check if response looks like HTML
      if (
        logText.trim().startsWith("<!DOCTYPE html>") ||
        logText.trim().startsWith("<html")
      ) {
        throw new Error(
          "Received HTML instead of log content - check your API URL",
        );
      }

      setLogs(logText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      // Set up polling to refresh logs every 3 seconds
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="SIGHTS Logs"
      width="w-5/6"
      height="h-4/5"
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          {error ? (
            <div className="text-red-500 p-4">Error: {error}</div>
          ) : (
            <pre className="text-sm font-mono whitespace-pre-wrap p-4 bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 h-full overflow-auto">
              {logs || (loading ? "Loading..." : "No logs available")}
            </pre>
          )}
        </div>
      </div>
    </Popup>
  );
}
