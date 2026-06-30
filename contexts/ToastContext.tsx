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

// Internal state for RetroToast to access
let toastState: Toast | null = null;
let toastVisible = false;
let toastListeners: Array<() => void> = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener());
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => {
      setVisible(true);
      toastState = { message, type };
      toastVisible = true;
      notifyListeners();
    }, 10);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      toastVisible = false;
      notifyListeners();
      setTimeout(() => {
        setToast(null);
        toastState = null;
        notifyListeners();
      }, 300);
    }, 2000);
  }, []);

  const contextValue = React.useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast UI is rendered by RetroToast at root */}
    </ToastContext.Provider>
  );
};

// Hook for RetroToast to subscribe to toast state
export const useToastState = () => {
  const [state, setState] = React.useState({ toast: toastState, visible: toastVisible });

  React.useEffect(() => {
    const listener = () => {
      setState({ toast: toastState, visible: toastVisible });
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  return state;
};

export const useToast = () => useContext(ToastContext);

// Export Toast type for RetroToast
export type { Toast };
