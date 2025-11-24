import { useState } from "react";

import { AppClient } from "../../api";

export const CameraStream = ({
  cameraName,
  client,
}: {
  cameraName: string;
  client: AppClient;
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  if (imageError) {
    return (
      <div className="bg-gray-200 dark:bg-neutral-800 rounded-md p-6 flex flex-col items-center justify-center h-94 text-center">
        {
          <img
            src={"/logo.svg"}
            alt="Camera"
            className="dark:text-white w-auto mb-4"
          />
        }
        <p className="text-red-600 dark:text-red-400 text-sm">
          {"No Video Stream Available"}
        </p>
      </div>
    );
  }

  return (
    <img
      className="dark:text-white rounded-md w-full"
      src={`${client.request.config.BASE}/camera/${cameraName}/`}
      alt="Camera stream"
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
};
