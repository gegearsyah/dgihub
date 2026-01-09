'use client';

import { useState, useEffect } from 'react';

interface AttendanceTrackerProps {
  workshopId: string;
  sessionId: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number; // in meters
  onAttendanceRecorded?: (data: { latitude: number; longitude: number; timestamp: Date }) => void;
}

export default function AttendanceTracker({
  workshopId,
  sessionId,
  latitude: targetLatitude,
  longitude: targetLongitude,
  geofenceRadius,
  onAttendanceRecorded
}: AttendanceTrackerProps) {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>('');
  const [timestamp, setTimestamp] = useState<Date | null>(null);

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsRecording(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const now = new Date();

        setCurrentLocation({ latitude: lat, longitude: lon });
        setTimestamp(now);

        const dist = calculateDistance(lat, lon, targetLatitude, targetLongitude);
        setDistance(dist);
        setIsWithinGeofence(dist <= geofenceRadius);

        setIsRecording(false);

        if (dist <= geofenceRadius && onAttendanceRecorded) {
          onAttendanceRecorded({ latitude: lat, longitude: lon, timestamp: now });
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setIsRecording(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (currentLocation) {
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        targetLatitude,
        targetLongitude
      );
      setDistance(dist);
      setIsWithinGeofence(dist <= geofenceRadius);
    }
  }, [currentLocation, targetLatitude, targetLongitude, geofenceRadius]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">GPS Attendance Verification</h3>

      <div className="space-y-4">
        {/* Target Location Info */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Workshop Location</span>
            <span className="text-xs text-gray-500 font-mono">
              {targetLatitude.toFixed(6)}, {targetLongitude.toFixed(6)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Geofence Radius</span>
            <span className="text-sm text-white font-medium">{geofenceRadius}m</span>
          </div>
        </div>

        {/* Current Location Status */}
        {currentLocation && (
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Location</span>
              <span className="text-xs text-gray-500 font-mono">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Distance</span>
              <span className={`text-sm font-medium ${
                isWithinGeofence ? 'text-green-400' : 'text-red-400'
              }`}>
                {distance ? `${distance.toFixed(0)}m` : 'Calculating...'}
              </span>
            </div>
            {timestamp && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Timestamp</span>
                <span className="text-xs text-gray-500">
                  {timestamp.toLocaleTimeString('id-ID')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status Indicator */}
        {currentLocation && (
          <div className={`rounded-lg p-4 ${
            isWithinGeofence
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{isWithinGeofence ? '✅' : '❌'}</span>
              <div>
                <p className={`font-semibold ${
                  isWithinGeofence ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isWithinGeofence ? 'Within Geofence' : 'Outside Geofence'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isWithinGeofence
                    ? 'You can record your attendance'
                    : `You need to be within ${geofenceRadius}m of the workshop location`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Capture Button */}
        <button
          onClick={getCurrentLocation}
          disabled={isRecording}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isRecording ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Capturing Location...</span>
            </>
          ) : (
            <>
              <span>📍</span>
              <span>Capture GPS Location</span>
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Make sure location services are enabled</p>
          <p>• Stand within {geofenceRadius}m of the workshop location</p>
          <p>• Your location and timestamp will be recorded</p>
        </div>
      </div>
    </div>
  );
}



