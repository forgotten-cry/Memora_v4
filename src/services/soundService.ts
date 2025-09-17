// A simple service to manage audio playback for alerts.
import { SOS_ALERT_URL, REMINDER_ALERT_URL } from '../assets/audioData';

let sosAudio: HTMLAudioElement | null = null;
let reminderAudio: HTMLAudioElement | null = null;
let isUnlocked = false;

const soundService = {
  /**
   * Unlocks the browser's audio context by playing a muted sound.
   * This MUST be called from within a user-initiated event handler (e.g., a click).
   */
  unlock: () => {
    if (isUnlocked) return;
    
    console.log('Attempting to unlock audio context...');

    if (!sosAudio) {
      sosAudio = new Audio(SOS_ALERT_URL);
      sosAudio.loop = true;
    }
    if (!reminderAudio) {
      reminderAudio = new Audio(REMINDER_ALERT_URL);
      reminderAudio.loop = false;
    }

    // A common technique: play a muted sound to unlock the audio context.
    sosAudio.muted = true;
    const promise = sosAudio.play();

    if (promise) {
      promise.then(() => {
        // Once playback starts, we can pause it and unmute for future use.
        sosAudio?.pause();
        sosAudio.currentTime = 0;
        sosAudio.muted = false;
        isUnlocked = true;
        console.log('Audio context unlocked successfully.');
      }).catch(err => {
        // If it fails, we log the error but don't set isUnlocked,
        // allowing another user interaction to potentially try again.
        console.error('Audio unlock failed. Subsequent sounds may not play until another interaction.', err);
      });
    }
  },

  /**
   * Plays the looping SOS/Fall alert sound.
   */
  playSosAlert: () => {
    if (!sosAudio) {
      sosAudio = new Audio(SOS_ALERT_URL);
      sosAudio.loop = true;
    }
    // Check if it's already playing to avoid interrupting and restarting it
    if (sosAudio.paused) {
      sosAudio.play().catch(e => console.error("Error playing SOS sound:", e));
    }
  },
  
  /**
   * Stops the looping SOS/Fall alert sound and rewinds it.
   */
  stopSosAlert: () => {
    if (sosAudio && !sosAudio.paused) {
      sosAudio.pause();
      sosAudio.currentTime = 0; // Rewind to the start
    }
  },

  /**
   * Plays the one-time reminder notification sound.
   */
  playReminderAlert: () => {
    if (!reminderAudio) {
      reminderAudio = new Audio(REMINDER_ALERT_URL);
      reminderAudio.loop = false;
    }
    reminderAudio.currentTime = 0; // Rewind in case it's triggered again
    reminderAudio.play().catch(e => console.error("Error playing reminder sound:", e));
  }
};

export default soundService;
