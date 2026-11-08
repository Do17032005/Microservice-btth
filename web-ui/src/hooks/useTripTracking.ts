import { useState, useEffect, useCallback } from 'react';
import { Trip, LocationPoint, WebSocketEnvelope } from '../types';
import { RealtimeWebSocketService } from '../services/websocketClient';
import { ApiClient } from '../services/apiClient';

export function useTripTracking(initialTripId?: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [driverLocation, setDriverLocation] = useState<LocationPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTripSnapshot = useCallback(async (tripId: string) => {
    try {
      setIsLoading(true);
      const data = await ApiClient.getTrip(tripId);
      setTrip(data);
      if (data.driverLocation) {
        setDriverLocation(data.driverLocation);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip state');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialTripId) return;

    fetchTripSnapshot(initialTripId);

    const wsService = RealtimeWebSocketService.getInstance();

    // Subscribe to trip status changes
    const unsubStatus = wsService.subscribe<Trip>(
      `/topic/trips/${initialTripId}`,
      (envelope: WebSocketEnvelope<Trip>) => {
        if (envelope.eventType === 'TRIP_STATUS_CHANGED') {
          setTrip((prev) => (prev ? { ...prev, ...envelope.payload } : envelope.payload));
        }
      }
    );

    // Subscribe to driver telemetry stream
    const unsubLocation = wsService.subscribe<LocationPoint>(
      `/topic/trips/${initialTripId}/location`,
      (envelope: WebSocketEnvelope<LocationPoint>) => {
        if (envelope.eventType === 'DRIVER_LOCATION_UPDATED') {
          setDriverLocation(envelope.payload);
        }
      }
    );

    return () => {
      unsubStatus();
      unsubLocation();
    };
  }, [initialTripId, fetchTripSnapshot]);

  return {
    trip,
    setTrip,
    driverLocation,
    isLoading,
    error,
    refresh: () => initialTripId && fetchTripSnapshot(initialTripId)
  };
}
