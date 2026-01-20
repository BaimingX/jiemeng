import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Cloud, CloudDownload, Loader2, Star, Moon } from 'lucide-react';
import { getConversationsForMonth, Conversation, getMessages, StoredMessage, getTodayId, restoreFromSupabase } from '../services/dreamDB';
import { Language } from '../types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface DreamMapPanelProps {
    language: Language;
    onSelectDate: (dateId: string) => void;
    onBack: () => void; // Kept for prop compatibility
}

const DreamMapPanel: React.FC<DreamMapPanelProps> = ({ language, onSelectDate }) => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [dreamDays, setDreamDays] = useState<Map<number, Conversation>>(new Map());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    // Preview state - simplified for compact view
    const [isRestoring, setIsRestoring] = useState(false);

    const todayId = getTodayId();
    const [todayYear, todayMonth, todayDay] = todayId.split('-').map(Number);

    useEffect(() => {
        const loadMonth = async () => {
            const conversations = await getConversationsForMonth(currentYear, currentMonth);
            setDreamDays(conversations);
        };
        loadMonth();
    }, [currentYear, currentMonth]);

    useEffect(() => {
        if (selectedDay !== null) {
            const conversation = dreamDays.get(selectedDay);
            setSelectedConversation(conversation || null);
        }
    }, [selectedDay, dreamDays]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay();

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

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const calendarDays: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    const isToday = (day: number) => currentYear === todayYear && currentMonth === todayMonth && day === todayDay;
    const hasDream = (day: number) => dreamDays.has(day);

    const handleRestore = async () => {
        if (!confirm(language === 'zh' ? '确定要从云端恢复数据吗？这将覆盖本地记录。' : 'Restore data from cloud? This will overwrite local records.')) return;
        setIsRestoring(true);
        try {
            await restoreFromSupabase();
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
        <div className="w-full flex justify-center py-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#131926]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-100">
                            <Moon size={16} className="text-indigo-300" />
                            <span className="text-base font-serif tracking-wide border-l border-white/10 pl-3">
                                {language === 'zh' ? `${currentMonth}月 ${currentYear}` : new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/5 p-0.5">
                            <button onClick={goToPreviousMonth} className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
                                <ChevronLeft size={14} />
                            </button>
                            <button onClick={goToNextMonth} className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Week Header */}
                    <div className="grid grid-cols-7 text-center">
                        {(language === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day, i) => (
                            <div key={i} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

                            const isDream = hasDream(day);
                            const todayIs = isToday(day);
                            const dateId = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                            return (
                                <button
                                    key={day}
                                    disabled={!isDream}
                                    onClick={() => isDream && onSelectDate(dateId)}
                                    className={cn(
                                        "aspect-square rounded-full flex flex-col items-center justify-center text-xs font-medium transition-all duration-300 relative group",
                                        isDream
                                            ? "text-indigo-100 hover:bg-white/5 cursor-pointer"
                                            : "text-slate-600 cursor-default",
                                        todayIs && "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                    )}
                                >
                                    <span>{day}</span>
                                    {isDream && !todayIs && (
                                        <div className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_4px_rgba(129,140,248,0.8)]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer / Restore */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                        <span className="text-[10px] text-slate-500">
                            {language === 'zh' ? '• 有梦记录' : '• Dream Logged'}
                        </span>
                        <button
                            onClick={handleRestore}
                            disabled={isRestoring}
                            className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 text-slate-500 hover:text-indigo-300 rounded text-[10px] transition-colors"
                        >
                            {isRestoring ? <Loader2 size={10} className="animate-spin" /> : <CloudDownload size={10} />}
                            <span>{language === 'zh' ? '同步' : 'Sync'}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DreamMapPanel;
