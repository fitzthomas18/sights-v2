import { Popup } from "../ui/Popup";

interface TerminalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TerminalPopup({ isOpen, onClose }: TerminalPopupProps) {
  const url = `http://${window.location.hostname}:8001`;
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="SSH Terminal"
      width="w-5/6"
      height="h-4/5"
    >
      <div className="w-full h-full">
        <iframe
          src="http://localhost:8001"
          style={{ width: "100vw", height: "100vh", border: "none" }}
        />
      </div>
    </Popup>
  );
}
