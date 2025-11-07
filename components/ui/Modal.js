'use client';

import { useEffect } from 'react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, description, children, className = '' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {description && <p className="modal-description">{description}</p>}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

