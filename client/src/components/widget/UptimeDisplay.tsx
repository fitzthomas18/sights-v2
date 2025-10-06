interface UptimeDisplayProps {
  uptimeSeconds?: number;
}

export const UptimeDisplay = ({ uptimeSeconds }: UptimeDisplayProps) => {
  if (!uptimeSeconds) {
    return <span>--:--:--</span>;
  }

  const seconds = uptimeSeconds;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return (
      <span>
        {days}d {hours}h
      </span>
    );
  } else {
    return (
      <span>
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {remainingSeconds.toString().padStart(2, "0")}
      </span>
    );
  }
};
