import React from 'react';
import { Module } from '../types';
import { BookOpenIcon, MusicalNoteIcon, PencilSquareIcon, MicrophoneIcon, SparklesIcon, VariableIcon, SpeakerWaveIcon, ChatBubbleLeftRightIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import DailyTip from './dashboard/DailyTip';
import ProgressTracker from './dashboard/ProgressTracker';
import WeeklyGoals from './dashboard/WeeklyGoals';
import Card from './ui/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Button from './ui/Button';

interface DashboardProps {
  setActiveModule: (module: Module) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveModule }) => {
  const [targetBandScore] = useLocalStorage<number>('target-band-score', 6.5);
  const modules = [
    { name: 'Listening', module: Module.LISTENING, icon: MusicalNoteIcon },
    { name: 'Reading', module: Module.READING, icon: BookOpenIcon },
    { name: 'Writing', module: Module.WRITING, icon: PencilSquareIcon },
    { name: 'Speaking', module: Module.SPEAKING, icon: MicrophoneIcon },
    { name: 'Vocabulary', module: Module.VOCABULARY, icon: SparklesIcon },
    { name: 'Grammar Gym', module: Module.GRAMMAR, icon: VariableIcon },
    { name: 'Pronunciation', module: Module.PRONUNCIATION, icon: SpeakerWaveIcon },
    { name: 'Paraphraser', module: Module.PARAPHRASER, icon: ChatBubbleLeftRightIcon },
  ];

  const ModuleButton: React.FC<{ name: string; module: Module; icon: React.ElementType; }> = ({ name, module, icon: Icon }) => (
    <button 
      onClick={() => setActiveModule(module)} 
      className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:shadow-md transition-all duration-200 text-center space-y-2"
    >
      <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
      <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-200">{name}</span>
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Welcome, Future Scholar!</h2>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-300">Your journey to IELTS success starts now. Let's get practicing!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">Start Practicing</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 -mt-2">Practice materials will be filtered based on your target band score.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {modules.map(m => (
                        <ModuleButton key={m.name} {...m} />
                    ))}
                </div>
            </Card>
            <WeeklyGoals />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                    <AdjustmentsHorizontalIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Your Study Goal</h3>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                      Target Band Score: <strong className="text-xl">{targetBandScore.toFixed(1)}</strong>
                    </p>
                    <Button size="sm" variant="secondary" className="mt-2" onClick={() => setActiveModule(Module.SETTINGS)}>
                      Change Goal
                    </Button>
                </div>
            </div>
          </Card>
          <DailyTip />
          <ProgressTracker />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;