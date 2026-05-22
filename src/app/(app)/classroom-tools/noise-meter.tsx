'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Volume1,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Audio parameters
const FFT_SIZE = 512;
const MAX_STREAK_MILESTONE = 60; // Celebration every 60 seconds

export function NoiseMeter() {
  const [isListening, setIsListening] = React.useState(false);
  const [micPermission, setMicPermission] = React.useState<'default' | 'granted' | 'denied'>('default');
  const [volume, setVolume] = React.useState(0);
  const [threshold, setThreshold] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);
  const [aboveThresholdDuration, setAboveThresholdDuration] = React.useState(0); // in ms
  const [isAlertActive, setIsAlertActive] = React.useState(false);
  const [alertCount, setAlertCount] = React.useState(0);
  
  // Streak tracking
  const [currentStreak, setCurrentStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [streakMilestoneCount, setStreakMilestoneCount] = React.useState(0);

  const { toast } = useToast();
  
  // Web Audio refs
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = React.useRef<number | null>(null);
  
  // Keep values in refs for the animation loop
  const volumeRef = React.useRef(0);
  const thresholdRef = React.useRef(50);
  const isListeningRef = React.useRef(false);
  const consecutiveAboveThresholdRef = React.useRef(0); // frames count
  
  // Update refs when state changes
  React.useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  React.useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Handle active alert states
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening && !isAlertActive) {
      interval = setInterval(() => {
        setCurrentStreak((prev) => {
          const next = prev + 1;
          if (next > bestStreak) {
            setBestStreak(next);
          }
          // Milestone celebration trigger
          if (next > 0 && next % MAX_STREAK_MILESTONE === 0) {
            setStreakMilestoneCount(prevMilestones => prevMilestones + 1);
            toast({
              title: "🎉 Super Quiet Streak!",
              description: `The classroom remained quiet for ${Math.floor(next / 60)} minutes!`,
            });
          }
          return next;
        });
      }, 1000);
    } else {
      setCurrentStreak(0);
    }
    return () => clearInterval(interval);
  }, [isListening, isAlertActive, bestStreak, toast]);

  // Clean up Web Audio resources on unmount
  React.useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Preset buttons helper
  const applyPreset = (value: number) => {
    setThreshold(value);
    toast({
      title: "Threshold Updated",
      description: `Preset applied: ${value}% volume limit.`,
    });
  };

  // Dynamic sound generator for the alarm beep
  const playWarningBeep = () => {
    if (isMuted) return;
    try {
      const audioCtx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High A pitch
      
      // Volume ramp
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (err) {
      console.error('Failed to play warning beep:', err);
    }
  };

  // Start listening to mic input
  const startListening = async () => {
    if (typeof window !== 'undefined' && (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)) {
      setMicPermission('denied');
      toast({
        variant: "destructive",
        title: "Secure Connection Required",
        description: "Browser microphone access is blocked on insecure (HTTP) sites. Please access the website via HTTPS (https://) or localhost.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setMicPermission('granted');

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyserRef.current = analyser;

      source.connect(analyser);

      setIsListening(true);
      setIsAlertActive(false);
      setAboveThresholdDuration(0);
      consecutiveAboveThresholdRef.current = 0;

      // Start rendering canvas & reading mic data
      visualize();
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMicPermission('denied');
      
      let title = "Microphone Access Denied";
      let description = "Please check your browser or OS settings to allow microphone access.";

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        title = "Microphone Permission Blocked";
        description = "Microphone access was blocked. Please click the site settings icon in the URL bar (left of the address bar) and allow microphone permissions.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        title = "Microphone Device Not Found";
        description = "No microphone was detected. Please connect an audio input device and try again.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        title = "Microphone Busy";
        description = "Your microphone is already in use by another tab or app (like Zoom, Teams, or Meet).";
      } else if (err.name === 'SecurityError') {
        title = "Security Restriction";
        description = "Microphone access is restricted. Make sure you are on a secure (HTTPS) connection, or if inside an iframe, verify that allow=\"microphone\" is enabled.";
      } else if (err instanceof TypeError) {
        title = "Secure Connection Required";
        description = "Microphone access is blocked on unencrypted HTTP connections. Please access the site using HTTPS.";
      }

      toast({
        variant: "destructive",
        title,
        description,
      });
    }
  };

  // Stop listening to mic input
  const stopListening = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
    setVolume(0);
    volumeRef.current = 0;
    setIsAlertActive(false);
    setAboveThresholdDuration(0);
    consecutiveAboveThresholdRef.current = 0;
  };

  // Reset metrics
  const resetStats = () => {
    setAlertCount(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setStreakMilestoneCount(0);
    toast({
      title: "Metrics Reset",
      description: "Classroom noise history has been cleared.",
    });
  };

  // Canvas visualizer loop
  const visualize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isListeningRef.current) {
        // Draw flat line when idle
        drawIdleWave(ctx, canvas.width, canvas.height);
        return;
      }

      animationFrameIdRef.current = requestAnimationFrame(draw);

      // Read time-domain wave data
      analyser.getByteTimeDomainData(dataArray);

      // Compute volume (RMS - Root Mean Square)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] - 128) / 128; // scale to [-1.0, 1.0]
        sum += value * value;
      }
      const rms = Math.sqrt(sum / bufferLength);
      
      // Map to 0-100 gauge (exaggerated for classroom voice capture)
      const currentLevel = Math.min(Math.round(rms * 450), 100);
      
      // Exponential smoothing
      const smoothedLevel = Math.round(volumeRef.current * 0.7 + currentLevel * 0.3);
      volumeRef.current = smoothedLevel;
      setVolume(smoothedLevel);

      // Check threshold crossing
      const currentThreshold = thresholdRef.current;
      if (smoothedLevel > currentThreshold) {
        consecutiveAboveThresholdRef.current += 1;
        // Require ~1.2 seconds of consecutive noise to fire alarm (approx 70 frames at 60fps)
        const activeFramesThreshold = 40; 
        const progressPercent = Math.min((consecutiveAboveThresholdRef.current / activeFramesThreshold) * 100, 100);
        setAboveThresholdDuration(progressPercent);

        if (consecutiveAboveThresholdRef.current >= activeFramesThreshold) {
          if (!isAlertActive) {
            setIsAlertActive(true);
            setAlertCount(prev => prev + 1);
            playWarningBeep();
          }
        }
      } else {
        // Gradually recover/decrease above-threshold buffer
        consecutiveAboveThresholdRef.current = Math.max(0, consecutiveAboveThresholdRef.current - 1.5);
        const progressPercent = Math.min((consecutiveAboveThresholdRef.current / 40) * 100, 100);
        setAboveThresholdDuration(progressPercent);
        
        if (consecutiveAboveThresholdRef.current === 0) {
          setIsAlertActive(false);
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Neon Wave Visuals
      const width = canvas.width;
      const height = canvas.height;
      
      // Draw 3 layered waves for visual depth
      const isOver = volumeRef.current > currentThreshold;
      const primaryColor = isOver ? 'rgba(239, 68, 68, ' : 'rgba(34, 197, 94, ';
      const warningColor = 'rgba(234, 179, 8, ';

      // Wave 3 (Background subtle wave)
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = primaryColor + '0.15)';
      ctx.beginPath();
      let sliceWidth = width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const amplitude = (v - 1.0) * 1.5; // expand amplitude slightly
        const y = (height / 2) + amplitude * (height / 2) * Math.sin(i * 0.05);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // Wave 2 (Middle layer)
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = (isAlertActive ? primaryColor : warningColor) + '0.45)';
      ctx.beginPath();
      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const amplitude = (v - 1.0) * 1.2;
        const y = (height / 2) + amplitude * (height / 2) * Math.cos(i * 0.03 + Date.now() * 0.005);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // Wave 1 (Foreground glowing wave)
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = isOver ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)';
      ctx.strokeStyle = isOver ? '#ef4444' : '#22c55e';
      ctx.beginPath();
      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const amplitude = (v - 1.0) * 1.8;
        const y = (height / 2) + amplitude * (height / 2) * Math.sin(i * 0.04 + Date.now() * 0.008);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    };

    draw();
  };

  // Flat wave for inactive state
  const drawIdleWave = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  // Trigger idle wave draw on canvas initial load
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawIdleWave(ctx, canvas.width, canvas.height);
      }
    }
  }, [canvasRef]);

  // Color helper for volume gauge
  const getVolumeColorClass = () => {
    if (volume > threshold) return 'bg-red-500';
    if (volume > threshold * 0.75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const formatStreak = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${min}m ${remainingSec}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-1">
      {/* Visual Alert Notification Banner */}
      <AnimatePresence>
        {isAlertActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border-2 border-red-500 text-red-500 rounded-xl shadow-lg shadow-red-500/10 animate-bounce"
          >
            <AlertTriangle className="w-6 h-6 shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-extrabold text-base tracking-wide">SHH! CLASSROOM TOO LOUD! 🤫</p>
              <p className="text-xs text-red-400 font-medium">Please lower your voices to return to a calm environment.</p>
            </div>
            <div className="text-xs px-2.5 py-1 bg-red-500/20 text-red-500 rounded-md font-bold border border-red-500/30">
              Triggered
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Control Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-emerald-500" />
                    Microphone Monitor
                  </CardTitle>
                  <CardDescription>Visual feedback of your classroom volume levels.</CardDescription>
                </div>
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? 'destructive' : 'default'}
                  className="font-bold gap-2 px-5 py-2.5 transition-all shadow-md transform hover:scale-102"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" /> Stop Monitor
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" /> Start Monitor
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Real-time Oscilloscope Canvas */}
              <div className="relative w-full h-32 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={128}
                  className="w-full h-full block"
                />
                
                {!isListening && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] text-center p-4">
                    {typeof window !== 'undefined' && (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) ? (
                      <div className="flex flex-col items-center max-w-[340px] px-4">
                        <AlertTriangle className="w-7 h-7 text-red-500 animate-pulse mb-1.5" />
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
                          Secure Connection Required
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Your browser blocks microphone access on unencrypted connections. Please ensure the URL starts with <span className="font-semibold text-slate-200">https://</span> or run on <span className="font-semibold text-slate-200">localhost</span>.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <MicOff className="w-3.5 h-3.5" /> Monitor Inactive
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-[280px]">
                          Click "Start Monitor" above to visualize real-time decibel waves.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Decibel volume bar & threshold markers */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1"><Volume1 className="w-3.5 h-3.5" /> Current Level: {volume}%</span>
                  <span className="text-amber-500 font-bold">Limit: {threshold}%</span>
                </div>
                <div className="relative w-full h-5 bg-muted rounded-full overflow-hidden border border-border/60">
                  {/* Threshold mark line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 opacity-70 shadow-sm"
                    style={{ left: `${threshold}%` }}
                  />
                  {/* Filled level bar */}
                  <div 
                    className={`h-full transition-all duration-75 ${getVolumeColorClass()}`}
                    style={{ width: `${volume}%` }}
                  />
                </div>
              </div>

              {/* Warning Trigger Progress (Buffer delay display) */}
              {volume > threshold && !isAlertActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-lg text-xs flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
                  <span className="flex-1">Volume exceeded threshold. Preparing alert...</span>
                  <div className="w-20 bg-muted h-2 rounded-full overflow-hidden border border-yellow-500/20">
                    <div className="bg-yellow-500 h-full" style={{ width: `${aboveThresholdDuration}%` }} />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Threshold Settings & Presets */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Sensitivity & Threshold Config
              </CardTitle>
              <CardDescription>Adjust the volume limit for triggering quiet alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <Slider
                  min={10}
                  max={95}
                  step={5}
                  value={[threshold]}
                  onValueChange={(val) => setThreshold(val[0])}
                  className="py-1 cursor-pointer"
                />
                
                {/* Presets Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={threshold === 20 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset(20)}
                    className="text-xs font-bold"
                  >
                    🔇 Silent (20%)
                  </Button>
                  <Button
                    type="button"
                    variant={threshold === 45 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset(45)}
                    className="text-xs font-bold"
                  >
                    👥 Whispering (45%)
                  </Button>
                  <Button
                    type="button"
                    variant={threshold === 70 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset(70)}
                    className="text-xs font-bold"
                  >
                    🗣️ Discussion (70%)
                  </Button>
                </div>
              </div>

              {/* Sound warning alarm switch */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="space-y-0.5">
                  <Label htmlFor="mute-meter-sound" className="font-bold flex items-center gap-1.5">
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
                    Mute Alarm Ring
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Synthesize warning beep when threshold is crossed.</p>
                </div>
                <Switch
                  id="mute-meter-sound"
                  checked={isMuted}
                  onCheckedChange={setIsMuted}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel / Gamification */}
        <div className="space-y-6">
          <Card className="border border-border bg-card shadow-sm h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Quiet Stats
                </CardTitle>
                <CardDescription>Gamify class noise compliance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Current Quiet Streak */}
                <div className="p-3 bg-muted/50 rounded-xl border border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Current Quiet Streak</p>
                    <p className="text-2xl font-black tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                      {formatStreak(currentStreak)}
                    </p>
                  </div>
                  {isListening && !isAlertActive && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                {/* Best Streak */}
                <div className="p-3 bg-muted/50 rounded-xl border border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">All-time Session Best</p>
                    <p className="text-2xl font-black tracking-tight mt-1 text-amber-500">
                      {formatStreak(bestStreak)}
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>

                {/* Quiet Milestones */}
                <div className="p-3 bg-muted/50 rounded-xl border border-border/40">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Quiet Milestones (1m+)</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    <span className="text-xl font-black">{streakMilestoneCount}</span>
                    <span className="text-xs text-muted-foreground font-medium">earned this session</span>
                  </div>
                </div>

                {/* Trigger Alerts Counter */}
                <div className="p-3 bg-muted/50 rounded-xl border border-border/40">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Noise Violations</p>
                  <p className="text-2xl font-black tracking-tight mt-1 text-red-500">
                    {alertCount} <span className="text-xs text-muted-foreground font-normal">times flagged</span>
                  </p>
                </div>
              </CardContent>
            </div>
            
            <div className="p-6 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={resetStats}
                className="w-full text-xs font-bold gap-1.5 border-dashed"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Noise Stats
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
