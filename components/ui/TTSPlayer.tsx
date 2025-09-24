import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';
import Button from './Button';

interface TTSPlayerProps {
  text: string;
}

const TTSPlayer: React.FC<TTSPlayerProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const cleanText = useMemo(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
  }, [text]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsSpeaking(false);
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(100);
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(0);
    };

    utterance.onboundary = (event) => {
      // The `charIndex` is not always perfectly accurate for progress, but it's the best we have.
      const currentProgress = (event.charIndex + event.charLength) / (cleanText.length || 1) * 100;
      setProgress(currentProgress);
    };
    
    utteranceRef.current = utterance;

    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [cleanText]);

  const handlePlay = () => {
    if (!utteranceRef.current) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      // Stop any other speech before starting anew
      window.speechSynthesis.cancel();
      setProgress(0);
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
  };
  
  if (!('speechSynthesis' in window)) {
    return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 rounded">
            <p className="font-bold text-red-800 dark:text-red-300">Text-to-Speech Not Supported</p>
            <p className="text-red-700 dark:text-red-400 text-sm mt-1">Sorry, your browser does not support the audio playback feature for this content.</p>
        </div>
    );
  }

  return (
    <div className="p-4 border dark:border-zinc-700 rounded-lg space-y-3 bg-zinc-50 dark:bg-zinc-800/50">
      <div className="flex items-center gap-4">
        {!isSpeaking && !isPaused && (
          <Button onClick={handlePlay} icon={PlayIcon} size="md">Play Audio</Button>
        )}
        {isSpeaking && !isPaused && (
          <Button onClick={handlePause} icon={PauseIcon} size="md">Pause</Button>
        )}
        {isPaused && (
          <Button onClick={handlePlay} icon={PlayIcon} size="md">Resume</Button>
        )}
        <Button onClick={handleStop} icon={StopIcon} variant="secondary" size="md">Stop</Button>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-150" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TTSPlayer;
