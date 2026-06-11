'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, Loader2, AlertCircle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Channel } from '@/lib/types';

interface VideoPlayerProps {
  channel: Channel | null;
  onBack: () => void;
}

type PlayerState = 'loading' | 'playing' | 'paused' | 'error';

/**
 * Detect whether a URL likely serves HLS content.
 * Heuristic: contains .m3u8 anywhere, ends with .ts, or contains /live/ path segment.
 */
function looksLikeHls(url: string): boolean {
  return url.includes('.m3u8') || url.endsWith('.ts') || url.includes('/live/');
}

/**
 * Detect whether a URL looks like a direct non-HLS media file.
 */
function looksLikeDirectMedia(url: string): boolean {
  return /\.(mp4|webm|ogg|avi)(\?|$)/i.test(url);
}

export default function VideoPlayer({ channel, onBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const hlsFallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hideControlsDelayed = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState === 'playing') setShowControls(false);
    }, 3000);
  }, [playerState]);

  // Cleanup helper
  const cleanupAll = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (hlsFallbackTimerRef.current) {
      clearTimeout(hlsFallbackTimerRef.current);
      hlsFallbackTimerRef.current = null;
    }
  }, []);

  // Try native video playback
  const tryNativePlayback = useCallback((video: HTMLVideoElement, url: string) => {
    const onLoadedMetadata = () => {
      video.play().catch(() => setPlayerState('paused'));
    };
    const onError = () => {
      setPlayerState('error');
      setErrorMessage('Stream is currently unavailable. Please try again later.');
    };
    const onPlaying = () => {
      setPlayerState('playing');
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.addEventListener('playing', onPlaying);

    cleanupRef.current = () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
      video.removeEventListener('playing', onPlaying);
    };

    video.src = url;
    video.load();
  }, []);

  // Initialize video player
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setPlayerState('loading');
    setErrorMessage('');

    // Clean up previous
    cleanupAll();

    const url = channel.url;
    const isDirectMedia = looksLikeDirectMedia(url);
    const isHlsCandidate = looksLikeHls(url);

    // ── Path 1: Direct media files (MP4, WebM, etc.) — always native ──
    if (isDirectMedia) {
      tryNativePlayback(video, url);
      return cleanupAll;
    }

    // ── Path 2: Likely HLS — try HLS.js first, with fallback ──
    if (Hls.isSupported() && isHlsCandidate) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 10000,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setPlayerState('paused'));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Retry loading a few times
              if (data.details === 'manifestLoadTimeOut' || data.details === 'levelLoadError') {
                hls.destroy();
                hlsRef.current = null;
                // Fall back to native playback
                tryNativePlayback(video, url);
              } else {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setPlayerState('error');
              setErrorMessage('Stream is currently unavailable. Please try again later.');
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        }
      });

      // Fallback timer: if HLS.js hasn't fired MANIFEST_PARSED within 8s, try native
      let manifestParsed = false;
      const origManifestParsed = () => { manifestParsed = true; };
      hls.on(Hls.Events.MANIFEST_PARSED, origManifestParsed);

      hlsFallbackTimerRef.current = setTimeout(() => {
        if (!manifestParsed && hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
          tryNativePlayback(video, url);
        }
      }, 8000);

      return cleanupAll;
    }

    // ── Path 3: Safari native HLS support ──
    if (video.canPlayType('application/vnd.apple.mpegurl') && isHlsCandidate) {
      tryNativePlayback(video, url);
      return cleanupAll;
    }

    // ── Path 4: Unknown format — try native playback as last resort ──
    tryNativePlayback(video, url);
    return cleanupAll;
  }, [channel, cleanupAll, tryNativePlayback]);

  // Volume control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setPlayerState('playing')).catch(() => {});
    } else {
      video.pause();
      setPlayerState('paused');
    }
    setShowControls(true);
    hideControlsDelayed();
  }, [hideControlsDelayed]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (channel) {
      setPlayerState('loading');
      setErrorMessage('');
      // Force re-render of the channel to trigger useEffect
      const video = videoRef.current;
      if (!video) return;

      cleanupAll();

      const url = channel.url;
      const isHlsCandidate = looksLikeHls(url);
      const isDirectMedia = looksLikeDirectMedia(url);

      if (isDirectMedia) {
        tryNativePlayback(video, url);
      } else if (Hls.isSupported() && isHlsCandidate) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 2,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 10000,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => setPlayerState('paused'));
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (data.details === 'manifestLoadTimeOut' || data.details === 'levelLoadError') {
                  hls.destroy();
                  hlsRef.current = null;
                  tryNativePlayback(video, url);
                } else {
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setPlayerState('error');
                setErrorMessage('Stream is currently unavailable. Please try again later.');
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else {
        tryNativePlayback(video, url);
      }
    }
  }, [channel, cleanupAll, tryNativePlayback]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    hideControlsDelayed();
  }, [hideControlsDelayed]);

  if (!channel) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full player-area group"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (playerState === 'playing') setShowControls(false);
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        playsInline
        onClick={togglePlayPause}
        onPlay={() => setPlayerState('playing')}
        onPause={() => setPlayerState('paused')}
      />

      {/* Loading State */}
      {playerState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <Loader2 className="size-12 text-white animate-spin" />
        </div>
      )}

      {/* Error State */}
      {playerState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-4">
          <AlertCircle className="size-12 text-red-400" />
          <p className="text-white/70 text-sm text-center max-w-xs px-4">{errorMessage || 'Stream unavailable'}</p>
          <button
            onClick={handleRetry}
            className="bg-white/15 backdrop-blur-sm hover:bg-white/25 rounded-full px-4 py-2 text-sm text-white flex items-center gap-2 transition-colors"
          >
            <RotateCw className="size-4" />
            Retry
          </button>
        </div>
      )}

      {/* Play/Pause overlay (center) */}
      {showControls && playerState !== 'loading' && playerState !== 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          {playerState === 'paused' && (
            <div className="bg-white/15 backdrop-blur-sm rounded-full p-4 glow-purple">
              <Play className="size-8 text-white" fill="white" />
            </div>
          )}
        </motion.div>
      )}

      {/* Top Controls */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 p-3 z-20 flex items-center gap-3 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <button
          onClick={onBack}
          className="bg-white/15 backdrop-blur-sm hover:bg-white/25 rounded-full p-2 flex items-center gap-2 text-sm text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Bottom Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="px-3 pb-3 pt-8 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="bg-white/15 backdrop-blur-sm hover:bg-white/25 rounded-full p-2 transition-colors"
          >
            {playerState === 'playing' ? (
              <Pause className="size-5 text-white" fill="white" />
            ) : (
              <Play className="size-5 text-white" fill="white" />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="bg-white/15 backdrop-blur-sm hover:bg-white/25 rounded-full p-2 transition-colors">
              {isMuted ? (
                <VolumeX className="size-4 text-white" />
              ) : (
                <Volume2 className="size-4 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-20 h-1 hidden sm:block"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="bg-white/15 backdrop-blur-sm hover:bg-white/25 rounded-full p-2 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="size-4 text-white" />
            ) : (
              <Maximize className="size-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
