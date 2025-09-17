// A simple service to manage audio playback for alerts.

// Import audio assets so the bundler (Vite) includes them in the app package.
import sosAsset from '../assets/audio/sos_alert.mp3';
import fallAsset from '../assets/audio/fall_alert.mp3';
import reminderAsset from '../assets/audio/reminder_notification.mp3';

let sosAudio: HTMLAudioElement | null = null;
let fallAudio: HTMLAudioElement | null = null;
let reminderAudio: HTMLAudioElement | null = null;
let isUnlocked = false;

function ensureAudioElement(kind: 'sos' | 'fall' | 'reminder'): HTMLAudioElement {
  if (kind === 'sos') {
    if (sosAudio) return sosAudio;
    sosAudio = new Audio(sosAsset);
    sosAudio.loop = true;
    return sosAudio;
  }
  if (kind === 'fall') {
    if (fallAudio) return fallAudio;
    fallAudio = new Audio(fallAsset);
    fallAudio.loop = true;
    return fallAudio;
  }
  if (reminderAudio) return reminderAudio;
  reminderAudio = new Audio(reminderAsset);
  reminderAudio.loop = false;
  return reminderAudio;
}

const soundService = {
  /**
   * Unlocks the browser's audio context by playing a muted sound.
   * This MUST be called from within a user-initiated event handler (e.g., a click).
   */
  unlock: () => {
    if (isUnlocked) return;
    try {
      console.log('Attempting to unlock audio context...');
      const audio = ensureAudioElement('sos');
      audio.muted = true;
      const promise = audio.play();
      if (promise) {
        promise.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          isUnlocked = true;
          console.log('Audio context unlocked successfully.');
        }).catch(err => {
          console.error('Audio unlock failed. Subsequent sounds may not play until another interaction.', err);
        });
      }
    } catch (err) {
      console.error('Audio unlock failed synchronously', err);
    }
  },

  playSosAlert: () => {
    try {
      const audio = ensureAudioElement('sos');
      console.debug('[soundService] playSosAlert -> src=', audio.src);
      audio.muted = false;
      audio.volume = 1.0;
      // Ensure we start from the beginning for loudness
      audio.currentTime = 0;
      if (audio.paused) audio.play().catch(e => console.error('Error playing SOS sound:', e));
    } catch (e) {
      console.error('Error ensuring SOS audio element:', e);
    }
  },

  stopSosAlert: () => {
    if (sosAudio) {
      try {
        if (!sosAudio.paused) {
          sosAudio.pause();
          sosAudio.currentTime = 0;
        }
      } catch (e) {
        console.error('Error stopping SOS audio', e);
      }
    }
  },

  playFallAlert: () => {
    try {
      const audio = ensureAudioElement('fall');
      console.debug('[soundService] playFallAlert -> src=', audio.src);
      audio.muted = false;
      audio.volume = 1.0;
      audio.currentTime = 0;
      if (audio.paused) audio.play().catch(e => console.error('Error playing Fall alert sound:', e));
    } catch (e) {
      console.error('Error ensuring Fall audio element:', e);
    }
  },

  stopFallAlert: () => {
    if (fallAudio) {
      try {
        if (!fallAudio.paused) {
          fallAudio.pause();
          fallAudio.currentTime = 0;
        }
      } catch (e) {
        console.error('Error stopping Fall audio', e);
      }
    }
  },

  playReminderAlert: () => {
    try {
      const audio = ensureAudioElement('reminder');
      audio.currentTime = 0;
      audio.play().catch(e => console.error('Error playing reminder sound:', e));
    } catch (e) {
      console.error('Error ensuring Reminder audio element:', e);
    }
  }
};

export default soundService;
