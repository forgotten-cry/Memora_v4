import React, { useEffect, useRef } from 'react';
import soundService from '../../services/soundService';
import { useAppContext } from '../../context/AppContext';

const AcknowledgeModal: React.FC<{ alertId: string; alertType: 'SOS' | 'FALL'; onClose?: () => void }> = ({ alertId, alertType, onClose }) => {
  const { dispatch } = useAppContext();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    lastActive.current = document.activeElement as HTMLElement | null;
    setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      lastActive.current?.focus?.();
    };
  }, [onClose]);

  const acknowledge = () => {
    if (alertType === 'SOS') soundService.stopSosAlert();
    if (alertType === 'FALL') soundService.stopFallAlert();
    dispatch({ type: 'ACKNOWLEDGE_ALERTS' });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 99999 }} aria-hidden={false}>
      <div className="absolute inset-0 bg-black/60" style={{ zIndex: 99998 }} />
      <div ref={modalRef} role="dialog" aria-modal="true" className="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 border border-slate-700" style={{ zIndex: 99999 }}>
        <h3 className="text-lg font-bold mb-2">Important Alert</h3>
        <p className="text-sm text-slate-300 mb-4">A critical {alertType === 'SOS' ? 'SOS' : 'Fall'} alert is active. Please acknowledge to stop the alarm.</p>
        <div className="flex justify-end gap-2">
          <button onClick={acknowledge} className="px-4 py-2 bg-red-600 rounded">Acknowledge</button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgeModal;
