
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getDailyTip } from '../../services/geminiService';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { useData } from '../../contexts/DataContext';

interface CachedTip {
    tip: string;
    date: string;
}

const DailyTip: React.FC = () => {
    const [apiKey] = useLocalStorage<string>('gemini-api-key', 'AIzaSyDmKfMMah0cBthsv5YpqxfVP0rV8te-wE4');
    const [tip, setTip] = useState('Loading your daily tip...');
    const { setIsAILoading } = useData();

    useEffect(() => {
        const fetchTip = async () => {
            setIsAILoading(true);
            const today = new Date().toISOString().split('T')[0];
            const cachedData = localStorage.getItem('daily-tip');
            
            if (cachedData) {
                const { tip: cachedTip, date }: CachedTip = JSON.parse(cachedData);
                if (date === today) {
                    setTip(cachedTip);
                    setIsAILoading(false);
                    return;
                }
            }

            if(apiKey) {
                try {
                    const newTip = await getDailyTip(apiKey);
                    setTip(newTip);
                    localStorage.setItem('daily-tip', JSON.stringify({ tip: newTip, date: today }));
                } catch (e) {
                    setTip("Could not fetch tip. Check API key.");
                }
            } else {
                setTip('Set your API key in Settings to receive a daily tip!');
            }
            setIsAILoading(false);
        };

        fetchTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey]);
    
    return (
        <Card>
            <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <LightBulbIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">AI Tutor Tip of the Day</h3>
                    <p className={`mt-1 text-slate-600 dark:text-slate-300`}>{tip}</p>
                </div>
            </div>
        </Card>
    );
}

export default DailyTip;