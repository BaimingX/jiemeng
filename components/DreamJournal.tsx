import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, ChevronLeft, ChevronRight, X, Book,
    MessageCircle, Image as ImageIcon, Search, BookOpen,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getConversationDates, getConversation, Conversation, formatDateForDisplay } from '../services/dreamDB';
import { Language } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Seo from './Seo';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DreamJournalProps {
    language: Language;
}

type ViewMode = 'SHELF' | 'READING';

interface MonthData {
    id: string; // "YYYY-MM"
    year: number;
    month: number; // 1-12
    dreams: Conversation[];
}

// Helper to check if a dream belongs to a specific date
const isDreamForDate = (dreamId: string, year: number, month: number, day: number) => {
    // ID format: YYYY-MM-DD or YYYY-MM-DD-N
    const prefix = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dreamId === prefix || dreamId.startsWith(prefix + '-');
};

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
};

const MONTH_COLORS = [
    'from-red-900 to-red-950',          // Jan
    'from-indigo-900 to-indigo-950',    // Feb
    'from-green-900 to-green-950',      // Mar
    'from-amber-900 to-amber-950',      // Apr
    'from-blue-900 to-blue-950',        // May (Sky -> Blue)
    'from-purple-900 to-purple-950',    // Jun
    'from-orange-900 to-orange-950',    // Jul
    'from-teal-900 to-teal-950',        // Aug
    'from-cyan-900 to-cyan-950',        // Sep
    'from-pink-900 to-pink-950',        // Oct
    'from-slate-800 to-slate-950',      // Nov
    'from-rose-900 to-rose-950',        // Dec
];

// --- Components ---

const BookshelfItem = ({
    monthData,
    onClick,
    isEn
}: {
    monthData: MonthData;
    onClick: () => void;
    isEn: boolean
}) => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const colorClass = MONTH_COLORS[monthData.month - 1] || MONTH_COLORS[0];

    return (
        <motion.div
            layoutId={`book-${monthData.id}`}
            onClick={onClick}
            className="group cursor-pointer flex flex-col items-center gap-6 relative"
            whileHover={{ y: -15, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* 3D Book Cover */}
            <div className="relative w-36 h-52 md:w-44 md:h-64 perspective-1000">
                <div className={cn(
                    "absolute inset-0 rounded-r-lg shadow-2xl transition-all duration-500",
                    "bg-gradient-to-br border-l-4 border-l-white/20",
                    colorClass,
                    "group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:rotate-y-[-15deg] group-hover:translate-x-2"
                )}>
                    {/* Texture overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-white/10" />

                    {/* Spine */}
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/20 to-transparent border-r border-black/20" />

                    {/* Cover Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mb-4 bg-black/10 backdrop-blur-sm">
                            <span className="text-2xl font-serif text-white/90">{monthData.month}</span>
                        </div>
                        <h3 className="text-white/90 font-serif tracking-widest uppercase text-sm mb-1">
                            {isEn ? monthNames[monthData.month - 1] : `${monthData.month}月`}
                        </h3>
                        <div className="h-px w-8 bg-white/30 my-2" />
                        <span className="text-white/50 font-mono text-xs">{monthData.year}</span>
                    </div>

                    {/* Badge */}
                    <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/70 font-mono border border-white/10">
                        {monthData.dreams.length} {isEn ? 'DREAMS' : '篇'}
                    </div>
                </div>

                {/* Book Pages Side View (Simulates thickness) */}
                <div className="absolute right-0 top-1 bottom-1 w-3 bg-[#fffdf5] rounded-r-sm transform translate-z-[-10px] translate-x-[2px] shadow-inner group-hover:translate-x-[12px] group-hover:rotate-y-[-15deg] transition-all duration-500 origin-left border-l border-slate-300 pattern-lines"></div>
            </div>

            {/* Shelf Shadow */}
            <div className="absolute -bottom-6 w-32 h-4 bg-black/40 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
};

// --- Book Reader Components ---

const DreamPageContent = ({
    dream,
    dateString,
    isEmpty,
    isEn,
    onNavigate,
    dayNumber
}: {
    dream?: Conversation;
    dateString: string;
    isEmpty?: boolean;
    isEn: boolean;
    onNavigate: (id: string) => void;
    dayNumber: number;
}) => {
    return (
        <div className="h-full flex flex-col animate-in fade-in duration-700 p-2 relative pb-16">
            {/* Header */}
            <div className="flex items-end justify-between mb-6 border-b-2 border-slate-100 pb-2">
                <div className="text-xs font-serif text-slate-400 tracking-widest uppercase">
                    {dateString}
                </div>
                <div className="text-4xl font-serif text-slate-200 font-bold -mb-1 opacity-50 select-none">
                    {dayNumber}
                </div>
            </div>

            {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                        <span className="text-4xl text-slate-200 font-serif font-italic">Empty</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-slate-400 font-serif italic text-sm">
                            {isEn ? "The pages are silent..." : "这一页静悄悄的..."}
                        </p>
                    </div>
                </div>
            ) : dream && (
                <>
                    {/* Image (Polaroid style) - Only if exists */}
                    {dream.imageUrl && (
                        <div className="mb-6 self-center transform rotate-1 transition-transform hover:rotate-0 duration-500 cursor-pointer group"
                            onClick={(e) => { e.stopPropagation(); onNavigate(dream.id); }}
                        >
                            <div className="bg-white p-3 pb-8 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-100 w-full max-w-[320px] group-hover:shadow-xl transition-all">
                                <img
                                    src={dream.imageUrl}
                                    alt="Dream"
                                    className="w-full aspect-[4/3] object-cover bg-slate-100 filter contrast-[1.05]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Text Content */}
                    <div className="flex-1 relative overflow-hidden">
                        {/* Lined paper background effect for text area */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,#e2e8f0_28px)] bg-[length:100%_28px] opacity-40 pointer-events-none" />

                        <p className="font-serif text-slate-700 leading-[28px] text-base md:text-lg whitespace-pre-wrap relative z-10 line-clamp-[12] md:line-clamp-[14]">
                            {dream.summary || (isEn ? "No text recorded." : "无文字记录")}
                        </p>
                    </div>

                    {/* Footer Button - Centered Absolute */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onNavigate(dream.id); }}
                            className="text-xs uppercase tracking-widest text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-2 transition-colors px-4 py-2 hover:bg-indigo-50 rounded-full"
                        >
                            {isEn ? 'View Analysis' : '查看解析'} <BookOpen size={14} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// --- Main Component ---

const DreamJournal: React.FC<DreamJournalProps> = ({ language }) => {
    const navigate = useNavigate();
    const isZh = language === 'zh';
    const seoTitle = isZh ? '梦境日记 | Oneiro AI' : 'Dream Journal | Oneiro AI';
    const seoDescription = isZh
        ? '管理与回顾你的梦境日记与解析记录。'
        : 'Manage and review your dream journal entries and analyses.';
    const isEn = language === 'en';

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('SHELF');
    const [allMonths, setAllMonths] = useState<MonthData[]>([]);

    // Book State
    const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    // Modified Default: true (All Days), with persistence
    const [showAllDays, setShowAllDays] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dream_journal_show_all_days');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem('dream_journal_show_all_days', JSON.stringify(showAllDays));
    }, [showAllDays]);

    // Load Data
    useEffect(() => {
        const loadDreams = async () => {
            setLoading(true);
            try {
                const dates = await getConversationDates();
                const loadedDreams: Conversation[] = [];
                for (const dateId of dates) {
                    const dream = await getConversation(dateId);
                    if (dream) loadedDreams.push(dream);
                }

                // Group by Month
                const groups: Record<string, MonthData> = {};

                loadedDreams.forEach(dream => {
                    const parts = dream.id.split('-');
                    const yyyy = parseInt(parts[0]);
                    const mm = parseInt(parts[1]);
                    const key = `${parts[0]}-${parts[1]}`;

                    if (!groups[key]) {
                        groups[key] = {
                            id: key,
                            year: yyyy,
                            month: mm,
                            dreams: []
                        };
                    }
                    groups[key].dreams.push(dream);
                });

                const sortedMonths = Object.values(groups).sort((a, b) => b.id.localeCompare(a.id));
                setAllMonths(sortedMonths);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadDreams();
    }, []);

    const handleOpenBook = (monthId: string) => {
        setSelectedMonthId(monthId);
        setViewMode('READING');
        // If opening current month, act smarter?
        // For now start at beginning (Page 0) or maybe Today?
        // Let's start at page 0 for simplicity of "Opening a book"
        setCurrentPageIndex(0);
    };

    const handleCloseBook = () => {
        setViewMode('SHELF');
        setSelectedMonthId(null);
    };

    // Calculate Book Pages
    const pages = useMemo(() => {
        if (!selectedMonthId) return [];
        const monthData = allMonths.find(m => m.id === selectedMonthId);
        if (!monthData) return [];

        const generatedPages: { type: 'dream' | 'empty', data?: Conversation, dateStr: string, day: number }[] = [];

        if (showAllDays) {
            const daysInMonth = getDaysInMonth(monthData.year, monthData.month);
            for (let d = 1; d <= daysInMonth; d++) {
                const dreamsForDay = monthData.dreams.filter(dream =>
                    isDreamForDate(dream.id, monthData.year, monthData.month, d)
                );
                dreamsForDay.sort((a, b) => a.id.localeCompare(b.id));

                if (dreamsForDay.length > 0) {
                    dreamsForDay.forEach(dream => {
                        generatedPages.push({
                            type: 'dream',
                            data: dream,
                            dateStr: formatDateForDisplay(dream.id.split('-').slice(0, 3).join('-'), language),
                            day: d
                        });
                    });
                } else {
                    const dateId = `${monthData.year}-${String(monthData.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    generatedPages.push({
                        type: 'empty',
                        dateStr: formatDateForDisplay(dateId, language),
                        day: d
                    });
                }
            }
        } else {
            const storedDreams = [...monthData.dreams].sort((a, b) => a.id.localeCompare(b.id));
            storedDreams.forEach(dream => {
                const parts = dream.id.split('-');
                const d = parseInt(parts[2]);
                generatedPages.push({
                    type: 'dream',
                    data: dream,
                    dateStr: formatDateForDisplay(parts.slice(0, 3).join('-'), language),
                    day: d
                });
            });
        }

        return generatedPages;
    }, [selectedMonthId, showAllDays, allMonths, language]);

    // Navigation Logic
    const handleNextPage = () => {
        const increment = window.innerWidth >= 768 ? 2 : 1;
        if (currentPageIndex + increment < pages.length) {
            setCurrentPageIndex(prev => prev + increment);
        } else if (currentPageIndex + 1 < pages.length && increment === 2) {
            setCurrentPageIndex(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        const decrement = window.innerWidth >= 768 ? 2 : 1;
        if (currentPageIndex >= decrement) {
            setCurrentPageIndex(prev => prev - decrement);
        } else {
            setCurrentPageIndex(0);
        }
    };

    const leftPage = pages[currentPageIndex];
    // On desktop, right page is index + 1.
    // If we are on the very last item and it's odd, right page might be undefined.
    const rightPage = pages[currentPageIndex + 1];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-indigo-200/50 animate-pulse">
                <Book className="w-8 h-8 mr-2" />
                {isEn ? 'Retrieving Archives...' : '正在调取档案...'}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 min-h-[90vh] flex flex-col">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/journal"
                lang={language}
                noIndex={true}
            />

            {/* Top Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6 pb-4 border-b border-indigo-500/10"
            >
                <div className="flex items-center gap-4">
                    {viewMode === 'READING' && (
                        <button
                            onClick={handleCloseBook}
                            className="group flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-all border border-indigo-500/20"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif text-indigo-100 flex items-center gap-3 tracking-wide">
                            {viewMode === 'SHELF' ? (isEn ? 'Dream Library' : '梦境档案馆') : (isEn ? 'Reading' : '查阅中')}
                        </h1>
                        <p className="text-indigo-400/50 text-xs md:text-sm mt-1 font-light tracking-wider uppercase">
                            {viewMode === 'SHELF'
                                ? (isEn ? 'Select a volume to open' : '选择一卷笔记以开启')
                                : (isEn ? 'Flipping through time' : '翻阅时光')
                            }
                        </p>
                    </div>
                </div>

                {viewMode === 'READING' && (
                    <div className="flex items-center bg-[#0B0F19] rounded-lg p-1 border border-indigo-500/20 shadow-inner">
                        <button
                            onClick={() => { setShowAllDays(true); setCurrentPageIndex(0); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all",
                                showAllDays ? "bg-indigo-900/50 text-indigo-200 shadow-sm" : "text-indigo-500/50 hover:text-indigo-400"
                            )}
                        >
                            <Calendar size={14} />
                            {isEn ? 'Calendar' : '日历视图'}
                        </button>
                        <button
                            onClick={() => { setShowAllDays(false); setCurrentPageIndex(0); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all",
                                !showAllDays ? "bg-indigo-900/50 text-indigo-200 shadow-sm" : "text-indigo-500/50 hover:text-indigo-400"
                            )}
                        >
                            <Filter size={14} />
                            {isEn ? 'Entries Only' : '仅看记录'}
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Viewport */}
            <div className="flex-1 relative perspective-2000 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {viewMode === 'SHELF' ? (
                        <motion.div
                            key="shelf"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4 }}
                            className="bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#1a1110] rounded-xl shadow-2xl overflow-hidden min-h-[600px] border border-[#3a2e2c] relative"
                        >
                            {/* Inner Shelf Lighting */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40 pointer-events-none" />

                            <div className="relative z-10 p-12 md:p-16 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-y-20 gap-x-12 place-items-center">
                                {allMonths.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center text-white/20 py-20">
                                        <Book size={64} strokeWidth={1} />
                                        <p className="mt-4 font-serif text-lg">{isEn ? 'Your library is empty.' : '档案馆空空如也。'}</p>
                                    </div>
                                ) : (
                                    allMonths.map((month, idx) => (
                                        <BookshelfItem
                                            key={month.id}
                                            monthData={month}
                                            onClick={() => handleOpenBook(month.id)}
                                            isEn={isEn}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Shelf Highlights (Visual horizontal lines) */}
                            <div className="absolute top-[340px] left-0 right-0 h-4 bg-gradient-to-b from-black/50 to-transparent border-t border-[#4a3e3c]" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="book"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="flex flex-col items-center justify-center h-full relative py-4"
                        >
                            {/* Table/Desk Surface */}
                            <div className="absolute inset-x-[-50vw] inset-y-[-50vh] bg-[#0f121d] -z-10" />

                            {/* Book Container - ENLARGED */}
                            <div className="relative w-full max-w-7xl aspect-[1.4/1] md:aspect-[1.55/1] xl:aspect-[1.7/1]">
                                {/* Back Cover (Leather) */}
                                <div className="absolute inset-0 bg-[#2c1810] rounded-md md:rounded-xl transform translate-y-2 shadow-2xl" />
                                <div className="absolute -inset-3 bg-[#1a0f0a] rounded-xl -z-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/5" />

                                {/* Pages Container */}
                                <div className="absolute inset-[3px] md:inset-[6px] flex bg-[#fdfbf6] rounded-md overflow-hidden">

                                    {/* Left Page */}
                                    <div className="hidden md:block w-1/2 h-full relative border-r border-slate-200/50 bg-[#fffdf5]">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 pointer-events-none" />
                                        <div className="absolute inset-0 p-8 md:p-12 lg:p-14">
                                            {leftPage ? (
                                                <DreamPageContent
                                                    dream={leftPage.data}
                                                    dateString={leftPage.dateStr}
                                                    isEmpty={leftPage.type === 'empty'}
                                                    isEn={isEn}
                                                    onNavigate={(id) => navigate(`/?date=${id}`)}
                                                    dayNumber={leftPage.day}
                                                />
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-slate-200 text-sm tracking-widest uppercase">Start of Volume</div>
                                            )}
                                            {/* Page Num */}
                                            <div className="absolute bottom-6 left-8 text-[10px] text-slate-400 font-mono">
                                                {currentPageIndex + 1}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Page */}
                                    <div className="w-full md:w-1/2 h-full relative bg-[#fffdf5]">
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/5 pointer-events-none" />

                                        <div className="absolute inset-0 p-8 md:p-12 lg:p-14">
                                            {/* Logic Switch for Mobile vs Desktop rendering */}
                                            <div className="md:hidden h-full">
                                                {pages[currentPageIndex] ? (
                                                    <DreamPageContent
                                                        dream={pages[currentPageIndex].data}
                                                        dateString={pages[currentPageIndex].dateStr}
                                                        isEmpty={pages[currentPageIndex].type === 'empty'}
                                                        isEn={isEn}
                                                        onNavigate={(id) => navigate(`/?date=${id}`)}
                                                        dayNumber={pages[currentPageIndex].day}
                                                    />
                                                ) : (
                                                    <div className="h-full flex items-center justify-center opacity-50">End</div>
                                                )}
                                                <div className="absolute bottom-6 right-8 text-[10px] text-slate-400 font-mono">
                                                    {currentPageIndex + 1}
                                                </div>
                                            </div>

                                            <div className="hidden md:block h-full">
                                                {rightPage ? (
                                                    <DreamPageContent
                                                        dream={rightPage.data}
                                                        dateString={rightPage.dateStr}
                                                        isEmpty={rightPage.type === 'empty'}
                                                        isEn={isEn}
                                                        onNavigate={(id) => navigate(`/?date=${id}`)}
                                                        dayNumber={rightPage.day}
                                                    />
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-slate-200 text-sm tracking-widest uppercase">End of Volume</div>
                                                )}
                                                <div className="absolute bottom-6 right-8 text-[10px] text-slate-400 font-mono">
                                                    {currentPageIndex + 2}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Binding visual */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none hidden md:block" />
                                </div>

                                {/* Prev Button */}
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPageIndex === 0}
                                    className="absolute -left-12 md:-20 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all disabled:opacity-0 z-20"
                                >
                                    <ChevronLeft size={40} />
                                </button>
                                {/* Next Button */}
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPageIndex + (window.innerWidth >= 768 ? 2 : 1) >= pages.length}
                                    className="absolute -right-12 md:-20 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all disabled:opacity-0 z-20"
                                >
                                    <ChevronRight size={40} />
                                </button>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DreamJournal;
