"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { LoginModal } from "./login-modal";
import { RegisterModal } from "./register-modal";
import { UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ModalView = "login" | "register" | null;

export function AuthModals() {
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<ModalView>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const openLoginModal = () => {
    setView("login");
    setModalOpen(true);
    setDropdownOpen(false); // Close dropdown when opening modal
  };

  const openRegisterModal = () => {
    setView("register");
    setModalOpen(true);
    setDropdownOpen(false); // Close dropdown when opening modal
  };

  const handleOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Small delay to avoid UI glitch during transition
      setTimeout(() => setView(null), 200);
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <UserCircle className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // Prevent default selection behavior
              openLoginModal();
            }}
            className="cursor-pointer"
          >
            Login
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // Prevent default selection behavior
              openRegisterModal();
            }}
            className="cursor-pointer"
          >
            Register
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {view === "login" && (
        <LoginModal
          onOpenChange={handleOpenChange}
          openRegister={() => {
            setView("register");
          }}
        />
      )}

      {view === "register" && (
        <RegisterModal
          onOpenChange={handleOpenChange}
          openLogin={() => {
            setView("login");
          }}
        />
      )}
    </Dialog>
  );
}
