import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import AudioVisualizer from './AudioVisualizer';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { blobToWav, blobToDataUrl } from '../../utils/audioConverter';
import { useTheme } from '../../contexts/ThemeContext';
import { PlayIcon, StopIcon, ArrowDownTrayIcon, PencilIcon, CheckIcon, MicrophoneIcon, LightBulbIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getSpeakingFeedback } from '../../services/geminiService';
import { logActivity } from '../../utils/progressTracker';
import { SpeakingAttempt } from '../../types';
import { useData } from '../../contexts/DataContext';

interface RecordingControlsProps {
    prompt: React.ReactNode;
    apiKey: string;
    partId: 'part1' | 'part2' | 'part3';
    practiceId: string;
    onSaveAttempt: (attempt: Omit<SpeakingAttempt, 'id' | 'timestamp'>) => void;
}

type RecorderState = 'inactive' | 'recording' | 'stopped';

const RecordingControls: React.FC<RecordingControlsProps> = ({ prompt, apiKey, partId, practiceId, onSaveAttempt }) => {
    const [recorderState, setRecorderState] = useState<RecorderState>('inactive');
    const [audioURL, setAudioURL] = useState<string>('');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    
    // For visualization
    const audioContext = useRef<AudioContext | null>(null);
    const analyserNode = useRef<AnalyserNode | null>(null);
    const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);
    const { theme } = useTheme();
    const visualizerContainerRef = useRef<HTMLDivElement>(null);
    const [visualizerWidth, setVisualizerWidth] = useState(300);
    
    // For transcription
    const { isRecognizing, transcript, startRecognition, stopRecognition, setTranscript, isSupported } = useSpeechRecognition();
    const [isEditingTranscript, setIsEditingTranscript] = useState(false);

    // For AI Feedback
    const [feedback, setFeedback] = useState<string>('');
    const { setIsAILoading } = useData();

    const cleanup = () => {
        if (sourceNode.current && sourceNode.current.mediaStream) {
            sourceNode.current.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (audioContext.current && audioContext.current.state !== 'closed') {
            audioContext.current.close();
        }
    };

    const startRecording = useCallback(async () => {
        setRecorderState('inactive');
        setAudioURL('');
        setAudioBlob(null);
        setIsEditingTranscript(false);
        setFeedback('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
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
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                audioChunks.current = [];
                setRecorderState('stopped');
                cleanup();
            };

            mediaRecorder.current.start();
            setRecorderState('recording');
            if (isSupported) {
                startRecognition();
            }

        } catch (err) {
            console.error("Error starting recording:", err);
            alert("Microphone access was denied. Please allow microphone access in your browser settings.");
            cleanup();
        }
    }, [isSupported, startRecognition]);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
        }
        if (isRecognizing) {
            stopRecognition();
        }
        setRecorderState('stopped');
    }, [isRecognizing, stopRecognition]);
    
    const handleGetFeedback = async () => {
        setIsAILoading(true);
        setFeedback('');

        // Save final transcript for analysis module
        localStorage.setItem(`speaking-transcript-${partId}`, transcript);
        
        try {
            const result = await getSpeakingFeedback(apiKey, transcript);
            setFeedback(result);
            
            // Save feedback to local storage for the analysis module
            if (result && !result.toLowerCase().includes('error')) {
                localStorage.setItem(`speaking-feedback-${partId}`, result);
                logActivity('SPEAKING_FEEDBACK_RECEIVED');
                
                // Save the full attempt for history
                if (audioBlob) {
                    try {
                        const wavBlob = await blobToWav(audioBlob);
                        const audioDataUrl = await blobToDataUrl(wavBlob);
                        onSaveAttempt({
                            practiceId,
                            partId,
                            audioDataUrl,
                            transcript,
                            feedback: result
                        });
                    } catch (e) {
                        console.error("Failed to save speaking attempt to history:", e);
                    }
                }
            }
        } catch (e) {
            setFeedback("An error occurred while getting feedback.");
        } finally {
            setIsAILoading(false);
        }
    };

    const handleDownload = async () => {
        if (!audioBlob) return;
        try {
            const wavBlob = await blobToWav(audioBlob);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `ielts_speaking_${partId}_${new Date().toISOString()}.wav`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to convert to WAV", error);
            alert("Sorry, there was an error converting your recording to WAV format.");
        }
    };
    
    useEffect(() => {
        const container = visualizerContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                setVisualizerWidth(entries[0].contentRect.width);
            }
        });

        resizeObserver.observe(container);
        setVisualizerWidth(container.clientWidth);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        return () => {
            cleanup();
            if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
                mediaRecorder.current.stop();
            }
             if (isRecognizing) {
                stopRecognition();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            <Card>{prompt}</Card>
            <Card>
                 {recorderState === 'inactive' && (
                    <div className="flex items-start bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                        <InformationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>After you finish recording, your attempt will be saved automatically to the 'History' tab once you request AI feedback.</span>
                    </div>
                 )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {recorderState === 'inactive' && (
                        <Button onClick={startRecording} icon={PlayIcon} className="w-full sm:w-auto">Start Recording</Button>
                    )}
                    {recorderState === 'recording' && (
                        <Button onClick={stopRecording} icon={StopIcon} variant="danger" className="w-full sm:w-auto">Stop Recording</Button>
                    )}
                </div>
                 <div ref={visualizerContainerRef} className="mt-4 h-24 w-full">
                    <AudioVisualizer analyserNode={analyserNode.current} width={visualizerWidth} height={96} isRecording={recorderState === 'recording'} theme={theme} />
                </div>
            </Card>

            {recorderState === 'stopped' && audioURL && (
                <Card className="bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-semibold mb-3 text-lg dark:text-zinc-100">Your Practice Attempt</h4>
                    <div className="space-y-4">
                        <audio controls src={audioURL} className="w-full"></audio>
                        <div className="flex flex-col sm:flex-row sm:justify-end">
                             <Button onClick={handleDownload} variant="secondary" icon={ArrowDownTrayIcon} className="w-full sm:w-auto">Download as WAV</Button>
                        </div>
                    </div>
                </Card>
            )}

            {isSupported && (recorderState === 'recording' || (recorderState === 'stopped' && transcript)) && (
                 <Card>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-lg flex items-center dark:text-zinc-100">
                            <MicrophoneIcon className="h-5 w-5 mr-2" /> Live Transcription
                        </h4>
                        {recorderState === 'stopped' && !isEditingTranscript && (
                             <Button onClick={() => setIsEditingTranscript(true)} variant="secondary" size="sm" icon={PencilIcon}>Edit</Button>
                        )}
                         {recorderState === 'stopped' && isEditingTranscript && (
                             <Button onClick={() => setIsEditingTranscript(false)} variant="primary" size="sm" icon={CheckIcon}>Done</Button>
                        )}
                    </div>
                    {!isEditingTranscript ? (
                         <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-lg min-h-[100px]">{transcript || '...'}</p>
                    ) : (
                        <textarea 
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            className="w-full h-48 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-700 dark:text-zinc-100"
                        />
                    )}
                    {recorderState === 'recording' && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Transcription is in progress...</p>}
                 </Card>
            )}
            
            {recorderState === 'stopped' && transcript && !isEditingTranscript && (
                 <Card className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30">
                    <h4 className="text-lg font-semibold mb-2 text-indigo-800 dark:text-indigo-300">AI Analysis</h4>
                    {feedback ? (
                         <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} />
                    ) : (
                        <div>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">Your transcript is ready. Get instant feedback on your performance. This will also save your recording to the 'History' tab.</p>
                            <Button
                                onClick={handleGetFeedback}
                                disabled={!apiKey}
                                icon={LightBulbIcon}
                            >
                                Get AI Feedback
                            </Button>
                            {!apiKey && <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">To use this feature, please add your Gemini API key in the Settings page.</p>}
                        </div>
                    )}
                 </Card>
            )}


            {!isSupported && recorderState === 'recording' && (
                 <p className="text-center text-sm text-amber-700 dark:text-amber-500">Live transcription is not supported by your browser.</p>
            )}
        </div>
    );
};

export default RecordingControls;