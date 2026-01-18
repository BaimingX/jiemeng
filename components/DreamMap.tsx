import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Cloud, CloudDownload, Loader2 } from 'lucide-react';
import { getConversationsForMonth, Conversation, getMessages, StoredMessage, getTodayId, restoreFromSupabase } from '../services/dreamDB';
import { Language } from '../types';

interface DreamMapPanelProps {
    language: Language;
    onSelectDate: (dateId: string) => void;
    onBack: () => void;
}

const DreamMapPanel: React.FC<DreamMapPanelProps> = ({ language, onSelectDate, onBack }) => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [dreamDays, setDreamDays] = useState<Map<number, Conversation>>(new Map());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [previewMessages, setPreviewMessages] = useState<StoredMessage[]>([]);

    const todayId = getTodayId();
    const [todayYear, todayMonth, todayDay] = todayId.split('-').map(Number);
    const [isRestoring, setIsRestoring] = useState(false);

    // Load conversations for current month
    useEffect(() => {
        const loadMonth = async () => {
            const conversations = await getConversationsForMonth(currentYear, currentMonth);
            setDreamDays(conversations);
        };
        loadMonth();
    }, [currentYear, currentMonth]);

    // Load preview when day is selected
    useEffect(() => {
        if (selectedDay !== null) {
            const dateId = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            const conversation = dreamDays.get(selectedDay);
            setSelectedConversation(conversation || null);

            if (conversation) {
                getMessages(dateId).then(messages => {
                    const userMessages = messages.filter(m => m.sender === 'user').slice(0, 2);
                    setPreviewMessages(userMessages);
                });
            } else {
                setPreviewMessages([]);
            }
        }
    }, [selectedDay, dreamDays, currentYear, currentMonth]);

    const monthNames = language === 'zh'
        ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const weekDays = language === 'zh'
        ? ['日', '一', '二', '三', '四', '五', '六']
        : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month - 1, 1).getDay();
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setSelectedDay(null);
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setSelectedDay(null);
    };

    const handleDayClick = (day: number) => {
        setSelectedDay(day);
    };

    const handleViewConversation = () => {
        if (selectedDay !== null) {
            const dateId = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            onSelectDate(dateId);
        }
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const isToday = (day: number) => {
        return currentYear === todayYear && currentMonth === todayMonth && day === todayDay;
    };

    const hasDream = (day: number) => {
        return dreamDays.has(day);
    };

    const handleRestore = async () => {
        if (!confirm(language === 'zh' ? '确定要从云端恢复数据吗？这将覆盖本地记录。' : 'Restore data from cloud? This will overwrite local records.')) return;
        setIsRestoring(true);
        try {
            await restoreFromSupabase();
            // Reload current month data
            const conversations = await getConversationsForMonth(currentYear, currentMonth);
            setDreamDays(conversations);
            alert(language === 'zh' ? '恢复成功' : 'Restore Successful');
        } catch (e) {
            console.error(e);
            alert(language === 'zh' ? '恢复失败，请确保已登录' : 'Restore failed. Please check login.');
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"
            >
                <ChevronLeft size={16} />
                <span>{language === 'zh' ? '返回菜单' : 'Back'}</span>
            </button>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={goToPreviousMonth} className="p-1 text-gray-400 hover:text-white rounded">
                    <ChevronLeft size={16} />
                </button>
                <h3 className="text-sm font-medium text-white">
                    {monthNames[currentMonth - 1]} {currentYear}
                </h3>
                <button onClick={goToNextMonth} className="p-1 text-gray-400 hover:text-white rounded">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Restore Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-[10px] transition-colors"
                >
                    {isRestoring ? <Loader2 size={12} className="animate-spin" /> : <CloudDownload size={12} />}
                    <span>{language === 'zh' ? '同步云端数据' : 'Sync from Cloud'}</span>
                </button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {weekDays.map((day, index) => (
                    <div key={index} className="text-center text-[10px] text-gray-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid - compact */}
            <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, index) => (
                    <div key={index} className="aspect-square">
                        {day !== null && (
                            <button
                                onClick={() => handleDayClick(day)}
                                className={`w-full h-full flex flex-col items-center justify-center rounded-md transition-all relative text-xs
                  ${isToday(day) ? 'bg-blue-500 text-white' : ''}
                  ${selectedDay === day && !isToday(day) ? 'bg-white/20' : ''}
                  ${!isToday(day) && selectedDay !== day ? 'hover:bg-white/10 text-gray-300' : ''}
                `}
                            >
                                <span>{day}</span>
                                {hasDream(day) && (
                                    <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isToday(day) ? 'bg-white' : 'bg-blue-400'}`}
                                        style={{ boxShadow: isToday(day) ? 'none' : '0 0 3px rgba(59, 130, 246, 0.6)' }}
                                    />
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Selected Day Summary */}
            {selectedDay !== null && (
                <div className="mt-4 flex-1 overflow-y-auto">
                    {selectedConversation ? (
                        <button
                            onClick={handleViewConversation}
                            className="w-full bg-white/5 rounded-lg p-3 text-left hover:bg-white/10 transition-colors border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-blue-400">
                                    {language === 'zh' ? '梦境记录' : 'Dream Log'}
                                </span>
                            </div>
                            <p className="text-xs text-white line-clamp-2">
                                {selectedConversation.summary || previewMessages[0]?.text.slice(0, 60) + '...' || (language === 'zh' ? '点击查看' : 'Click to view')}
                            </p>
                            <p className="text-[10px] text-blue-400 mt-2">
                                {language === 'zh' ? '查看 →' : 'View →'}
                            </p>
                        </button>
                    ) : (
                        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                            <p className="text-xs text-gray-500">
                                {language === 'zh' ? '这一天没有记录' : 'No record'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DreamMapPanel;
