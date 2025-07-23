import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FaceID from "./FaceID";

interface FaceIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "register" | "verify";
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function FaceIDModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
  onError,
}: FaceIDModalProps) {
  const handleSuccess = () => {
    onSuccess();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleError = (error: string) => {
    onError(error);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="theme-card border-white/20 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === "register" ? "Настройка Face ID" : "Вход через Face ID"}
          </DialogTitle>
        </DialogHeader>
        <FaceID
          mode={mode}
          onSuccess={handleSuccess}
          onError={handleError}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
