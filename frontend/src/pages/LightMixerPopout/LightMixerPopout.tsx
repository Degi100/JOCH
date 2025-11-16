// ============================================
// JOCH Bandpage - Light Mixer Popout Window
// Standalone page for dual-monitor setups
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import LightMixer from '../../components/LightMixer/LightMixer';
import styles from './LightMixerPopout.module.scss';

const LightMixerPopout: React.FC = () => {
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const [syncedState, setSyncedState] = useState<any>(null);
  const isReceivingBroadcastRef = useRef<boolean>(false); // Flag to prevent echo

  useEffect(() => {
    // Setup BroadcastChannel to receive events from main window
    broadcastChannelRef.current = new BroadcastChannel('concert-mode-events');

    // Notify main window that popout is closing when user closes the window
    const handleBeforeUnload = () => {
      console.log('🪟 Popout closing - notifying main window');
      broadcastChannelRef.current?.postMessage({
        type: 'popoutClosed'
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    broadcastChannelRef.current.onmessage = (event) => {
      const { type, detail, state } = event.data;

      // Set flag to prevent re-broadcasting received events
      isReceivingBroadcastRef.current = true;

      // Re-dispatch events in this window
      if (type === 'musicBeat') {
        window.dispatchEvent(new CustomEvent('musicBeat', { detail }));
      } else if (type === 'lightControl') {
        // Dispatch received lightControl (but don't re-broadcast - that's why we set the flag!)
        window.dispatchEvent(new CustomEvent('lightControl', { detail }));
      } else if (type === 'stateSync') {
        // Sync state from main window
        setSyncedState(state);
        console.log('🔄 State synced from main window:', state);

        // Trigger state update event for LightMixer to consume
        window.dispatchEvent(new CustomEvent('lightMixerStateSync', { detail: state }));
      }

      // Reset flag after a short delay
      setTimeout(() => {
        isReceivingBroadcastRef.current = false;
      }, 10);
    };

    // CRITICAL FIX: Listen to lightControl events from LightMixer in THIS window
    // and broadcast them back to the main window (but ONLY if they were generated locally!)
    const handleLocalLightControl = (e: Event) => {
      // Skip if this event came from a broadcast (prevent echo/loop)
      if (isReceivingBroadcastRef.current) {
        return;
      }

      const customEvent = e as CustomEvent;
      console.log('🎛️ Popout: Broadcasting lightControl to main window:', customEvent.detail);

      // Broadcast back to main window
      broadcastChannelRef.current?.postMessage({
        type: 'lightControl',
        detail: customEvent.detail
      });
    };

    window.addEventListener('lightControl', handleLocalLightControl);

    console.log('🪟 Popout window ready - listening for events from main window');

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('lightControl', handleLocalLightControl);
      broadcastChannelRef.current?.close();
    };
  }, []);

  return (
    <div className={styles.popoutContainer}>
      <LightMixer isActive={true} isPopout={true} />
    </div>
  );
};

export default LightMixerPopout;
