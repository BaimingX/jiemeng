import React, { useState, useEffect } from 'react';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getConversationDates, getConversation, Conversation, formatDateForDisplay } from '../services/dreamDB';
import { Language } from '../types';

interface DreamGalleryProps {
    language: Language;
}

const DreamGallery: React.FC<DreamGalleryProps> = ({ language }) => {
    const navigate = useNavigate();
    const [dreams, setDreams] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDreams = async () => {
            setLoading(true);
            try {
                const dates = await getConversationDates();
                const loadedDreams: Conversation[] = [];

                // Load details for each date
                // Optimize: Parallelize if needed, but sequential is fine for IndexedDB
                for (const dateId of dates) {
                    const dream = await getConversation(dateId);
                    // Filter for dreams that actually have content to show
                    if (dream && (dream.imageUrl || dream.summary)) {
                        loadedDreams.push(dream);
                    }
                }
                setDreams(loadedDreams);
            } catch (error) {
                console.error("Failed to load dreams for gallery", error);
            } finally {
                setLoading(false);
            }
        };

        loadDreams();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-y-auto custom-scrollbar">
            {/* Navigation / Header - Floating minimalist */}
            {/* Navigation / Header - Floating minimalist - No Back Button */}
            <div className="sticky top-0 z-50 px-6 py-6 md:px-12 md:py-8 flex justify-center items-center bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent pointer-events-none">
                <h1 className="text-sm font-medium tracking-[0.3em] text-white/40 uppercase select-none relative z-10">
                    {language === 'zh' ? '· 梦境图廊 ·' : '· SILENT REVERIE ·'}
                </h1>
            </div>

            {/* Main Canvas */}
            <main className="px-6 md:px-12 pb-20 max-w-[1600px] mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-[60vh]">
                        <div className="w-12 h-12 border-t-2 border-white/20 rounded-full animate-spin"></div>
                    </div>
                ) : dreams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-white/20">
                        <ImageIcon size={64} className="mb-6 opacity-20" />
                        <p className="text-sm font-light tracking-widest uppercase">
                            {language === 'zh' ? '空无一物' : 'THE VOID IS EMPTY'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                        {dreams.map((dream) => (
                            <div
                                key={dream.id}
                                className="group relative flex flex-col gap-4 cursor-pointer"
                                onClick={() => navigate(`/?date=${dream.id}`)}
                            >
                                {/* Image Container - The "Artifact" */}
                                <div className="aspect-[3/4] overflow-hidden bg-[#111] relative shadow-2xl transition-all duration-700 ease-out group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                    {dream.imageUrl ? (
                                        <img
                                            src={dream.imageUrl}
                                            alt="Dream Artifact"
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                                            <div className="w-1 h-1 bg-white/20 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"></div>
                                        </div>
                                    )}

                                    {/* Subtle Overlay on Hover */}
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 pointer-events-none" />
                                </div>

                                {/* Metadata - Minimalist text below */}
                                <div className="flex flex-col gap-1 px-1">
                                    <span className="text-[10px] tracking-widest text-white/30 uppercase font-medium">
                                        {formatDateForDisplay(dream.id, language === 'zh' ? 'en' : 'en')} {/* Force EN date for aesthetics or keep consistent? Let's use clean format. */}
                                    </span>
                                    <h3 className="text-xs md:text-sm text-white/70 font-light leading-relaxed line-clamp-2 group-hover:text-white transition-colors duration-500">
                                        {dream.summary || (language === 'zh' ? '无题' : 'Untitled')}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #050505;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #222;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #333;
                }
            `}</style>
        </div>
    );
};

export default DreamGallery;
