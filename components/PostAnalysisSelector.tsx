import React from 'react';
import { MessageSquare, Image } from 'lucide-react';
import { Language } from '../types';

export type PostAnalysisChoice = 'reanalyze' | 'new_dream' | 'card';

interface PostAnalysisSelectorProps {
    onSelect: (choice: PostAnalysisChoice) => void;
    language: Language;
    disableNewDream?: boolean; // If true, hide "Tell Another Dream" and show reminder
    disableCard?: boolean;     // If true, disable "Generate Card"
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

const PostAnalysisSelector: React.FC<PostAnalysisSelectorProps> = ({ onSelect, language, disableNewDream, disableCard }) => {
    const options: ChoiceOption[] = [
        {
            id: 'reanalyze',
            labelEn: "Try Another Perspective",
            labelZh: "换一种分析方式",
            descEn: "Re-interpret this dream with a different style",
            descZh: "用不同的人设重新解读这个梦",
            icon: <MessageSquare size={20} className="rotate-180" />, // Differentiate icon
            color: "bg-indigo-50 text-indigo-600 border-indigo-100"
        },
        {
            id: 'card',
            labelEn: disableCard ? "Daily Card Limit Reached" : "Generate Dream Card",
            labelZh: disableCard ? "今日生图额度已用完" : "生成梦境卡",
            descEn: disableCard ? "You can create 2 cards per day" : "Create an illustration of this dream",
            descZh: disableCard ? "每天只能生成 2 张梦境卡" : "为这个梦创作一幅插画",
            icon: <Image size={20} />,
            color: disableCard ? "bg-gray-50 text-gray-400 border-gray-100" : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border-purple-100"
        },
        // Only show "Tell Another Dream" if not disabled (or show it but handle disable logic differently? User asked for reminder AT THE END)
        // If disabled, we simply won't include it in the map, and show a message below.
    ];

    if (!disableNewDream) {
        options.push({
            id: 'new_dream',
            labelEn: "Tell Another Dream",
            labelZh: "讲述另一个梦境",
            descEn: "Start a new dream conversation",
            descZh: "开始一段新的梦境对话",
            icon: <MessageSquare size={20} />,
            color: "bg-blue-50 text-blue-600 border-blue-100"
        });
    }

    return (
        <div className="w-full max-w-[90%] md:max-w-[75%] ml-4 mt-2 mb-4 grid grid-cols-1 gap-2 animate-fade-in-up">
            {options.map((option, index) => (
                <button
                    key={option.id}
                    onClick={() => {
                        if (option.id === 'card' && disableCard) return;
                        onSelect(option.id);
                    }}
                    disabled={option.id === 'card' && disableCard}
                    className={`flex items-center p-4 rounded-xl border text-left transition-all duration-200 
                        ${option.id === 'card' && disableCard ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98] hover:border-gray-200 bg-white border-gray-100'}
                    `}
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

            {disableNewDream && (
                <div className="p-4 rounded-xl border border-yellow-100 bg-yellow-50 text-yellow-800 text-sm mt-2 animate-fade-in">
                    {language === 'zh'
                        ? "今天已经解析了两个梦境啦，让潜意识休息一下吧。明天见！🌙"
                        : "You've analyzed two dreams today. Let your subconscious rest. See you tomorrow! 🌙"}
                </div>
            )}
        </div>
    );
};

export default PostAnalysisSelector;
