import { useState, useEffect, useCallback, useRef } from 'react';
import { DriverOffer, WebSocketEnvelope } from '../types';
import { RealtimeWebSocketService } from '../services/websocketClient';
import { ApiClient } from '../services/apiClient';

export function useDriverOffers(driverId: string) {
  const [activeOffer, setActiveOffer] = useState<DriverOffer | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  const clearCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((seconds: number) => {
    clearCountdown();
    setRemainingSeconds(seconds);

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearCountdown();
          setActiveOffer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  // Handle incoming offer
  const handleNewOffer = useCallback((offer: DriverOffer) => {
    setActiveOffer(offer);
    const expiresAt = new Date(offer.expiresAt).getTime();
    const now = Date.now();
    const diffSecs = Math.max(0, Math.floor((expiresAt - now) / 1000));
    startCountdown(diffSecs > 0 ? diffSecs : 15);
  }, [startCountdown]);

  useEffect(() => {
    if (!driverId) return;

    // Check existing pending offers on mount
    ApiClient.getDriverOffers(driverId)
      .then((offers) => {
        if (offers && offers.length > 0) {
          handleNewOffer(offers[0]);
        }
      })
      .catch((err) => console.warn('Could not fetch existing offers:', err));

    const wsService = RealtimeWebSocketService.getInstance();
    const unsub = wsService.subscribe<DriverOffer>(
      `/topic/drivers/${driverId}/offers`,
      (envelope: WebSocketEnvelope<DriverOffer>) => {
        if (envelope.eventType === 'DRIVER_OFFER_CREATED') {
          handleNewOffer(envelope.payload);
        }
      }
    );

    return () => {
      unsub();
      clearCountdown();
    };
  }, [driverId, handleNewOffer, clearCountdown]);

  const acceptCurrentOffer = async (): Promise<boolean> => {
    if (!activeOffer) return false;
    try {
      setIsAccepting(true);
      await ApiClient.acceptOffer(activeOffer.id, driverId);
      clearCountdown();
      setActiveOffer(null);
      return true;
    } catch (err: any) {
      alert(`Accept failed: ${err.message}`);
      return false;
    } finally {
      setIsAccepting(false);
    }
  };

  const rejectCurrentOffer = async (): Promise<void> => {
    if (!activeOffer) return;
    try {
      await ApiClient.rejectOffer(activeOffer.id, driverId);
    } catch (err) {
      console.warn('Reject offer error:', err);
    } finally {
      clearCountdown();
      setActiveOffer(null);
    }
  };

  return {
    activeOffer,
    remainingSeconds,
    isAccepting,
    acceptCurrentOffer,
    rejectCurrentOffer
  };
}
