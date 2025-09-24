import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import HelpModal from '../ui/HelpModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getPronunciationFeedback, suggestPronunciationWord, generateTongueTwister, generateMinimalPairs, generateSentenceForStress } from '../../services/geminiService';
import { blobToBase64 } from '../../utils/audioConverter';
import { SpeakerWaveIcon, MicrophoneIcon, StopIcon, LightBulbIcon, SparklesIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { logActivity } from '../../utils/progressTracker';

type PracticeMode = 'singleWord' | 'tongueTwister' | 'minimalPair' | 'sentenceStress';

const PronunciationStudio: React.FC = () => {
    const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
    const [practiceMode, setPracticeMode] = useState<PracticeMode>('singleWord');
    
    // State for all modes
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // State specific to modes
    const [word, setWord] = useState('analysis');
    const [tongueTwister, setTongueTwister] = useState("She sells seashells by the seashore.");
    const [minimalPair, setMinimalPair] = useState<{ pair: [string, string]; sentences: [string, string] } | null>({ pair: ["ship", "sheep"], sentences: ["The ship is in the harbour.", "The sheep is in the field."] });
    const [sentenceStress, setSentenceStress] = useState("I haven't seen that movie yet.");
    
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser doesn't support text-to-speech.");
        }
    };

    const resetState = () => {
        setError('');
        setFeedback('');
        setAudioBlob(null);
        setIsLoading(false);
        if (isRecording) {
            stopRecording();
        }
    };

    const startRecording = useCallback(async () => {
        resetState();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };
            mediaRecorder.current.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                audioChunks.current = [];
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone error:", err);
            setError("Microphone access was denied. Please allow it in your browser settings.");
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    }, []);

    const handleGetFeedback = async () => {
        if (!apiKey) {
            setError('Please set your Gemini API key in Settings to use this feature.');
            return;
        }
        if (!audioBlob) {
            setError('Please record yourself first.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setFeedback('');

        let textToPractice = '';
        switch (practiceMode) {
            case 'singleWord': textToPractice = word; break;
            case 'tongueTwister': textToPractice = tongueTwister; break;
            case 'minimalPair': textToPractice = minimalPair ? `${minimalPair.pair[0]} vs. ${minimalPair.pair[1]}` : ''; break;
            case 'sentenceStress': textToPractice = sentenceStress; break;
        }

        try {
            const audioBase64 = await blobToBase64(audioBlob);
            const result = await getPronunciationFeedback(apiKey, textToPractice, audioBase64, audioBlob.type, practiceMode);
            setFeedback(result);
            logActivity('PRONUNCIATION_PRACTICE_COMPLETED');
        } catch (e) {
            setError((e as Error).message || 'Failed to get feedback.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateNew = async () => {
        if (!apiKey) {
            setError('API key is required for suggestions.');
            return;
        }
        setIsLoading(true);
        resetState();
        try {
            switch(practiceMode) {
                case 'singleWord':
                    setWord(await suggestPronunciationWord(apiKey));
                    break;
                case 'tongueTwister':
                    setTongueTwister(await generateTongueTwister(apiKey));
                    break;
                case 'minimalPair':
                    setMinimalPair(await generateMinimalPairs(apiKey));
                    break;
                case 'sentenceStress':
                    setSentenceStress(await generateSentenceForStress(apiKey));
                    break;
            }
        } catch (e) {
            setError((e as Error).message);
        }
        setIsLoading(false);
    };

    const playAudio = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch(e => console.error("Error playing audio:", e));
    };

    useEffect(() => {
        return () => {
             if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
                mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const TabButton: React.FC<{ mode: PracticeMode, children: React.ReactNode }> = ({ mode, children }) => (
        <button
            onClick={() => { setPracticeMode(mode); resetState(); }}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                practiceMode === mode ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
        >
            {children}
        </button>
    );

    const renderPracticeContent = () => {
        switch(practiceMode) {
            case 'singleWord':
                return (
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                        <div className="flex-grow">
                            <label htmlFor="word-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                1. Enter or generate a word
                            </label>
                            <div className="relative">
                                <input
                                    id="word-input" type="text" value={word} onChange={(e) => setWord(e.target.value)}
                                    className="block w-full mt-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pr-10"
                                />
                                <button onClick={() => speak(word)} className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-indigo-600"><SpeakerWaveIcon className="h-5 w-5"/></button>
                            </div>
                        </div>
                        <Button onClick={handleGenerateNew} disabled={isLoading || !apiKey} icon={SparklesIcon} variant="secondary" title="Suggest a word" className="w-full sm:w-auto flex-shrink-0">AI Suggest</Button>
                    </div>
                );
            case 'tongueTwister':
                 return (
                     <div className="space-y-3">
                        <p className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">1. Practice this tongue twister</p>
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                           <p className="flex-grow text-lg font-semibold text-center text-indigo-700 dark:text-indigo-300">{tongueTwister}</p>
                           <button onClick={() => speak(tongueTwister)} className="p-2 text-zinc-500 hover:text-indigo-600 rounded-full flex-shrink-0"><SpeakerWaveIcon className="h-5 w-5"/></button>
                        </div>
                        <Button onClick={handleGenerateNew} disabled={isLoading || !apiKey} icon={SparklesIcon} variant="secondary">New Tongue Twister</Button>
                    </div>
                 );
            case 'minimalPair':
                 return (
                     <div className="space-y-3">
                         <p className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">1. Practice distinguishing these sounds</p>
                         <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg space-y-2">
                             <div className="flex justify-center items-center gap-4">
                                <h3 className="text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400">{minimalPair?.pair[0]}</h3>
                                <span className="text-zinc-400">vs.</span>
                                <h3 className="text-2xl font-bold text-center text-teal-700 dark:text-teal-400">{minimalPair?.pair[1]}</h3>
                                <button onClick={() => speak(`${minimalPair?.pair[0]}.     ${minimalPair?.pair[1]}`)} className="p-2 text-zinc-500 hover:text-indigo-600 rounded-full flex-shrink-0"><SpeakerWaveIcon className="h-5 w-5"/></button>
                             </div>
                             <div className="text-sm text-zinc-600 dark:text-zinc-300 text-center space-y-1 pt-2 border-t dark:border-zinc-600">
                                 <p><em>{minimalPair?.sentences[0]}</em></p>
                                 <p><em>{minimalPair?.sentences[1]}</em></p>
                             </div>
                         </div>
                         <Button onClick={handleGenerateNew} disabled={isLoading || !apiKey} icon={SparklesIcon} variant="secondary">New Minimal Pair</Button>
                     </div>
                 );
            case 'sentenceStress':
                return (
                    <div className="space-y-3">
                        <p className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">1. Practice this sentence with natural stress</p>
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                           <p className="flex-grow text-lg font-semibold text-center text-indigo-700 dark:text-indigo-300">{sentenceStress}</p>
                           <button onClick={() => speak(sentenceStress)} className="p-2 text-zinc-500 hover:text-indigo-600 rounded-full flex-shrink-0"><SpeakerWaveIcon className="h-5 w-5"/></button>
                        </div>
                        <Button onClick={handleGenerateNew} disabled={isLoading || !apiKey} icon={SparklesIcon} variant="secondary">New Sentence</Button>
                    </div>
                );
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Pronunciation Studio</h2>
                <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
                    <QuestionMarkCircleIcon className="h-7 w-7" />
                </button>
            </div>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-300">Practice your pronunciation and get instant AI feedback.</p>

             <div className="flex flex-wrap gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg self-start">
                <TabButton mode="singleWord">Single Word</TabButton>
                <TabButton mode="tongueTwister">Tongue Twister</TabButton>
                <TabButton mode="minimalPair">Minimal Pairs</TabButton>
                <TabButton mode="sentenceStress">Sentence Stress</TabButton>
            </div>
            
            <Card>
                <div className="space-y-4">
                    {renderPracticeContent()}
                    <div className="mt-4 pt-4 border-t dark:border-zinc-700 space-y-4">
                        <p className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">2. Record your voice</p>
                        <div className="flex items-center gap-4">
                            {!isRecording ? (
                                <Button onClick={startRecording} icon={MicrophoneIcon}>Start Recording</Button>
                            ) : (
                                <Button onClick={stopRecording} icon={StopIcon} variant="danger">Stop Recording</Button>
                            )}
                            {isRecording && <span className="text-sm text-red-500 animate-pulse">Recording...</span>}
                        </div>

                        {audioBlob && (
                            <div className="flex items-center gap-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Button onClick={() => playAudio(audioBlob)} icon={SpeakerWaveIcon} variant="secondary">Play Recording</Button>
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">Your recording is ready.</span>
                            </div>
                        )}

                        <p className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">3. Get AI Feedback</p>
                        <Button onClick={handleGetFeedback} disabled={isLoading || !audioBlob} icon={LightBulbIcon}>
                            {isLoading ? 'Analyzing...' : 'Analyze My Pronunciation'}
                        </Button>
                    </div>
                     {error && <p className="text-sm text-red-600 dark:text-red-400 mt-4">{error}</p>}
                </div>
            </Card>

            {feedback && (
                <Card>
                    <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">Feedback</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }}></div>
                </Card>
            )}

             <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Pronunciation Studio Help">
                <h4>How to Use the Studio</h4>
                <ol>
                    <li><strong>Choose a Mode:</strong> Select one of the four practice tabs at the top.</li>
                    <li><strong>Hear It First:</strong> Click the speaker icon (🔊) to listen to the correct pronunciation before you record.</li>
                    <li><strong>Generate New:</strong> Use the "AI Suggest" or "New..." button to get new practice material from the AI.</li>
                    <li><strong>Record:</strong> Click "Start Recording," say the word or phrase, then click "Stop Recording."</li>
                    <li><strong>Analyze:</strong> Once your recording is ready, click "Analyze My Pronunciation" to get detailed feedback from the AI.</li>
                </ol>
                <h4>Practice Modes Explained</h4>
                <ul>
                    <li><strong>Single Word:</strong> Focus on the pronunciation of one tricky word at a time.</li>
                    <li><strong>Tongue Twister:</strong> Improve your fluency, clarity, and speed with fun tongue twisters.</li>
                    <li><strong>Minimal Pairs:</strong> Master difficult, similar-sounding words (like 'ship' vs 'sheep') to make your speech clearer.</li>
                    <li><strong>Sentence Stress:</strong> Practice the natural rhythm and intonation of full sentences to sound more like a native speaker.</li>
                </ul>
            </HelpModal>
        </div>
    );
};

export default PronunciationStudio;
