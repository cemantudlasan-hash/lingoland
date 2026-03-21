'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function TimerTool() {
  const [initialMinutes, setInitialMinutes] = React.useState(5);
  const [initialSeconds, setInitialSeconds] = React.useState(0);
  const [totalSeconds, setTotalSeconds] = React.useState(300);
  const [secondsLeft, setSecondsLeft] = React.useState(300);
  const [isActive, setIsActive] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        // A simple beep sound from a reliable source.
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
    }
  }, []);
  
  React.useEffect(() => {
      const newTotal = (initialMinutes * 60) + initialSeconds;
      setTotalSeconds(newTotal);
      if(!isActive) {
          setSecondsLeft(newTotal);
      }
  }, [initialMinutes, initialSeconds]);

  React.useEffect(() => {
    // This effect handles the "Time's Up" logic
    if (isActive && secondsLeft <= 0) {
      setIsActive(false); // Stop the timer
      if (!isMuted) {
        audioRef.current?.play().catch((e) => console.error("Audio play failed:", e));
      }
      toast({ title: "Time's Up!", description: "The timer has finished." });
    }
  }, [secondsLeft, isActive, toast, isMuted]);

  React.useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Set up the interval when the timer is active
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    // Clean up the interval on component unmount or when isActive becomes false
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);


  const handleStartPause = () => {
    if (totalSeconds > 0) {
        setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(totalSeconds);
  };
  
  const formatTime = (timeInSeconds: number) => {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-6 p-4 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="grid gap-1.5 text-center">
            <Label htmlFor="minutes-input" className="text-muted-foreground">Minutes</Label>
            <Input
              id="minutes-input"
              type="number"
              value={initialMinutes}
              onChange={(e) => setInitialMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-28 text-center text-6xl h-24"
              disabled={isActive}
            />
        </div>
        <span className="text-8xl font-bold pt-8">:</span>
        <div className="grid gap-1.5 text-center">
            <Label htmlFor="seconds-input" className="text-muted-foreground">Seconds</Label>
            <Input
              id="seconds-input"
              type="number"
              value={initialSeconds}
              onChange={(e) => setInitialSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-28 text-center text-6xl h-24"
              disabled={isActive}
            />
        </div>
      </div>

      <div className="w-full max-w-lg text-center space-y-4">
        <p className="text-9xl font-mono tracking-tighter">{formatTime(secondsLeft)}</p>
        <Progress value={progress} />
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleStartPause} size="lg" className="w-32">
          {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="mr-2" /> Reset
        </Button>
      </div>
      <div className="flex items-center space-x-2 pt-4">
        <Switch id="mute-sound" checked={isMuted} onCheckedChange={setIsMuted} />
        <Label htmlFor="mute-sound">Mute Sound</Label>
      </div>
    </div>
  );
}
