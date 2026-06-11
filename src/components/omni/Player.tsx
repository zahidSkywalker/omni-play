'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Maximize2, Minimize2, Loader2, AlertTriangle, Play, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import Hls from 'hls.js';
import { type Channel } from '@/lib/famelack-types';

interface PlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onToggleFavorite: (nanoid: string) => void;
  onClose: () => void;
}

export default function Player({ channel, isFavorite, onToggleFavorite, onClose }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Build proxy URL for streams that may be geo/embed blocked
  const proxiedUrl = useCallback((url: string) => {
    if (typeof window === 'undefined') return url;
    return `${window.location.origin}/api/stream-proxy?url=${encodeURIComponent(url)}`;
  }, []);

  const streamUrl = useMemo(() => {
    if (channel.stream_urls && channel.stream_urls.length > 0) {
      return channel.stream_urls[0];
    }
    return null;
  }, [channel]);

  const youtubeUrl = useMemo(() => {
    if (channel.youtube_urls && channel.youtube_urls.length > 0) {
      return channel.youtube_urls[0];
    }
    return null;
  }, [channel]);

  const isYouTube = !!youtubeUrl && !streamUrl;

  // State for YouTube → HLS extraction
  const [ytHlsUrl, setYtHlsUrl] = useState<string | null | undefined>(undefined);
  const ytHlsExtracted = useRef(false);
  const ytFallbackTriggered = useRef(false);

  const playSource = useMemo(() => {
    if (streamUrl) return 'hls' as const;
    if (youtubeUrl) {
      if (ytHlsUrl) return 'hls' as const;
      return 'youtube' as const;
    }
    return null;
  }, [streamUrl, youtubeUrl, ytHlsUrl]);

  const effectiveStreamUrl = useMemo(() => {
    if (streamUrl) return streamUrl;
    if (youtubeUrl && ytHlsUrl) return ytHlsUrl;
    return null;
  }, [streamUrl, youtubeUrl, ytHlsUrl]);

  const isEffectiveHLS = useMemo(() => {
    return effectiveStreamUrl && (effectiveStreamUrl.includes('.m3u8') || effectiveStreamUrl.includes('m3u8'));
  }, [effectiveStreamUrl]);

  const isYouTubeHLS = !!youtubeUrl && !!ytHlsUrl && !streamUrl;

  // HLS Player — handles both regular stream_urls and extracted YouTube HLS
  useEffect(() => {
    if (!effectiveStreamUrl || !videoRef.current) return;

    setLoading(true);
    setError(null);

    if (isEffectiveHLS && Hls.isSupported()) {
      // Build URL list: direct URLs first, then proxied as fallback
      const directUrls = channel.stream_urls?.length ? channel.stream_urls : [effectiveStreamUrl];
      const proxiedUrls = directUrls.map((u: string) => proxiedUrl(u));
      const allStreamUrls = [...directUrls, ...proxiedUrls];
      let currentUrlIndex = 0;

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        maxBufferSize: 30 * 1000 * 1000,
        maxBufferHole: 0.3,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
        liveDurationInfinity: true,
        backBufferLength: 5,
        startLevel: -1,
        fragLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 3,
        fragLoadingRetryDelay: 800,
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 8000,
        levelLoadingMaxRetry: 2,
      });
      hlsRef.current = hls;

      let stallCount = 0;
      const video = videoRef.current;
      const onWaiting = () => {
        stallCount++;
        if (isYouTubeHLS && stallCount >= 4 && !ytFallbackTriggered.current) {
          ytFallbackTriggered.current = true;
          hls.destroy();
          hlsRef.current = null;
          setYtHlsUrl(null);
        }
      };
      const onPlaying = () => { stallCount = 0; };
      video.addEventListener('waiting', onWaiting);
      video.addEventListener('playing', onPlaying);

      hls.loadSource(allStreamUrls[currentUrlIndex]);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        if (hls.audioTracks && hls.audioTracks.length > 1) {
          hls.audioTrack = 0;
        }
        if (!isYouTubeHLS && data.levels.length > 1) {
          hls.currentLevel = 0;
        }
        setLoading(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (isYouTubeHLS && !ytFallbackTriggered.current) {
                ytFallbackTriggered.current = true;
                hls.destroy();
                hlsRef.current = null;
                setYtHlsUrl(null);
              } else if (currentUrlIndex < allStreamUrls.length - 1) {
                // Try next stream URL
                currentUrlIndex++;
                hls.loadSource(allStreamUrls[currentUrlIndex]);
              } else {
                setError('Network error — stream may be geo-blocked or offline');
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error — trying to recover');
              hls.recoverMediaError();
              break;
            default:
              if (isYouTubeHLS && !ytFallbackTriggered.current) {
                ytFallbackTriggered.current = true;
                hls.destroy();
                hlsRef.current = null;
                setYtHlsUrl(null);
              } else {
                setError('Stream playback error — try opening externally');
                hls.destroy();
              }
              break;
          }
        }
      });

      return () => {
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('playing', onPlaying);
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (effectiveStreamUrl && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      const video = videoRef.current;
      const onLoaded = () => { setLoading(false); video.play().catch(() => {}); };
      const onError = () => { setError('Failed to play stream'); };
      video.src = effectiveStreamUrl;
      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onError);
      return () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
        video.src = '';
      };
    }
  }, [effectiveStreamUrl, isEffectiveHLS, isYouTubeHLS]);

  // YouTube → HLS extraction: try to get native HLS URL server-side
  useEffect(() => {
    if (!isYouTube || !youtubeUrl || ytHlsExtracted.current) return;
    ytHlsExtracted.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/youtube-hls?url=${encodeURIComponent(youtubeUrl)}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setYtHlsUrl(data.hlsUrl || null);
        } else {
          setYtHlsUrl(null);
        }
      } catch {
        if (!cancelled) setYtHlsUrl(null);
      }
    })();

    return () => { cancelled = true; };
  }, [isYouTube, youtubeUrl]);

  // Pause HLS video when player is minimized — saves CPU/GPU
  useEffect(() => {
    if (isMinimized) {
      videoRef.current?.pause();
      hlsRef.current?.stopLoad();
    } else {
      videoRef.current?.play().catch(() => {});
      hlsRef.current?.startLoad();
    }
  }, [isMinimized]);

  // YouTube iframe — set src immediately, don't wait for HLS extraction
  const handleYouTubeReady = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isYouTube || !youtubeUrl) return;
    if (!iframeRef.current) return;

    const ytId = extractYouTubeId(youtubeUrl);
    if (!ytId) {
      const timeout = setTimeout(() => {
        setError('Invalid YouTube URL');
      }, 0);
      return () => clearTimeout(timeout);
    }

    const src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&rel=0`;
    iframeRef.current.src = src;
  }, [isYouTube, youtubeUrl]);

  // Keyboard: Escape to close player
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fullscreen handling
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    // iOS Safari: use webkitEnterFullscreen on the video element
    if (playSource === 'hls' && videoRef.current) {
      const video = videoRef.current;
      // @ts-expect-error webkitEnterFullscreen is iOS-specific
      if (video.webkitEnterFullscreen) {
        // @ts-expect-error webkitEnterFullscreen is iOS-specific
        video.webkitEnterFullscreen();
        return;
      }
    }
    // Standard Fullscreen API (Android, Desktop)
    const target = videoContainerRef.current || containerRef.current;
    if (!target) return;
    const el = target as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };
    if (document.fullscreenElement) {
      (document.exitFullscreen || (document as any).webkitExitFullscreen).call(document);
    } else {
      const requestFn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (requestFn) {
        requestFn.call(el).catch(() => {});
      }
    }
  }, [playSource]);

  const handleOpenExternal = useCallback(() => {
    if (streamUrl) {
      window.open(streamUrl, '_blank', 'noopener');
    } else if (youtubeUrl) {
      window.open(youtubeUrl, '_blank', 'noopener');
    }
  }, [streamUrl, youtubeUrl]);

  // ── Mini Player Bar (mobile only) ──
  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-[100] omni-mini-player"
        style={{
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Mini video preview (pip-style) */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 relative"
            style={{ background: '#1a1a2e' }}
          >
            {playSource === 'youtube' && iframeRef.current && (
              // We can't easily show iframe in mini, so show a static preview
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white/60" />
              </div>
            )}
            {playSource === 'hls' && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            )}
            {!playSource && (
              <div className="w-full h-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            )}
            {/* LIVE dot */}
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>

          {/* Channel info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-[#1a1a2e] truncate">
              {channel.name}
            </p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5">
              {youtubeUrl && ytHlsUrl ? 'YouTube Live · HLS' : playSource === 'youtube' ? 'YouTube' : 'Live Stream'} · Now Playing
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <motion.button
              onClick={() => onToggleFavorite(channel.nanoid)}
              whileTap={{ scale: 0.88 }}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 ${
                isFavorite ? 'text-[#4CAF50]' : 'text-[#9ca3af]'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Expand button — larger touch target */}
            <motion.button
              onClick={() => setIsMinimized(false)}
              whileTap={{ scale: 0.88 }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl text-[#6b7280] hover:text-[#1a1a2e] transition-all duration-200"
              aria-label="Expand player"
            >
              <ChevronUp className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.88 }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl text-[#6b7280] hover:text-red-500 transition-all duration-200"
              aria-label="Close player"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Progress-like accent line */}
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #6C84E8 0%, #8B6CC4 100%)' }} />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        ref={containerRef}
        className="flex flex-col overflow-hidden relative z-20"
        style={{
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.06)',
          isolation: 'isolate',
        }}
      >
        {/* ── Player Header ── */}
        <div
          className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3"
          style={{
            borderBottom: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {/* LIVE indicator */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <span
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                style={{ background: '#ef4444' }}
              />
              <span
                className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  color: '#ef4444',
                }}
              >
                LIVE
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[#1a1a2e] truncate">
                {channel.name}
              </p>
              <p className="text-[9px] sm:text-[10px] text-[#9ca3af]">
                {youtubeUrl && ytHlsUrl ? 'YouTube Live · HLS' : playSource === 'youtube' ? 'YouTube' : 'Live Stream'}
              </p>
            </div>
          </div>

          {/* Control buttons — responsive touch targets */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* Minimize — mobile only */}
            <motion.button
              onClick={() => setIsMinimized(true)}
              whileTap={{ scale: 0.88 }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-3 rounded-xl md:hidden text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f7fa] transition-all duration-200"
              aria-label="Minimize player"
              title="Minimize player"
            >
              <ChevronDown className="w-4 h-4 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Favorite */}
            <motion.button
              onClick={() => onToggleFavorite(channel.nanoid)}
              whileTap={{ scale: 0.88 }}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                isFavorite
                  ? 'text-[#4CAF50] bg-[rgba(76,175,80,0.06)]'
                  : 'text-[#6b7280] hover:text-[#4CAF50] hover:bg-[#f5f7fa]'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <motion.div
                animate={isFavorite ? { scale: [1, 1.25, 0.95, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </motion.div>
            </motion.button>

            {/* External link */}
            <motion.button
              onClick={handleOpenExternal}
              whileTap={{ scale: 0.88 }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-3 rounded-xl text-[#6b7280] hover:text-[#6C84E8] hover:bg-[#f5f7fa] transition-all duration-200"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Fullscreen */}
            <motion.button
              onClick={toggleFullscreen}
              whileTap={{ scale: 0.88 }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-3 rounded-xl text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f7fa] transition-all duration-200"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </motion.button>

            {/* Close */}
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.88 }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-3 rounded-xl text-[#6b7280] hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              aria-label="Close player"
              title="Close player"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
          </div>
        </div>

        {/* ── Player Area ── */}
        <div ref={videoContainerRef} className="relative bg-black w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {playSource === 'hls' && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                controls
                autoPlay
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center omni-player-overlay-top pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'rgba(108, 132, 232, 0.15)',
                      }}
                    >
                      <Loader2 className="w-6 h-6 text-[#6C84E8] animate-spin" />
                    </div>
                    <span className="text-[11px] text-white/60 font-medium">Loading stream...</span>
                  </motion.div>
                </div>
              )}
            </>
          )}

          {playSource === 'youtube' && (
            <>
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleYouTubeReady}
                title={channel.name}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center omni-player-overlay-top pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'rgba(139, 108, 196, 0.15)',
                      }}
                    >
                      <Loader2 className="w-6 h-6 text-[#8B6CC4] animate-spin" />
                    </div>
                    <span className="text-[11px] text-white/60 font-medium">Loading video...</span>
                  </motion.div>
                </div>
              )}
            </>
          )}

          {/* No stream available */}
          {!playSource && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#1a1a2e' }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                }}
              >
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-white/90">No Stream Available</p>
              <p className="text-xs text-white/40 mt-1">
                This channel does not have any playable streams
              </p>
              {youtubeUrl && (
                <motion.a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: '#6C84E8',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(108,132,232,0.25)',
                  }}
                >
                  <Play className="w-3 h-3" />
                  Watch on YouTube
                </motion.a>
              )}
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#1a1a2e' }} role="alert" aria-live="assertive">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                }}
              >
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm font-semibold text-white/90">Playback Error</p>
              <p className="text-xs text-white/40 mt-1 text-center max-w-xs px-6">
                {error}
              </p>
              <motion.button
                onClick={handleOpenExternal}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background: '#6C84E8',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(108,132,232,0.25)',
                }}
              >
                <ExternalLink className="w-3 h-3" />
                Open in New Tab
              </motion.button>
            </div>
          )}

          {/* Gradient overlay at video edges */}
          <div className="absolute top-0 left-0 right-0 h-8 omni-player-overlay-top pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-8 omni-player-overlay-bottom pointer-events-none" />
        </div>

        {/* Bottom subtle accent line */}
        <div
          className="h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(108,132,232,0.15) 50%, transparent 100%)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
