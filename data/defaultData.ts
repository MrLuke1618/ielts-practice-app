
import { AllData } from '../types';
import { listeningTestData } from './listeningData';
import { readingPassageData } from './readingData';
import { writingTaskData } from './writingData';
import { speakingPracticeData } from './speakingData';
import { vocabularyData } from './vocabularyData';

export const defaultAllData: AllData = {
  listeningTests: listeningTestData,
  readingPassages: readingPassageData,
  writingTasks: writingTaskData,
  speakingPractice: speakingPracticeData,
  vocabulary: vocabularyData,
};
