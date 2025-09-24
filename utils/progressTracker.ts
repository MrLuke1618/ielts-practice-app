
export interface Activity {
  type: string;
  timestamp: number;
}

export type Milestone = 'FIRST_ACTIVITY' | 'STREAK_3' | 'STREAK_7' | 'LISTENING_1' | 'READING_1' | 'WRITING_1' | 'SPEAKING_1' | 'ANALYSIS_1' | 'GRAMMAR_1' | 'PRONUNCIATION_1';

export const milestones: Record<Milestone, { title: string, description: string, icon: string }> = {
    FIRST_ACTIVITY: { title: "Getting Started", description: "Completed your first activity!", icon: "🎉" },
    STREAK_3: { title: "On a Roll", description: "Maintained a 3-day streak!", icon: "🔥" },
    STREAK_7: { title: "Week-Long Warrior", description: "Maintained a 7-day streak!", icon: "🏆" },
    LISTENING_1: { title: "Sharp Ears", description: "Completed your first listening test.", icon: "🎧" },
    READING_1: { title: "Bookworm", description: "Completed your first reading test.", icon: "📚" },
    WRITING_1: { title: "Aspiring Author", description: "Got your first writing feedback.", icon: "✍️" },
    SPEAKING_1: { title: "Public Speaker", description: "Got your first speaking feedback.", icon: "🎤" },
    ANALYSIS_1: { title: "Strategic Planner", description: "Generated your first study plan.", icon: "🗺️" },
    GRAMMAR_1: { title: "Grammar Guru", description: "Completed your first grammar exercise.", icon: "🧐" },
    PRONUNCIATION_1: { title: "Clear Speaker", description: "Got your first pronunciation feedback.", icon: "🗣️" },
};


const aDayInMs = 24 * 60 * 60 * 1000;
const ACTIVITY_LOG_KEY = 'activity-log';

export const logActivity = (type: string) => {
  try {
    const log: Activity[] = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
    log.push({ type, timestamp: Date.now() });
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};

export const getActivityLog = (): Activity[] => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

export const calculateStreak = (log: Activity[]): number => {
    if (log.length === 0) return 0;

    const uniqueDays = [...new Set(log.map(activity => new Date(activity.timestamp).setHours(0, 0, 0, 0)))].sort((a,b) => b-a);
    
    if (uniqueDays.length === 0) return 0;
    
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActivityDay = uniqueDays[0];

    // If the last activity was not today or yesterday, streak is broken
    if (today - lastActivityDay > aDayInMs) {
        return 0;
    }

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
        const day = uniqueDays[i-1];
        const prevDay = uniqueDays[i];
        if (day - prevDay === aDayInMs) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export const getEarnedBadges = (log: Activity[]): Milestone[] => {
    const earned: Set<Milestone> = new Set();
    if (log.length > 0) earned.add('FIRST_ACTIVITY');
    
    const streak = calculateStreak(log);
    if (streak >= 3) earned.add('STREAK_3');
    if (streak >= 7) earned.add('STREAK_7');

    const activityTypes = new Set(log.map(a => a.type));
    if (activityTypes.has('LISTENING_TEST_COMPLETED')) earned.add('LISTENING_1');
    if (activityTypes.has('READING_TEST_COMPLETED')) earned.add('READING_1');
    if (activityTypes.has('WRITING_FEEDBACK_RECEIVED')) earned.add('WRITING_1');
    if (activityTypes.has('SPEAKING_FEEDBACK_RECEIVED')) earned.add('SPEAKING_1');
    if (activityTypes.has('ANALYSIS_GENERATED')) earned.add('ANALYSIS_1');
    if (activityTypes.has('GRAMMAR_EXERCISE_COMPLETED')) earned.add('GRAMMAR_1');
    if (activityTypes.has('PRONUNCIATION_PRACTICE_COMPLETED')) earned.add('PRONUNCIATION_1');


    return Array.from(earned);
}