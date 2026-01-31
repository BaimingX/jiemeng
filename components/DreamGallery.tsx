import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Heart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';
import Seo from './Seo';
import { useAuth } from '../context/AuthContext';

interface DreamGalleryProps {
    language: Language;
}

interface PublicDream {
    id: string;
    permanentUrl: string;
    createdAt: string;
    likeCount: number;
    isLiked: boolean;
}

const DreamGallery: React.FC<DreamGalleryProps> = ({ language }) => {
    const { user } = useAuth();
    const [publicDreams, setPublicDreams] = useState<PublicDream[]>([]);
    const [loading, setLoading] = useState(true);

    const isZh = language === 'zh';

    useEffect(() => {
        const loadDreams = async () => {
            setLoading(true);
            try {
                // Fetch public images with like counts
                // Note: This requires the dream_likes table and foreign key setup.
                // We use a safe check assuming the table might not exist yet during dev.
                const { data: imagesData, error: imagesError } = await supabase
                    .from('dream_images')
                    .select(`
                        id, 
                        permanent_url, 
                        created_at,
                        dream_likes (count)
                    `)
                    .eq('is_public', true)
                    .order('created_at', { ascending: false });

                if (imagesError) {
                    console.error("Error fetching images, maybe migration needed:", imagesError);
                    // Fallback to just images if the join fails (e.g. table missing)
                    const { data: simpleImages } = await supabase
                        .from('dream_images')
                        .select('id, permanent_url, created_at')
                        .eq('is_public', true)
                        .order('created_at', { ascending: false });

                    if (simpleImages) {
                        setPublicDreams(simpleImages.map(item => ({
                            id: item.id,
                            permanentUrl: item.permanent_url,
                            createdAt: item.created_at,
                            likeCount: 0,
                            isLiked: false
                        })));
                    }
                    setLoading(false);
                    return;
                }

                let myLikesSet = new Set<string>();
                if (user) {
                    const { data: myLikesData } = await supabase
                        .from('dream_likes')
                        .select('dream_id')
                        .eq('user_id', user.id);

                    if (myLikesData) {
                        myLikesData.forEach(like => myLikesSet.add(like.dream_id));
                    }
                }

                const mappedDreams: PublicDream[] = (imagesData || [])
                    .filter(item => item.permanent_url)
                    .map(item => ({
                        id: item.id,
                        permanentUrl: item.permanent_url,
                        createdAt: item.created_at,
                        // @ts-ignore - Supabase types join result
                        likeCount: item.dream_likes ? item.dream_likes[0]?.count || 0 : 0,
                        isLiked: myLikesSet.has(item.id)
                    }));

                setPublicDreams(mappedDreams);
            } catch (error) {
                console.error("Failed to load public dreams", error);
            } finally {
                setLoading(false);
            }
        };

        loadDreams();
    }, [user]);

    const handleLike = async (dreamId: string, currentIsLiked: boolean) => {
        if (!user) {
            alert(isZh ? '请先登录' : 'Please login to like');
            return;
        }

        // Optimistic update
        setPublicDreams(prev => prev.map(dream => {
            if (dream.id === dreamId) {
                return {
                    ...dream,
                    isLiked: !currentIsLiked,
                    likeCount: currentIsLiked ? Math.max(0, dream.likeCount - 1) : dream.likeCount + 1
                };
            }
            return dream;
        }));

        try {
            if (currentIsLiked) {
                // Unlike
                const { error } = await supabase
                    .from('dream_likes')
                    .delete()
                    .eq('dream_id', dreamId)
                    .eq('user_id', user.id);
                if (error) throw error;
            } else {
                // Like
                const { error } = await supabase
                    .from('dream_likes')
                    .insert({ dream_id: dreamId, user_id: user.id });
                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setPublicDreams(prev => prev.map(dream => {
                if (dream.id === dreamId) {
                    return {
                        ...dream,
                        isLiked: currentIsLiked, // Revert to original
                        likeCount: currentIsLiked ? dream.likeCount + 1 : Math.max(0, dream.likeCount - 1)
                    };
                }
                return dream;
            }));
        }
    };

    const hasPublicDreams = publicDreams.length > 0;
    const seoTitle = isZh ? '梦境画廊 | Oneiro AI' : 'Dream Gallery | Oneiro AI';
    const seoDescription = isZh
        ? '探索 Oneiro AI 梦境画廊与公开梦境卡片。'
        : 'Explore public dream cards and your dream gallery in Oneiro AI.';

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-y-auto custom-scrollbar">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/gallery"
                lang={language}
            />
            {/* Navigation / Header - Floating minimalist */}
            <div className="sticky top-0 z-40 px-6 py-6 md:px-12 md:py-8 flex justify-center items-center bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent pointer-events-none">
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
                ) : !hasPublicDreams ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-white/20">
                        <ImageIcon size={64} className="mb-6 opacity-20" />
                        <p className="text-sm font-light tracking-widest uppercase">
                            {isZh ? '空无一物' : 'THE VOID IS EMPTY'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-14">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-semibold tracking-[0.35em] text-white/40 uppercase">
                                    {isZh ? '公开图廊' : 'Public Gallery'}
                                </h2>
                                <span className="text-[10px] text-white/30 uppercase tracking-[0.3em]">
                                    {isZh ? '社区精选' : 'Curated'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                                {publicDreams.map((dream) => (
                                    <div
                                        key={dream.id}
                                        className="group relative flex flex-col gap-4"
                                    >
                                        <div
                                            className="aspect-[3/4] overflow-hidden bg-[#111] relative shadow-2xl transition-all duration-700 ease-out group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer"
                                            onClick={() => window.open(dream.permanentUrl, '_blank', 'noopener,noreferrer')}
                                        >
                                            <img
                                                src={dream.permanentUrl}
                                                alt="Public Dream"
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 pointer-events-none" />
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] tracking-widest text-white/30 uppercase font-medium">
                                                    {dream.createdAt
                                                        ? new Date(dream.createdAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')
                                                        : ''}
                                                </span>
                                                <h3 className="text-xs md:text-sm text-white/70 font-light leading-relaxed line-clamp-2 group-hover:text-white transition-colors duration-500">
                                                    {isZh ? '公开梦境' : 'Shared Dream'}
                                                </h3>
                                            </div>

                                            {/* Like Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(dream.id, dream.isLiked);
                                                }}
                                                className="flex items-center gap-2 group/like focus:outline-none"
                                            >
                                                <span className="text-[10px] text-white/40 font-light group-hover/like:text-white/60 transition-colors">
                                                    {dream.likeCount}
                                                </span>
                                                <Heart
                                                    size={16}
                                                    className={`transition-all duration-300 ${dream.isLiked
                                                            ? 'fill-red-500 text-red-500 scale-110'
                                                            : 'text-white/30 group-hover/like:text-white/60 group-hover/like:scale-110'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
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
