'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function WorkshopAttendancePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workshopId = params?.id as string;
  const [workshop, setWorkshop] = useState<any>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Load workshop data if needed
    // For now, we'll use the workshopId directly
  }, [isAuthenticated]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');
    setLocation(null);
    setDistance(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // If workshop has location, calculate distance
        if (workshop?.latitude && workshop?.longitude) {
          const dist = calculateDistance(
            latitude,
            longitude,
            workshop.latitude,
            workshop.longitude
          );
          setDistance(dist);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmitAttendance = async () => {
    if (!location) {
      setLocationError('Please get your location first');
      return;
    }

    if (distance !== null && distance > 100) {
      setLocationError(`You are ${Math.round(distance)}m away. Please move within 100m.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiClient.recordWorkshopAttendance(workshopId, location);
      
      if (response.success) {
        router.push('/talenta/my-courses');
      } else {
        setLocationError(response.message || 'Failed to record attendance');
      }
    } catch (error) {
      console.error('Attendance submission error:', error);
      setLocationError('Failed to record attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {workshop && (
                <div>
                  <h3 className="font-semibold mb-2">{workshop.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {workshop.location_name || workshop.city}, {workshop.province}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Location Verification Required:</strong> Please enable location services
                    and ensure you are at the workshop location (within 100m) to record attendance.
                  </div>
                </div>
              </div>

              <div>
                <Button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                  size="lg"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Get My Location
                    </>
                  )}
                </Button>
              </div>

              {locationError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <p className="text-sm text-destructive">{locationError}</p>
                  </div>
                </div>
              )}

              {location && (
                <div className="space-y-4">
                  <div
                    className={`rounded-lg p-4 border ${
                      distance !== null && distance <= 100
                        ? 'bg-success/10 border-success/30'
                        : distance !== null && distance > 100
                        ? 'bg-destructive/10 border-destructive/30'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Location Captured</span>
                      {distance !== null && distance <= 100 && (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                      {distance !== null && distance > 100 && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>Latitude: {location.latitude.toFixed(6)}</p>
                      <p>Longitude: {location.longitude.toFixed(6)}</p>
                      {distance !== null && (
                        <p className="font-medium text-foreground">
                          Distance from workshop: {Math.round(distance)}m
                          {distance > 100 && (
                            <span className="text-destructive ml-2">(Too far! Must be within 100m)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Map placeholder - you can integrate Google Maps or Mapbox here */}
                  <div className="bg-muted border-2 border-border rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Map View</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your location and workshop location would be shown here
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link href="/talenta/my-courses">Cancel</Link>
                </Button>
                <Button
                  onClick={handleSubmitAttendance}
                  disabled={!location || (distance !== null && distance > 100) || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    'Record Attendance'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
