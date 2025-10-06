import { Popup } from "../ui/Popup";

interface DocsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsPopup({ isOpen, onClose }: DocsPopupProps) {
  const url = `http://${window.location.hostname}:8000/docs/`;

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="SIGHTS Documentation"
      width="w-5/6"
      height="h-4/5"
    >
      <div className="w-full h-full">
        <iframe src={url} width="100%" height="100%"></iframe>
      </div>
    </Popup>
  );
}
