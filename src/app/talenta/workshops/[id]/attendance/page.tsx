'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockWorkshops } from '@/lib/mockData';

export default function WorkshopAttendancePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workshopId = params?.id as string;
  const [workshop, setWorkshop] = useState<any>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const foundWorkshop = mockWorkshops.find(w => w.workshop_id === workshopId);
    if (foundWorkshop) {
      setWorkshop(foundWorkshop);
    }
  }, [workshopId]);

  const getCurrentLocation = () => {
    setIsRecording(true);
    setLocationError('');

    // Mock GPS location (in real app, use navigator.geolocation)
    setTimeout(() => {
      const mockLat = workshop?.latitude || -6.2088;
      const mockLon = workshop?.longitude || 106.8456;
      // Add small random offset to simulate real GPS
      const lat = mockLat + (Math.random() - 0.5) * 0.001;
      const lon = mockLon + (Math.random() - 0.5) * 0.001;

      setLocation({ latitude: lat, longitude: lon });
      setIsRecording(false);
    }, 2000);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

  const handleSubmitAttendance = () => {
    if (!location || !workshop) return;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      workshop.latitude,
      workshop.longitude
    );

    if (distance > 100) {
      setLocationError(`You are ${Math.round(distance)}m away from the workshop location. Please move closer.`);
      return;
    }

    // Mock attendance submission
    alert('Attendance recorded successfully!');
    router.push('/talenta/my-courses');
  };

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const distance = location && workshop
    ? calculateDistance(location.latitude, location.longitude, workshop.latitude, workshop.longitude)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/talenta/courses" className="text-xl font-bold text-gray-900">
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workshop Attendance</h1>
          <p className="text-gray-600 mb-6">{workshop.title}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Location Verification Required:</strong> Please enable location services and ensure
              you are at the workshop location to record attendance.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Workshop Location</h3>
            <p className="text-gray-700">{workshop.location_name}</p>
            <p className="text-gray-600 text-sm">{workshop.city}, {workshop.province}</p>
            <p className="text-gray-600 text-sm">
              {new Date(workshop.start_date).toLocaleDateString()} • {workshop.start_time} - {workshop.end_time}
            </p>
          </div>

          <div className="mb-6">
            <button
              onClick={getCurrentLocation}
              disabled={isRecording}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecording ? 'Getting Location...' : '📍 Get My Location'}
            </button>
          </div>

          {location && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">Location Captured</span>
                  {distance !== null && distance <= 100 && (
                    <span className="text-green-600 text-sm">✓ Within range</span>
                  )}
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Latitude: {location.latitude.toFixed(6)}</p>
                  <p>Longitude: {location.longitude.toFixed(6)}</p>
                  {distance !== null && (
                    <p className="font-medium">
                      Distance from workshop: {Math.round(distance)}m
                      {distance > 100 && <span className="text-red-600"> (Too far!)</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Map Mock */}
              <div className="bg-gray-200 border-2 border-gray-300 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-gray-600">Map View</p>
                  <p className="text-sm text-gray-500">Your location and workshop location would be shown here</p>
                </div>
              </div>
            </div>
          )}

          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{locationError}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <Link
              href="/talenta/courses"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmitAttendance}
              disabled={!location || (distance !== null && distance > 100)}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Record Attendance
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}



