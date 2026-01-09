'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, XCircle, MapPin } from 'lucide-react';

interface GeoQRAttendanceProps {
  workshopId: string;
  sessionId: string;
  instructorMode?: boolean;
  onAttendanceRecorded?: (data: {
    qrCode: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
  }) => void;
}

/**
 * Geo-QR Attendance Component
 * Teaching Factory (TeFa) attendance with dynamic QR code and GPS verification
 */
export default function GeoQRAttendance({
  workshopId,
  sessionId,
  instructorMode = false,
  onAttendanceRecorded
}: GeoQRAttendanceProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [qrExpiry, setQrExpiry] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [distance, setDistance] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const WORKSHOP_LOCATION = {
    latitude: -6.2088, // Example: Jakarta coordinates
    longitude: 106.8456,
  };
  const GEOFENCE_RADIUS = 50; // 50 meters

  // Generate dynamic QR code (refreshes every 120 seconds)
  const generateQRCode = async () => {
    const timestamp = Date.now();
    const qrData = JSON.stringify({
      workshopId,
      sessionId,
      timestamp,
      expiry: timestamp + 120000, // 120 seconds
    });

    try {
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0D1B2A',
          light: '#E0E1DD',
        },
      });
      setQrCode(qrUrl);
      setQrExpiry(new Date(timestamp + 120000));
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Auto-refresh QR code every 120 seconds
  useEffect(() => {
    if (instructorMode) {
      generateQRCode();
      intervalRef.current = setInterval(generateQRCode, 120000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [instructorMode, workshopId, sessionId]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ latitude: lat, longitude: lon });

        // Calculate distance
        const dist = calculateDistance(
          lat,
          lon,
          WORKSHOP_LOCATION.latitude,
          WORKSHOP_LOCATION.longitude
        );
        setDistance(dist);

        if (dist <= GEOFENCE_RADIUS) {
          setScanStatus('success');
          // Trigger haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          onAttendanceRecorded?.({
            qrCode: `${workshopId}-${sessionId}`,
            latitude: lat,
            longitude: lon,
            timestamp: new Date(),
          });
        } else {
          setScanStatus('error');
        }
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
        setScanStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

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

  // Instructor Mode: Generate QR Code
  if (instructorMode) {
    return (
      <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#E0E1DD] mb-4">
          Generate Dynamic QR Code
        </h3>
        <p className="text-sm text-[#C5C6C0] mb-4">
          QR code refreshes every 120 seconds to prevent proxy attendance
        </p>

        {qrCode && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={qrCode} alt="Attendance QR Code" className="w-64 h-64" />
            </div>
            {qrExpiry && (
              <p className="text-sm text-[#C5C6C0]">
                Expires: {qrExpiry.toLocaleTimeString('id-ID')}
              </p>
            )}
          </div>
        )}

        <button
          onClick={generateQRCode}
          className="mt-4 w-full px-6 py-3 bg-[#2D6A4F] hover:bg-[#2D6A4F]/80 text-white rounded-lg font-medium transition-colors touch-target"
        >
          Generate New QR Code
        </button>
      </div>
    );
  }

  // Student Mode: Scan QR Code
  return (
    <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#E0E1DD] mb-4">Scan QR Code for Attendance</h3>

      {/* Instructions */}
      <div className="bg-[#0D1B2A] rounded-lg p-4 mb-4">
        <p className="text-sm text-[#C5C6C0] mb-2">
          • Position QR code within the frame
        </p>
        <p className="text-sm text-[#C5C6C0] mb-2">
          • Enable Location Services
        </p>
        <p className="text-sm text-[#C5C6C0]">
          • You must be within 50m of the workshop center
        </p>
      </div>

      {/* Camera/QR Scanner Area */}
      <div className="relative bg-[#0D1B2A] rounded-lg mb-4" style={{ aspectRatio: '1' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-lg"
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 border-[#2D6A4F] rounded-lg" style={{ width: '80%', aspectRatio: '1' }} />
        </div>
      </div>

      {/* Location Status */}
      {location && (
        <div className="mb-4 p-4 bg-[#0D1B2A] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm text-[#E0E1DD]">Location Verified</span>
          </div>
          {distance !== null && (
            <p className="text-xs text-[#C5C6C0]">
              Distance: {distance.toFixed(0)}m from workshop center
            </p>
          )}
        </div>
      )}

      {/* Status Messages */}
      {scanStatus === 'success' && (
        <div className="mb-4 p-4 bg-[#2D6A4F]/20 border border-[#2D6A4F] rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <div>
            <p className="text-[#E0E1DD] font-semibold">Location Verified</p>
            <p className="text-sm text-[#C5C6C0]">
              You are within the required range. Attendance recorded.
            </p>
          </div>
        </div>
      )}

      {scanStatus === 'error' && (
        <div className="mb-4 p-4 bg-[#BA1A1A]/20 border border-[#BA1A1A] rounded-lg flex items-center gap-3">
          <XCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-[#E0E1DD] font-semibold">
              {distance && distance > GEOFENCE_RADIUS ? 'Out of Range' : 'Invalid QR'}
            </p>
            <p className="text-sm text-[#C5C6C0]">
              {distance && distance > GEOFENCE_RADIUS
                ? `Please move closer to the workshop center (${(distance - GEOFENCE_RADIUS).toFixed(0)}m away)`
                : 'Please scan a valid QR code'}
            </p>
          </div>
        </div>
      )}

      {locationError && (
        <div className="mb-4 p-4 bg-[#BA1A1A]/20 border border-[#BA1A1A] rounded-lg">
          <p className="text-sm text-[#BA1A1A]">{locationError}</p>
        </div>
      )}

      {/* Scan Button */}
      <button
        onClick={getCurrentLocation}
        disabled={scanStatus === 'scanning'}
        className="w-full px-6 py-3 bg-[#2D6A4F] hover:bg-[#2D6A4F]/80 disabled:bg-[#415A77] disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors touch-target flex items-center justify-center gap-2"
      >
        {scanStatus === 'scanning' ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Verifying Location...</span>
          </>
        ) : (
          <>
            <MapPin className="h-5 w-5" />
            <span>Verify Location & Record Attendance</span>
          </>
        )}
      </button>
    </div>
  );
}
