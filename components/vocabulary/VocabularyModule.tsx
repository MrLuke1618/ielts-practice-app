import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import HelpModal from '../ui/HelpModal';
import { SpeakerWaveIcon, ArrowLeftIcon, ArrowRightIcon, ArrowsRightLeftIcon, QuestionMarkCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generateVocabularyQuiz, VocabularyQuiz, generateVocabularyList } from '../../services/geminiService';
// FIX: Imported VocabularyCategory type to correctly type component props.
import { VocabularyCategory } from '../../types';

type ActiveView = 'flashcards' | 'aiPractice';

const VocabularyModule: React.FC = () => {
  const { data, addVocabularyCategory } = useData();
  const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('flashcards');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [topicToSelect, setTopicToSelect] = useState('');

  const vocabularyData = data.vocabulary || [];
  const selectedCategory = vocabularyData[selectedCategoryIndex];
  
  useEffect(() => {
    // Reset category when global data changes, but don't reset if we are adding a new one.
    if (!topicToSelect) {
        setSelectedCategoryIndex(0);
    }
  }, [data.vocabulary, topicToSelect]);

  useEffect(() => {
    if (topicToSelect && data.vocabulary.length > 0) {
        const newIndex = data.vocabulary.findIndex(cat => cat.category === topicToSelect);
        if (newIndex !== -1) {
            setSelectedCategoryIndex(newIndex);
            setTopicToSelect(''); // Reset after selection
        }
    }
  }, [data.vocabulary, topicToSelect]);

  const handleGenerateCategory = async () => {
    if (!newTopic.trim()) {
        setGenerationError('Please enter a topic.');
        return;
    }
    if (!apiKey) {
        setGenerationError('Please set your Gemini API key in Settings to use this feature.');
        return;
    }
    setIsGenerating(true);
    setGenerationError('');
    try {
        const newWords = await generateVocabularyList(apiKey, newTopic);
        const capitalizedTopic = newTopic.trim().replace(/\b\w/g, l => l.toUpperCase());
        
        const newCategory: VocabularyCategory = {
            category: capitalizedTopic,
            words: newWords
        };
        
        setTopicToSelect(capitalizedTopic);
        addVocabularyCategory(newCategory);
        
        setIsModalOpen(false);
        setNewTopic('');
    } catch (e) {
        setGenerationError((e as Error).message);
    } finally {
        setIsGenerating(false);
    }
  };


  const TabButton = ({ view, label }: { view: ActiveView, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        activeView === view
          ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Vocabulary Practice</h2>
        <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
            <QuestionMarkCircleIcon className="h-7 w-7" />
        </button>
      </div>
      <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6">Learn new words with flashcards or test your knowledge with an AI quiz.</p>
       
       <div className="mb-4">
            <label htmlFor="category-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Select or Create a Category
            </label>
            <div className="flex gap-2 items-center">
                <select
                    id="category-select"
                    value={selectedCategoryIndex}
                    onChange={(e) => setSelectedCategoryIndex(Number(e.target.value))}
                    className="flex-grow block w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {vocabularyData.map((cat, index) => (
                        <option key={cat.category} value={index}>{cat.category}</option>
                    ))}
                </select>
                <Button onClick={() => setIsModalOpen(true)} icon={SparklesIcon} variant="secondary" className="flex-shrink-0">
                    New AI Category
                </Button>
            </div>
        </div>

      <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <div className="flex space-x-4">
              <TabButton view="flashcards" label="Flashcards" />
              <TabButton view="aiPractice" label="AI Practice" />
          </div>
      </div>

      {activeView === 'flashcards' ? (
        <FlashcardView category={selectedCategory} />
      ) : (
        <AIQuizView category={selectedCategory} apiKey={apiKey} />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setIsModalOpen(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Generate New Vocabulary List</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Enter a topic, and the AI will create a new list of words for you to practice.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="topic-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Topic Name
                </label>
                <input
                  id="topic-input"
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g., Artificial Intelligence"
                  className="mt-1 block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              {generationError && <p className="text-sm text-red-600 dark:text-red-400">{generationError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateCategory} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Vocabulary Module Help">
        <h4>Flashcards</h4>
        <ul>
            <li><strong>Flip the Card:</strong> Click on the flashcard to reveal the definition, pronunciation, and an example sentence.</li>
            <li><strong>Navigate:</strong> Use the "Prev" and "Next" buttons to move through the words in the current category.</li>
            <li><strong>Shuffle:</strong> Click "Shuffle Deck" to randomize the order of the cards for a more challenging practice session.</li>
            <li><strong>Translation:</strong> Use the "Show Vietnamese" toggle to see the translation for each word.</li>
        </ul>
        <h4>AI Practice</h4>
        <ul>
            <li>Click <strong>"Generate AI Quiz"</strong> to create a multiple-choice question based on the words in the current category (requires Gemini API key).</li>
            <li>The AI will write a sentence with a blank and provide four options.</li>
            <li>Choose the word you think best completes the sentence to see if you're correct. This is a great way to test your understanding of words in context.</li>
        </ul>
        <h4>New AI Category</h4>
         <ul>
            <li>Click the <strong>"New AI Category"</strong> button to open a dialog.</li>
            <li>Enter any topic you want to learn about (e.g., "Space Exploration", "Marine Biology").</li>
            <li>The AI will generate a new list of 7 words for that topic, which will be added to your category list and selected automatically.</li>
        </ul>
      </HelpModal>
    </div>
  );
};


// FIX: Changed category prop type from 'any' to the specific 'VocabularyCategory' type.
// This resolves a TypeScript error where an array of keys was incorrectly inferred as 'unknown[]'.
const FlashcardView: React.FC<{ category: VocabularyCategory | undefined }> = ({ category }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
    const [showTranslation, setShowTranslation] = useLocalStorage('vocab-show-translation', false);

    const words = category?.words || [];

    const shuffleWords = useCallback(() => {
        if (words.length === 0) return;
        const indices = Array.from(words.keys());
        for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setShuffledIndices(indices);
        setCurrentWordIndex(0);
        setIsFlipped(false);
    }, [words]);

    useEffect(() => {
        shuffleWords();
    }, [category, shuffleWords]);

    const displayedIndex = shuffledIndices.length > 0 ? shuffledIndices[currentWordIndex] : currentWordIndex;
    const currentWord = words[displayedIndex];

    const handleNext = () => {
        if (words.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 150);
    };
    
    const handlePrev = () => {
        if (words.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
        setCurrentWordIndex((prev) => (prev - 1 + words.length) % words.length);
        }, 150);
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
        }
    };

     if (!currentWord) {
      return <Card><p>This category has no words. Select another category or generate a new one using AI!</p></Card>
    }

    return (
        <div>
            <div className="flex justify-end items-center mb-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Show Vietnamese</span>
                    <button
                        type="button"
                        className={`${
                        showTranslation ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-700'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900`}
                        role="switch"
                        aria-checked={showTranslation}
                        onClick={() => setShowTranslation(!showTranslation)}
                    >
                        <span
                        aria-hidden="true"
                        className={`${
                            showTranslation ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                </div>
            </div>
            <div className="relative h-80 [perspective:1000px]">
                <div 
                    className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className="absolute w-full h-full [backface-visibility:hidden]">
                        <Card className="w-full h-full flex flex-col justify-center items-center cursor-pointer">
                            <h3 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100 text-center">{currentWord.word}</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Click to see definition</p>
                        </Card>
                    </div>
                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <Card className="w-full h-full flex flex-col justify-center cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentWord.word}</h4>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm">{currentWord.pronunciation}</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); speak(currentWord.word); }} 
                                    className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                                >
                                    <SpeakerWaveIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="mt-4 text-zinc-800 dark:text-zinc-200">{currentWord.definition}</p>
                            {showTranslation && currentWord.vietnamese && (
                                <p className="mt-2 font-semibold text-teal-600 dark:text-teal-400">{currentWord.vietnamese}</p>
                            )}
                            <p className="mt-2 text-zinc-600 dark:text-zinc-300 italic bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-md">"{currentWord.example}"</p>
                        </Card>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
                <Button onClick={handlePrev} variant="secondary" icon={ArrowLeftIcon}>Prev</Button>
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {currentWordIndex + 1} / {words.length}
                </div>
                <Button onClick={handleNext} variant="secondary" icon={ArrowRightIcon}>Next</Button>
            </div>
            <div className="text-center mt-4">
                <Button onClick={shuffleWords} variant="secondary" icon={ArrowsRightLeftIcon}>Shuffle Deck</Button>
            </div>
        </div>
    )
}

// FIX: Changed category prop type from 'any' to 'VocabularyCategory' for type safety and consistency.
const AIQuizView: React.FC<{ category: VocabularyCategory | undefined, apiKey: string }> = ({ category, apiKey }) => {
    const [quiz, setQuiz] = useState<VocabularyQuiz | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userSelection, setUserSelection] = useState<{ word: string, index: number } | null>(null);

    const handleGenerateQuiz = async () => {
        const words = category?.words || [];
        if (words.length < 4) {
            setError("This category needs at least 4 words to generate a quiz.");
            return;
        }
        if (!apiKey) {
            setError('Please set your Gemini API key in Settings to use this feature.');
            return;
        }
        setIsLoading(true);
        setError('');
        setQuiz(null);
        setUserSelection(null);
        try {
            const newQuiz = await generateVocabularyQuiz(apiKey, words);
            setQuiz(newQuiz);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswer = (word: string, index: number) => {
        if (userSelection) return; // Don't allow changing answer
        setUserSelection({ word, index });
    };

    return (
        <Card>
            <div className="space-y-4">
                <Button onClick={handleGenerateQuiz} disabled={isLoading} icon={SparklesIcon} variant="primary">
                    {isLoading ? 'Generating...' : (quiz ? 'New Question' : 'Generate AI Quiz')}
                </Button>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                
                {quiz && (
                    <div className="pt-4 mt-4 border-t dark:border-zinc-700 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Complete the sentence:</p>
                            <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{quiz.question}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {quiz.options.map((option, index) => {
                                const isSelected = userSelection?.index === index;
                                const isCorrect = quiz.answer === option;
                                
                                let buttonClass = 'bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600';
                                if (isSelected) {
                                    buttonClass = isCorrect ? 'bg-green-100 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-300' 
                                                            : 'bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-300';
                                } else if (userSelection && isCorrect) {
                                    buttonClass = 'bg-green-100 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-300';
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option, index)}
                                        disabled={!!userSelection}
                                        className={`p-4 border dark:border-zinc-600 rounded-lg text-center font-medium transition-colors duration-200 ${buttonClass}`}
                                    >
                                        {option}
                                    </button>
                                )
                            })}
                        </div>
                        {userSelection && (
                            <div className={`p-3 rounded-lg text-sm ${userSelection.word === quiz.answer ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                                {userSelection.word === quiz.answer ? 'Correct! Well done.' : `Not quite. The correct answer was "${quiz.answer}".`}
                            </div>
                        )}
                    </div>
                )}
                 {!quiz && !isLoading && (
                    <div className="text-center py-8">
                        <SparklesIcon className="mx-auto h-12 w-12 text-zinc-400" />
                        <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-200">Ready to Practice?</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Click the button above to generate a quiz question.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};


export default VocabularyModule;