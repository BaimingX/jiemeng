import React from 'react';
import { 
  BookOpen, 
  Moon, 
  Activity, 
  Settings, 
  Map as MapIcon, 
  Feather,
  Eye,
  X,
  Globe
} from 'lucide-react';
import { Language } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, language, onToggleLanguage }) => {
  const isEn = language === 'en';

  const translations = {
    discovery: isEn ? "Discovery" : "探索",
    journal: isEn ? "Dream Journal" : "梦境日记",
    trends: isEn ? "Weekly Trends" : "每周趋势",
    map: isEn ? "Dream Map" : "梦境地图",
    dictionary: isEn ? "Symbol Dictionary" : "象征词典",
    visual: isEn ? "Visual Restoration" : "视觉还原",
    poetry: isEn ? "Poetry Mode" : "诗意模式",
    settings: isEn ? "Settings" : "设置",
    dreamer: isEn ? "Dreamer" : "造梦者",
    profile: isEn ? "Gen-Z / Explorer" : "Z世代 / 探索者"
  };

  const menuItems = [
    { icon: <Moon size={20} />, label: translations.journal, active: true },
    { icon: <Activity size={20} />, label: translations.trends },
    { icon: <MapIcon size={20} />, label: translations.map },
    { icon: <BookOpen size={20} />, label: translations.dictionary },
    { icon: <Eye size={20} />, label: translations.visual },
    { icon: <Feather size={20} />, label: translations.poetry },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-[#1C1C1E] text-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Dream Decoder</h2>
              <p className="text-xs text-gray-400 mt-1">v2.0.2</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X size={20} className="text-gray-300" />
            </button>
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center space-x-3 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              Z
            </div>
            <div>
              <p className="text-sm font-semibold">{translations.dreamer}</p>
              <p className="text-xs text-gray-400">{translations.profile}</p>
            </div>
          </div>

          {/* Functional Map (Menu) */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">{translations.discovery}</p>
            {menuItems.map((item, index) => (
              <button 
                key={index}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${item.active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <button className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors text-sm">
              <Settings size={18} />
              <span>{translations.settings}</span>
            </button>
            
            <button 
              onClick={onToggleLanguage}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium text-gray-300"
            >
              <Globe size={14} />
              <span>{isEn ? 'EN' : '中文'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;