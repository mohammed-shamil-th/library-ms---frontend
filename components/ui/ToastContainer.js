'use client';

import { useState, useEffect, useCallback } from 'react';
import Toast from './Toast';

// Global toast state
let toastListeners = [];
let toasts = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toasts]));
};

// Export showToast function
export const showToast = (message, type = 'success', duration = 3000) => {
  const id = Date.now() + Math.random();
  const newToast = { id, message, type, duration };
  toasts = [...toasts, newToast];
  notifyListeners();

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter((toast) => toast.id !== id);
      notifyListeners();
    }, duration);
  }
};

export default function ToastContainer({ toasts: externalToasts, removeToast: externalRemoveToast }) {
  const [internalToasts, setInternalToasts] = useState([]);

  useEffect(() => {
    // If external toasts are provided, use them (for admin dashboard)
    if (externalToasts && externalRemoveToast) {
      return;
    }

    // Otherwise, use global toast system
    const listener = (newToasts) => {
      setInternalToasts(newToasts);
    };

    toastListeners.push(listener);
    setInternalToasts([...toasts]);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, [externalToasts, externalRemoveToast]);

  const removeToast = useCallback(
    (id) => {
      if (externalRemoveToast) {
        externalRemoveToast(id);
      } else {
        toasts = toasts.filter((toast) => toast.id !== id);
        notifyListeners();
      }
    },
    [externalRemoveToast]
  );

  const displayToasts = externalToasts || internalToasts;

  return (
    <div className="toast-container">
      {displayToasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}

