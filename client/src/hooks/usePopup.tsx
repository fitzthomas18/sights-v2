import { useState } from "react";

export function usePopup() {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);
  const togglePopup = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    openPopup,
    closePopup,
    togglePopup,
  };
}
