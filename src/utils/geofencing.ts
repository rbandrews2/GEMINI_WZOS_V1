import { Job } from '../types';

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 * @returns distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance into a human-readable string (ft for close distances, mi for farther).
 */
export function formatDistance(meters: number): string {
  const feet = meters * 3.28084;
  if (feet < 1000) {
    return `${Math.round(feet)} ft`;
  }
  const miles = meters * 0.000621371;
  if (miles < 10) {
    return `${miles.toFixed(2)} mi`;
  }
  return `${miles.toFixed(1)} mi`;
}

/**
 * Standard geofence radiuses in meters
 */
export const GEOFENCE_PRESETS = [
  { label: 'Tight (150m / 500ft)', value: 150, description: 'Work zone core & taper point' },
  { label: 'Standard (350m / 1,150ft)', value: 350, description: 'Full work corridor & staging buffer' },
  { label: 'Extended (800m / 0.5mi)', value: 800, description: 'Advanced warning sign perimeter' },
];

export interface GeofenceEvaluation {
  job: Job;
  distanceMeters: number;
  distanceFormatted: string;
  isInside: boolean;
  bearingDeg?: number;
}

/**
 * Evaluates whether current coordinates are within a job's geofence radius.
 */
export function evaluateJobGeofence(
  userCoords: [number, number],
  job: Job,
  radiusMeters: number = 350
): GeofenceEvaluation {
  const dist = calculateDistanceMeters(
    userCoords[0],
    userCoords[1],
    job.coordinates[0],
    job.coordinates[1]
  );

  return {
    job,
    distanceMeters: dist,
    distanceFormatted: formatDistance(dist),
    isInside: dist <= radiusMeters,
  };
}

/**
 * Finds all jobs sorted by distance to the user's coordinates.
 */
export function evaluateAllJobs(
  userCoords: [number, number],
  jobs: Job[],
  radiusMeters: number = 350
): GeofenceEvaluation[] {
  return jobs
    .map((job) => evaluateJobGeofence(userCoords, job, radiusMeters))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
