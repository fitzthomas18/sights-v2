import React, { useState, useEffect } from "react";

import { AppClient } from "../../api";

interface NetworkDisplayProps {
  client: AppClient;
}

export const NetworkDisplay = ({ client }: NetworkDisplayProps) => {
  const [ping, setPing] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("Connecting...");

  useEffect(() => {
    const measurePing = async () => {
      try {
        const startTime = performance.now();

        const response = await fetch("http://localhost:8000/api/ping");
        if (!response.ok) throw new Error("Ping failed");

        const endTime = performance.now();
        const roundTripTime = Math.round(endTime - startTime);

        setPing(roundTripTime);
        setStatus("Connected");
      } catch (error) {
        setPing(null);
        setStatus("Disconnected");
      }
    };

    measurePing();
    const interval = setInterval(measurePing, 2750);
    return () => clearInterval(interval);
  }, [client]);

  const getStatusColor = () => {
    if (status === "Disconnected") return "text-red-400";
    if (ping === null) return "text-yellow-400";
    if (ping < 50) return "text-green-400";
    if (ping < 150) return "text-yellow-400";
    return "text-red-400";
  };

  const displayText =
    status === "Disconnected"
      ? "Disconnected"
      : ping === null
        ? "Connecting..."
        : `${ping}ms`;

  return <span className={getStatusColor()}>{displayText}</span>;
};
