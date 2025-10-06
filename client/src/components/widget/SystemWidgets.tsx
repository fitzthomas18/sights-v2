import React from "react";

import { AppClient } from "../../api";
import { useSystemInfo } from "../../hooks/useSystemInfo";
import { CircleGraph } from "./CircleGraph";
import { NetworkDisplay } from "./NetworkDisplay";
import { SpeedIndicator } from "./SpeedIndicator";
import { UptimeDisplay } from "./UptimeDisplay";

interface State {
  speed: number;
  cameras: string[];
  sensors: Record<string, any>;
}

// CPU Info + Speed Widget Component
export const CPUInfoSpeedWidget = ({
  sensorName,
  client,
  state,
}: {
  sensorName: string;
  client: AppClient;
  state: State;
}) => {
  const { data } = useSystemInfo(client, sensorName, 1000);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-3 h-70">
        <CircleGraph
          title="CPU Temperature"
          value={data?.temperature}
          suffix="℃"
          updatePeriod={500}
        />
        <CircleGraph
          title="CPU Usage"
          value={data ? Math.round(data.cpu_percent) : undefined}
          suffix="%"
          updatePeriod={500}
        />
      </div>
      <SpeedIndicator speed={state.speed}></SpeedIndicator>
    </div>
  );
};

// System Info + Uptime Widget Component
export const SysInfoUptimeWidget = ({
  sensorName,
  client,
}: {
  sensorName: string;
  client: AppClient;
}) => {
  const { data } = useSystemInfo(client, sensorName, 1000);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-3 h-70">
        <CircleGraph
          title="Memory Usage"
          value={data?.memory}
          suffix="%"
          updatePeriod={500}
        />
        <CircleGraph
          title="Disk Usage"
          value={data?.disk_usage}
          suffix="%"
          updatePeriod={500}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-neutral-800 rounded-md px-6 py-3 h-21">
        <div className="text-gray-900 dark:text-white flex flex-col justify-center items-start">
          <div className="text-sm text-grey-900 dark:text-gray-300">Uptime</div>
          <div className="text-lg font-semibold">
            <UptimeDisplay uptimeSeconds={data?.uptime_seconds} />
          </div>
        </div>
        <div className="text-white flex flex-col justify-center items-end">
          <div className="text-sm text-gray-900 dark:text-gray-300">Ping</div>
          <div className="text-lg font-semibold">
            <NetworkDisplay client={client} />
          </div>
        </div>
      </div>
    </div>
  );
};
