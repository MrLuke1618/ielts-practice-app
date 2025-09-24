import React, { useState, useEffect } from 'react';

const quotes = [
    "The limits of my language are the limits of my world.",
    "To learn a language is to have one more window from which to look at the world.",
    "Learning is a treasure that will follow its owner everywhere.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever."
];

const Footer: React.FC = () => {
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <footer className="w-full mt-auto bg-zinc-200 dark:bg-zinc-700 border-t border-zinc-300 dark:border-zinc-600 p-4 text-zinc-600 dark:text-zinc-300 text-sm">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="copyright-text order-3 md:order-1">&copy; 2025 MrLuke1618. All rights reserved.</p>
                <div id="quote-container" className="italic order-1 md:order-2 text-center">
                    <p id="quote-text">"{quote}"</p>
                </div>
                <div className="flex space-x-4 text-lg order-2 md:order-3">
                    <a href="https://www.youtube.com/@luke1618gamer" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-red-600 transition-colors">
                        <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://www.tiktok.com/@hoangcao2704" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-black dark:hover:text-white transition-colors">
                        <i className="fab fa-tiktok"></i>
                    </a>
                    <a href="https://www.linkedin.com/in/hoangminhcao" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-700 transition-colors">
                        <i className="fab fa-linkedin"></i>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;