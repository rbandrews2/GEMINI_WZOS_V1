import { useState, useEffect, useRef, useCallback } from 'react';
import { Job } from '../types';
import {
  evaluateAllJobs,
  GeofenceEvaluation,
  calculateDistanceMeters,
  formatDistance,
} from '../utils/geofencing';

export type GpsStatus = 'active' | 'searching' | 'denied' | 'simulated' | 'unsupported';

export interface UseGeofencingOptions {
  jobs: Job[];
  defaultRadiusMeters?: number;
  onArrival?: (job: Job, evaluation: GeofenceEvaluation) => void;
}

export function useGeofencing({
  jobs,
  defaultRadiusMeters = 350,
  onArrival,
}: UseGeofencingOptions) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('searching');
  const [geofenceRadius, setGeofenceRadius] = useState<number>(defaultRadiusMeters);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [simulatedJobName, setSimulatedJobName] = useState<string | null>(null);
  const [dismissedJobId, setDismissedJobId] = useState<string | null>(null);
  const [autoSelectJob, setAutoSelectJob] = useState<boolean>(true);

  const prevInsideJobIdRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Start real GPS watcher
  const startGpsWatcher = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }

    setGpsStatus('searching');

    const handleSuccess = (position: GeolocationPosition) => {
      // Only apply if not actively simulating
      if (!isSimulated) {
        const newCoords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setCoords(newCoords);
        setAccuracy(Math.round(position.coords.accuracy));
        setGpsStatus('active');
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (!isSimulated) {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('denied');
        } else {
          // Default fallback to first job coordinate area or simulated if device has no fix
          setGpsStatus('searching');
        }
      }
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    } catch {
      setGpsStatus('unsupported');
    }
  }, [isSimulated]);

  // Initial setup of GPS
  useEffect(() => {
    startGpsWatcher();

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startGpsWatcher]);

  // Evaluate all jobs relative to current coords
  const evaluations: GeofenceEvaluation[] = coords
    ? evaluateAllJobs(coords, jobs, geofenceRadius)
    : [];

  const nearestEvaluation = evaluations.length > 0 ? evaluations[0] : null;

  // The job that worker is currently inside geofence perimeter of (if any)
  const arrivedEvaluation = evaluations.find(
    (e) => e.isInside && e.job.id !== dismissedJobId
  ) || null;

  // Trigger onArrival callback when newly entering a geofence
  useEffect(() => {
    if (arrivedEvaluation && arrivedEvaluation.job.id !== prevInsideJobIdRef.current) {
      prevInsideJobIdRef.current = arrivedEvaluation.job.id;
      if (onArrival) {
        onArrival(arrivedEvaluation.job, arrivedEvaluation);
      }
    } else if (!arrivedEvaluation) {
      prevInsideJobIdRef.current = null;
    }
  }, [arrivedEvaluation, onArrival]);

  // Simulation controls
  const simulateArrivalAtJob = useCallback((job: Job) => {
    setIsSimulated(true);
    setSimulatedJobName(job.title);
    setGpsStatus('simulated');
    setDismissedJobId(null);
    // Put coordinates ~45 meters offset from job site center
    const simulatedCoords: [number, number] = [
      job.coordinates[0] + 0.0003,
      job.coordinates[1] + 0.0003,
    ];
    setCoords(simulatedCoords);
    setAccuracy(8); // 8 meters accuracy
  }, []);

  const simulateEnRoute = useCallback((job: Job) => {
    setIsSimulated(true);
    setSimulatedJobName(`En-Route to ${job.jobNumber}`);
    setGpsStatus('simulated');
    setDismissedJobId(null);
    // Place worker ~4.5 miles away
    const simulatedCoords: [number, number] = [
      job.coordinates[0] - 0.065,
      job.coordinates[1] - 0.065,
    ];
    setCoords(simulatedCoords);
    setAccuracy(18);
  }, []);

  const resetToRealGps = useCallback(() => {
    setIsSimulated(false);
    setSimulatedJobName(null);
    setDismissedJobId(null);
    startGpsWatcher();
  }, [startGpsWatcher]);

  const dismissArrivalSuggestion = useCallback((jobId: string) => {
    setDismissedJobId(jobId);
  }, []);

  return {
    coords,
    accuracy,
    gpsStatus,
    geofenceRadius,
    setGeofenceRadius,
    evaluations,
    nearestEvaluation,
    arrivedEvaluation,
    isInsideGeofence: Boolean(arrivedEvaluation),
    isSimulated,
    simulatedJobName,
    autoSelectJob,
    setAutoSelectJob,
    simulateArrivalAtJob,
    simulateEnRoute,
    resetToRealGps,
    dismissArrivalSuggestion,
  };
}
