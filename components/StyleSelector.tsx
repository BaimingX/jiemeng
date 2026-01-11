import React, { useState } from 'react';
import { Brain, Sparkles, Feather, Lightbulb, ChevronLeft, Book, Moon, Star, Leaf, Cross } from 'lucide-react';
import { Language, AnalysisStyleId, StyleCategory } from '../types';

interface StyleSelectorProps {
  onSelect: (style: AnalysisStyleId) => void;
  language: Language;
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

const StyleSelector: React.FC<StyleSelectorProps> = ({ onSelect, language }) => {
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory | null>(null);

  const handleCategoryClick = (category: CategoryOption) => {
    if (category.hasSubStyles) {
      setSelectedCategory(category.id);
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

  const handleBack = () => {
    setSelectedCategory(null);
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
    const categoryLabel = selectedCategory === 'PSYCHOLOGY'
      ? (language === 'en' ? 'Psychology' : '心理视角')
      : (language === 'en' ? 'Cultural Traditions' : '传统解梦');

    return (
      <div className="w-full max-w-[90%] md:max-w-[75%] ml-4 mt-2 mb-4 animate-fade-in-up">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-3 text-sm"
        >
          <ChevronLeft size={18} />
          <span>{language === 'en' ? 'Back' : '返回'}</span>
        </button>

        {/* Category title */}
        <div className="text-sm font-medium text-gray-600 mb-2">
          {language === 'en' ? `Choose ${categoryLabel} style:` : `选择${categoryLabel}风格：`}
        </div>

        {/* Sub-style options */}
        <div className="grid grid-cols-1 gap-2">
          {subStyles.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleSubStyleClick(option.id)}
              className="flex items-center p-3 rounded-xl border text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] bg-white border-gray-100 hover:border-gray-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2 rounded-lg mr-3 ${option.color}`}>
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
      </div>
    );
  }

  // Render main category view
  return (
    <div className="w-full max-w-[90%] md:max-w-[75%] ml-4 mt-2 mb-4 grid grid-cols-1 gap-2 animate-fade-in-up">
      {CATEGORY_OPTIONS.map((option, index) => (
        <button
          key={option.id}
          onClick={() => handleCategoryClick(option)}
          className="flex items-center p-3 rounded-xl border text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] bg-white border-gray-100 hover:border-gray-200"
          style={{ animationDelay: `${index * 75}ms` }}
        >
          <div className={`p-2 rounded-lg mr-3 ${option.color}`}>
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
          {option.hasSubStyles && (
            <div className="text-gray-400">
              <ChevronLeft size={18} className="rotate-180" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;