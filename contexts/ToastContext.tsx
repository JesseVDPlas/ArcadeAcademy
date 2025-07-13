import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => setVisible(true), 10); // allow fade-out if needed
    timeoutRef.current = setTimeout(() => setVisible(false), 2000);
  }, []);

  // Hide toast after fade-out
  React.useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setToast(null), 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast UI is rendered by RetroToast at root */}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// For RetroToast: export the current toast state
export const useToastState = () => {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);
  // This hook will be replaced by context subscription in RetroToast
  return { toast, visible };
}; 