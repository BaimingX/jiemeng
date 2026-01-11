import React from 'react';
import { MessageSquare, Image } from 'lucide-react';
import { Language } from '../types';

export type PostAnalysisChoice = 'continue' | 'card';

interface PostAnalysisSelectorProps {
    onSelect: (choice: PostAnalysisChoice) => void;
    language: Language;
}

interface ChoiceOption {
    id: PostAnalysisChoice;
    labelEn: string;
    labelZh: string;
    descEn: string;
    descZh: string;
    icon: React.ReactNode;
    color: string;
}

const CHOICE_OPTIONS: ChoiceOption[] = [
    {
        id: 'continue',
        labelEn: "Continue Analyzing",
        labelZh: "继续解梦",
        descEn: "Tell me about another dream",
        descZh: "讲述另一个梦境",
        icon: <MessageSquare size={20} />,
        color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
        id: 'card',
        labelEn: "Generate Dream Card",
        labelZh: "生成梦境卡",
        descEn: "Create an illustration of this dream",
        descZh: "为这个梦创作一幅插画",
        icon: <Image size={20} />,
        color: "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border-purple-100"
    }
];

const PostAnalysisSelector: React.FC<PostAnalysisSelectorProps> = ({ onSelect, language }) => {
    return (
        <div className="w-full max-w-[90%] md:max-w-[75%] ml-4 mt-2 mb-4 grid grid-cols-1 gap-2 animate-fade-in-up">
            {CHOICE_OPTIONS.map((option, index) => (
                <button
                    key={option.id}
                    onClick={() => onSelect(option.id)}
                    className={`flex items-center p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] bg-white border-gray-100 hover:border-gray-200`}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className={`p-2.5 rounded-lg mr-3 ${option.color}`}>
                        {option.icon}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-[15px] text-gray-900">
                            {language === 'en' ? option.labelEn : option.labelZh}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {language === 'en' ? option.descEn : option.descZh}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default PostAnalysisSelector;
