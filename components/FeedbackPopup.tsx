import React, { useState } from 'react';
import { X, Star, Send, MessageSquare, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { saveFeedbackToSupabase, getTodayId } from '../services/dreamDB';

interface FeedbackPopupProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ isOpen, onClose, language }) => {
    const isEn = language === 'en';
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await saveFeedbackToSupabase({
                rating,
                comment,
                conversationId: getTodayId()
            });

            setIsSubmitting(false);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setRating(0);
                setComment('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to submit feedback", error);
            setIsSubmitting(false);
            // Optional: show error state
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                                <Send size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                {isEn ? 'Thank You!' : '感谢反馈！'}
                            </h2>
                            <p className="text-slate-600">
                                {isEn
                                    ? 'Your feedback helps us improve Oneiro AI.'
                                    : '您的建议将帮助我们改进 Oneiro AI。'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <div className="mx-auto h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                    <MessageSquare size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {isEn ? 'We Value Your Feedback' : '我们需要您的建议'}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    {isEn
                                        ? 'Help us shape the future of Oneiro AI directly.'
                                        : '直接参与 Oneiro AI 的开发，帮助我们做得更好。'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Rating Stars */}
                                <div className="flex justify-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Text Area */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {isEn ? 'Your Thoughts' : '您的想法'}
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-colors resize-none"
                                        placeholder={isEn ? "Share your ideas or report issues..." : "分享您的想法或反馈遇到的问题..."}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        isEn ? 'Submit Feedback' : '提交反馈'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default FeedbackPopup;
