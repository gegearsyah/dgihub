'use client';

import { useState, useRef, useEffect } from 'react';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FaceIcon from '@mui/icons-material/Face';

interface EKYCFlowProps {
  onComplete?: (data: {
    nik: string;
    name: string;
    photo: string;
    livenessScore: number;
  }) => void;
  onError?: (error: string) => void;
}

/**
 * e-KYC Flow Component
 * Electronic Know Your Customer with OCR and Liveness Check
 * UU PDP compliant identity verification
 */
export default function EKYCFlow({ onComplete, onError }: EKYCFlowProps) {
  const [step, setStep] = useState<'ocr' | 'liveness' | 'complete'>('ocr');
  const [ocrData, setOcrData] = useState<{ nik: string; name: string } | null>(null);
  const [livenessPrompt, setLivenessPrompt] = useState<string>('');
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'detecting' | 'success' | 'failed'>('idle');
  const [feedback, setFeedback] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const livenessPrompts = [
    'Blink 3 times',
    'Turn head left',
    'Turn head right',
    'Smile',
    'Look straight ahead',
  ];

  // Initialize camera for OCR scan
  useEffect(() => {
    if (step === 'ocr') {
      startCamera();
    } else if (step === 'liveness') {
      startLivenessCheck();
    }

    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera for document scan
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      onError?.('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureDocument = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');

    // Simulate OCR processing (in production, call OCR API)
    // This would typically call an OCR service to extract NIK and name from E-KTP
    setTimeout(() => {
      // Mock OCR result
      const mockOcrData = {
        nik: '3201012345678901',
        name: 'John Doe',
      };
      setOcrData(mockOcrData);
      setPhoto(imageData);
      setFeedback('Document captured successfully');
      stopCamera();
      setStep('liveness');
    }, 1500);
  };

  const startLivenessCheck = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // Use front camera for face
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Randomize liveness prompt
      const randomPrompt = livenessPrompts[Math.floor(Math.random() * livenessPrompts.length)];
      setLivenessPrompt(randomPrompt);
      setLivenessStatus('detecting');
    } catch (error) {
      onError?.('Camera access denied. Please enable camera permissions.');
    }
  };

  const performLivenessCheck = () => {
    setLivenessStatus('detecting');
    setFeedback('Stay still...');

    // Simulate liveness detection (in production, use ML model)
    setTimeout(() => {
      // Mock liveness check
      const livenessScore = Math.random() * 0.3 + 0.7; // 0.7-1.0

      if (livenessScore > 0.85) {
        setLivenessStatus('success');
        setFeedback('Liveness verified');
        stopCamera();
        setTimeout(() => {
          setStep('complete');
          onComplete?.({
            nik: ocrData?.nik || '',
            name: ocrData?.name || '',
            photo: photo,
            livenessScore: livenessScore,
          });
        }, 1000);
      } else {
        setLivenessStatus('failed');
        setFeedback('Liveness check failed. Please try again.');
      }
    }, 2000);
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-semibold text-[#E0E1DD] mb-6">e-KYC Verification</h2>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${step === 'ocr' ? 'text-[#2D6A4F]' : 'text-[#C5C6C0]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'ocr' ? 'bg-[#2D6A4F] text-white' : 'bg-[#415A77] text-[#C5C6C0]'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">OCR Scan</span>
        </div>
        <div className="w-12 h-0.5 bg-[#415A77]" />
        <div className={`flex items-center gap-2 ${step === 'liveness' ? 'text-[#2D6A4F]' : 'text-[#C5C6C0]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'liveness' ? 'bg-[#2D6A4F] text-white' : 'bg-[#415A77] text-[#C5C6C0]'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">Liveness Check</span>
        </div>
        <div className="w-12 h-0.5 bg-[#415A77]" />
        <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-[#2D6A4F]' : 'text-[#C5C6C0]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'complete' ? 'bg-[#2D6A4F] text-white' : 'bg-[#415A77] text-[#C5C6C0]'
          }`}>
            {step === 'complete' ? <CheckCircleIcon fontSize="small" /> : '3'}
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>

      {/* OCR Scan Step */}
      {step === 'ocr' && (
        <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#E0E1DD] mb-4">Scan E-KTP</h3>
          <p className="text-sm text-[#C5C6C0] mb-4">
            Position your E-KTP within the frame. Ensure good lighting and the document is flat.
          </p>

          <div className="relative bg-[#0D1B2A] rounded-lg mb-4" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-[#2D6A4F] rounded-lg" style={{ width: '90%', aspectRatio: '16/9' }} />
            </div>
            {feedback && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-sm text-[#2D6A4F] bg-[#0D1B2A]/90 px-4 py-2 rounded-lg inline-block">
                  {feedback}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-xs text-[#C5C6C0]">• Ensure the document is fully visible</p>
            <p className="text-xs text-[#C5C6C0]">• Move to a brighter area if needed</p>
            <p className="text-xs text-[#C5C6C0]">• Keep the document flat and steady</p>
          </div>

          <button
            onClick={captureDocument}
            className="w-full px-6 py-3 bg-[#2D6A4F] hover:bg-[#2D6A4F]/80 text-white rounded-lg font-medium transition-colors touch-target flex items-center justify-center gap-2"
          >
            <CameraAltIcon />
            <span>Capture Document</span>
          </button>
        </div>
      )}

      {/* Liveness Check Step */}
      {step === 'liveness' && (
        <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#E0E1DD] mb-4">Liveness Check</h3>
          <p className="text-sm text-[#C5C6C0] mb-4">
            Follow the prompt to verify you are a real person (not a photo or video)
          </p>

          <div className="relative bg-[#0D1B2A] rounded-lg mb-4" style={{ aspectRatio: '1' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg scale-x-[-1]"
              autoPlay
              playsInline
            />
            {livenessPrompt && (
              <div className="absolute top-4 left-0 right-0 text-center">
                <div className="bg-[#2D6A4F]/90 px-4 py-2 rounded-lg inline-block">
                  <p className="text-lg font-semibold text-white">{livenessPrompt}</p>
                </div>
              </div>
            )}
            {feedback && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className={`text-sm px-4 py-2 rounded-lg inline-block ${
                  livenessStatus === 'success'
                    ? 'text-[#2D6A4F] bg-[#0D1B2A]/90'
                    : livenessStatus === 'failed'
                    ? 'text-[#BA1A1A] bg-[#0D1B2A]/90'
                    : 'text-[#C5C6C0] bg-[#0D1B2A]/90'
                }`}>
                  {feedback}
                </p>
              </div>
            )}
          </div>

          {livenessStatus === 'idle' && (
            <button
              onClick={performLivenessCheck}
              className="w-full px-6 py-3 bg-[#2D6A4F] hover:bg-[#2D6A4F]/80 text-white rounded-lg font-medium transition-colors touch-target flex items-center justify-center gap-2"
            >
              <FaceIcon />
              <span>Start Liveness Check</span>
            </button>
          )}

          {livenessStatus === 'detecting' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6A4F] mx-auto mb-2"></div>
              <p className="text-sm text-[#C5C6C0]">Detecting liveness...</p>
            </div>
          )}

          {livenessStatus === 'failed' && (
            <button
              onClick={performLivenessCheck}
              className="w-full px-6 py-3 bg-[#2D6A4F] hover:bg-[#2D6A4F]/80 text-white rounded-lg font-medium transition-colors touch-target"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <div className="bg-[#1B263B] border border-[#2D6A4F] rounded-lg p-6 text-center">
          <CheckCircleIcon className="text-[#2D6A4F] mx-auto mb-4" style={{ fontSize: '64px' }} />
          <h3 className="text-lg font-semibold text-[#E0E1DD] mb-2">Verification Complete</h3>
          <p className="text-sm text-[#C5C6C0] mb-4">
            Your identity has been verified successfully.
          </p>
          {ocrData && (
            <div className="bg-[#0D1B2A] rounded-lg p-4 text-left">
              <div className="text-sm text-[#C5C6C0] mb-1">NIK:</div>
              <div className="text-[#E0E1DD] font-mono mb-3">{ocrData.nik}</div>
              <div className="text-sm text-[#C5C6C0] mb-1">Name:</div>
              <div className="text-[#E0E1DD] font-medium">{ocrData.name}</div>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

