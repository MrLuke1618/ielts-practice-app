import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import HelpModal from '../ui/HelpModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getOverallAnalysis, PerformanceData } from '../../services/geminiService';
import { TestScore } from '../../types';
import { LightBulbIcon, QuestionMarkCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { logActivity } from '../../utils/progressTracker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

const ScoreChart: React.FC<{ data: TestScore[], title: string, color: string, theme: 'light' | 'dark' }> = ({ data, title, color, theme }) => {
    if (data.length < 2) {
        return (
            <div className="flex items-center justify-center h-[200px] bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 p-4">Complete at least two {title.toLowerCase()} tests to see your progress chart.</p>
            </div>
        );
    }

    const chartData = data
        .map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: (item.score / item.total) * 100, 
        }))
        .reverse();

    const gridStrokeColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const axisTextColor = theme === 'dark' ? '#a1a1aa' : '#71717a';

    return (
        <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: axisTextColor }} />
                    <YAxis unit="%" domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: axisTextColor }} />
                    <Tooltip
                         content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="p-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg">
                                        <p className="label text-sm font-semibold text-zinc-800 dark:text-zinc-200">{`${label}`}</p>
                                        <p className="intro text-sm" style={{ color: payload[0].color }}>
                                            {`Score : ${payload[0].value?.toFixed(0)}%`}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const AccordionItem: React.FC<{
  id: string;
  title: string;
  summary: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}> = ({ id, title, summary, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{title}</span>
        <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">{summary}</span>
            <ChevronDownIcon
            className={`h-5 w-5 text-zinc-500 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
            }`}
            />
        </div>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
            <div className="p-4 pt-0">
            {children}
            </div>
        </div>
      </div>
    </div>
  );
};


const AnalysisModule: React.FC = () => {
  const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
  // FIX: Destructure isAILoading from useData context to use for loading state.
  const { isAILoading, setIsAILoading } = useData();
  const [analysis, setAnalysis] = useLocalStorage<string>('ai-analysis-report', '');
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [listeningHistory, setListeningHistory] = useState<TestScore[]>([]);
  const [readingHistory, setReadingHistory] = useState<TestScore[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { theme } = useTheme();
  const [openAccordion, setOpenAccordion] = useState<string | null>('Listening');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  useEffect(() => {
    // Load all performance data from local storage
    const listeningScores: TestScore[] = JSON.parse(localStorage.getItem('listening-scores') || '[]');
    const readingScores: TestScore[] = JSON.parse(localStorage.getItem('reading-scores') || '[]');
    
    setListeningHistory(listeningScores);
    setReadingHistory(readingScores);

    const data: PerformanceData = {
      listeningScore: listeningScores[0],
      readingScore: readingScores[0],
      writingFeedbackTask1: localStorage.getItem('writing-feedback-task1') || undefined,
      writingFeedbackTask2: localStorage.getItem('writing-feedback-task2') || undefined,
      speakingFeedbackPart1: localStorage.getItem('speaking-feedback-part1') || undefined,
      speakingFeedbackPart2: localStorage.getItem('speaking-feedback-part2') || undefined,
      speakingFeedbackPart3: localStorage.getItem('speaking-feedback-part3') || undefined,
    };
    setPerformanceData(data);
  }, []);

  const handleGeneratePlan = async () => {
    if (!performanceData) return;
    setIsAILoading(true);
    setAnalysis('');
    try {
        const result = await getOverallAnalysis(apiKey, performanceData);
        setAnalysis(result);
        logActivity('ANALYSIS_GENERATED');

        // Extract and save the weekly plan for the dashboard
        const planSection = result.match(/### Your Personalized 1-Week Study Plan 🗓️([\s\S]*?)###/);
        if (planSection && planSection[1]) {
            const planItems = planSection[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.startsWith('- **Day') || line.startsWith('* **Day'));
            
            const structuredPlan = planItems.map(item => ({ text: item, completed: false }));
            localStorage.setItem('weekly-study-plan', JSON.stringify(structuredPlan));
        } else {
             localStorage.removeItem('weekly-study-plan');
        }
    } catch (e) {
        console.error("Failed to generate study plan:", e);
        setAnalysis("An error occurred while generating your analysis. Please check your API key and try again.");
    } finally {
        setIsAILoading(false);
    }
  };
  
  const hasSpeakingFeedback = !!(performanceData?.speakingFeedbackPart1 || performanceData?.speakingFeedbackPart2 || performanceData?.speakingFeedbackPart3);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Analysis & Study Plan</h2>
         <button onClick={() => setIsHelpOpen(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors dark:text-zinc-500 dark:hover:text-indigo-500">
            <QuestionMarkCircleIcon className="h-7 w-7" />
        </button>
      </div>
      <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6">Get a personalized study plan based on your recent performance.</p>

      <Card className="mb-6">
        <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">Your Recent Performance Data</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">This module uses your most recent scores and AI feedback saved in the app. The more you practice, the better your analysis will be!</p>
        <div className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <AccordionItem
                id="Listening"
                title="Listening"
                summary={performanceData?.listeningScore ? `Latest: ${performanceData.listeningScore.score}/${performanceData.listeningScore.total}` : 'No data'}
                isOpen={openAccordion === 'Listening'}
                onToggle={toggleAccordion}
            >
                <ScoreChart data={listeningHistory} title="Listening" color="#4f46e5" theme={theme} />
            </AccordionItem>
            <AccordionItem
                id="Reading"
                title="Reading"
                summary={performanceData?.readingScore ? `Latest: ${performanceData.readingScore.score}/${performanceData.readingScore.total}` : 'No data'}
                isOpen={openAccordion === 'Reading'}
                onToggle={toggleAccordion}
            >
                <ScoreChart data={readingHistory} title="Reading" color="#14b8a6" theme={theme} />
            </AccordionItem>
            <AccordionItem
                id="WritingT1"
                title="Writing Task 1"
                summary={performanceData?.writingFeedbackTask1 ? 'Feedback saved' : 'No data'}
                isOpen={openAccordion === 'WritingT1'}
                onToggle={toggleAccordion}
            >
                 {performanceData?.writingFeedbackTask1 ? 
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: performanceData.writingFeedbackTask1.replace(/\n/g, '<br />') }} /> 
                    : <p className="text-sm text-zinc-500 dark:text-zinc-400">Complete a Task 1 and get AI feedback to see it here.</p>}
            </AccordionItem>
            <AccordionItem
                id="WritingT2"
                title="Writing Task 2"
                summary={performanceData?.writingFeedbackTask2 ? 'Feedback saved' : 'No data'}
                isOpen={openAccordion === 'WritingT2'}
                onToggle={toggleAccordion}
            >
                 {performanceData?.writingFeedbackTask2 ? 
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: performanceData.writingFeedbackTask2.replace(/\n/g, '<br />') }} /> 
                    : <p className="text-sm text-zinc-500 dark:text-zinc-400">Complete a Task 2 and get AI feedback to see it here.</p>}
            </AccordionItem>
             <AccordionItem
                id="Speaking"
                title="Speaking"
                summary={hasSpeakingFeedback ? 'Feedback saved' : 'No data'}
                isOpen={openAccordion === 'Speaking'}
                onToggle={toggleAccordion}
            >
                 {hasSpeakingFeedback ? (
                    <div className="space-y-4">
                        {performanceData?.speakingFeedbackPart1 && <div><h5 className="font-semibold text-zinc-700 dark:text-zinc-300">Part 1</h5><div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: performanceData.speakingFeedbackPart1.replace(/\n/g, '<br />') }} /></div>}
                        {performanceData?.speakingFeedbackPart2 && <div><h5 className="font-semibold text-zinc-700 dark:text-zinc-300">Part 2</h5><div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: performanceData.speakingFeedbackPart2.replace(/\n/g, '<br />') }} /></div>}
                        {performanceData?.speakingFeedbackPart3 && <div><h5 className="font-semibold text-zinc-700 dark:text-zinc-300">Part 3</h5><div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: performanceData.speakingFeedbackPart3.replace(/\n/g, '<br />') }} /></div>}
                    </div>
                 )
                    : <p className="text-sm text-zinc-500 dark:text-zinc-400">Complete a speaking practice and get AI feedback to see it here.</p>}
            </AccordionItem>
        </div>
      </Card>
      
      <div className="text-center">
        {/* FIX: Replaced undefined `isLoading` with `isAILoading` from context. */}
        <Button onClick={handleGeneratePlan} disabled={isAILoading || !apiKey} icon={LightBulbIcon} className="w-full sm:w-auto">
            {isAILoading ? "Generating Your Plan..." : "Generate My Study Plan"}
        </Button>
        {!apiKey && <p className="text-sm text-amber-700 dark:text-amber-500 mt-2">Note: This feature requires a Gemini API key set in Settings.</p>}
      </div>

      {analysis && (
        <Card className="mt-6">
           <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-indigo-700 dark:prose-headings:text-indigo-400" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
        </Card>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Analysis Module Help">
        <h4>What is this?</h4>
        <p>This module acts as your personal AI tutor. It gathers all your recent performance data from the other modules to give you a complete picture of your current IELTS level.</p>
        
        <h4>How it Works</h4>
        <ol>
            <li><strong>Practice:</strong> Complete tests in the Listening, Reading, Writing, and Speaking modules. Your scores and AI feedback are saved automatically.</li>
            <li><strong>Review Data:</strong> The "Recent Performance Data" card shows you what information will be used for the analysis. You can click on each section to expand it and see details like score charts or saved feedback.</li>
            <li><strong>Generate Plan:</strong> Click the "Generate My Study Plan" button. This sends your data to the AI. (Requires a Gemini API key).</li>
            <li><strong>Receive Report:</strong> The AI will produce a detailed report including:
                <ul>
                    <li>An overall performance summary and estimated band score.</li>
                    <li>Your key strengths and weaknesses.</li>
                    <li>A personalized 1-week study plan with daily tasks.</li>
                    <li>Helpful resources and tips.</li>
                </ul>
            </li>
        </ol>
        <p>The more modules you complete, the more accurate and helpful your study plan will be!</p>
      </HelpModal>
    </div>
  );
};

export default AnalysisModule;