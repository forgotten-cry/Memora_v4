import React, { useState, useEffect } from 'react';
import PatientView from './components/patient/PatientView';
import CaregiverView from './components/caregiver/CaregiverView';
import FamilyView from './components/family/FamilyView';
import { ViewMode } from './types';
import { useAppContext } from './context/AppContext';
import soundService from './services/soundService';
import localNotifications from './services/localNotifications';
import DemoLogin from './components/shared/DemoLogin';
import LoginPage from './components/shared/LoginPage';
import AcknowledgeModal from './components/shared/AcknowledgeModal';

const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  // Use global currentView from app state so login can control the dashboard
  const viewMode = state.currentView || ViewMode.PATIENT;

  const realtimeDotClass = (user: any) => {
    if (state.devMode) return 'bg-yellow-400';
    return user ? 'bg-green-400' : 'bg-red-500';
  };

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

  // Expose a global helper so PatientHome can open the login modal without prop drilling
  useEffect(() => {
    (window as any).openLoginModal = () => setShowLogin(true);
    return () => { (window as any).openLoginModal = undefined; };
  }, []);

  // Centralized alert sound control: only play alerts for caregiver/family or when in devMode.
  useEffect(() => {
    const unack = state.alerts.filter(a => (a.type === 'SOS' || a.type === 'FALL') && a.requiresAcknowledgement);
    const role = state.currentUser?.role?.toUpperCase?.();
    const canHear = state.devMode || role === 'CAREGIVER' || role === 'FAMILY';

    if (!canHear) {
      soundService.stopSosAlert();
      soundService.stopFallAlert();
      return;
    }

    if (unack.length > 0) {
      if (unack.some(a => a.type === 'SOS')) {
        soundService.stopFallAlert();
        soundService.playSosAlert();
      } else if (unack.some(a => a.type === 'FALL')) {
        soundService.stopSosAlert();
        soundService.playFallAlert();
      }
    } else {
      soundService.stopSosAlert();
      soundService.stopFallAlert();
    }

    return () => {
      soundService.stopSosAlert();
      soundService.stopFallAlert();
    };
  }, [state.alerts, state.currentUser, state.devMode]);

  // Request native permissions (microphone/camera) when a user logs in on native platforms
  useEffect(() => {
    const tryRequestNativePermissions = async () => {
      try {
        const Cap = (window as any).Capacitor;
        if (Cap && typeof Cap.isNativePlatform === 'function' && Cap.isNativePlatform()) {
          // dynamic import to avoid bundler issues on web
          const core = await import('@capacitor/core');
          const coreAny: any = core;
          try {
            if (coreAny.Permissions && typeof coreAny.Permissions.request === 'function') {
              await coreAny.Permissions.request({ name: 'camera' as any });
            }
          } catch (e) {
            console.warn('Camera permission request failed', e);
          }
          try {
            if (coreAny.Permissions && typeof coreAny.Permissions.request === 'function') {
              await coreAny.Permissions.request({ name: 'microphone' as any });
            }
          } catch (e) {
            console.warn('Microphone permission request failed', e);
          }
        }
      } catch (e) {
        // Not a native environment or permissions plugin missing — ignore.
        // On web, components already request permissions when needed.
      }
    };

    if (state.currentUser) {
      // Request permissions for camera/microphone (existing) and additional
      // best-effort requests for bluetooth, motion/activity, and notifications.
      tryRequestNativePermissions();
      // Request notification permission (web) and Local Notifications on native
      (async () => {
        try {
          await localNotifications.requestPermission();
        } catch (e) {
          console.warn('Notification permission request failed', e);
        }
      })();
    }
  }, [state.currentUser]);


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
    let next = ViewMode.PATIENT;
    if (viewMode === ViewMode.PATIENT) next = ViewMode.CAREGIVER;
    else if (viewMode === ViewMode.CAREGIVER) next = ViewMode.FAMILY;
    else next = ViewMode.PATIENT;
    dispatch({ type: 'SET_VIEW_MODE', payload: next });
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

  const canShowMasterSwitch = !!state.currentUser || !!state.devMode;

  const [showLogin, setShowLogin] = React.useState(false);
  const [showAckForAlertId, setShowAckForAlertId] = React.useState<string | null>(null);

  return (
    // The main background is now on the body tag in index.html
    <div className="min-h-screen font-sans antialiased text-gray-300"> 
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {/* Connection status dot */}
        <div className={`w-3 h-3 rounded-full ${realtimeDotClass(state.currentUser)} ${state.devMode ? 'ring-2 ring-yellow-400' : ''}`} title={state.currentUser ? 'Connected' : 'Not connected'} />
        {canShowMasterSwitch && (
          <button
            onClick={handleSwitchView}
            className="px-3 py-1 bg-slate-800/80 border border-slate-700 text-xs text-gray-300 rounded-full shadow-sm hover:bg-slate-700/90 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            {getNextViewName()}
          </button>
        )}
      </div>
      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}

      {/* Show acknowledge modal for the first critical alert that requires acknowledgment */}
      {state.alerts.length > 0 && !showAckForAlertId && (() => {
        const critical = state.alerts.find(a => (a.type === 'SOS' || a.type === 'FALL') && a.requiresAcknowledgement);
        if (critical) {
          setShowAckForAlertId(critical.id);
        }
        return null;
      })()}

      {showAckForAlertId && (() => {
        const a = state.alerts.find(x => x.id === showAckForAlertId);
        if (!a) return null;
        return (
          <AcknowledgeModal
            alertId={a.id}
            alertType={a.type === 'FALL' ? 'FALL' : 'SOS'}
            onClose={() => setShowAckForAlertId(null)}
          />
        );
      })()}
      
      <div className="container mx-auto max-w-lg p-2 sm:p-4">
        {renderView()}
      </div>
    </div>
  );
};

export default App;