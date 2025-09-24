import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AllData, VocabularyCategory } from '../types';
import { defaultAllData } from '../data/defaultData';

interface DataContextType {
  data: AllData;
  importData: (file: File) => Promise<void>;
  exportData: () => void;
  resetData: () => void;
  addVocabularyCategory: (newCategory: VocabularyCategory) => void;
  isAILoading: boolean;
  setIsAILoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DATA_STORAGE_KEY = 'ielts-practice-data';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AllData>(() => {
    try {
      const savedData = localStorage.getItem(DATA_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      localStorage.removeItem(DATA_STORAGE_KEY);
    }
    return defaultAllData;
  });
  const [isAILoading, setIsAILoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [data]);

  const importData = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result;
          if (typeof text !== 'string') {
            throw new Error("File content is not readable text.");
          }
          const jsonData = JSON.parse(text);

          // Basic validation
          if (
            !jsonData.listeningTests ||
            !jsonData.readingPassages ||
            !jsonData.writingTasks ||
            !jsonData.speakingPractice ||
            !jsonData.vocabulary
          ) {
            throw new Error("Invalid data structure. Please use the template file as a reference.");
          }
          
          setData(jsonData as AllData);
          resolve();
        } catch (error) {
          console.error("Error processing imported file:", error);
          reject(new Error("Failed to process file. Make sure it's a valid JSON with the correct structure."));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read the file."));
      };
      reader.readAsText(file);
    });
  }, []);

  const exportData = useCallback(() => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ielts-practice-data-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const resetData = useCallback(() => {
    localStorage.removeItem(DATA_STORAGE_KEY);
    setData(defaultAllData);
  }, []);
  
  const addVocabularyCategory = useCallback((newCategory: VocabularyCategory) => {
    setData(prevData => {
        const existingCategoryIndex = prevData.vocabulary.findIndex(
            cat => cat.category.trim().toLowerCase() === newCategory.category.trim().toLowerCase()
        );

        let newVocabularyList = [...prevData.vocabulary];

        if (existingCategoryIndex !== -1) {
            // Category exists, merge words
            const existingCategory = newVocabularyList[existingCategoryIndex];
            const existingWords = new Set(existingCategory.words.map(w => w.word.trim().toLowerCase()));
            const wordsToAdd = newCategory.words.filter(newWord => !existingWords.has(newWord.word.trim().toLowerCase()));
            
            if (wordsToAdd.length > 0) {
                newVocabularyList[existingCategoryIndex] = {
                    ...existingCategory,
                    words: [...existingCategory.words, ...wordsToAdd]
                };
            }
        } else {
            // New category, add it
            newVocabularyList = [...newVocabularyList, newCategory];
        }

        return { ...prevData, vocabulary: newVocabularyList };
    });
  }, []);


  return (
    <DataContext.Provider value={{ data, importData, exportData, resetData, addVocabularyCategory, isAILoading, setIsAILoading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};