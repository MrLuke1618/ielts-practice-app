import React, { useState, useCallback } from 'react';
import { Module } from './types';
import Dashboard from './components/Dashboard';
import ListeningModule from './components/listening/ListeningModule';
import ReadingModule from './components/reading/ReadingModule';
import WritingModule from './components/writing/WritingModule';
import SpeakingModule from './components/speaking/SpeakingModule';
import VocabularyModule from './components/vocabulary/VocabularyModule';
import Settings from './components/Settings';
import AnalysisModule from './components/analysis/AnalysisModule';
import GrammarModule from './components/grammar/GrammarModule';
import PronunciationStudio from './components/pronunciation/PronunciationStudio';
import ParaphrasingTool from './components/paraphrasing/ParaphrasingTool';
import Footer from './components/ui/Footer';
import OnboardingModal from './components/ui/OnboardingModal';
import { AcademicCapIcon, BookOpenIcon, MusicalNoteIcon, PencilSquareIcon, MicrophoneIcon, Cog6ToothIcon, HomeIcon, SparklesIcon, VariableIcon, SpeakerWaveIcon, ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useData } from './contexts/DataContext';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isAILoading } = useData();
  const [hasOnboarded, setHasOnboarded] = useLocalStorage('has-onboarded', false);

  const renderModule = () => {
    switch (activeModule) {
      case Module.LISTENING:
        return <ListeningModule />;
      case Module.READING:
        return <ReadingModule />;
      case Module.WRITING:
        return <WritingModule />;
      case Module.SPEAKING:
        return <SpeakingModule />;
      case Module.VOCABULARY:
        return <VocabularyModule />;
      case Module.ANALYSIS:
        return <AnalysisModule />;
      case Module.GRAMMAR:
        return <GrammarModule />;
      case Module.PRONUNCIATION:
        return <PronunciationStudio />;
      case Module.PARAPHRASER:
        return <ParaphrasingTool />;
      case Module.SETTINGS:
        return <Settings />;
      case Module.DASHBOARD:
      default:
        return <Dashboard setActiveModule={setActiveModule} />;
    }
  };
  
  const NavItem = useCallback(({ module, label, icon: Icon, isSidebar }: { module: Module; label: string; icon: React.ElementType; isSidebar?: boolean; }) => (
      <button
        onClick={() => setActiveModule(module)}
        className={`flex items-center justify-start w-full text-sm font-medium p-3 rounded-lg transition-colors duration-200 ${
          activeModule === module
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
        } ${isSidebar ? 'flex-row' : 'flex-col items-center sm:flex-row sm:justify-center sm:w-auto sm:text-base sm:p-2'}`}
      >
        <Icon className={`h-6 w-6 ${isSidebar ? 'mr-3' : 'sm:mr-3'}`} />
        <span className={`${!isSidebar ? 'mt-1 sm:mt-0 text-xs' : ''}`}>{label}</span>
      </button>
  ), [activeModule]);

  // A single source of truth for all navigation items
  const allNavItems = [
    { module: Module.DASHBOARD, label: "Dashboard", icon: HomeIcon },
    { module: Module.LISTENING, label: "Listening", icon: MusicalNoteIcon },
    { module: Module.READING, label: "Reading", icon: BookOpenIcon },
    { module: Module.WRITING, label: "Writing", icon: PencilSquareIcon },
    { module: Module.SPEAKING, label: "Speaking", icon: MicrophoneIcon },
    { module: Module.VOCABULARY, label: "Vocabulary", icon: SparklesIcon },
    { module: Module.GRAMMAR, label: "Grammar Gym", icon: VariableIcon },
    { module: Module.PRONUNCIATION, label: "Pronunciation", icon: SpeakerWaveIcon },
    { module: Module.PARAPHRASER, label: "Paraphraser", icon: ChatBubbleLeftRightIcon },
    { module: Module.ANALYSIS, label: "Analysis", icon: AcademicCapIcon },
    { module: Module.SETTINGS, label: "Settings", icon: Cog6ToothIcon },
  ];

  // Main items for the sidebar (all except settings)
  const mainNavItems = allNavItems.filter(item => item.module !== Module.SETTINGS);
  
  // Settings item for the bottom of the sidebar
  const settingsNavItem = allNavItems.find(item => item.module === Module.SETTINGS)!;

  // Mobile items: Core practice modules for quick access on the bottom bar
  const mobileNavItems = [
    allNavItems.find(i => i.module === Module.DASHBOARD)!,
    allNavItems.find(i => i.module === Module.LISTENING)!,
    allNavItems.find(i => i.module === Module.READING)!,
    allNavItems.find(i => i.module === Module.WRITING)!,
    allNavItems.find(i => i.module === Module.SPEAKING)!,
  ];

  const activeModuleLabel = allNavItems.find(item => item.module === activeModule)?.label || "Dashboard";


  return (
    <div className="min-h-screen flex bg-zinc-100 dark:bg-zinc-900">
      <OnboardingModal 
        isOpen={!hasOnboarded}
        onClose={() => setHasOnboarded(true)}
        onGoToSettings={() => {
          setActiveModule(Module.SETTINGS);
          setHasOnboarded(true);
        }}
      />
       {/* Mobile Sidebar (Drawer) */}
      <div className={`sm:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileNavOpen(false)}></div>
        
        {/* Sidebar Content */}
        <aside className={`relative flex flex-col w-64 h-full bg-white dark:bg-zinc-800 shadow-lg transform transition-transform duration-300 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
              <div className='flex items-center space-x-2'>
                  <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
                  <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">IELTS Pod</h1>
              </div>
              <button onClick={() => setIsMobileNavOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700">
                <XMarkIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
              </button>
          </div>
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            {allNavItems.map(item => (
               <button
                  key={item.module}
                  onClick={() => {
                    setActiveModule(item.module);
                    setIsMobileNavOpen(false);
                  }}
                  className={`flex items-center justify-start w-full text-sm font-medium p-3 rounded-lg transition-colors duration-200 ${
                    activeModule === item.module
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <item.icon className="h-6 w-6 mr-3" />
                  <span>{item.label}</span>
                </button>
            ))}
          </nav>
        </aside>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden sm:flex flex-col w-64 bg-white dark:bg-zinc-800 shadow-lg fixed h-full">
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
            <div className='flex items-center space-x-2'>
                <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">IELTS Practice Pod</h1>
                {isAILoading && (
                  <SparklesIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 animate-spin" />
                )}
            </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {mainNavItems.map(item => (
            <NavItem key={item.module} {...item} isSidebar={true} />
          ))}
        </nav>
        <div className="p-4 border-t dark:border-zinc-700">
           <NavItem {...settingsNavItem} isSidebar={true} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 sm:pl-64 flex flex-col">
        {/* Mobile Header */}
        <header className="sm:hidden bg-white dark:bg-zinc-800 shadow-md sticky top-0 z-30">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <button onClick={() => setIsMobileNavOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <Bars3Icon className="h-6 w-6 text-zinc-800 dark:text-zinc-100" />
                </button>
                <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{activeModuleLabel}</h1>
                <div className="w-6"></div> {/* Spacer to balance the hamburger icon */}
            </div>
        </header>

        <main className="flex-grow container mx-auto p-4 sm:p-6">
            {renderModule()}
        </main>
        <Footer />
      </div>

       {/* Bottom Navigation for Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 shadow-t-md flex justify-around p-1 z-20">
        {mobileNavItems.map(item => <NavItem key={item.module} {...item}/>)}
      </nav>
      <div className="sm:hidden h-16"></div> {/* Spacer for bottom nav */}
    </div>
  );
};

export default App;