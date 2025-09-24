import { useState, useRef, useCallback } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  
  // For visualization
  const audioContext = useRef<AudioContext | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);

  const cleanup = () => {
    if (sourceNode.current && sourceNode.current.mediaStream) {
      sourceNode.current.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close();
    }
    sourceNode.current = null;
    analyserNode.current = null;
    audioContext.current = null;
    mediaRecorder.current = null;
  };
  
  const startRecording = useCallback(async () => {
    setIsRecording(false);
    setAudioBlob(null);
    audioChunks.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // @ts-ignore
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext.current = new AudioContext();
      analyserNode.current = audioContext.current.createAnalyser();
      sourceNode.current = audioContext.current.createMediaStreamSource(stream);
      sourceNode.current.connect(analyserNode.current);

      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        cleanup();
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Microphone access was denied. Please allow microphone access in your browser settings.");
      cleanup();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, []);

  return { isRecording, startRecording, stopRecording, audioBlob, analyserNode: analyserNode.current };
};