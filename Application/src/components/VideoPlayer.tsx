'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface VideoPlayerProps {
  src: string;
  title?: string;
  materialId?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export default function VideoPlayer({ 
  src, 
  title, 
  materialId,
  onComplete, 
  onProgress 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { success } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const lastSaveTimeRef = useRef<number>(0);

  // Load saved progress on mount
  useEffect(() => {
    if (materialId) {
      loadProgress();
    }
  }, [materialId]);

  const loadProgress = async () => {
    try {
      const response = await apiClient.getMaterialProgress(materialId!);
      if (response.success && response.data) {
        const progressData = response.data as any;
        if (progressData.last_position && progressData.last_position > 0) {
          setSavedProgress(progressData.last_position);
          setTimeSpent(progressData.time_spent_seconds || 0);
          setProgress(progressData.progress_percentage || 0);
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Restore position when video is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video || loadingProgress) return;

    const handleLoadedMetadata = () => {
      if (savedProgress && savedProgress > 5) { // Only restore if > 5 seconds
        video.currentTime = savedProgress;
        setCurrentTime(savedProgress);
        success(`Resumed from ${Math.floor(savedProgress / 60)}:${Math.floor(savedProgress % 60).toString().padStart(2, '0')}`);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [savedProgress, loadingProgress]);

  // Save progress periodically
  const saveProgress = useCallback(async (currentTime: number, duration: number, timeSpent: number) => {
    if (!materialId) return;
    
    const now = Date.now();
    // Save every 10 seconds or if progress changed significantly
    if (now - lastSaveTimeRef.current < 10000 && progress < 95) return;
    
    lastSaveTimeRef.current = now;
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    try {
      await apiClient.updateMaterialProgress(materialId, {
        progressPercentage,
        lastPosition: Math.floor(currentTime),
        timeSpentSeconds: timeSpent,
        markComplete: progressPercentage >= 95 // Auto-complete at 95%
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [materialId, progress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let timeSpentInterval: NodeJS.Timeout;
    const startTime = Date.now();

    const updateTime = () => {
      const current = video.currentTime;
      const dur = video.duration;
      setCurrentTime(current);
      const prog = dur > 0 ? (current / dur) * 100 : 0;
      setProgress(prog);
      onProgress?.(prog);

      // Track time spent (only when playing)
      if (isPlaying) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeSpent(prev => prev + elapsed);
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (materialId) {
        saveProgress(video.duration, video.duration, timeSpent);
        apiClient.markMaterialComplete(materialId, {
          progressPercentage: 100,
          lastPosition: Math.floor(video.duration),
          timeSpentSeconds: timeSpent
        });
      }
      onComplete?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      timeSpentInterval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (timeSpentInterval) clearInterval(timeSpentInterval);
      if (materialId) {
        saveProgress(video.currentTime, video.duration, timeSpent);
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Save progress every 10 seconds
    progressSaveIntervalRef.current = setInterval(() => {
      if (materialId && video.duration > 0) {
        saveProgress(video.currentTime, video.duration, timeSpent);
      }
    }, 10000);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
      if (timeSpentInterval) clearInterval(timeSpentInterval);
    };
  }, [onComplete, onProgress, materialId, saveProgress, timeSpent, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleReset = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loadingProgress) {
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-white">Loading video...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        onClick={togglePlay}
      />
      
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0EB0F9]"
          />
          <span className="text-white text-sm min-w-[80px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress Percentage */}
        {materialId && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-[#0EB0F9] h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-gray-800"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-white hover:bg-gray-800"
              title="Restart video"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-gray-800"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0EB0F9]"
              />
            </div>

            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                if (videoRef.current) {
                  videoRef.current.playbackRate = rate;
                }
              }}
              className="bg-gray-800 text-white text-sm px-2 py-1 rounded"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            className="text-white hover:bg-gray-800"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
