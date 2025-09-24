
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { getActivityLog, calculateStreak, getEarnedBadges, milestones, Milestone } from '../../utils/progressTracker';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';

const ProgressTracker: React.FC = () => {
    const [streak, setStreak] = useState(0);
    const [badges, setBadges] = useState<Milestone[]>([]);

    useEffect(() => {
        const log = getActivityLog();
        setStreak(calculateStreak(log));
        setBadges(getEarnedBadges(log));
    }, []); // Run once on mount, re-rendering will be handled by parent state changes if needed

    return (
        <Card>
             <div className="flex items-center space-x-3 mb-4">
                <TrophyIcon className="h-6 w-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Your Progress</h3>
            </div>
            <div className="flex items-center justify-around bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                 <div className="text-center">
                    <div className="flex items-center justify-center text-orange-500">
                        <FireIcon className="h-8 w-8"/>
                        <span className="text-4xl font-bold">{streak}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Day Streak</p>
                 </div>
            </div>

            <div className="mt-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Achievements</h4>
                {badges.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {badges.map(badgeKey => (
                            <div key={badgeKey} className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center" title={`${milestones[badgeKey].title}: ${milestones[badgeKey].description}`}>
                                <span className="text-3xl">{milestones[badgeKey].icon}</span>
                                <span className="text-xs mt-1 text-slate-600 dark:text-slate-300 font-medium leading-tight">{milestones[badgeKey].title}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Complete activities to earn badges!</p>
                )}
            </div>
        </Card>
    );
};

export default ProgressTracker;
