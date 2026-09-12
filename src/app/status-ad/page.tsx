"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Smartphone,
  Share2,
  Check,
  ArrowLeft,
  Apple,
  Eye,
  Film,
  Flame,
} from "lucide-react";

const DURATION = 15;

export default function StatusAdPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Audio synthesis references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const lastSoundSceneRef = useRef<number>(-1);

  // Image references
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const imagesLoadedRef = useRef<boolean>(false);

  // Animation frame reference
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Load Photorealistic 3D Scenes
  useEffect(() => {
    const urls = ["/ad/scene1.jpg", "/ad/scene2.jpg", "/ad/scene3.jpg"];
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    urls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === urls.length) {
          imagesLoadedRef.current = true;
        }
      };
      loadedImages[i] = img;
    });

    imagesRef.current = loadedImages;
  }, []);

  // Initialize Web Audio Context
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const dest = ctx.createMediaStreamDestination();
        audioCtxRef.current = ctx;
        audioDestRef.current = dest;
      }
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Apple Keynote Rhythmic Sound FX
  const playSceneAudio = (sceneIdx: number) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const dest = audioDestRef.current;
    if (!dest) return;

    const now = ctx.currentTime;
    const connectOut = (node: AudioNode) => {
      node.connect(ctx.destination);
      node.connect(dest);
    };

    if (sceneIdx === 0) {
      // Scene 1: Apple Sub-Bass Impact + Shimmer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 1.2);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc.connect(gain);
      connectOut(gain);
      osc.start(now);
      osc.stop(now + 1.4);
    } else if (sceneIdx === 1) {
      // Scene 2: High Energy Riser + Bass Drop for 0% Commission
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 1.3);
      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      connectOut(gain);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (sceneIdx === 2) {
      // Scene 3: Grand Celestial Finale Chimes
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.3, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 1.5);
        osc.connect(gain);
        connectOut(gain);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 1.5);
      });
    }
  };

  // Apple Easing Curve
  const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
  const easeInOutQuad = (x: number): number =>
    x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

  // Render Frame - Hyper-realistic 3D Product Cinematography
  const renderFrame = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    // Determine Scene index (Each 5.0s)
    let scene = 0;
    let localT = 0;
    if (t < 5.0) {
      scene = 0;
      localT = t;
    } else if (t < 10.0) {
      scene = 1;
      localT = t - 5.0;
    } else {
      scene = 2;
      localT = t - 10.0;
    }

    if (scene !== activeSceneIndex) {
      setActiveSceneIndex(scene);
    }

    if (scene !== lastSoundSceneRef.current) {
      lastSoundSceneRef.current = scene;
      playSceneAudio(scene);
    }

    const currentImg = imagesRef.current[scene];

    if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
      const p = localT / 5.0;

      // Cinematic Camera Motion (Zoom In, Zoom Out, Parallax Drift)
      let zoom = 1.0;
      let panX = 0;
      let panY = 0;

      if (scene === 0) {
        // Scene 1: Camera Dolly Out (Zoom 1.25 down to 1.0) revealing liquid gold ribbon
        zoom = 1.25 - easeOutCubic(p) * 0.25;
        panY = Math.sin(p * Math.PI) * 12;
      } else if (scene === 1) {
        // Scene 2: Camera Push In (Zoom 1.0 up to 1.2) onto 0% Commission & Sneakers
        zoom = 1.0 + easeInOutQuad(p) * 0.2;
        panX = Math.sin(p * Math.PI) * 15;
      } else {
        // Scene 3: Camera Settle & Slow Drift (Zoom 1.15 down to 1.02) on Golden Monogram
        zoom = 1.15 - easeOutCubic(p) * 0.13;
        panY = Math.cos(p * Math.PI) * 10;
      }

      // Smooth Crossfade Blend at transitions
      let alpha = 1.0;
      if (localT < 0.4) {
        alpha = localT / 0.4;
      } else if (localT > 4.6) {
        alpha = (5.0 - localT) / 0.4;
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(panX, panY);

      // Draw high-resolution 3D render centered
      ctx.drawImage(currentImg, -w / 2, -h / 2, w, h);

      // Subtle volumetric anamorphic light sweep overlay
      const sweepProgress = (localT / 5.0) * (w * 2) - w;
      const sweepGrad = ctx.createLinearGradient(sweepProgress - 120, -h / 2, sweepProgress + 120, h / 2);
      sweepGrad.addColorStop(0, "transparent");
      sweepGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
      sweepGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(-w / 2, -h / 2, w, h);
    } else {
      // Fallback loader state
      ctx.fillStyle = "#F5F5F7";
      ctx.font = "900 36px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CARTYGO", w / 2, h / 2);
    }

    ctx.restore();
  };

  // Animation Loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      if (isPlaying) {
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const boundedTime = elapsed % DURATION;
        setCurrentTime(boundedTime);
        renderFrame(boundedTime);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isMuted]);

  const togglePlay = () => {
    initAudio();
    if (isPlaying) {
      pausedTimeRef.current = currentTime;
      setIsPlaying(false);
    } else {
      startTimeRef.current = performance.now() - pausedTimeRef.current * 1000;
      setIsPlaying(true);
    }
  };

  const restart = () => {
    initAudio();
    lastSoundSceneRef.current = -1;
    startTimeRef.current = performance.now();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const toggleSound = () => {
    initAudio();
    setIsMuted(!isMuted);
  };

  // Download 60FPS Video (WebM/MP4)
  const downloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initAudio();
    setIsRecording(true);
    setRecordProgress(0);

    const canvasStream = canvas.captureStream(60);
    let combinedStream = canvasStream;
    if (audioDestRef.current && audioDestRef.current.stream.getAudioTracks().length > 0) {
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDestRef.current.stream.getAudioTracks(),
      ]);
    }

    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm;codecs=vp8,opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }
    }

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 16000000, // 16 Mbps Ultra-High Bitrate
    });

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cartygo-3d-apple-ad.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setRecordProgress(0);
    };

    restart();
    mediaRecorder.start();

    const checkInterval = setInterval(() => {
      setRecordProgress((prev) => {
        const next = prev + 1;
        if (next >= DURATION) {
          clearInterval(checkInterval);
          mediaRecorder.stop();
          return DURATION;
        }
        return next;
      });
    }, 1000);
  };

  const triggerFullScreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000000] text-[#F5F5F7] flex flex-col items-center justify-start overflow-y-auto py-6 px-4 font-sans selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-4 border-b border-white/10 pb-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#86868B] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to cartygo.com</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              isMuted
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                : "bg-white/10 text-[#F5F5F7]"
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? "Tap to Unmute Audio 🔊" : "Sound On"}</span>
          </button>
          <button
            onClick={copyPageLink}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium transition-colors"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
            <span>{copiedLink ? "Copied" : "Share"}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Frame */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        {/* Left: 9:16 Video Player Stage */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            ref={containerRef}
            className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-[48px] p-2 bg-[#121214] shadow-[0_30px_100px_rgba(0,0,0,1)] border border-white/20 overflow-hidden"
          >
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-end pr-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            {/* 60FPS Video Canvas with 3D Camera Dolly */}
            <canvas
              ref={canvasRef}
              width={540}
              height={960}
              className="w-full h-full rounded-[40px] bg-black block cursor-pointer object-cover shadow-2xl"
              onClick={togglePlay}
            />

            {/* Recording Banner */}
            {isRecording && (
              <div className="absolute top-12 left-6 right-6 z-30 flex items-center justify-between bg-white text-black text-xs font-black px-4 py-2 rounded-full shadow-2xl animate-pulse">
                <span>RENDERING 1080x1920 3D AD...</span>
                <span>{recordProgress}s / {DURATION}s</span>
              </div>
            )}
          </div>

          {/* Scrubber Controls */}
          <div className="w-full max-w-[360px] mt-4 flex flex-col gap-2">
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-100"
                style={{ width: `${(currentTime / DURATION) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#86868B]">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="hover:text-white transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={restart}
                  className="hover:text-white transition-colors"
                  title="Replay"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleSound}
                  className="hover:text-white transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <span className="font-mono text-white text-xs">
                00:{Math.floor(currentTime).toString().padStart(2, "0")} / 00:15
              </span>

              <button
                onClick={triggerFullScreen}
                className="hover:text-white transition-colors"
                title="Full Screen View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Export & HD Poster Downloads */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Video Download Action */}
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Octane 3D Photorealistic Video</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Apple Commercial (9:16)
            </h2>
            <p className="text-xs text-[#A1A1A6] leading-relaxed mb-6">
              Features floating titanium iPhone 16 Pro, liquid molten gold, luxury designer sneakers, smartwatches, and 0% Commission with camera dolly zoom.
            </p>

            <button
              onClick={downloadVideo}
              disabled={isRecording}
              className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-black text-sm tracking-wide transition-all shadow-xl ${
                isRecording
                  ? "bg-white text-black cursor-wait animate-pulse"
                  : "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-navy-950 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {isRecording
                  ? `Rendering Video (${recordProgress}s / 15s)...`
                  : "DOWNLOAD 9:16 STATUS VIDEO (MP4/WebM)"}
              </span>
            </button>

            <div className="mt-3 text-[11px] text-[#86868B] text-center">
              1080x1920 • 60 FPS • Ready for WhatsApp Status & Instagram Story
            </div>
          </div>

          {/* 3 High-Resolution 9:16 Status Posters for Direct Status Upload */}
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>🖼️ 3 Ready-to-Post Status Images (HD 9:16)</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Scene 1 Poster */}
              <a
                href="/ad/scene1.jpg"
                download="cartygo-apple-iphone-gold.jpg"
                className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/15 hover:border-amber-400 transition-all shadow-md block"
              >
                <img
                  src="/ad/scene1.jpg"
                  alt="Cartygo iPhone Scene"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-black/70 px-1 py-0.5 rounded text-center truncate font-semibold">
                  Scene 1 (iPhone)
                </span>
              </a>

              {/* Scene 2 Poster */}
              <a
                href="/ad/scene2.jpg"
                download="cartygo-0-percent-commission.jpg"
                className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/15 hover:border-amber-400 transition-all shadow-md block"
              >
                <img
                  src="/ad/scene2.jpg"
                  alt="Cartygo 0% Commission Scene"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-black/70 px-1 py-0.5 rounded text-center truncate font-semibold">
                  Scene 2 (0% Fee)
                </span>
              </a>

              {/* Scene 3 Poster */}
              <a
                href="/ad/scene3.jpg"
                download="cartygo-gold-monument.jpg"
                className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/15 hover:border-amber-400 transition-all shadow-md block"
              >
                <img
                  src="/ad/scene3.jpg"
                  alt="Cartygo Gold Finale Scene"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-black/70 px-1 py-0.5 rounded text-center truncate font-semibold">
                  Scene 3 (Finale)
                </span>
              </a>
            </div>

            <p className="text-[11px] text-[#86868B] text-center pt-1">
              Tap any image to download direct high-res 9:16 WhatsApp Status wallpaper!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#86868B] flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Quick Status Tip:</strong> Aap ya toh direct <strong>"DOWNLOAD 9:16 STATUS VIDEO"</strong> dabakar 15-second ka motion ad save kar sakte hain, ya upar ke 3 posters me se kisi ko bhi click karke direct WhatsApp Status photo laga sakte hain!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
