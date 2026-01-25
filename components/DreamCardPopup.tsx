import React, { useEffect, useState } from 'react';
import { X, Share2, Save, Check } from 'lucide-react';
import { Language } from '../types';
import { saveDreamCardForever, shareDreamCard } from '../services/imageService';

interface DreamCardPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: (url: string) => void;
    imageUrl: string;
    conversationId: string;
    language: Language;
}

const DreamCardPopup: React.FC<DreamCardPopupProps> = ({ isOpen, onClose, onSaved, imageUrl, conversationId, language }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [permanentUrl, setPermanentUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setIsSaved(false);
        setIsShared(false);
        setPermanentUrl(null);
        if (imageUrl.includes('permanent_dream_images')) {
            setPermanentUrl(imageUrl);
            setIsSaved(true);
        }
    }, [imageUrl]);

    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        setErrorMessage(null);
        try {
            const url = await saveDreamCardForever(imageUrl, conversationId);
            setPermanentUrl(url);
            setIsSaved(true);
            onSaved?.(url);
        } catch (error) {
            console.error('Failed to save', error);
            setErrorMessage(language === 'zh' ? '保存失败，请重试' : 'Failed to save, please try again');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        setErrorMessage(null);
        try {
            let url = permanentUrl;
            if (!url) {
                // Determine if we need to save first. 
                // Any public image MUST be permanent.
                url = await saveDreamCardForever(imageUrl, conversationId);
                setPermanentUrl(url);
                setIsSaved(true);
                onSaved?.(url);
            }
            await shareDreamCard(url);
            setIsShared(true);
        } catch (error) {
            console.error('Failed to share', error);
            setErrorMessage(language === 'zh' ? '分享失败，请重试' : 'Failed to share, please try again');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-[#1A1A1A] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                {/* Header / Close */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Image Container */}
                <div className="w-full flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4">
                    <img
                        src={imageUrl}
                        alt="Dream Card"
                        className="w-full h-auto max-h-full object-contain rounded-lg shadow-lg"
                    />
                </div>

                {/* Warning Text - displayed over image bottom or in footer */}
                {!isSaved && (
                    <div className="px-6 py-2 bg-[#2a2a2a] text-center border-t border-white/5">
                        <p className="text-xs text-orange-300 font-medium">
                            {language === 'zh' ? '提示：图片为临时，7 天内有效，请及时保存' : 'Note: Image expires in 7 days. Please save it.'}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 bg-[#1A1A1A] flex flex-col gap-3 border-t border-white/5 shrink-0">
                    {errorMessage && (
                        <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                            {errorMessage}
                        </div>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isSaved}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${isSaved
                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                : 'bg-white text-black hover:bg-gray-100'
                                }`}
                        >
                            {isSaved ? <Check size={18} /> : <Save size={18} />}
                            <span className="whitespace-nowrap">
                                {language === 'zh'
                                    ? (isSaved ? '已永久保存' : '永久保存到云端')
                                    : (isSaved ? 'Saved Forever' : 'Save to Library')
                                }
                            </span>
                        </button>

                        <button
                            onClick={handleShare}
                            disabled={isSharing || isShared}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${isShared
                                ? 'bg-blue-500/20 text-blue-400 cursor-default'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                } disabled:opacity-50`}
                        >
                            {isShared ? <Check size={18} /> : <Share2 size={18} />}
                            <span className="whitespace-nowrap">
                                {language === 'zh'
                                    ? (isShared ? '已公开' : '分享到梦境图廊')
                                    : (isShared ? 'Shared' : 'Share to Gallery')
                                }
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DreamCardPopup;

