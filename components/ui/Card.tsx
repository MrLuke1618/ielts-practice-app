import React from 'react';

// FIX: Extended CardProps with React.HTMLAttributes to allow standard HTML attributes like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl shadow-md dark:shadow-none dark:border dark:border-zinc-700 overflow-hidden ${className}`} {...props}>
      <div className="p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
};

export default Card;