import React, { useState, useEffect } from 'react';
import RecordingControls from './RecordingControls';
import HelpModal from '../ui/HelpModal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useData } from '../../contexts/DataContext';
import { generateSpeakingPractice } from '../../services/geminiService';
import { QuestionMarkCircleIcon, SparklesIcon, ChevronDownIcon, TrashIcon, ArchiveBoxIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { SpeakingPractice, SpeakingAttempt } from '../../types';

type SpeakingPart = 'Part 1' | 'Part 2' | 'Part 3';
type ActiveView = 'practice' | 'history';

const SpeakingModule: React.FC = () => {
  const { data } = useData();
  const [activePart, setActivePart] = useState<SpeakingPart>('Part 1');
  const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
  // FIX: Added targetBandScore to pass as difficulty to the AI generation function.
  const [targetBandScore] = useLocalStorage<number>('target-band-score', 6.5);
  const [practices, setPractices] = useState<SpeakingPractice[]>(data.speakingPractice || []);
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('practice');
  const [savedAttempts, setSavedAttempts] = useLocalStorage<SpeakingAttempt[]>('speaking-attempts', []);
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
  
  useEffect(() => {
    setPractices(data.speakingPractice || []);
    setSelectedPracticeIndex(0);
  }, [data.speakingPractice]);

  const handleSaveAttempt = (newAttemptData: Omit<SpeakingAttempt, 'id' | 'timestamp'>) => {
    const newAttempt: SpeakingAttempt = {
        ...newAttemptData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
    };
    setSavedAttempts(prev => [newAttempt, ...prev]);
  };

  const handleDeleteAttempt = (idToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this practice attempt? This action cannot be undone.")) {
      setSavedAttempts(prev => prev.filter(attempt => attempt.id !== idToDelete));
    }
  };

  const handleGenerateTopic = async () => {
    if (!apiKey) {
      setGenerationError('Please set your Gemini API key in Settings to use this feature.');
      return;
    }
    setIsGenerating(true);
    setGenerationError('');
    try {
      // FIX: Passed the targetBandScore as the difficulty argument.
      const newPractice = await generateSpeakingPractice(apiKey, targetBandScore);
      setPractices(prev => {
        const newPractices = [...prev, newPractice];
        setSelectedPracticeIndex(newPractices.length - 1);
        return newPractices;
      });
    } catch (e) {
      setGenerationError((e as Error).message || 'Failed to generate new topic.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPractice = practices[selectedPracticeIndex];

  if (!currentPractice) {
    return (
        <Card>
            <p>No speaking prompts found. Please import a data file or reset to default data in the Settings page.</p>
        </Card>
    );
  }
  
  const commonRecordingProps = {
    apiKey: apiKey,
    practiceId: currentPractice.part2Card.id,
    onSaveAttempt: handleSaveAttempt
  };

  const renderContent = () => {
    switch (activePart) {
      case 'Part 2':
        return (
            <RecordingControls 
                {...commonRecordingProps}
                partId="part2"
                prompt={
                    <div>
                        <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">Part 2: Long Turn</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">You should speak about the topic for 1 to 2 minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.</p>
                         <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{currentPractice.part2Card.topic}</p>
                            <ul className="list-disc list-inside mt-2 text-zinc-700 dark:text-zinc-300">
                            {currentPractice.part2Card.points.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                    </div>
                }
            />
        );
      case 'Part 3':
        return (
            <RecordingControls
                {...commonRecordingProps}
                partId="part3"
                prompt={
                    <div>
                        <h3 className="text-xl font-semibold mb-4 dark:text-zinc-100">Part 3: Discussion</h3>
                        <ul className="space-y-3 list-disc list-inside text-zinc-700 dark:text-zinc-300">
                        {currentPractice.part3Questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                }
            />
        );
      case 'Part 1':
      default:
        return (
           <RecordingControls 
                {...commonRecordingProps}
                partId="part1"
                prompt={
                     <div>
                        <h3 className="text-xl font-semibold mb-4 dark:text-zinc-100">Part 1: Introduction & Interview</h3>
                        <ul className="space-y-3 list-disc list-inside text-zinc-700 dark:text-zinc-300">
                        {currentPractice.part1Questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                }
           />
        );
    }
  };
  
  const PartTabButton = ({ partName }: { partName: SpeakingPart }) => (
    <button
      onClick={() => setActivePart(partName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activePart === partName ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      }`}
    >
      {partName}
    </button>
  );

  const ViewTabButton = ({ view, label, count }: { view: ActiveView, label: string, count?: number }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        activeView === view
          ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );

  const filteredAttempts = savedAttempts.filter(att => att.practiceId === currentPractice.part2Card.id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Speaking Practice</h2>
            <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
                <QuestionMarkCircleIcon className="h-7 w-7" />
            </button>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={handleGenerateTopic} disabled={isGenerating} icon={SparklesIcon} variant="secondary">
                {isGenerating ? '...' : 'New AI Topic'}
            </Button>
            {activeView === 'practice' && (
                <div className="flex space-x-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <PartTabButton partName="Part 1" />
                    <PartTabButton partName="Part 2" />
                    <PartTabButton partName="Part 3" />
                </div>
            )}
        </div>
      </div>
      {generationError && <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">{generationError}</p>}
      
      {practices.length > 1 && (
        <div className="mb-4 max-w-sm">
            <label htmlFor="topic-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Select a Topic
            </label>
            <select
                id="topic-select"
                value={selectedPracticeIndex}
                onChange={(e) => setSelectedPracticeIndex(Number(e.target.value))}
                className="block w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                {practices.map((p, index) => (
                    <option key={p.part2Card.id} value={index}>
                        Topic: {p.part2Card.topic.split(' ').slice(1).join(' ')}
                    </option>
                ))}
            </select>
        </div>
      )}

      <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <div className="flex space-x-4">
              <ViewTabButton view="practice" label="Practice" />
              <ViewTabButton view="history" label="History" count={filteredAttempts.length} />
          </div>
      </div>

      {activeView === 'practice' && renderContent()}

      {activeView === 'history' && (
          <div className="space-y-4">
              {filteredAttempts.length > 0 ? (
                  filteredAttempts.map(attempt => (
                      <Card key={attempt.id}>
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenHistoryId(openHistoryId === attempt.id ? null : attempt.id)}>
                              <div>
                                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Practice Attempt - {attempt.partId.replace('part', 'Part ')}</p>
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{new Date(attempt.timestamp).toLocaleString()}</p>
                              </div>
                              <ChevronDownIcon className={`h-5 w-5 text-zinc-500 transition-transform ${openHistoryId === attempt.id ? 'rotate-180' : ''}`} />
                          </div>

                          {openHistoryId === attempt.id && (
                              <div className="mt-4 pt-4 border-t dark:border-zinc-700 space-y-4">
                                  <div>
                                      <h4 className="font-medium text-sm mb-2 text-zinc-600 dark:text-zinc-300">Your Recording</h4>
                                      <audio controls src={attempt.audioDataUrl} className="w-full"></audio>
                                  </div>
                                  <div>
                                      <h4 className="font-medium text-sm mb-2 text-zinc-600 dark:text-zinc-300">Transcript</h4>
                                      <p className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-md text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">{attempt.transcript}</p>
                                  </div>
                                  <div>
                                      <h4 className="font-medium text-sm mb-2 text-zinc-600 dark:text-zinc-300">AI Feedback</h4>
                                      <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-md">
                                          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: attempt.feedback.replace(/\n/g, '<br />') }} />
                                      </div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                      <a href={attempt.audioDataUrl} download={`speaking-attempt-${attempt.partId}-${new Date(attempt.timestamp).toISOString()}.wav`}>
                                          <Button variant="secondary" icon={ArrowDownTrayIcon}>Download</Button>
                                      </a>
                                      <Button onClick={() => handleDeleteAttempt(attempt.id)} variant="danger" icon={TrashIcon}>Delete</Button>
                                  </div>
                              </div>
                          )}
                      </Card>
                  ))
              ) : (
                  <Card>
                      <div className="text-center py-8">
                          <ArchiveBoxIcon className="mx-auto h-12 w-12 text-zinc-400" />
                          <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-200">No History Found</h3>
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your saved practice attempts for this topic will appear here.</p>
                      </div>
                  </Card>
              )}
          </div>
      )}


      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Speaking Module Help">
        <h4>Practice View</h4>
        <p>This is where you record your attempts.Use the tabs at the top to switch between Part 1, 2, and 3. You can choose different topics from the dropdown menu.</p>
        <ul>
            <li>Click <strong>"Start Recording"</strong> and your browser will ask for microphone permission.</li>
            <li>After recording, you can play it back, download it, and edit the live transcript.</li>
            <li>Click <strong>"Get AI Feedback"</strong> to analyze your performance. This will automatically save your attempt (audio, transcript, and feedback) to the "History" tab.</li>
        </ul>
        
        <h4>History View</h4>
        <ul>
            <li>This tab contains a complete record of all your saved attempts for the currently selected topic.</li>
            <li>Click on any attempt to expand it and review the details.</li>
            <li>You can listen to your old recordings, read the transcripts, review the AI feedback, and download the audio file for offline practice.</li>
            <li>Use the <strong>"Delete"</strong> button to permanently remove an attempt.</li>
        </ul>
      </HelpModal>
    </div>
  );
};

export default SpeakingModule;
