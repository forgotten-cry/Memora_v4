import React from 'react';
import soundService from '../../services/soundService';
import { useAppContext } from '../../context/AppContext';

const AcknowledgeModal: React.FC<{ alertId: string; alertType: 'SOS' | 'FALL'; onClose?: () => void }> = ({ alertId, alertType, onClose }) => {
  const { dispatch } = useAppContext();

  const acknowledge = () => {
    // Stop appropriate sound
    if (alertType === 'SOS') soundService.stopSosAlert();
    if (alertType === 'FALL') soundService.stopFallAlert();
    // Mark alerts as acknowledged in global state
    dispatch({ type: 'ACKNOWLEDGE_ALERTS' });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-60">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 z-70 border border-slate-700">
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
