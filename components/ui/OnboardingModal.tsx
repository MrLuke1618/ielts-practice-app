import React from 'react';
import Card from './Card';
import Button from './Button';
import { KeyIcon } from '@heroicons/react/24/outline';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onGoToSettings }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
    >
      <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <KeyIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <h3 id="onboarding-title" className="mt-4 text-xl font-semibold text-zinc-800 dark:text-zinc-100">Welcome to IELTS Practice Pod!</h3>
            <div className="mt-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    To unlock the full power of this app, including AI-generated tests and personalized feedback, you'll need to add a Google Gemini API Key.
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                    You can get a free key from Google AI Studio.
                </p>
            </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button onClick={onClose} variant="secondary">
                Ask Me Later
            </Button>
            <Button onClick={onGoToSettings}>
                Go to Settings
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingModal;