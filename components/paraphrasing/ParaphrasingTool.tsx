import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getParaphrasedText } from '../../services/geminiService';
import { ArrowsRightLeftIcon, ClipboardDocumentIcon, CheckIcon, LightBulbIcon, StarIcon as StarIconOutline, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useData } from '../../contexts/DataContext';


const ParaphrasingTool: React.FC = () => {
    const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
    const { setIsAILoading } = useData();
    const [inputText, setInputText] = useState('');
    const [paraphrases, setParaphrases] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [view, setView] = useState<'suggestions' | 'saved'>('suggestions');
    const [savedParaphrases, setSavedParaphrases] = useLocalStorage<string[]>('saved-paraphrases', []);

    const tones = ['Simple', 'Formal', 'Expanded', 'Concise', 'Persuasive'];
    const [selectedTone, setSelectedTone] = useState('Formal');


    const handleParaphrase = async () => {
        setError('');
        setParaphrases([]);
        setIsAILoading(true);
        setView('suggestions');
        try {
            const results = await getParaphrasedText(apiKey, inputText, selectedTone);
            setParaphrases(results);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleCopyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleToggleSave = (phrase: string) => {
        setSavedParaphrases(prev => {
            if (prev.includes(phrase)) {
                return prev.filter(p => p !== phrase);
            } else {
                return [...prev, phrase];
            }
        });
    };
    
    const handleDeleteSaved = (indexToDelete: number) => {
        setSavedParaphrases(prev => prev.filter((_, index) => index !== indexToDelete));
    };


    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Paraphrasing Tool</h2>
                <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-300">Improve your writing by exploring different ways to express your ideas.</p>
            </div>
            
            <Card>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Select a Tone
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {tones.map(tone => (
                                <Button
                                    key={tone}
                                    onClick={() => setSelectedTone(tone)}
                                    variant={selectedTone === tone ? 'primary' : 'secondary'}
                                    size="sm"
                                >
                                    {tone}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="paraphrase-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Enter a sentence to paraphrase
                        </label>
                        <textarea
                            id="paraphrase-input"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full mt-1 h-28 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-800 text-zinc-100 dark:placeholder-zinc-400"
                            placeholder="e.g., The increasing popularity of the internet has dramatically changed how people communicate."
                        />
                    </div>
                    <Button onClick={handleParaphrase} disabled={!inputText.trim()} icon={ArrowsRightLeftIcon}>
                        {`Paraphrase as ${selectedTone}`}
                    </Button>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                </div>
            </Card>

            {(paraphrases.length > 0 || savedParaphrases.length > 0) && (
                 <Card>
                    <div className="flex border-b dark:border-zinc-700 mb-4">
                        <button 
                            onClick={() => setView('suggestions')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'suggestions' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                        >
                            Suggestions
                        </button>
                         <button 
                            onClick={() => setView('saved')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'saved' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                        >
                            Saved ({savedParaphrases.length})
                        </button>
                    </div>

                    {view === 'suggestions' ? (
                        <ul className="space-y-4">
                            {paraphrases.map((phrase, index) => {
                                const isSaved = savedParaphrases.includes(phrase);
                                return (
                                <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                                    <p className="text-zinc-800 dark:text-zinc-200 w-full">{phrase}</p>
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <Button onClick={() => handleToggleSave(phrase)} variant="secondary" size="sm" className="flex-shrink-0" title={isSaved ? "Unsave" : "Save"}>
                                            {isSaved ? <StarIconSolid className="h-4 w-4 text-yellow-500" /> : <StarIconOutline className="h-4 w-4" />}
                                        </Button>
                                        <Button onClick={() => handleCopyToClipboard(phrase, index)} variant="secondary" size="sm" className="flex-shrink-0" title="Copy to clipboard">
                                            {copiedIndex === index ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </li>
                                )
                            })}
                        </ul>
                    ) : ( // Saved View
                         <div className="space-y-4">
                            {savedParaphrases.length > 0 ? (
                                savedParaphrases.map((phrase, index) => (
                                     <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                                        <p className="text-zinc-800 dark:text-zinc-200 w-full">{phrase}</p>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <Button onClick={() => handleCopyToClipboard(phrase, index)} variant="secondary" size="sm" className="flex-shrink-0" title="Copy to clipboard">
                                                {copiedIndex === index ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                            </Button>
                                            <Button onClick={() => handleDeleteSaved(index)} variant="secondary" size="sm" className="flex-shrink-0" title="Delete">
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">You haven't saved any paraphrases yet. Click the star icon on a suggestion to save it here.</p>
                            )}
                        </div>
                    )}
                </Card>
            )}

             <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 rounded-lg flex items-start space-x-3">
                 <LightBulbIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0"/>
                 <p className="text-sm text-indigo-700 dark:text-indigo-300">
                   <strong>Pro Tip:</strong> Use paraphrasing to avoid repetition in your writing and to show the examiner your range of vocabulary and sentence structures.
                 </p>
              </div>
        </div>
    );
};

export default ParaphrasingTool;