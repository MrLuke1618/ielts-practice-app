import React, { useState, useEffect } from 'react';
import { WritingTask } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useData } from '../../contexts/DataContext';
import { getWritingFeedback, generateImageFromPrompt, generateWritingTask } from '../../services/geminiService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Timer from '../ui/Timer';
import HelpModal from '../ui/HelpModal';
import { DocumentTextIcon, LightBulbIcon, SparklesIcon, QuestionMarkCircleIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { logActivity } from '../../utils/progressTracker';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

type ActiveTab = 'Task 1' | 'Task 2';

const WritingEditor: React.FC<{ task?: WritingTask, apiKey: string }> = ({ task, apiKey }) => {
  const [essay, setEssay] = useLocalStorage<string>(`writing-essay-${task?.id || 'default'}`, '');
  const [wordCount, setWordCount] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState(task?.imageSrc);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const { isRecognizing, transcript, startRecognition, stopRecognition, isSupported } = useSpeechRecognition();
  const [essayBeforeDictation, setEssayBeforeDictation] = useState('');
  
  useEffect(() => {
    // Reset state when the task changes
    setEssay(localStorage.getItem(`writing-essay-${task?.id || 'default'}`) || '');
    setFeedback('');
    setImageSrc(task?.imageSrc);
    setImageError('');
    if (isRecognizing) {
        stopRecognition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);
  
  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [essay]);

  useEffect(() => {
    // Append transcript to essay while dictating
    if (isRecognizing) {
      const separator = essayBeforeDictation.length > 0 && !essayBeforeDictation.endsWith(' ') ? ' ' : '';
      setEssay(essayBeforeDictation + separator + transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isRecognizing, essayBeforeDictation]);


  if (!task) return <Card><p>No writing task found. Please import data or reset to default in Settings.</p></Card>;
  
  const handleGetFeedback = async () => {
    setIsLoading(true);
    setFeedback('');
    const result = await getWritingFeedback(apiKey, task.type, essay);
    setFeedback(result);
    setIsLoading(false);

    if (result && !result.toLowerCase().includes('error') && !result.toLowerCase().includes('api key not provided')) {
        const storageKey = `writing-feedback-${task.type.replace(/\s+/g, '').toLowerCase()}`;
        localStorage.setItem(storageKey, result);
        logActivity('WRITING_FEEDBACK_RECEIVED');
    }
  };
  
  const handleGenerateImage = async () => {
    if (!apiKey) {
        setImageError('Please set your Gemini API key in Settings to generate an image.');
        return;
    }
    setIsGeneratingImage(true);
    setImageError('');
    try {
        const newImage = await generateImageFromPrompt(apiKey, task.imageGenerationPrompt || 'a random data chart');
        setImageSrc(newImage);
    } catch (error) {
        setImageError(error instanceof Error ? error.message : 'Failed to generate image.');
    }
    setIsGeneratingImage(false);
  };

  const downloadEssay = () => {
    const blob = new Blob([essay], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ielts_${task.type.replace(' ', '_').toLowerCase()}_${task.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleDictation = () => {
    if (isRecognizing) {
      stopRecognition();
    } else {
      setEssayBeforeDictation(essay);
      startRecognition();
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">{task.type} Prompt</h3>
                {task.type === 'Task 1' && (
                    <Button onClick={handleGenerateImage} disabled={isGeneratingImage} icon={SparklesIcon} variant="secondary">
                        {isGeneratingImage ? 'Generating...' : 'New AI Image'}
                    </Button>
                )}
            </div>

            {imageError && <p className="text-sm text-red-600 dark:text-red-400 my-2">{imageError}</p>}
            {task.type === 'Task 1' && imageSrc && <img src={imageSrc} alt="Task 1 diagram" className="my-4 border dark:border-zinc-700 rounded-lg max-w-full h-auto" />}
            
            <p className="text-zinc-700 dark:text-zinc-300">{task.prompt}</p>
        </Card>
        
        <div className="flex flex-wrap justify-between items-center gap-2 sm:sticky sm:top-0 bg-zinc-100 dark:bg-zinc-900 py-2 z-10">
            <div className="flex items-center flex-wrap gap-2">
                 <Timer initialMinutes={task.type === 'Task 1' ? 20 : 40} onComplete={() => {}} isRunning={true} />
                 <div className="text-sm font-medium p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200">
                    Word Count: <span className="font-bold">{wordCount}</span>
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                 {isSupported && (
                    <Button
                        onClick={handleToggleDictation}
                        variant={isRecognizing ? 'danger' : 'secondary'}
                        icon={MicrophoneIcon}
                        title={isRecognizing ? 'Stop Dictation' : 'Start Dictation'}
                    >
                        {isRecognizing ? 'Stop' : 'Dictate'}
                    </Button>
                 )}
                 <Button onClick={downloadEssay} variant="secondary" icon={DocumentTextIcon}>Export</Button>
            </div>
        </div>

        <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            readOnly={isRecognizing}
            className={`w-full h-64 sm:h-96 p-4 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 transition-colors ${isRecognizing ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900/50' : 'border-zinc-300 dark:border-zinc-600'}`}
            placeholder={isRecognizing ? "Listening... say something." : "Type your essay here to begin..."}
        />

        <div>
            <Button onClick={handleGetFeedback} disabled={isLoading} icon={LightBulbIcon}>
                {isLoading ? 'Getting Feedback...' : 'Get AI Feedback'}
            </Button>
        </div>

        {feedback && (
            <Card className="mt-6 bg-zinc-50 dark:bg-zinc-800/50">
                <h4 className="text-lg font-semibold mb-2 dark:text-zinc-100">Feedback</h4>
                <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} />
            </Card>
        )}
    </div>
  );
}

const WritingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Task 1');
  const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
  // FIX: Added targetBandScore to pass as difficulty to the AI generation function.
  const [targetBandScore] = useLocalStorage<number>('target-band-score', 6.5);
  const { data } = useData();
  const [writingTasks, setWritingTasks] = useState<WritingTask[]>(data.writingTasks || []);
  const [selectedTask1Index, setSelectedTask1Index] = useState(0);
  const [selectedTask2Index, setSelectedTask2Index] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    setWritingTasks(data.writingTasks || []);
    setSelectedTask1Index(0);
    setSelectedTask2Index(0);
  }, [data.writingTasks]);
  
  const task1Prompts = writingTasks.filter(t => t.type === 'Task 1');
  const task2Prompts = writingTasks.filter(t => t.type === 'Task 2');

  const handleGeneratePrompt = async () => {
    if (!apiKey) {
      setGenerationError('Please set your Gemini API key in Settings to use this feature.');
      return;
    }
    setIsGenerating(true);
    setGenerationError('');
    try {
      // FIX: Passed the targetBandScore as the difficulty argument.
      const newTask = await generateWritingTask(apiKey, activeTab, targetBandScore);
      setWritingTasks(prev => [...prev, newTask]);
      if (activeTab === 'Task 1') {
        setSelectedTask1Index(task1Prompts.length);
      } else {
        setSelectedTask2Index(task2Prompts.length);
      }
    } catch (e) {
      setGenerationError((e as Error).message || 'Failed to generate prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const TabButton = ({ tabName }: {tabName: ActiveTab}) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      }`}
    >
      {tabName}
    </button>
  );

  const currentPrompts = activeTab === 'Task 1' ? task1Prompts : task2Prompts;
  const currentSelection = activeTab === 'Task 1' ? selectedTask1Index : selectedTask2Index;
  const setSelection = activeTab === 'Task 1' ? setSelectedTask1Index : setSelectedTask2Index;
  const currentTask = currentPrompts[currentSelection];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Writing Practice</h2>
            <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
                <QuestionMarkCircleIcon className="h-7 w-7" />
            </button>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={handleGeneratePrompt} disabled={isGenerating} icon={SparklesIcon} variant="secondary">
                {isGenerating ? '...' : 'New AI Prompt'}
            </Button>
            <div className="flex space-x-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <TabButton tabName="Task 1" />
              <TabButton tabName="Task 2" />
            </div>
        </div>
      </div>
      {generationError && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{generationError}</p>}
      
      {currentPrompts.length > 1 && (
        <div className="mb-4 max-w-sm">
            <label htmlFor="prompt-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Select a Prompt
            </label>
            <select
                id="prompt-select"
                value={currentSelection}
                onChange={(e) => setSelection(Number(e.target.value))}
                className="block w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                {currentPrompts.map((p, index) => (
                    <option key={p.id} value={index}>{p.prompt.substring(0, 50)}...</option>
                ))}
            </select>
        </div>
      )}

      <WritingEditor task={currentTask} apiKey={apiKey} />

       <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Writing Module Help">
            <h4>Task 1 vs. Task 2</h4>
            <ul>
                <li><strong>Task 1:</strong> You need to describe a visual piece of information (like a graph, chart, or diagram). The recommended time is 20 minutes, and you should write at least 150 words.</li>
                <li><strong>Task 2:</strong> You need to write an essay in response to a point of view, argument, or problem. The recommended time is 40 minutes, and you should write at least 250 words.</li>
            </ul>
            <p>Use the toggle buttons at the top to switch between the two tasks.</p>

            <h4>Features</h4>
            <ul>
                <li><strong>Dictate:</strong> Click the microphone button to use your voice to type the essay. Click it again to stop. Your browser will ask for microphone permission.</li>
                <li><strong>Select a Prompt:</strong> If multiple prompts are available for a task type, a dropdown menu will appear allowing you to choose.</li>
                <li><strong>Timer & Word Count:</strong> Keep an eye on the live timer and word count to manage your time effectively.</li>
                <li><strong>Export:</strong> Click the "Export" button to download your essay as a .txt file.</li>
                <li><strong>New AI Prompt:</strong> Generate a completely new topic for the current task (requires API key).</li>
                <li><strong>New AI Image (Task 1 only):</strong> Click this to generate a new graph or chart for endless practice (requires API key).</li>
                <li><strong>Get AI Feedback:</strong> After writing your essay, click this button to get a detailed analysis based on IELTS criteria (requires API key). Your feedback will be saved automatically for the main Analysis module.</li>
            </ul>
      </HelpModal>
    </div>
  );
};

export default WritingModule;
