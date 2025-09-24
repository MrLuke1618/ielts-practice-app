import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generateGrammarExercise } from '../../services/geminiService';
import { SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';
import { logActivity } from '../../utils/progressTracker';
import { useData } from '../../contexts/DataContext';

type ExerciseType = 'Error Spotting' | 'Tense Practice' | 'Sentence Transformation' | 'Word Forms';

const exerciseDescriptions: Record<ExerciseType, string> = {
    'Error Spotting': "Find and correct the grammatical mistake in the sentence below.",
    'Tense Practice': "Follow the instruction to rewrite the sentence correctly.",
    'Sentence Transformation': "Rewrite the sentence according to the instruction (e.g., change to passive voice).",
    'Word Forms': "Use the correct form of the word in brackets to complete the sentence."
};

const GrammarModule: React.FC = () => {
    const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
    const { setIsAILoading } = useData();
    const [exerciseType, setExerciseType] = useState<ExerciseType>('Error Spotting');
    const [currentExercise, setCurrentExercise] = useState<{ question: string; answer: string } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{ message: string, isCorrect: boolean } | null>(null);
    const [error, setError] = useState('');

    const handleGenerateExercise = async () => {
        if (!apiKey) {
            setError('Please set your Gemini API key in Settings to use this feature.');
            return;
        }
        setIsAILoading(true);
        setError('');
        setFeedback(null);
        setUserAnswer('');
        setCurrentExercise(null);
        try {
            const exercise = await generateGrammarExercise(apiKey, exerciseType);
            setCurrentExercise(exercise);
        } catch (e) {
            setError((e as Error).message || 'Failed to generate exercise.');
        } finally {
            setIsAILoading(false);
        }
    };

    const handleCheckAnswer = () => {
        if (!currentExercise) return;
        const isCorrect = userAnswer.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();
        
        if (isCorrect) {
            logActivity('GRAMMAR_EXERCISE_COMPLETED');
        }

        setFeedback({
            message: isCorrect ? 'Correct! Well done.' : `Not quite. The correct answer is: ${currentExercise.answer}`,
            isCorrect: isCorrect,
        });
    };
    
    const TabButton = ({ type }: { type: ExerciseType }) => (
        <button
            onClick={() => {
                setExerciseType(type);
                setCurrentExercise(null);
                setFeedback(null);
                setUserAnswer('');
            }}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                exerciseType === type ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
        >
            {type}
        </button>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Grammar Gym</h2>
                <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-300">Strengthen your grammar with infinite AI-powered exercises.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg self-start">
                <TabButton type="Error Spotting" />
                <TabButton type="Tense Practice" />
                <TabButton type="Sentence Transformation" />
                <TabButton type="Word Forms" />
            </div>

            <Card>
                <div className="space-y-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {exerciseDescriptions[exerciseType]}
                    </p>
                    <Button onClick={handleGenerateExercise} disabled={!apiKey} icon={SparklesIcon} variant="secondary">
                        New Exercise
                    </Button>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    
                    {currentExercise && (
                        <div className="space-y-4 pt-4 border-t dark:border-zinc-700">
                            <p className="font-semibold text-lg text-zinc-800 dark:text-zinc-200">{currentExercise.question}</p>
                            <textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                disabled={!!feedback}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                                placeholder="Type your answer here..."
                            />
                             <Button onClick={handleCheckAnswer} disabled={!userAnswer || !!feedback} icon={CheckIcon}>
                                Check Answer
                            </Button>
                        </div>
                    )}

                    {feedback && (
                         <div className={`p-3 rounded-lg text-sm ${feedback.isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                            {feedback.message}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default GrammarModule;