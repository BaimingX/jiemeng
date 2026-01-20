import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageCircle, ChevronRight, Search, Image as ImageIcon } from 'lucide-react';
import { getConversationDates, getConversation, Conversation, formatDateForDisplay } from '../services/dreamDB';
import { Language } from '../types';

interface DreamJournalProps {
    language: Language;
}

const DreamJournal: React.FC<DreamJournalProps> = ({ language }) => {
    const navigate = useNavigate();
    const [dreams, setDreams] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const isEn = language === 'en';

    useEffect(() => {
        const loadDreams = async () => {
            setLoading(true);
            try {
                const dates = await getConversationDates();
                const loadedDreams: Conversation[] = [];

                for (const dateId of dates) {
                    const dream = await getConversation(dateId);
                    if (dream) {
                        loadedDreams.push(dream);
                    }
                }
                //Sort by date info descending (id is date string YYYY-MM-DD usually, or timestamp for new ones)
                // Actually ID format varies in this codebase (YYYY-MM-DD or timestamp).
                // Let's sort by ID descending which is roughly chronological.
                loadedDreams.sort((a, b) => b.id.localeCompare(a.id));

                setDreams(loadedDreams);
            } catch (error) {
                console.error("Failed to load dreams", error);
            } finally {
                setLoading(false);
            }
        };
        loadDreams();
    }, []);

    const filteredDreams = dreams.filter(d =>
        (d.summary?.toLowerCase().includes(filter.toLowerCase())) ||
        (d.id.includes(filter))
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-indigo-100 mb-2">
                        {isEn ? 'Dream Journal' : '梦境日记'}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {isEn ? 'A chronicle of your subconscious wanderings.' : '潜意识漫游的编年史。'}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder={isEn ? "Search your dreams..." : "搜索你的梦境..."}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:border-indigo-500/50 outline-none transition-all"
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">{isEn ? 'Loading...' : '加载中...'}</div>
                ) : filteredDreams.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white/5 rounded-2xl border border-white/5">
                        <p>{isEn ? 'No journal entries found.' : '暂无日记记录。'}</p>
                    </div>
                ) : (
                    filteredDreams.map((dream) => (
                        <div
                            key={dream.id}
                            onClick={() => navigate(`/?date=${dream.id}`)}
                            className="group bg-[#131926]/60 hover:bg-[#1A2133] border border-white/5 hover:border-indigo-500/20 rounded-xl p-5 cursor-pointer transition-all duration-300 flex items-start gap-4"
                        >
                            {/* Date Box */}
                            <div className="flex-none w-16 h-16 bg-white/5 rounded-lg flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-300 transition-colors">
                                <Calendar size={20} className="mb-1" />
                                <span className="text-[10px] font-mono">{formatDateForDisplay(dream.id, 'en').split(',')[0]}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-base font-medium text-slate-200 group-hover:text-white truncate pr-4">
                                        {dream.summary || (isEn ? 'Untitled Dream' : '无题梦境')}
                                    </h3>
                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                    {dream.summary || (isEn ? 'No analysis summary available.' : '暂无解析摘要。')}
                                </p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <MessageCircle size={12} />
                                        {isEn ? 'Analysis' : '已解析'}
                                    </span>
                                    {dream.imageUrl && (
                                        <span className="flex items-center gap-1 text-indigo-400/80">
                                            <ImageIcon size={12} />
                                            {isEn ? 'Visualized' : '已绘图'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DreamJournal;
