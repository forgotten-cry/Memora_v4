import React, { useState, useEffect } from 'react';
import PatientView from './components/patient/PatientView';
import CaregiverView from './components/caregiver/CaregiverView';
import FamilyView from './components/family/FamilyView';
import { ViewMode } from './types';
import { useAppContext } from './context/AppContext';
import soundService from './services/soundService';

const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PATIENT);

  // Effect to unlock audio on the first user interaction
  useEffect(() => {
    const unlockAudioPlayback = () => {
      soundService.unlock();
      // This handler should only run once.
      document.removeEventListener('click', unlockAudioPlayback);
      document.removeEventListener('touchstart', unlockAudioPlayback);
    };

    document.addEventListener('click', unlockAudioPlayback);
    document.addEventListener('touchstart', unlockAudioPlayback);

    return () => {
      document.removeEventListener('click', unlockAudioPlayback);
      document.removeEventListener('touchstart', unlockAudioPlayback);
    };
  }, []);


  // Effect for checking reminders
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      const now = new Date();
      // Get current time in minutes from midnight for easy comparison
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes(); 

      state.reminders.forEach(reminder => {
        if (reminder.completed || reminder.notified) {
          return;
        }

        // Parse reminder time string (e.g., "08:30") into minutes from midnight
        const [hoursStr, minutesStr] = reminder.time.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        
        const reminderTimeInMinutes = hours * 60 + minutes;

        if (reminderTimeInMinutes <= currentTimeInMinutes) {
          console.log(`Reminder due: ${reminder.title}`);
          soundService.playReminderAlert();
          dispatch({ type: 'MARK_REMINDER_NOTIFIED', payload: reminder.id });
        }
      });
    }, 30000); // Check every 30 seconds for responsiveness

    return () => clearInterval(reminderInterval);
  }, [state.reminders, dispatch]);


  const handleSwitchView = () => {
    if (viewMode === ViewMode.PATIENT) {
      setViewMode(ViewMode.CAREGIVER);
    } else if (viewMode === ViewMode.CAREGIVER) {
      setViewMode(ViewMode.FAMILY);
    } else {
      setViewMode(ViewMode.PATIENT);
    }
  };

  const getNextViewName = () => {
    if (viewMode === ViewMode.PATIENT) return 'Caregiver';
    if (viewMode === ViewMode.CAREGIVER) return 'Family';
    return 'Patient';
  };

  const renderView = () => {
    switch(viewMode) {
      case ViewMode.PATIENT:
        return <PatientView />;
      case ViewMode.CAREGIVER:
        return <CaregiverView />;
      case ViewMode.FAMILY:
        return <FamilyView />;
      default:
        return <PatientView />;
    }
  }

  return (
    // The main background is now on the body tag in index.html
    <div className="min-h-screen font-sans antialiased text-gray-300"> 
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleSwitchView}
          className="px-4 py-2 bg-slate-800/80 border border-slate-700 backdrop-blur-sm text-sm text-gray-300 rounded-full shadow-lg hover:bg-slate-700/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Switch to {getNextViewName()} View
        </button>
      </div>
      
      <div className="container mx-auto max-w-lg p-2 sm:p-4">
        {renderView()}
      </div>
    </div>
  );
};

export default App;