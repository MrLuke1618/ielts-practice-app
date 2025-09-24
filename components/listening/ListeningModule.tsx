import React, { useState, useRef, useEffect } from 'react';
import { ListeningTest, Question, QuestionType, TestScore } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import HelpModal from '../ui/HelpModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useData } from '../../contexts/DataContext';
import { ListeningTestType, generateListeningTest } from '../../services/geminiService';
import { SparklesIcon, QuestionMarkCircleIcon, InformationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { logActivity } from '../../utils/progressTracker';
import TTSPlayer from '../ui/TTSPlayer';

type UserAnswers = { [key: number]: string };

const ListeningModule: React.FC = () => {
  const { data, setIsAILoading } = useData();
  const [tests, setTests] = useState<ListeningTest[]>(data.listeningTests);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const test = tests[selectedTestIndex];
  
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [, setScores] = useLocalStorage<TestScore[]>('listening-scores', []);
  const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
  const [targetBandScore] = useLocalStorage<number>('target-band-score', 6.5);
  const [generationError, setGenerationError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [aiTestType, setAiTestType] = useState<ListeningTestType>('Everyday Conversation');
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);

  useEffect(() => {
    // When the global data changes (e.g., from an import), reset the component state
    setTests(data.listeningTests);
    setSelectedTestIndex(0);
  }, [data.listeningTests]);

  useEffect(() => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setIsTranscriptVisible(false); // Hide transcript when test changes
    if(audioRef.current && test?.audioSrc) {
      audioRef.current.src = test.audioSrc;
      audioRef.current.load();
    }
    // Stop any speaking when changing tests, handled by TTSPlayer cleanup
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
  }, [selectedTestIndex, test]);

  // The TTSPlayer component now manages its own lifecycle, including cleanup.
  useEffect(() => {
    return () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);

  const handleGenerateTest = async () => {
    if (!apiKey) {
        setGenerationError('Please set your Gemini API key in Settings to use this feature.');
        return;
    }
    setIsAILoading(true);
    setGenerationError('');
    try {
        const newTestPartial = await generateListeningTest(apiKey, aiTestType, targetBandScore);
        const newTest: ListeningTest = {
            ...newTestPartial,
            id: `ai-${Date.now()}`,
            audioSrc: '', // No audio for AI-generated tests
            questions: newTestPartial.questions.map(q => ({...q, explanation: 'This is an AI-generated question; explanations are not available.'}))
        };
        // Replace the current test with the newly generated one
        setTests(prev => {
            const newTests = [...prev];
            newTests[selectedTestIndex] = newTest;
            return newTests;
        });
    } catch (e) {
        const error = e as Error;
        setGenerationError(error.message || 'Failed to generate test. Please try again.');
        console.error(e);
    }
    setIsAILoading(false);
  };

  const handleInputChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleSubmit = () => {
    if (!test) return;
    let finalScore = 0;
    
    test.questions.forEach(q => {
        const userAnswer = answers[q.id]?.trim().toLowerCase() || '';

        if (q.type === QuestionType.MULTIPLE_CHOICE) {
            if (q.correctAnswer && typeof q.correctAnswer === 'string' && userAnswer === q.correctAnswer.toLowerCase()) {
                finalScore++;
            }
        } else if (q.type === QuestionType.FILL_IN_THE_BLANK) {
            const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer.map(c => c.toLowerCase()) : [q.correctAnswer?.toLowerCase()];
            if (correctAnswers.includes(userAnswer)) {
                finalScore++;
            }
        }
    });

    setScore(finalScore);

    const newScore: TestScore = {
      moduleId: 'LISTENING',
      testId: test.id,
      score: finalScore,
      total: test.questions.length,
      date: new Date().toISOString(),
    };
    
    setScores(prevScores => [newScore, ...prevScores].slice(0, 5));
    setIsSubmitted(true);
    setIsTranscriptVisible(true); // Show transcript upon submission
    logActivity('LISTENING_TEST_COMPLETED');
  };
  
  const renderQuestion = (q: Question) => {
    const userAnswer = answers[q.id]?.trim().toLowerCase() || '';
    const correctAnswerText = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : q.correctAnswer;
    
    let isCorrect = false;
    if (isSubmitted) {
        if (q.type === QuestionType.MULTIPLE_CHOICE) {
            isCorrect = typeof q.correctAnswer === 'string' && userAnswer === q.correctAnswer.toLowerCase();
        } else {
            const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer.map(c => c.toLowerCase()) : [q.correctAnswer?.toLowerCase()];
            isCorrect = correctAnswers.includes(userAnswer);
        }
    }
    const isIncorrect = isSubmitted && !isCorrect;

    switch (q.type) {
      case QuestionType.FILL_IN_THE_BLANK:
        const hasValue = (answers[q.id] || '').length > 0;
        let inputClasses = 'border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:bg-indigo-50 dark:focus:bg-zinc-700/50 focus:ring-indigo-500 focus:border-indigo-500';
        if (isSubmitted) {
            inputClasses = isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700 text-green-800 dark:text-green-300' 
                                     : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700 text-red-800 dark:text-red-300';
        } else if (hasValue) {
            inputClasses = 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-700 focus:ring-indigo-500 focus:border-indigo-500';
        }
        return (
          <div key={q.id} className="mb-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 break-words" dangerouslySetInnerHTML={{ __html: q.questionText }}></label>
            <input
              type="text"
              disabled={isSubmitted}
              onChange={(e) => handleInputChange(q.id, e.target.value)}
              value={answers[q.id] || ''}
              className={`block w-full sm:w-1/2 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-200 ${inputClasses}`}
            />
            {isIncorrect && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Correct answer: <strong>{correctAnswerText}</strong></p>}
            {isCorrect && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Correct!</p>}
             {isSubmitted && q.explanation && (
                <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-400 dark:border-indigo-500 rounded-r-lg text-sm">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-300 flex items-center"><InformationCircleIcon className="h-4 w-4 mr-1"/>Explanation</p>
                    <p className="text-indigo-700 dark:text-indigo-400 mt-1" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                </div>
            )}
          </div>
        );
    case QuestionType.MULTIPLE_CHOICE:
        return (
            <div key={q.id} className="mb-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 break-words" dangerouslySetInnerHTML={{ __html: q.questionText }} />
                <fieldset className="space-y-2" disabled={isSubmitted}>
                    {q.options?.map(option => {
                        const isChecked = answers[q.id] === option.text;
                        let labelClasses = "text-zinc-700 dark:text-zinc-300";
                        if (isSubmitted && option.isCorrect) {
                            labelClasses = "text-green-700 dark:text-green-400 font-semibold";
                        } else if (isSubmitted && isChecked && !option.isCorrect) {
                            labelClasses = "text-red-700 dark:text-red-400 line-through";
                        }
                        return (
                            <label key={option.text} className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${isChecked ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}>
                                <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={option.text}
                                    disabled={isSubmitted}
                                    checked={isChecked}
                                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                                    className={`h-4 w-4 text-indigo-600 border-zinc-300 dark:bg-zinc-600 dark:border-zinc-500 focus:ring-indigo-500`}
                                />
                                <span className={labelClasses}>{option.text}</span>
                            </label>
                        )
                    })}
                </fieldset>
                {isIncorrect && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Correct answer: <strong>{correctAnswerText}</strong></p>}
                {isCorrect && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Correct!</p>}
                {isSubmitted && q.explanation && (
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-400 dark:border-indigo-500 rounded-r-lg text-sm">
                        <p className="font-semibold text-indigo-800 dark:text-indigo-300 flex items-center"><InformationCircleIcon className="h-4 w-4 mr-1"/>Explanation</p>
                        <p className="text-indigo-700 dark:text-indigo-400 mt-1" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                )}
            </div>
        );
      default:
        return null;
    }
  };

  if (!test) {
    return (
        <Card>
            <p>No listening tests found. Please import a data file or reset to default data in the Settings page.</p>
        </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{test.title}</h2>
            <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
                <QuestionMarkCircleIcon className="h-7 w-7" />
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6 self-start">
            <Card>
                <h3 className="text-lg font-semibold mb-3 dark:text-zinc-100">Test Controls</h3>
                <div className="mb-4">
                    <label htmlFor="test-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Select a Test
                    </label>
                    <select
                        id="test-select"
                        value={selectedTestIndex}
                        onChange={(e) => setSelectedTestIndex(Number(e.target.value))}
                        className="block w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {tests.map((t, index) => (
                            <option key={t.id} value={index}>{t.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Generate AI Test
                    </label>
                    <div className="flex gap-2">
                         <select
                            value={aiTestType}
                            onChange={(e) => setAiTestType(e.target.value as ListeningTestType)}
                            className="block w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                         >
                            <option value="Everyday Conversation">Conversation</option>
                            <option value="Academic Monologue">Monologue</option>
                        </select>
                        <Button onClick={handleGenerateTest} icon={SparklesIcon} variant="secondary">
                            Generate
                        </Button>
                    </div>
                    {generationError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{generationError}</p>}
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold dark:text-zinc-100">Audio Controls</h3>
                    <Button
                        onClick={() => setIsTranscriptVisible(prev => !prev)}
                        variant="secondary"
                        size="sm"
                        icon={isTranscriptVisible ? EyeSlashIcon : EyeIcon}
                    >
                        {isTranscriptVisible ? 'Hide' : 'Show'} Transcript
                    </Button>
                </div>
                {test.audioSrc ? (
                <>
                    <audio ref={audioRef} controls src={test.audioSrc} className="w-full"></audio>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Listen to the audio and answer the questions.</p>
                </>
                ) : (
                <div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 p-4 rounded mb-4">
                    <p className="font-bold text-amber-800 dark:text-amber-300">AI-Generated Audio (Text-to-Speech)</p>
                    <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">This audio is generated by your browser. Click play to listen.</p>
                    </div>
                    <TTSPlayer text={test.transcript} />
                </div>
                )}
            </Card>

            {isTranscriptVisible && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4 dark:text-zinc-100">Transcript</h3>
                    <div className="prose prose-sm max-w-none bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg max-h-80 overflow-y-auto prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-strong:text-zinc-800 dark:prose-strong:text-zinc-100" dangerouslySetInnerHTML={{ __html: test.transcript }}>
                    </div>
                </Card>
            )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
            {isSubmitted && (
                <Card className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30">
                    <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">Results</h3>
                    <p className="text-lg text-indigo-700 dark:text-indigo-400">You scored <strong>{score}</strong> out of <strong>{test.questions.length}</strong>.</p>
                </Card>
            )}

            <Card>
                <h3 className="text-xl font-semibold mb-4 dark:text-zinc-100">Questions</h3>
                {test.questions.map(renderQuestion)}
                {!isSubmitted && (
                <Button onClick={handleSubmit} className="mt-4">Submit Answers</Button>
                )}
            </Card>
        </div>
      </div>


      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Listening Module Help">
        <h4>How to Use This Module</h4>
        <ul>
            <li><strong>Select a Test:</strong> Use the dropdown menu in the 'Test Controls' card to choose from a list of tests. You can add more tests via the Settings page.</li>
            <li><strong>Listen Carefully:</strong> Play the audio using the controls in the 'Audio Controls' card. You can play, pause, and seek as needed.</li>
            <li><strong>Answer Questions:</strong> As you listen, answer the multiple-choice or fill-in-the-blank questions in the right-hand panel.</li>
            <li><strong>Submit:</strong> Once the audio is finished and you've answered all questions, click "Submit Answers" to see your score. Correct and incorrect answers will be highlighted, and a detailed explanation will be provided for each question.</li>
        </ul>
        <h4>AI-Generated Tests</h4>
        <ul>
            <li>Select a test type ('Conversation' or 'Monologue') and click the <strong>"Generate"</strong> button to create a new transcript and set of questions. This will replace the currently selected test for this session.</li>
            <li><strong>Note:</strong> This feature requires a Gemini API key (set in Settings) and does not include a downloadable audio file.</li>
            <li><strong>Text-to-Speech:</strong> For AI-generated tests, a player is provided to have the text read to you by your browser. You can play, pause, and stop the audio.</li>
            <li><strong>Transcript:</strong> The transcript is hidden by default to better simulate test conditions. Click the "Show Transcript" button in the 'Audio Controls' card to view it at any time. It will appear automatically after you submit your answers.</li>
        </ul>
      </HelpModal>
    </div>
  );
};

export default ListeningModule;