import React, { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Keys } from "react-hotkeys-hook/dist/types";
import { Key } from "ts-key-enum";
import { AppClient, OpenAPI, SensorConfig } from "../api";
import { Loader } from "../components/ui/Loader";
import { SelectableCard } from "../components/widget/SelectableCard";
import useApi from "../useApi";

function Index(): JSX.Element {
  const client = new AppClient(OpenAPI);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const cameras = useApi<string[]>(client.default.listCamerasCameraGet(), refreshKey);
  const sensors = useApi<Record<string, SensorConfig>>(client.default.sensorListSensorListGet(), refreshKey);
  const [speed, setSpeed] = useState<number>(3);

  const handleConfigChange = (): void => {
    // Force re-fetch of cameras and sensors after config switch
    setRefreshKey(prev => prev + 1);
  };

  // Expose the config change handler globally for Nav component
  useEffect(() => {
    (window as any).handleConfigChange = handleConfigChange;
    return () => {
      delete (window as any).handleConfigChange;
    };
  }, []);

  const useDriveHotkey = (key: Keys, left: number, right: number): void => {
    useHotkeys(key, () =>
      client.default.driveDrivePost({ speed: [speed * left, speed * right] }),
    );
    useHotkeys(key, () => client.default.driveStopDriveStopPost(), {
      keydown: false,
      keyup: true,
    });
  };

  useDriveHotkey(["w", Key.ArrowUp], 125, 125);
  useDriveHotkey(["a", Key.ArrowLeft], -125, 125);
  useDriveHotkey(["s", Key.ArrowDown], -125, -125);
  useDriveHotkey(["d", Key.ArrowRight], 125, -125);

  useHotkeys("equal", () => setSpeed((prev) => Math.min(8, prev + 1)));
  useHotkeys("minus", () => setSpeed((prev) => Math.max(1, prev - 1)));

  useHotkeys("num1", () =>
    client.default.armMoveArmServoServoNamePost("SHOULDER", {
      direction: true,
    }),
  );
  useHotkeys("num4", () =>
    client.default.armMoveArmServoServoNamePost("SHOULDER", {
      direction: false,
    }),
  );
  useHotkeys("num2", () =>
    client.default.armMoveArmServoServoNamePost("ELBOW", { direction: false }),
  );
  useHotkeys("num5", () =>
    client.default.armMoveArmServoServoNamePost("ELBOW", { direction: true }),
  );
  useHotkeys("num3", () =>
    client.default.armMoveArmServoServoNamePost("WRISTUD", {
      direction: false,
    }),
  );
  useHotkeys("num6", () =>
    client.default.armMoveArmServoServoNamePost("WRISTUD", { direction: true }),
  );
  useHotkeys("num7", () =>
    client.default.armMoveArmServoServoNamePost("WRISTLR", { direction: true }),
  );
  useHotkeys("num8", () =>
    client.default.armMoveArmServoServoNamePost("WRISTLR", {
      direction: false,
    }),
  );
  useHotkeys(Key.Add, () =>
    client.default.armMoveArmServoServoNamePost("CLAW", { direction: true }),
  );
  useHotkeys(Key.Subtract, () =>
    client.default.armMoveArmServoServoNamePost("CLAW", { direction: false }),
  );
  useHotkeys("num0", () => client.default.armHomeArmHomePost());
  useHotkeys("num.", () => client.default.armHomeArmPresetPresetPost("drive"));

  if (cameras.loading || sensors.loading || !cameras.data || !sensors.data) {
    return <Loader />;
  }

  const state = {
    speed,
    cameras: cameras.data,
    sensors: sensors.data,
  };

  return (
    <div className="container mx-auto mt-6">
      <div className="grid grid-cols-3 gap-4">
        <SelectableCard id={1} client={client} state={state} />
        <SelectableCard id={2} client={client} state={state} />
        <SelectableCard id={3} client={client} state={state} />
        <SelectableCard id={4} client={client} state={state} />
        <SelectableCard id={5} client={client} state={state} />
        <SelectableCard id={6} client={client} state={state} />
      </div>
    </div>
  );
}

export default Index;
