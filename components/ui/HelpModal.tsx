import React, { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-zinc-700">
          <h3 id="help-modal-title" className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
            aria-label="Close help modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-zinc-700 dark:prose-headings:text-zinc-200 prose-ul:list-disc prose-ul:ml-4 prose-li:my-1">
                {children}
            </div>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-t dark:border-zinc-700 text-right rounded-b-xl">
             <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Got it!
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;