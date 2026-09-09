"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import ContactModal, { type ModalMode } from "@/components/contact-modal";
import SlidingMenu from "@/components/sliding-menu";

type NavContextType = {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  activeModal: ModalMode | null;
  openModal: (mode: ModalMode) => void;
  closeModal: () => void;
};

const NavContext = createContext<NavContextType | null>(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error("useNav must be used within a NavProvider");
  }
  return ctx;
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalMode | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const openModal = (mode: ModalMode) => {
    setIsMenuOpen(false);
    setActiveModal(mode);
  };
  const closeModal = () => setActiveModal(null);

  return (
    <NavContext.Provider
      value={{
        isMenuOpen,
        openMenu,
        closeMenu,
        activeModal,
        openModal,
        closeModal,
      }}
    >
      {children}
      {mounted &&
        createPortal(
          <>
            <SlidingMenu
              isOpen={isMenuOpen}
              onClose={closeMenu}
              onOpenPartnerModal={() => {
                closeMenu();
                openModal("partner");
              }}
            />
            <ContactModal mode={activeModal} onClose={closeModal} />
          </>,
          document.body
        )}
    </NavContext.Provider>
  );
}
