import React, { useState } from 'react';
import { Brain, Sparkles, Feather, Lightbulb, ChevronLeft, ChevronRight, Book, Moon, Star, Leaf, Cross } from 'lucide-react';
import { Language, AnalysisStyleId, StyleCategory } from '../types';

interface StyleSelectorProps {
  onSelect: (style: AnalysisStyleId, label?: string) => void; // Updated signature to allow passing label back if needed
  language: Language;
  darkMode?: boolean;
}

interface CategoryOption {
  id: StyleCategory;
  labelEn: string;
  labelZh: string;
  descEn: string;
  descZh: string;
  icon: React.ReactNode;
  color: string;
  hasSubStyles: boolean;
}

interface SubStyleOption {
  id: AnalysisStyleId;
  labelEn: string;
  labelZh: string;
  descEn: string;
  descZh: string;
  icon: React.ReactNode;
  color: string;
}

// First-level category options
const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'RATIONAL',
    labelEn: "Rational Analysis",
    labelZh: "理性分析",
    descEn: "Scientific, Functional",
    descZh: "科学视角，功能性解释",
    icon: <Brain size={20} />,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    hasSubStyles: false
  },
  {
    id: 'PSYCHOLOGY',
    labelEn: "Psychological",
    labelZh: "心理视角",
    descEn: "Modern / Freud / Jung",
    descZh: "现代咨询 / 弗洛伊德 / 荣格",
    icon: <Feather size={20} />,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    hasSubStyles: true
  },
  {
    id: 'FOLK',
    labelEn: "Cultural Traditions",
    labelZh: "传统解梦",
    descEn: "5 Cultural Traditions",
    descZh: "中/希/犹/伊/佛",
    icon: <Sparkles size={20} />,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    hasSubStyles: true
  },
  {
    id: 'CREATIVE',
    labelEn: "Creative Inspiration",
    labelZh: "灵感创作",
    descEn: "Storytelling, Metaphors",
    descZh: "故事化，隐喻重构",
    icon: <Lightbulb size={20} />,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hasSubStyles: false
  }
];

// Psychology sub-styles
const PSYCHOLOGY_SUB_STYLES: SubStyleOption[] = [
  {
    id: AnalysisStyleId.PSY_INTEGRATIVE,
    labelEn: "Modern Counseling",
    labelZh: "现代咨询整合",
    descEn: "CBT, Emotional patterns",
    descZh: "认知行为，情绪模式",
    icon: <Feather size={20} />,
    color: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    id: AnalysisStyleId.PSY_FREUD,
    labelEn: "Freudian",
    labelZh: "精神分析（弗洛伊德）",
    descEn: "Conflict, Defense, Repression",
    descZh: "冲突、防御、压抑",
    icon: <Moon size={20} />,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100"
  },
  {
    id: AnalysisStyleId.PSY_JUNG,
    labelEn: "Jungian",
    labelZh: "分析心理学（荣格）",
    descEn: "Archetypes, Shadow, Compensation",
    descZh: "原型、阴影、补偿",
    icon: <Star size={20} />,
    color: "bg-violet-50 text-violet-600 border-violet-100"
  }
];

// Folk/Cultural sub-styles
const FOLK_SUB_STYLES: SubStyleOption[] = [
  {
    id: AnalysisStyleId.FOLK_CN,
    labelEn: "Chinese Folk",
    labelZh: "中国民俗/术数",
    descEn: "Zhou Gong, Symbols, Omens",
    descZh: "周公解梦，象意示警",
    icon: <Book size={20} />,
    color: "bg-red-50 text-red-600 border-red-100"
  },
  {
    id: AnalysisStyleId.FOLK_GREEK,
    labelEn: "Greek-Roman",
    labelZh: "古希腊罗马",
    descEn: "Artemidorus, Social roles",
    descZh: "亚特弥多洛斯，社会角色",
    icon: <Star size={20} />,
    color: "bg-amber-50 text-amber-600 border-amber-100"
  },
  {
    id: AnalysisStyleId.FOLK_JUDEO,
    labelEn: "Judeo-Christian",
    labelZh: "犹太-基督教",
    descEn: "Reflection, Guidance",
    descZh: "省察、劝诫",
    icon: <Cross size={20} />,
    color: "bg-sky-50 text-sky-600 border-sky-100"
  },
  {
    id: AnalysisStyleId.FOLK_ISLAM,
    labelEn: "Islamic",
    labelZh: "伊斯兰传统",
    descEn: "Dream classification",
    descZh: "真梦/自我梦/扰梦",
    icon: <Moon size={20} />,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100"
  },
  {
    id: AnalysisStyleId.FOLK_DHARMA,
    labelEn: "Buddhist/Hindu",
    labelZh: "印度/佛教",
    descEn: "Mind, Karma, Awareness",
    descZh: "心识、习气、觉照",
    icon: <Leaf size={20} />,
    color: "bg-orange-50 text-orange-600 border-orange-100"
  }
];

const StyleSelector: React.FC<StyleSelectorProps & { selectedStyleId?: AnalysisStyleId | null; selectedCategory: StyleCategory | null; onSelectCategory: (c: StyleCategory | null) => void }> = ({ onSelect, language, selectedStyleId, selectedCategory, onSelectCategory }) => {

  const handleCategoryClick = (category: CategoryOption) => {
    if (category.hasSubStyles) {
      onSelectCategory(category.id);
    } else {
      // Direct selection for categories without sub-styles
      if (category.id === 'RATIONAL') {
        onSelect(AnalysisStyleId.RATIONAL);
      } else if (category.id === 'CREATIVE') {
        onSelect(AnalysisStyleId.CREATIVE);
      }
    }
  };

  const handleSubStyleClick = (style: AnalysisStyleId) => {
    onSelect(style);
  };

  // Get sub-styles based on selected category
  const getSubStyles = (): SubStyleOption[] => {
    if (selectedCategory === 'PSYCHOLOGY') {
      return PSYCHOLOGY_SUB_STYLES;
    } else if (selectedCategory === 'FOLK') {
      return FOLK_SUB_STYLES;
    }
    return [];
  };

  // Render sub-styles view
  if (selectedCategory) {
    const subStyles = getSubStyles();

    return (
      <div className="w-full animate-fade-in-up">
        {/* Only Sub-style options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subStyles.map((option, index) => {
            const isSelected = selectedStyleId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSubStyleClick(option.id)}
                className={`flex items-center p-4 rounded-xl border text-left transition-all duration-300 group
                ${isSelected
                    ? "bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    : "bg-[#1A2133] border-white/5 hover:border-white/10 hover:bg-[#202940]"
                  }
              `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`p-2.5 rounded-lg mr-4 transition-colors ${isSelected ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-slate-400 group-hover:text-slate-300"}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-[15px] mb-0.5 ${isSelected ? "text-indigo-200" : "text-slate-200"}`}>
                    {language === 'en' ? option.labelEn : option.labelZh}
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                    {language === 'en' ? option.descEn : option.descZh}
                  </div>
                </div>
                {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]" />}
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  // Render main category view
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in-up">
      {CATEGORY_OPTIONS.map((option, index) => {
        let isActive = false;
        if (selectedStyleId === 'RATIONAL' && option.id === 'RATIONAL') isActive = true;
        else if (selectedStyleId === 'CREATIVE' && option.id === 'CREATIVE') isActive = true;

        return (
          <button
            key={option.id}
            onClick={() => handleCategoryClick(option)}
            className={`flex items-center p-4 rounded-xl border text-left transition-all duration-300 group relative overflow-hidden
            ${isActive
                ? "bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                : "bg-[#1A2133] border-white/5 hover:border-white/10 hover:bg-[#202940]"
              }
          `}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className={`p-2.5 rounded-lg mr-4 transition-colors ${isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-slate-400 group-hover:text-slate-300"}`}>
              {option.icon}
            </div>
            <div className="flex-1 z-10 relative">
              <div className={`font-medium text-[15px] mb-0.5 ${isActive ? "text-indigo-200" : "text-slate-200"}`}>
                {language === 'en' ? option.labelEn : option.labelZh}
              </div>
              <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                {language === 'en' ? option.descEn : option.descZh}
              </div>
            </div>
            {option.hasSubStyles && (
              <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                <ChevronRight size={18} />
              </div>
            )}
            {isActive && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]" />}
          </button>
        )
      })}
    </div>
  );
};

export default StyleSelector;