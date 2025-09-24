import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  initialMinutes: number;
  onComplete: () => void;
  isRunning: boolean;
  className?: string;
  onTick?: (seconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes, onComplete, isRunning, className, onTick }) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            onComplete();
            return 0;
          }
          const newSeconds = prev - 1;
          if(onTick) onTick(newSeconds);
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, onComplete]);
  
  useEffect(() => {
    setSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const secs = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className={`text-2xl font-mono p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 tabular-nums ${className}`}>
      {formatTime(seconds)}
    </div>
  );
};

export default Timer;