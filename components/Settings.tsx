import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useData } from '../contexts/DataContext';
import Card from './ui/Card';
import Button from './ui/Button';
import HelpModal from './ui/HelpModal';
import { KeyIcon, InformationCircleIcon, EyeIcon, EyeSlashIcon, QuestionMarkCircleIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowPathIcon, ArchiveBoxIcon, UserCircleIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
  const [targetBandScore, setTargetBandScore] = useLocalStorage<number>('target-band-score', 6.5);
  const [inputValue, setInputValue] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { importData, exportData, resetData } = useData();
  const practiceContentFileInputRef = useRef<HTMLInputElement>(null);
  const userProgressFileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSave = () => {
    setApiKey(inputValue);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePracticeContentFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importData(file);
        setStatus({ message: 'Practice content imported successfully!', type: 'success' });
      } catch (error) {
        setStatus({ message: (error as Error).message, type: 'error' });
      }
    }
    if (event.target) event.target.value = '';
  };

  const handleResetPracticeContent = () => {
    if (window.confirm("Are you sure you want to reset all practice content? This will remove any imported tests and restore the original materials.")) {
      resetData();
      setStatus({ message: 'Practice content has been reset to the default set.', type: 'success' });
    }
  };

  const exportUserProgress = () => {
    const allKeys = Object.keys(localStorage);
    const progressData: { [key: string]: string | null } = {};
    allKeys.forEach(key => {
      // Exclude the main practice data, which has its own management system
      if (key !== 'ielts-practice-data') {
        progressData[key] = localStorage.getItem(key);
      }
    });

    const jsonString = JSON.stringify(progressData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ielts-practice-progress-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus({ message: 'Your progress has been exported successfully.', type: 'success' });
  };
  
  const handleUserProgressFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File could not be read.");
            const importedProgress = JSON.parse(text);

            // Don't import practice data using this function
            if (importedProgress['ielts-practice-data']) {
                delete importedProgress['ielts-practice-data'];
            }

            Object.keys(importedProgress).forEach(key => {
                if(importedProgress[key] !== null) {
                    localStorage.setItem(key, importedProgress[key]);
                } else {
                    localStorage.removeItem(key);
                }
            });
            setStatus({ message: 'Progress imported successfully! The app will now reload.', type: 'success' });
            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            setStatus({ message: "Failed to import progress. The file might be invalid.", type: 'error' });
        }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = '';
  };

  const resetUserProgress = () => {
     if (window.confirm("Are you sure you want to reset ALL your progress? This will delete your scores, saved attempts, settings, and essays. This cannot be undone.")) {
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            // Do not delete the main practice data content
            if (key !== 'ielts-practice-data') {
                localStorage.removeItem(key);
            }
        });
        setStatus({ message: 'All your progress has been reset. The app will now reload.', type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
    }
  };

  const bandScores = Array.from({ length: 11 }, (_, i) => 4.0 + i * 0.5);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h2>
        <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
          <QuestionMarkCircleIcon className="h-7 w-7" />
        </button>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-zinc-500 dark:text-zinc-400"/>
              Study Goal
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Set your target band score to get practice materials tailored to your level.
            </p>
          </div>
           <div>
            <label htmlFor="band-score-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Your Target IELTS Band Score
            </label>
            <select
              id="band-score-select"
              value={targetBandScore}
              onChange={(e) => setTargetBandScore(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              {bandScores.map(score => (
                <option key={score} value={score}>
                  {score.toFixed(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2 text-zinc-500 dark:text-zinc-400"/>
              Google Gemini API Key
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Provide your API key to enable AI-powered features. Your key is stored securely in your browser's local storage.
            </p>
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 rounded-lg flex items-start space-x-3">
             <InformationCircleIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0"/>
             <p className="text-sm text-indigo-700 dark:text-indigo-300">
               You can get a free API key from Google AI Studio. AI features are enabled by default with a provided key.
             </p>
          </div>
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Your API Key
            </label>
            <div className="mt-1 relative">
              <input
                type={showKey ? 'text' : 'password'}
                id="api-key"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                placeholder="Enter your Gemini API key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end items-center space-x-4">
             {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved successfully!</span>}
            <Button onClick={handleSave}>
              Save Key
            </Button>
          </div>
        </div>
      </Card>
      
      {status && (
        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
            {status.message}
        </div>
      )}

      <Card>
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 flex items-center">
                    <ArchiveBoxIcon className="h-5 w-5 mr-2 text-zinc-500 dark:text-zinc-400"/>
                    Practice Content Management
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage the core test materials (listening, reading, writing, etc.) for the entire application.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => practiceContentFileInputRef.current?.click()} variant="secondary" icon={ArrowUpTrayIcon} className="flex-1">
                    Import Content
                </Button>
                <input type="file" ref={practiceContentFileInputRef} onChange={handlePracticeContentFileChange} accept=".json" className="hidden" />
                
                <Button onClick={exportData} variant="secondary" icon={ArrowDownTrayIcon} className="flex-1">
                    Download Template
                </Button>

                <Button onClick={handleResetPracticeContent} variant="danger" icon={ArrowPathIcon} className="flex-1">
                    Reset Content
                </Button>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 flex items-center">
                    <UserCircleIcon className="h-5 w-5 mr-2 text-zinc-500 dark:text-zinc-400"/>
                    User Progress & Settings
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Export, import, or reset your personal data like scores, saved attempts, and settings.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => userProgressFileInputRef.current?.click()} variant="secondary" icon={ArrowUpTrayIcon} className="flex-1">
                    Import My Progress
                </Button>
                <input type="file" ref={userProgressFileInputRef} onChange={handleUserProgressFileChange} accept=".json" className="hidden" />
                
                <Button onClick={exportUserProgress} variant="secondary" icon={ArrowDownTrayIcon} className="flex-1">
                    Export My Progress
                </Button>
                
                <Button onClick={resetUserProgress} variant="danger" icon={ArrowPathIcon} className="flex-1">
                    Reset My Progress
                </Button>
            </div>
        </div>
      </Card>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Settings Help">
        <h4>Study Goal</h4>
        <ul>
            <li><strong>Target Band Score:</strong> Set the IELTS band score you are aiming for. The app will use this to filter practice tests and generate AI content at the right difficulty level for you.</li>
        </ul>

        <h4>Gemini API Key</h4>
        <ul>
            <li><strong>What is it?</strong> An API key is like a password that allows this app to use Google's AI (Gemini) for features like writing feedback, AI-generated tests, and speaking analysis.</li>
            <li><strong>Where do I get one?</strong> You can get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google AI Studio</a>.</li>
            <li><strong>Is it safe?</strong> Yes. Your key is stored only in your browser and is never sent to any server other than Google's.</li>
        </ul>
        
        <h4>Practice Content Management</h4>
        <ul>
            <li><strong>Import Content:</strong> Load your own tests into the app. Click "Download Template" to get the correct JSON format, add your content, and then upload it using this button.</li>
            <li><strong>Download Template:</strong> This saves a JSON file of the app's current test data. It's the perfect starting point for adding your own practice material.</li>
            <li><strong>Reset Content:</strong> This will remove any tests you've imported and restore the original tests that came with the app. It does NOT affect your personal scores or progress.</li>
        </ul>

        <h4>User Progress & Settings</h4>
        <ul>
            <li><strong>Import My Progress:</strong> Load a previously exported progress file to restore all your scores, saved attempts, and settings.</li>
            <li><strong>Export My Progress:</strong> Saves a single backup file of ALL your personal data, including your API key, theme preference, scores, saved speaking attempts, paraphrases, and essays. Useful for moving your data to another computer.</li>
            <li><strong>Reset My Progress:</strong> This will delete ALL your personal data and reset your progress to zero. It does NOT affect the practice content itself. Use this to start completely fresh.</li>
        </ul>
      </HelpModal>
    </div>
  );
};

export default Settings;