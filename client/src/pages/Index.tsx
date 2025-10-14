import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Keys } from "react-hotkeys-hook/dist/types";

import { Key } from "ts-key-enum";

import { AppClient, OpenAPI } from "../api";
import { Loader } from "../components/ui/Loader";
import { SelectableCard } from "../components/widget/SelectableCard";
import useApi from "../useApi";

function Index() {
  const client = new AppClient(OpenAPI);
  const cameras = useApi(client.default.listCamerasCameraGet());
  const sensors = useApi(client.default.sensorListSensorListGet());
  const [speed, setSpeed] = useState<number>(3);

  const useDriveHotkey = (key: Keys, left: number, right: number) => {
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

  if (cameras.loading || sensors.loading || !cameras.data || !sensors.data)
    return <Loader />;

  let state = {
    speed,
    cameras: cameras.data,
    sensors: sensors.data,
  };

  return (
    <div className="container mx-auto mt-6">
      <div className="grid grid-cols-3 gap-4">
        <SelectableCard id={1} client={client} state={state}></SelectableCard>
        <SelectableCard id={2} client={client} state={state}></SelectableCard>
        <SelectableCard id={3} client={client} state={state}></SelectableCard>
        <SelectableCard id={4} client={client} state={state}></SelectableCard>
        <SelectableCard id={5} client={client} state={state}></SelectableCard>
        <SelectableCard id={6} client={client} state={state}></SelectableCard>
      </div>
    </div>
  );
}

export default Index;
