import React, { useState, useEffect } from 'react';
import {
  Moon,
  Image as ImageIcon,
  Settings,
  Map as MapIcon,
  BookOpen,
  Feather,
  Eye,
  X,
  Globe,
  MessageCircle,
  Calendar,
  LogOut
} from 'lucide-react';
import { Language } from '../types';
import { getConversationDates, formatDateForDisplay, getTodayId } from '../services/dreamDB';
import DreamMapPanel from './DreamMap';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

// Simple profile interface if specific one not available
interface SidebarProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  credits_balance: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onSelectConversation?: (dateId: string) => void;
  currentConversationId?: string;
  user?: User | null;
  profile?: SidebarProfile | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

type SidebarView = 'menu' | 'dreammap' | 'gallery';

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
  onSelectConversation,
  currentConversationId,
  user,
  profile,
  onOpenLogin,
  onLogout
}) => {
  const isEn = language === 'en';
  const [conversationDates, setConversationDates] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<SidebarView>('menu');
  const todayId = getTodayId();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      getConversationDates().then(dates => {
        setConversationDates(dates);
      });
      // Reset to menu view when opening
      setCurrentView('menu');
    }
  }, [isOpen]);

  const translations = {
    discovery: isEn ? "Discovery" : "探索",
    journal: isEn ? "Dream Journal" : "梦境日记",
    gallery: isEn ? "Dream Gallery" : "梦境图廊",
    map: isEn ? "Dream Map" : "梦境地图",
    dictionary: isEn ? "Symbol Dictionary" : "象征词典",
    visual: isEn ? "Visual Restoration" : "视觉还原",
    poetry: isEn ? "Poetry Mode" : "诗意模式",
    settings: isEn ? "Settings" : "设置",
    dreamer: isEn ? "Dreamer" : "造梦者",
    profile: isEn ? "Gen-Z / Explorer" : "Z世代 / 探索者",
    history: isEn ? "History" : "历史记录",
    newDream: isEn ? "Today's Dream" : "今日梦境"
  };

  const menuItems = [
    {
      icon: <Moon size={20} />,
      label: translations.journal,
      active: true,
      onClick: () => {
        onSelectConversation?.(todayId);
        onClose();
      }
    },
    {
      icon: <ImageIcon size={20} />,
      label: translations.gallery,
      onClick: () => {
        navigate('/gallery');
        onClose();
      }
    },
    {
      icon: <MapIcon size={20} />,
      label: translations.map,
      onClick: () => setCurrentView('dreammap')
    },
    { icon: <BookOpen size={20} />, label: translations.dictionary },
    { icon: <Eye size={20} />, label: translations.visual },
    { icon: <Feather size={20} />, label: translations.poetry },
  ];

  const handleSubViewSelectDate = (dateId: string) => {
    onSelectConversation?.(dateId);
    onClose();
  };

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Dream Decoder</h2>
              <p className="text-xs text-gray-400 mt-1">v2.1.0</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X size={20} className="text-gray-300" />
            </button>
          </div>

          {currentView === 'menu' ? (
            <>
              {/* User Profile Summary */}
              {user ? (
                <div className="flex items-center space-x-3 mb-6 p-3 bg-white/5 rounded-xl border border-white/5 relative group">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold uppercase">
                      {(profile?.display_name || user.email || 'U').charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{profile?.display_name || 'Dreamer'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title={language === 'en' ? 'Log out' : '退出登录'}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="w-full flex items-center justify-center space-x-2 mb-6 p-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
                >
                  <span className="text-sm font-bold">{isEn ? 'Log In / Sign Up' : '登录 / 注册'}</span>
                </button>
              )}

              {/* Main Menu */}
              <div className="space-y-1 mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">{translations.discovery}</p>
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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

              {/* Conversation History */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-2">
                  <Calendar size={12} />
                  {translations.history}
                </p>
                <div className="space-y-1">
                  {conversationDates.length === 0 ? (
                    <p className="text-xs text-gray-500 px-3 py-2">
                      {isEn ? 'No dream records yet' : '还没有梦境记录'}
                    </p>
                  ) : (
                    conversationDates.map((dateId) => (
                      <button
                        key={dateId}
                        onClick={() => {
                          onSelectConversation?.(dateId);
                          onClose();
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                          ${currentConversationId === dateId
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                          }`}
                      >
                        <MessageCircle size={16} />
                        <span>{formatDateForDisplay(dateId, language)}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : currentView === 'dreammap' ? (
            <div className="flex-1 overflow-hidden">
              <DreamMapPanel
                language={language}
                onSelectDate={handleSubViewSelectDate}
                onBack={() => setCurrentView('menu')}
              />
            </div>
          ) : null}

          {/* Bottom Actions */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
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