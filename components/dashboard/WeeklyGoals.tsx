
import React from 'react';
import Card from '../ui/Card';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

interface Goal {
    text: string;
    completed: boolean;
}

const WeeklyGoals: React.FC = () => {
    const [goals, setGoals] = useLocalStorage<Goal[]>('weekly-study-plan', []);

    const toggleGoal = (index: number) => {
        const newGoals = [...goals];
        newGoals[index].completed = !newGoals[index].completed;
        setGoals(newGoals);
    };

    if (goals.length === 0) {
        return (
            <Card>
                <div className="flex items-center space-x-3 mb-2">
                    <CalendarDaysIcon className="h-6 w-6 text-green-600 dark:text-green-500" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Your Weekly Goals</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                    Visit the "Analysis" module and generate a study plan to see your personalized goals here.
                </p>
            </Card>
        );
    }

    return (
        <Card>
             <div className="flex items-center space-x-3 mb-4">
                <CalendarDaysIcon className="h-6 w-6 text-green-600 dark:text-green-500" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Your Weekly Goals</h3>
            </div>
            <ul className="space-y-3">
                {goals.map((goal, index) => (
                    <li key={index} className="flex items-start">
                        <input
                            type="checkbox"
                            id={`goal-${index}`}
                            checked={goal.completed}
                            onChange={() => toggleGoal(index)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer flex-shrink-0"
                        />
                        <label
                            htmlFor={`goal-${index}`}
                            className={`ml-3 text-slate-700 dark:text-slate-300 cursor-pointer ${
                                goal.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: goal.text.replace(/- \*\*(.*?)\*\*/, '<strong>$1</strong>') }} />
                        </label>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default WeeklyGoals;
