import { useState, useEffect } from "react";

import { AppClient } from "../api";

export const useSystemInfo = (
  client: AppClient,
  sensorName: string,
  updatePeriod: number = 1000,
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await client.default.sensorSensorSensorIdGet(sensorName);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("System info fetch failed:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, updatePeriod);
    return () => clearInterval(interval);
  }, [client, sensorName, updatePeriod]);

  return { data, loading };
};
