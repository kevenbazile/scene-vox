// src/components/ui/use-toast.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

type ToastContextType = {
  message: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setMessage(msg);
  const hideToast = () => setMessage(null);

  return (
    <ToastContext.Provider value={{ message, showToast, hideToast }}>
      {children}
      {message && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-gray-800 text-white rounded-md">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
export default useToast;