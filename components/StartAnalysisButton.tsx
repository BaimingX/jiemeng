import React from 'react';
import { Play } from 'lucide-react';
import { Language } from '../types';

interface StartAnalysisButtonProps {
    onClick: () => void;
    language: Language;
}

const StartAnalysisButton: React.FC<StartAnalysisButtonProps> = ({ onClick, language }) => {
    return (
        <div className="flex justify-end pr-4 mt-2 mb-4 animate-fade-in-up">
            <button
                onClick={onClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
                <Play size={18} fill="white" />
                <span>{language === 'en' ? 'Start Analysis' : '开始解析'}</span>
            </button>
        </div>
    );
};

export default StartAnalysisButton;
