import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  width: number;
  height: number;
  isRecording: boolean;
  theme: 'light' | 'dark';
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyserNode, width, height, isRecording, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    
    analyserNode.fftSize = 2048;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const bgColor = theme === 'dark' ? 'rgb(39 39 42)' : 'rgb(244 244 245)';
    const lineColor = 'rgb(79 70 229)';
    const inactiveLineColor = theme === 'dark' ? 'rgb(82 82 91)' : 'rgb(113 113 122)';

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      
      analyserNode.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = bgColor;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = lineColor;

      canvasCtx.beginPath();
      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };
    
    if (isRecording) {
      draw();
    } else {
        // Draw a flat line when not recording
        canvasCtx.fillStyle = bgColor;
        canvasCtx.fillRect(0, 0, width, height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = inactiveLineColor;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, height / 2);
        canvasCtx.lineTo(width, height / 2);
        canvasCtx.stroke();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyserNode, width, height, isRecording, theme]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded-lg bg-zinc-100 dark:bg-zinc-800"></canvas>;
};

export default AudioVisualizer;