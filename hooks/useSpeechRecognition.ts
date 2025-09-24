import { useState, useRef, useEffect, useCallback } from 'react';

// TypeScript definitions for the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

export const useSpeechRecognition = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcriptArray = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript);
      setTranscript(transcriptArray.join(''));
    };
    
    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech Recognition Error", event.error);
        setIsRecognizing(false);
    }
    
    rec.onend = () => {
        setIsRecognizing(false);
    }

    recognition.current = rec;

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startRecognition = useCallback(() => {
    if (recognition.current && !isRecognizing) {
      setTranscript(''); // Reset transcript for new session
      recognition.current.start();
      setIsRecognizing(true);
    }
  }, [isRecognizing]);

  const stopRecognition = useCallback(() => {
    if (recognition.current && isRecognizing) {
      recognition.current.stop();
      setIsRecognizing(false);
    }
  }, [isRecognizing]);

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return { isRecognizing, transcript, startRecognition, stopRecognition, setTranscript, isSupported };
};
