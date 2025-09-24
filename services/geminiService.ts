import { GoogleGenAI, Type } from "@google/genai";
import { ListeningTest, ReadingPassage, TestScore, SpeakingPractice, WritingTask, QuestionOption, VocabularyItem } from '../types';

export const getWritingFeedback = async (apiKey: string, taskType: 'Task 1' | 'Task 2', essay: string): Promise<string> => {
  if (!apiKey) {
    return "API Key not provided. Please add your Gemini API key in the Settings page to get feedback.";
  }

  if (essay.trim().length < 20) {
      return "Please write a longer essay to receive feedback."
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Act as an expert IELTS examiner. Evaluate the following IELTS ${taskType} essay based on the official IELTS assessment criteria.

    The criteria are:
    1.  **Task Achievement (${taskType === 'Task 1' ? 'Task 1' : 'Task Response for Task 2'})**: How well the response addresses the task requirements.
    2.  **Coherence and Cohesion**: How well-structured and logically connected the ideas are.
    3.  **Lexical Resource**: The range and accuracy of vocabulary.
    4.  **Grammatical Range and Accuracy**: The range and accuracy of grammatical structures.

    Provide an estimated overall band score (from 1-9).
    Then, for each of the four criteria, provide a brief, constructive feedback paragraph with specific examples from the essay.
    Finally, give one or two key suggestions for improvement.

    Format your response clearly using markdown. Use headings for the overall score, each criterion, and suggestions.

    **Essay to evaluate:**
    ---
    ${essay}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "Error: The provided Gemini API key is not valid. Please check the key in the Settings page.";
    }
    return "An error occurred while fetching feedback from the Gemini API. Please check the console for details.";
  }
};


export const generateImageFromPrompt = async (apiKey: string, prompt: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key not provided.");
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `An IELTS Writing Task 1 data visualization. A simple, clear, minimalist, 2D infographic chart with clean vector lines and clear, legible labels. Do not include any descriptive text, titles, or explanations on the image itself. The chart to generate is: ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '16:9',
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Gemini Image Generation API error:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid.");
        }
        throw new Error("An error occurred while generating the image.");
    }
};

export type ListeningTestType = 'Everyday Conversation' | 'Academic Monologue';

export const generateListeningTest = async (apiKey: string, testType: ListeningTestType, difficulty: number): Promise<Omit<ListeningTest, 'audioSrc' | 'id'>> => {
    if (!apiKey) {
        throw new Error("API Key not provided.");
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt = '';
    if (testType === 'Everyday Conversation') {
        prompt = `Create a new IELTS-style listening test dialogue suitable for a test-taker aiming for a band score of ${difficulty}. The topic should be an everyday conversation. The dialogue should be between two people and be approximately 150-200 words long. The vocabulary and sentence structure should be appropriate for the target band score. After the dialogue, create exactly 5 questions based on specific details from the text. The questions should be a mix of 'FILL_IN_THE_BLANK' and 'MULTIPLE_CHOICE' types. For MULTIPLE_CHOICE, provide 3 options, only one of which is correct. Return the entire output as a single JSON object.`;
    } else { // Academic Monologue
        prompt = `Create a new IELTS Section 4 style listening test monologue suitable for a test-taker aiming for a band score of ${difficulty}. The content should be a short academic lecture (around 200-250 words) from a single speaker on a topic like biology, history, or environmental science. The language complexity should match the target band score. After the monologue, create exactly 5 'FILL_IN_THE_BLANK' questions that require the listener to note specific details, facts, or figures from the lecture. The blank should ideally be one or two words. Return the entire output as a single JSON object.`;
    }


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'An engaging title for the test, max 5 words.' },
                        difficulty: { type: Type.NUMBER, description: `The target difficulty band score, which must be ${difficulty}.` },
                        transcript: { type: Type.STRING, description: 'The full dialogue or monologue script, formatted with HTML <p> and <b> tags for speakers if applicable.' },
                        questions: {
                            type: Type.ARRAY,
                            description: "An array of exactly 5 question objects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    type: { type: Type.STRING, description: `The value must be "FILL_IN_THE_BLANK" or "MULTIPLE_CHOICE".` },
                                    questionText: { type: Type.STRING },
                                    correctAnswer: { type: Type.STRING, description: "For FILL_IN_THE_BLANK, the word that fits the blank. For MULTIPLE_CHOICE, the text of the correct option." },
                                    options: {
                                        type: Type.ARRAY,
                                        description: "For MULTIPLE_CHOICE questions, provide an array of 3 option objects.",
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                text: { type: Type.STRING },
                                                isCorrect: { type: Type.BOOLEAN }
                                            },
                                            required: ['text', 'isCorrect']
                                        }
                                    }
                                },
                                required: ['id', 'type', 'questionText']
                            },
                        },
                    },
                    required: ['title', 'transcript', 'questions', 'difficulty']
                },
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        if (!jsonResponse.title || !jsonResponse.transcript || !Array.isArray(jsonResponse.questions) || jsonResponse.questions.length === 0) {
            throw new Error("Received invalid data structure from AI.");
        }

        // Post-process to ensure correctAnswer is set for MCQs
        jsonResponse.questions.forEach((q: { type: string; options?: QuestionOption[]; correctAnswer?: string }) => {
            if (q.type === 'MULTIPLE_CHOICE' && q.options && !q.correctAnswer) {
                const correctOption = q.options.find(opt => opt.isCorrect);
                if (correctOption) {
                    q.correctAnswer = correctOption.text;
                }
            }
        });

        return jsonResponse;

    } catch (error) {
        console.error("Gemini API error in generateListeningTest:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid.");
        }
        throw new Error("An error occurred while generating the listening test.");
    }
};

export const generateReadingTest = async (apiKey: string, difficulty: number): Promise<Omit<ReadingPassage, 'id'>> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create a new IELTS-style reading passage of about 250-300 words, suitable for a test-taker aiming for a band score of ${difficulty}. The topic should be suitable for a general audience, like technology, environment, or society. The vocabulary and sentence structure complexity must be appropriate for the target band score. After the passage, create exactly 5 'True/False/Not Given' style questions based on the text. Return the entire output as a single JSON object. The passage should be a single string with HTML <p> tags for paragraphs.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'An engaging title for the passage, max 7 words.' },
                        passage: { type: Type.STRING, description: 'The full reading passage, formatted with HTML <p> tags.' },
                        difficulty: { type: Type.NUMBER, description: `The target difficulty band score, which must be ${difficulty}.` },
                        questions: {
                            type: Type.ARRAY,
                            description: "An array of exactly 5 question objects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER, description: "A unique number for the question, from 1 to 5." },
                                    type: { type: Type.STRING, description: `The value must be exactly "TRUE_FALSE_NOT_GIVEN".` },
                                    questionText: { type: Type.STRING, description: 'The statement for the T/F/NG question.' },
                                    correctAnswer: { type: Type.STRING, description: 'The correct answer, either "True", "False", or "Not Given".' },
                                },
                                required: ['id', 'type', 'questionText', 'correctAnswer']
                            },
                        },
                    },
                    required: ['title', 'passage', 'questions', 'difficulty']
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.title || !jsonResponse.passage || !Array.isArray(jsonResponse.questions) || jsonResponse.questions.length === 0) {
            throw new Error("Received invalid data structure from AI.");
        }
        return jsonResponse;
    } catch (error) {
        console.error("Gemini API error in generateReadingTest:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid.");
        }
        throw new Error("An error occurred while generating the reading test.");
    }
};

export const getSpeakingFeedback = async (apiKey: string, transcript: string): Promise<string> => {
    if (!apiKey) return "API Key not provided. Cannot get feedback.";
    if (transcript.trim().length < 10) return "The transcript is too short to provide meaningful feedback.";

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Act as a friendly and encouraging IELTS speaking coach for a young learner (around 13 years old).
        Analyze the following transcript from a practice speaking test.
        Use simple, clear language. Avoid overly complex jargon.
        The goal is to build confidence while providing constructive feedback.

        Please format your response in clear markdown with the following sections:

        ### Estimated Band Score
        Provide a single estimated band score (e.g., 6.0, 6.5).

        ### What You Did Well! 👍
        - Start with a positive and encouraging sentence.
        - List 2-3 specific things the speaker did well. Use bullet points.
        - Quote short examples from their transcript to illustrate the points.

        ### Areas for Improvement 💡
        - Gently introduce this section.
        - List 2-3 specific areas for improvement focusing on Fluency, Vocabulary (Lexical Resource), or Grammar.
        - For each point, briefly explain why it's important and give a clear example of how to improve it, using a phrase from the transcript if possible.

        ### A Friendly Tip ✨
        - Provide one final, simple, and encouraging tip to help them in their next practice.

        **Transcript to analyze:**
        ---
        ${transcript}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in getSpeakingFeedback:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            return "Error: The provided Gemini API key is not valid.";
        }
        return "An error occurred while fetching feedback from the Gemini API.";
    }
};

export interface PerformanceData {
    listeningScore?: TestScore;
    readingScore?: TestScore;
    writingFeedbackTask1?: string;
    writingFeedbackTask2?: string;
    speakingFeedbackPart1?: string;
    speakingFeedbackPart2?: string;
    speakingFeedbackPart3?: string;
}

export const getOverallAnalysis = async (apiKey: string, data: PerformanceData): Promise<string> => {
    if (!apiKey) {
        return "### Analysis Unavailable\n\nPlease provide your Gemini API key in the Settings page to generate your personalized study plan.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Build a summary of the data to send to the AI
    let dataSummary = "Here is the user's latest performance data from their IELTS practice:\n\n";

    if (data.listeningScore) {
        dataSummary += `- **Listening**: Scored ${data.listeningScore.score} out of ${data.listeningScore.total} on the test "${data.listeningScore.testId}".\n`;
    } else {
        dataSummary += "- **Listening**: No recent test data available.\n";
    }

    if (data.readingScore) {
        dataSummary += `- **Reading**: Scored ${data.readingScore.score} out of ${data.readingScore.total} on the test "${data.readingScore.testId}".\n`;
    } else {
        dataSummary += "- **Reading**: No recent test data available.\n";
    }
    
    if (data.writingFeedbackTask1) {
        dataSummary += `- **Writing Task 1 Feedback Summary**: \n\`\`\`\n${data.writingFeedbackTask1}\n\`\`\`\n`;
    } else {
        dataSummary += "- **Writing Task 1**: No recent feedback available.\n";
    }
    
    if (data.writingFeedbackTask2) {
        dataSummary += `- **Writing Task 2 Feedback Summary**: \n\`\`\`\n${data.writingFeedbackTask2}\n\`\`\`\n`;
    } else {
        dataSummary += "- **Writing Task 2**: No recent feedback available.\n";
    }
    
    const speakingFeedback = [data.speakingFeedbackPart1, data.speakingFeedbackPart2, data.speakingFeedbackPart3].filter(Boolean);
    if (speakingFeedback.length > 0) {
         dataSummary += `- **Speaking Feedback Summary**: \n\`\`\`\n${speakingFeedback.join('\n\n')}\n\`\`\`\n`;
    } else {
         dataSummary += "- **Speaking**: No recent feedback available.\n";
    }

    const prompt = `
        You are an expert, friendly, and highly motivational IELTS tutor. Your student is a young learner who needs a clear and encouraging analysis of their recent practice.
        
        Based on the following performance data, please generate a comprehensive analysis and a personalized 1-week study plan.
        
        **User's Data:**
        ${dataSummary}
        
        **Your Task:**
        
        Please structure your response in clear markdown with the following sections. Use a friendly and positive tone throughout.
        
        ### Overall Performance Summary 🚀
        Start with an encouraging sentence. Briefly summarize the user's current performance across the four skills (Listening, Reading, Writing, Speaking). Provide an estimated overall IELTS band score range (e.g., 5.5 - 6.5) based on the available data. If data for a skill is missing, acknowledge it.
        
        ### Your Strengths! 💪
        Identify 2-3 key strengths based on the data. Be specific. For example, "You have a good grasp of vocabulary in your writing" or "Your listening score shows you can understand main ideas well."
        
        ### Key Areas for Improvement 🎯
        Identify the 2-3 most important areas for improvement. Be constructive and specific. For example, "Focus on improving grammatical accuracy in your speaking" or "Practice identifying details in reading passages more carefully."
        
        ### Your Personalized 1-Week Study Plan 🗓️
        Create a simple, actionable study plan for the next 7 days. Make it realistic for a student (e.g., 1-2 hours per day). For each day, suggest one or two specific tasks that target the "Areas for Improvement." The entire study plan MUST be a single markdown list.
        
        Example Day:
        - **Day 1: Grammar Focus.** Review past tense and practice writing 5 sentences. Use a grammar app to check your work.
        
        ### Helpful Resources & Tips ✨
        Suggest 2-3 practical resources. These can include specific apps (like Duolingo for vocabulary), websites (like the British Council's), or simple study tips (like "read an English news article every day").
        
        Remember to be encouraging and make the user feel motivated to continue their studies!
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in getOverallAnalysis:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            return "Error: The provided Gemini API key is not valid.";
        }
        return "An error occurred while generating your analysis. Please try again.";
    }
};

export const getDailyTip = async (apiKey: string): Promise<string> => {
    if (!apiKey) {
        return "Set your Gemini API key in Settings to get a daily tip!";
    }
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Act as an IELTS coach for a 13-year-old Vietnamese student. Give one small, encouraging, and actionable tip for today. Make it short, friendly, and under 25 words.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in getDailyTip:", error);
        return "Could not fetch a tip right now. Try again later!";
    }
};

export const generateGrammarExercise = async (apiKey: string, type: 'Error Spotting' | 'Tense Practice' | 'Sentence Transformation' | 'Word Forms'): Promise<{ question: string; answer: string }> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    let prompt = '';
    if (type === 'Error Spotting') {
        prompt = `Create a single English sentence for a 13-year-old IELTS learner that contains one common grammatical error (e.g., subject-verb agreement, incorrect preposition, wrong tense). The sentence should be about a simple topic like hobbies, school, or family. Return a JSON object with two keys: "question" (the sentence with the error) and "answer" (the corrected sentence).`;
    } else if (type === 'Tense Practice') {
        prompt = `Create a simple English sentence in the present simple tense. Then, provide the same sentence correctly converted to the past simple tense. The topic should be suitable for a teenager. Return a JSON object with two keys: "question" (e.g., "Rewrite this sentence in the past simple: 'She plays tennis.'") and "answer" (the corrected sentence, e.g., "She played tennis.").`;
    } else if (type === 'Sentence Transformation') {
        prompt = `Create a sentence transformation exercise for a 13-year-old IELTS learner. Provide a sentence and a clear instruction (e.g., "Rewrite this sentence in the passive voice: 'The dog chased the cat.'"). The topic should be simple and relatable. Return a JSON object with two keys: "question" (the full instruction and original sentence) and "answer" (the correctly transformed sentence).`;
    } else { // Word Forms
        prompt = `Create a word form exercise for a 13-year-old IELTS learner. Provide a sentence with a blank space and a root word in brackets at the end. The user must fill the blank with the correct form of the word. Example question: "Her ___ at the concert was amazing. (sing)". Example answer: "singing". Return a JSON object with two keys: "question" (the full sentence with blank and hint) and "answer" (the single correct word form).`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING },
                    },
                    required: ['question', 'answer']
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini API error in generateGrammarExercise:", error);
        throw new Error("Failed to generate a grammar exercise.");
    }
};

type PronunciationPracticeMode = 'singleWord' | 'tongueTwister' | 'minimalPair' | 'sentenceStress';

export const getPronunciationFeedback = async (apiKey: string, textToPractice: string, audioBase64: string, mimeType: string, practiceMode: PronunciationPracticeMode): Promise<string> => {
    if (!apiKey) return "API Key not provided.";
    const ai = new GoogleGenAI({ apiKey });

    const audioPart = {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
    };

    let prompt = '';
    switch (practiceMode) {
        case 'tongueTwister':
            prompt = `Act as a friendly English pronunciation coach for a 13-year-old native Vietnamese speaker.
            Analyze my pronunciation of the tongue twister "${textToPractice}" from the provided audio.
            Focus on fluency, rhythm, and clarity.
            
            Please give me feedback in this format:
            1.  **Overall Impression:** Give a positive, encouraging comment on my attempt.
            2.  **Clarity Check:** Point out one or two words that were a bit unclear and suggest how to say them more clearly.
            3.  **Fluency Tip:** Give one simple tip to improve the flow and rhythm.
            
            Keep the tone very encouraging and positive!`;
            break;
        case 'minimalPair':
             prompt = `Act as a friendly English pronunciation coach for a 13-year-old native Vietnamese speaker.
            Analyze my pronunciation of the minimal pair "${textToPractice}" from the provided audio. I attempted to say both words.
            
            Please give me feedback in this format:
            1.  **Sound Distinction:** Did I successfully distinguish between the two key sounds?
            2.  **Specific Feedback:** For each word, briefly comment on my pronunciation. For example, 'Your 'ship' was clear, but your 'sheep' vowel sound was a bit short.'
            3.  **How to Improve:** Give one clear, simple instruction on mouth or tongue position to improve the difficult sound.
            
            Keep the tone very encouraging and positive!`;
            break;
        case 'sentenceStress':
             prompt = `Act as a friendly English pronunciation coach for a 13-year-old native Vietnamese speaker.
            Analyze my pronunciation of the sentence "${textToPractice}" from the provided audio.
            
            Please give me feedback in this format:
            1.  **Rhythm & Flow:** Comment on the overall rhythm of my sentence. Was it natural?
            2.  **Word Stress:** Point out one or two key words that I should have stressed more to sound more natural.
            3.  **Intonation Tip:** Briefly comment on my intonation (the 'music' of my voice). Did it rise and fall correctly for the sentence type?
            
            Keep the tone very encouraging and positive!`;
            break;
        case 'singleWord':
        default:
            prompt = `Act as a friendly English pronunciation coach for a 13-year-old native Vietnamese speaker.
            Analyze my pronunciation of the word "${textToPractice}" from the provided audio.
            
            Please give me feedback in this format:
            1.  **Phonetic Breakdown:** Give a simple, easy-to-read phonetic breakdown (e.g., AN-A-LYZE).
            2.  **Your Pronunciation:** Briefly comment on what I did well or what needs work based on the audio.
            3.  **Common Mistake Alert:** Point out one common mistake a Vietnamese speaker might make with this word (like dropping final sounds or incorrect vowel sounds).
            4.  **How to Improve:** Give one clear, simple instruction on how to fix that mistake (e.g., "Make sure your tongue touches the back of your teeth for the 'th' sound.").
            
            Keep the tone very encouraging and positive!`;
            break;
    }


    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [audioPart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API error in getPronunciationFeedback:", error);
        return "Sorry, I couldn't analyze the audio right now. The model might not support audio analysis, or an error occurred. You can still practice recording!";
    }
};

export const suggestPronunciationWord = async (apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Suggest one single, common but sometimes tricky-to-pronounce English word for a 13-year-old to practice. Examples: "schedule", "thoroughly", "phenomenon". Return only the single word, nothing else.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text.trim().replace(/["'.]/g, ''); // Clean up potential quotes or periods
    } catch (error) {
        console.error("Gemini API error in suggestPronunciationWord:", error);
        return "vocabulary"; // fallback word
    }
};

export const generateTongueTwister = async (apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create one short, fun English tongue twister suitable for a 13-year-old learner. It should be 1-2 sentences long. Return only the tongue twister text.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API error in generateTongueTwister:", error);
        return "She sells seashells by the seashore."; // fallback
    }
};

export const generateMinimalPairs = async (apiKey: string): Promise<{ pair: [string, string]; sentences: [string, string] }> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create one minimal pair exercise for a 13-year-old Vietnamese English learner. Focus on a common challenge, like /iː/ vs /ɪ/ (sheep/ship) or final consonants. Provide the two words and a simple example sentence for each. Return a single JSON object.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pair: { type: Type.ARRAY, description: "An array of two strings representing the minimal pair (e.g., ['ship', 'sheep']).", items: { type: Type.STRING } },
                        sentences: { type: Type.ARRAY, description: "An array of two strings, each a simple sentence using one of the words.", items: { type: Type.STRING } },
                    },
                    required: ['pair', 'sentences']
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.pair || jsonResponse.pair.length !== 2 || !jsonResponse.sentences || jsonResponse.sentences.length !== 2) {
             throw new Error("Invalid format for minimal pairs.");
        }
        return jsonResponse;
    } catch (error) {
        console.error("Gemini API error in generateMinimalPairs:", error);
        return { pair: ["ship", "sheep"], sentences: ["The ship is in the harbour.", "The sheep is in the field."] }; // fallback
    }
};


export const generateSentenceForStress = async (apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create one single, simple English sentence (7-10 words) that is good for practicing sentence stress and intonation for a 13-year-old learner. It should be a common statement or question. Return only the sentence text.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API error in generateSentenceForStress:", error);
        return "I haven't seen that movie yet."; // fallback
    }
};


export const generateSpeakingPractice = async (apiKey: string, difficulty: number): Promise<SpeakingPractice> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create a full, cohesive IELTS speaking test (Parts 1, 2, and 3) on a single topic suitable for a teenager. The questions should be clear and natural, with a difficulty level appropriate for a test-taker aiming for band score ${difficulty}. Return the entire output as a single JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        part1Questions: { type: Type.ARRAY, description: "An array of 4-5 introductory questions.", items: { type: Type.STRING } },
                        part2Card: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "A unique ID for the card, e.g., 'ai-card-1'." },
                                topic: { type: Type.STRING, description: "The main topic to describe." },
                                points: { type: Type.ARRAY, description: "An array of 3-4 bullet points to guide the speaker.", items: { type: Type.STRING } }
                            },
                            required: ['id', 'topic', 'points']
                        },
                        part3Questions: { type: Type.ARRAY, description: "An array of 4-5 follow-up discussion questions related to the Part 2 topic.", items: { type: Type.STRING } },
                        difficulty: { type: Type.NUMBER, description: `The target difficulty band score, which must be ${difficulty}.` },
                    },
                    required: ['part1Questions', 'part2Card', 'part3Questions', 'difficulty']
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.part1Questions || !jsonResponse.part2Card || !jsonResponse.part3Questions) {
            throw new Error("Received invalid data structure from AI for speaking practice.");
        }
        return jsonResponse;
    } catch (error) {
        console.error("Gemini API error in generateSpeakingPractice:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid.");
        }
        throw new Error("An error occurred while generating the speaking test.");
    }
};

export const generateWritingTask = async (apiKey: string, taskType: 'Task 1' | 'Task 2', difficulty: number): Promise<Omit<WritingTask, 'imageSrc'>> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = taskType === 'Task 1' 
        ? `You are an expert creator of IELTS test materials. Your task is to generate a perfectly consistent pair of prompts for a Writing Task 1 exercise suitable for a test-taker aiming for band score ${difficulty}. It is critical that the user-facing prompt and the AI image generation prompt are based on the exact same data and description.

Follow these steps:
1.  **Invent a Dataset:** First, invent a simple, clear dataset for a common chart type (line graph, bar chart, pie chart, table, or process diagram). The data complexity should match the target band score.
2.  **Write the User Prompt:** Based on your invented dataset, write the user-facing prompt. This is the text the student will see, describing what the chart shows. For example: "The chart below illustrates changes in the percentage of the population using the internet in three different countries between 2010 and 2020."
3.  **Write the Image Generation Prompt:** Write a separate, highly detailed prompt for an AI image generator to create the visualization. This prompt MUST include the specific chart type, axes with labels, and the EXACT data points, values, and trends from the dataset you invented. The goal is to produce a simple, clear, 2D infographic suitable for an IELTS test, without extra text on the image. For example: "A line graph titled 'Internet Usage (2010-2020)'. X-axis is 'Year' with values 2010, 2015, 2020. Y-axis is 'Percentage of Population' from 0 to 100. Country A line: (2010, 20%), (2015, 50%), (2020, 80%). Country B line: (2010, 40%), (2015, 60%), (2020, 75%). Country C line: (2010, 10%), (2015, 25%), (2020, 60%)."

Ensure both prompts describe the identical scenario. Return a single JSON object.`
        : `Create a new IELTS Writing Task 2 essay question suitable for a test-taker aiming for band score ${difficulty}. The topic should be debatable and suitable for a general audience (e.g., technology, society, education). The question should ask the test-taker to discuss views, present an argument, or suggest solutions. Return a single JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique ID for the task, e.g., 'ai-task1-1'." },
                        type: { type: Type.STRING, description: `The value must be exactly "${taskType}".` },
                        prompt: { type: Type.STRING, description: "The full prompt for the user to read." },
                        difficulty: { type: Type.NUMBER, description: `The target difficulty band score, which must be ${difficulty}.` },
                        ...(taskType === 'Task 1' && {
                            imageGenerationPrompt: { type: Type.STRING, description: "A detailed, descriptive prompt for an AI image generator. It must specify chart type, axes, data, and labels to ensure an accurate and simple visual is created." }
                        })
                    },
                    required: ['id', 'type', 'prompt', 'difficulty']
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.id || !jsonResponse.type || !jsonResponse.prompt) {
            throw new Error("Received invalid data structure from AI for writing task.");
        }
        return jsonResponse;
    } catch (error) {
        console.error(`Gemini API error in generateWritingTask for ${taskType}:`, error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid.");
        }
        throw new Error(`An error occurred while generating the writing ${taskType} prompt.`);
    }
};

export const getParaphrasedText = async (apiKey: string, text: string, tone: string): Promise<string[]> => {
    if (!apiKey) throw new Error("API Key not provided.");
    if (text.trim().length < 5) throw new Error("Please enter a longer sentence to paraphrase.");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert IELTS writing tutor. Your task is to paraphrase the given sentence to help a student improve their writing. Paraphrase it according to the specified tone.

The paraphrases must:
1. Preserve the original meaning completely (unless the tone is 'Expanded').
2. Be grammatically perfect and sound natural for an academic essay.
3. Use a **${tone}** tone: 
    - For a 'Simple' tone, make it easier to understand using common vocabulary, ideal for clarifying a complex idea.
    - For a 'Formal' tone, use more sophisticated vocabulary and complex sentence structures suitable for high-scoring academic writing.
    - For an 'Expanded' tone, elaborate on the original idea to make the sentence more detailed and descriptive, useful for developing a point.
    - For a 'Concise' tone, express the same meaning in fewer words, making it more direct and impactful. This is excellent for powerful topic sentences.
    - For a 'Persuasive' tone, rephrase the sentence to be more convincing and argumentative, which is crucial for strengthening arguments in Writing Task 2.
4. Avoid robotic or unnatural language.

Sentence to paraphrase: "${text}"

Provide exactly three distinct paraphrased versions. Return the output as a single JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        paraphrases: {
                            type: Type.ARRAY,
                            description: "An array of exactly 3 distinct paraphrased sentences.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['paraphrases']
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.paraphrases || !Array.isArray(jsonResponse.paraphrases)) {
            throw new Error("Received invalid data structure from AI.");
        }
        return jsonResponse.paraphrases;
    } catch (error) {
        console.error("Gemini API error in getParaphrasedText:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid.");
        }
        throw new Error("An error occurred while generating paraphrases.");
    }
};

export const generateVocabularyList = async (apiKey: string, topic: string): Promise<VocabularyItem[]> => {
    if (!apiKey) throw new Error("API Key not provided.");
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a list of exactly 7 advanced English vocabulary words related to the topic "${topic}". The words should be useful for an IELTS student. For each word, provide its pronunciation (IPA format), a clear definition, an example sentence, and its Vietnamese translation. Return the entire output as a single JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        words: {
                            type: Type.ARRAY,
                            description: "An array of exactly 7 vocabulary word objects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    pronunciation: { type: Type.STRING, description: "IPA format, e.g., /əˈnælɪsɪs/." },
                                    definition: { type: Type.STRING },
                                    example: { type: Type.STRING },
                                    vietnamese: { type: Type.STRING, description: "Vietnamese translation." }
                                },
                                required: ['word', 'pronunciation', 'definition', 'example', 'vietnamese']
                            }
                        }
                    },
                    required: ['words']
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.words || !Array.isArray(jsonResponse.words) || jsonResponse.words.length === 0) {
            throw new Error("Received invalid data structure from AI for vocabulary list.");
        }
        return jsonResponse.words;
    } catch (error) {
        console.error("Gemini API error in generateVocabularyList:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid.");
        }
        throw new Error(`An error occurred while generating vocabulary for the topic "${topic}".`);
    }
};

export interface VocabularyQuiz {
    question: string;
    options: string[];
    answer: string;
}

export const generateVocabularyQuiz = async (apiKey: string, words: VocabularyItem[]): Promise<VocabularyQuiz> => {
    if (!apiKey) throw new Error("API Key not provided.");
    if (words.length < 4) throw new Error("Not enough words in this category to generate a quiz (minimum 4 required).");

    const ai = new GoogleGenAI({ apiKey });
    const wordList = words.map(w => w.word).join(', ');

    const prompt = `
        From the following list of vocabulary words: [${wordList}], create a single, high-quality, multiple-choice quiz question.
        
        Follow these steps:
        1.  Choose ONE word from the list to be the correct answer.
        2.  Write a clear sentence that uses this word in context, but replace the word with a blank (represented by "______").
        3.  Choose THREE other distinct words from the same list to be plausible but incorrect options (distractors).
        4.  The final list of options must have exactly four unique words, including the correct answer. The options should be shuffled.
        
        Return the result as a single JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING, description: 'The sentence with a "______" for the blank.' },
                        options: {
                            type: Type.ARRAY,
                            description: "An array of exactly 4 unique word options from the provided list, shuffled.",
                            items: { type: Type.STRING }
                        },
                        answer: { type: Type.STRING, description: 'The single correct word that fits the blank.' },
                    },
                    required: ['question', 'answer']
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        if (!jsonResponse.question || !jsonResponse.options || !jsonResponse.answer || jsonResponse.options.length !== 4) {
            throw new Error("Received invalid data structure from AI for vocabulary quiz.");
        }
        return jsonResponse;
    } catch (error) {
        console.error("Gemini API error in generateVocabularyQuiz:", error);
        throw new Error("Failed to generate a vocabulary quiz.");
    }
};