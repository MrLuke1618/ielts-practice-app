import React, { useState, useMemo, useEffect } from 'react';
import { ReadingPassage, Question, QuestionType, TestScore } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Timer from '../ui/Timer';
import HelpModal from '../ui/HelpModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useData } from '../../contexts/DataContext';
import { generateReadingTest } from '../../services/geminiService';
import { SparklesIcon, QuestionMarkCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { logActivity } from '../../utils/progressTracker';

type UserAnswers = { [key: number]: string | string[] };

const ReadingModule: React.FC = () => {
  const { data, setIsAILoading } = useData();
  const [passages, setPassages] = useState<ReadingPassage[]>(data.readingPassages);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const passage = passages[selectedTestIndex];
  
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [, setScores] = useLocalStorage<TestScore[]>('reading-scores', []);
  const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
  const [targetBandScore] = useLocalStorage<number>('target-band-score', 6.5);
  const [generationError, setGenerationError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    setPassages(data.readingPassages);
    setSelectedTestIndex(0);
  }, [data.readingPassages]);

  useEffect(() => {
    setAnswers({});
    setIsSubmitted(false);
    setIsTimerRunning(true);
  }, [selectedTestIndex]);

  const handleGenerateTest = async () => {
    if (!apiKey) {
      setGenerationError('Please set your Gemini API key in Settings to use this feature.');
      return;
    }
    setIsAILoading(true);
    setGenerationError('');
    try {
      const newPassageData = await generateReadingTest(apiKey, targetBandScore);
      const newPassage: ReadingPassage = {
        ...newPassageData,
        id: `ai-${Date.now()}`,
        questions: newPassageData.questions.map(q => ({...q, explanation: 'This is an AI-generated question; explanations are not available.'}))
      };
      setPassages(prev => [...prev, newPassage]);
      setSelectedTestIndex(passages.length); // Switch to the new test
    } catch (e) {
      const error = e as Error;
      setGenerationError(error.message || 'Failed to generate test. Please try again.');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!passage) return;
    setIsTimerRunning(false);
    
    const finalScore = passage.questions.reduce((acc, q) => {
      const userAnswer = (answers[q.id] as string)?.trim().toLowerCase();
      if (!userAnswer) return acc;

      if (typeof q.correctAnswer === 'string' && q.correctAnswer.toLowerCase() === userAnswer) {
        return acc + 1;
      }
      if (Array.isArray(q.correctAnswer) && q.correctAnswer.some(ans => ans.toLowerCase() === userAnswer)) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const newScore: TestScore = {
      moduleId: 'READING',
      testId: passage.id,
      score: finalScore,
      total: passage.questions.length,
      date: new Date().toISOString()
    };
    setScores(prevScores => [newScore, ...prevScores].slice(0, 5));
    setIsSubmitted(true);
    logActivity('READING_TEST_COMPLETED');
  };
  
  const score = useMemo(() => {
    if (!isSubmitted || !passage) return 0;
    return passage.questions.reduce((acc, q) => {
      const userAnswer = (answers[q.id] as string)?.trim().toLowerCase();
      if (!userAnswer) return acc;

      if (typeof q.correctAnswer === 'string' && q.correctAnswer.toLowerCase() === userAnswer) {
        return acc + 1;
      }
       if (Array.isArray(q.correctAnswer) && q.correctAnswer.some(ans => ans.toLowerCase() === userAnswer)) {
        return acc + 1;
      }
      return acc;
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted, answers, passage?.questions]);
  
  const renderQuestion = (q: Question) => {
    const userAnswer = (answers[q.id] as string)?.toLowerCase();
    const isCorrect = isSubmitted && userAnswer &&
      (typeof q.correctAnswer === 'string' 
        ? q.correctAnswer.toLowerCase() === userAnswer
        : Array.isArray(q.correctAnswer) && q.correctAnswer.some(a => a.toLowerCase() === userAnswer));
    
    const isIncorrect = isSubmitted && userAnswer && !isCorrect;

    switch (q.type) {
      case QuestionType.TRUE_FALSE_NOT_GIVEN:
        return (
          <div key={q.id} className="mb-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">{q.id}. {q.questionText}</p>
            <fieldset className="flex space-x-4" disabled={isSubmitted}>
              {['True', 'False', 'Not Given'].map(option => {
                const isChecked = answers[q.id] === option;
                let ringColor = 'focus:ring-indigo-500';
                if (isSubmitted && isChecked) {
                    ringColor = isCorrect ? 'ring-green-500' : 'ring-red-500';
                }

                return (
                    <label key={option} className={`flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 rounded p-1 transition-colors ${isSubmitted && isChecked && isCorrect ? 'text-green-700 dark:text-green-400' : ''} ${isSubmitted && isChecked && isIncorrect ? 'text-red-700 dark:text-red-400' : ''}`}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={option}
                        disabled={isSubmitted}
                        checked={isChecked}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className={`h-4 w-4 text-indigo-600 border-zinc-300 dark:bg-zinc-600 dark:border-zinc-500 ${ringColor} focus:ring-2`}
                      />
                      <span>{option}</span>
                    </label>
                )
              })}
            </fieldset>
            {isIncorrect && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Correct answer: <strong>{q.correctAnswer}</strong></p>}
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

  if (!passage) {
     return (
        <Card>
            <p>No reading passages found. Please import a data file or reset to default data in the Settings page.</p>
        </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{passage.title}</h2>
            <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
                <QuestionMarkCircleIcon className="h-7 w-7" />
            </button>
        </div>
        <Timer initialMinutes={20} onComplete={handleSubmit} isRunning={isTimerRunning} />
      </div>

       <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
            <div>
                <label htmlFor="test-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Select a Reading Passage
                </label>
                <select
                    id="test-select"
                    value={selectedTestIndex}
                    onChange={(e) => setSelectedTestIndex(Number(e.target.value))}
                    className="block w-full sm:max-w-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {passages.map((p, index) => (
                        <option key={p.id} value={index}>{p.title}</option>
                    ))}
                </select>
            </div>
            <Button onClick={handleGenerateTest} icon={SparklesIcon} variant="secondary" className="h-10">
                New AI Test
            </Button>
        </div>
        {generationError && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{generationError}</p>}
      
      {isSubmitted && (
         <Card className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30">
             <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">Results</h3>
             <p className="text-lg text-indigo-700 dark:text-indigo-400">You scored <strong>{score}</strong> out of <strong>{passage.questions.length}</strong>.</p>
         </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:h-[70vh] lg:overflow-y-auto pr-4">
            <Card>
                <h3 className="text-xl font-semibold mb-4 dark:text-zinc-100">Reading Passage</h3>
                <div className="prose max-w-none text-justify dark:prose-p:text-zinc-300" dangerouslySetInnerHTML={{ __html: passage.passage }}></div>
            </Card>
        </div>
        <div className="lg:h-[70vh] lg:overflow-y-auto">
            <Card>
                <h3 className="text-xl font-semibold mb-4 dark:text-zinc-100">Questions</h3>
                <div>{passage.questions.map(renderQuestion)}</div>
                {!isSubmitted && (
                    <Button onClick={handleSubmit} className="mt-4">Submit Reading Test</Button>
                )}
            </Card>
        </div>
      </div>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Reading Module Help">
        <h4>Layout</h4>
        <p>This module uses a two-panel view. The reading passage is on the left, and the questions are on the right. Both panels scroll independently so you can easily refer back to the text while answering.</p>
        
        <h4>Timer</h4>
        <p>A 20-minute timer starts automatically. The test will be submitted when the timer ends, or you can submit it manually at any time.</p>
        
        <h4>Answering Questions</h4>
        <ul>
            <li>Read the passage carefully.</li>
            <li>For each question, select one of the options (True, False, or Not Given).</li>
            <li>Click "Submit Reading Test" when you are finished. Your results will be displayed at the top, and each question will show detailed feedback and an explanation.</li>
        </ul>

        <h4>AI-Generated & Custom Tests</h4>
        <ul>
          <li>Click the <strong>"New AI Test"</strong> button to generate a brand-new reading passage and questions (requires a Gemini API key).</li>
          <li>You can add your own reading passages by importing a data file on the Settings page.</li>
        </ul>
      </HelpModal>
    </div>
  );
};

export default ReadingModule;