
export enum Module {
  DASHBOARD = 'DASHBOARD',
  LISTENING = 'LISTENING',
  READING = 'READING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  VOCABULARY = 'VOCABULARY',
  SETTINGS = 'SETTINGS',
  ANALYSIS = 'ANALYSIS',
  GRAMMAR = 'GRAMMAR',
  PRONUNCIATION = 'PRONUNCIATION',
  PARAPHRASER = 'PARAPHRASER',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  TRUE_FALSE_NOT_GIVEN = 'TRUE_FALSE_NOT_GIVEN',
  MATCHING_HEADINGS = 'MATCHING_HEADINGS',
  SUMMARY_COMPLETION = 'SUMMARY_COMPLETION'
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[]; // For multiple choice
  correctAnswer?: string | string[]; // For fill in the blank, T/F/NG, multiple correct answers
  wordBank?: string[]; // For summary completion
  explanation?: string;
}

export interface ListeningTest {
  id: string;
  title: string;
  audioSrc: string; // base64 data URI
  transcript: string;
  questions: Question[];
  difficulty: number;
}

export interface ReadingPassage {
  id: string;
  title: string;
  passage: string;
  questions: Question[];
  difficulty: number;
}

export interface WritingTask {
  id: string;
  type: 'Task 1' | 'Task 2';
  prompt: string;
  imageSrc?: string; // For Task 1 graphs/charts
  imageGenerationPrompt?: string;
  difficulty: number;
}

export interface SpeakingCueCard {
    id: string;
    topic: string;
    points: string[];
}

export interface SpeakingPractice {
    part1Questions: string[];
    part2Card: SpeakingCueCard;
    part3Questions: string[];
    difficulty: number;
}

export interface SpeakingAttempt {
  id: string;
  practiceId: string; // Corresponds to SpeakingCueCard.id
  partId: 'part1' | 'part2' | 'part3';
  timestamp: number;
  audioDataUrl: string; // A data URL for the recorded audio
  transcript: string;
  feedback: string;
}

export interface VocabularyItem {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  vietnamese?: string;
}

export interface VocabularyCategory {
  category: string;
  words: VocabularyItem[];
}

export interface TestScore {
  moduleId: 'LISTENING' | 'READING';
  testId: string;
  score: number;
  total: number;
  date: string; // ISO string
}

export interface AllData {
  listeningTests: ListeningTest[];
  readingPassages: ReadingPassage[];
  writingTasks: WritingTask[];
  speakingPractice: SpeakingPractice[];
  vocabulary: VocabularyCategory[];
}