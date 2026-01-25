import React, { useState } from 'react';
import { Star, Send, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { saveFeedbackToSupabase, getTodayId } from '../services/dreamDB';
import { useNavigate } from 'react-router-dom';
import Seo from './Seo';

interface FeedbackPageProps {
    language: Language;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ language }) => {
    const isEn = language === 'en';
    const navigate = useNavigate();
    const seoTitle = isEn ? 'Feedback | Oneiro AI' : '反馈与建议 | Oneiro AI';
    const seoDescription = isEn
        ? 'Share feedback to help improve Oneiro AI dream interpretation.'
        : '提交反馈，帮助我们优化 Oneiro AI 梦境解析。';
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);

        try {
            await saveFeedbackToSupabase({
                rating,
                comment,
                conversationId: getTodayId()
            });

            setIsSubmitting(false);
            setSubmitted(true);

            // Optionally redirect after success
            setTimeout(() => {
                // navigate('/'); 
            }, 3000);
        } catch (error) {
            console.error("Failed to submit feedback", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] relative overflow-hidden">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/feedback"
                lang={language}
            />
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm">
                        <MessageSquare className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isEn ? 'Share Your Feedback' : '分享您的反馈'}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {isEn
                            ? 'Your insights help shape the future of Oneiro AI. Whether it’s a bug report, a feature request, or just saying hello, we’d love to hear from you.'
                            : '您的见解将帮助我们塑造 Oneiro AI 的未来。无论是错误报告、功能请求，还是仅仅想打个招呼，我们都期待听到您的声音。'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {submitted ? (
                        <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/5">
                                <Send className="w-10 h-10 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                {isEn ? 'Thank You!' : '感谢您的反馈！'}
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                {isEn
                                    ? 'We have received your message. Your feedback is incredibly valuable to us.'
                                    : '我们已收到您的留言。您的反馈对我们非常有价值。'}
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-6 py-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all font-medium"
                            >
                                {isEn ? 'Return Home' : '返回首页'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 relative">
                            {/* Rating Section */}
                            <div className="space-y-4 text-center">
                                <label className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
                                    {isEn ? 'How would you rate your experience?' : '您如何评价您的体验？'}
                                </label>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="group/star p-2 focus:outline-none transition-all duration-300 hover:scale-110"
                                        >
                                            <Star
                                                size={36}
                                                className={`transition-all duration-300 ${star <= rating
                                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                                                        : 'text-slate-700 hover:text-slate-500'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-sm font-medium text-indigo-400 animate-in fade-in slide-in-from-bottom-2">
                                        {rating === 5 && (isEn ? "Excellent!" : "太棒了！")}
                                        {rating === 4 && (isEn ? "Great!" : "很好！")}
                                        {rating === 3 && (isEn ? "Good" : "还不错")}
                                        {rating === 2 && (isEn ? "Fair" : "一般")}
                                        {rating === 1 && (isEn ? "Poor" : "需要改进")}
                                    </p>
                                )}
                            </div>

                            {/* Comment Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-300 uppercase tracking-wider">
                                    {isEn ? 'Your Feedback or Proposal' : '您的反馈或建议'}
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={6}
                                        className="block w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                                        placeholder={isEn
                                            ? "Tell us what you like, what we can improve, or feature ideas..."
                                            : "告诉我们您喜欢什么，我们可以在哪里改进，或者是您的新功能点子..."}
                                        required
                                    />
                                    <Sparkles className="absolute top-4 right-4 text-indigo-500/20 w-5 h-5" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || rating === 0}
                                className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-medium text-lg relative overflow-hidden"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin w-6 h-6" />
                                ) : (
                                    <>
                                        <span className="mr-2">{isEn ? 'Submit Feedback' : '提交反馈'}</span>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-600 mt-4">
                                {isEn
                                    ? "Your feedback is anonymous unless you're logged in."
                                    : "除非您已登录，否则您的反馈将是匿名的。"}
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
