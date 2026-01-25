import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Sparkles, ArrowLeft, Zap, Star, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import Seo from './Seo';

interface SubscribePageProps {
    language: Language;
}

interface PlanPrice {
    plan_key: string;
    stripe_price_id: string;
    mode: string;
}

const SubscribePage: React.FC<SubscribePageProps> = ({ language }) => {
    const navigate = useNavigate();
    const { user, billingStatus, openCheckout, refreshBillingStatus, openCustomerPortal } = useAuth();
    const isEn = language === 'en';
    const seoTitle = isEn ? 'Pricing & Plans | Oneiro AI' : '订阅计划 | Oneiro AI';
    const seoDescription = isEn
        ? 'Compare Oneiro AI subscription plans and unlock premium dream interpretation features.'
        : '了解 Oneiro AI 订阅计划，解锁更多梦境解析功能。';
    const [loading, setLoading] = useState<string | null>(null);
    const [prices, setPrices] = useState<PlanPrice[]>([]);
    const [currentPlanKey, setCurrentPlanKey] = useState<'monthly' | 'yearly' | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);

    // Check for billing success/cancel query params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('billing') === 'success') {
            refreshBillingStatus();
            // Clean up the URL
            window.history.replaceState({}, '', '/subscribe');
        }
    }, [refreshBillingStatus]);

    // Fetch available plans
    useEffect(() => {
        const fetchPrices = async () => {
            const { data } = await supabase
                .from('billing_plan_prices')
                .select('plan_key, stripe_price_id, mode')
                .eq('active', true);
            if (data) setPrices(data);
        };
        fetchPrices();
    }, []);

    useEffect(() => {
        if (!user) {
            setCurrentPlanKey(null);
            return;
        }

        const fetchCurrentPlan = async () => {
            const { data, error } = await supabase
                .from('billing_subscriptions')
                .select('plan_key, status')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Failed to fetch subscription plan', error);
                setCurrentPlanKey(null);
                return;
            }

            if (data?.plan_key && ['active', 'trialing', 'past_due', 'unpaid'].includes(data.status)) {
                setCurrentPlanKey(data.plan_key);
            } else {
                setCurrentPlanKey(null);
            }
        };

        fetchCurrentPlan();
    }, [user?.id, billingStatus?.access, billingStatus?.isActive]);

    const handleSubscribe = async (planKey: 'monthly' | 'yearly' | 'lifetime') => {
        if (!user) {
            // Redirect to login or show login modal
            navigate('/?login=true');
            return;
        }

        setLoading(planKey);
        try {
            await openCheckout(planKey);
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleOpenPortal = async () => {
        if (!user) {
            navigate('/?login=true');
            return;
        }

        setPortalLoading(true);
        try {
            await openCustomerPortal();
        } catch (error) {
            console.error('Portal error:', error);
        } finally {
            setPortalLoading(false);
        }
    };

    const plans = [
        {
            key: 'monthly' as const,
            name: isEn ? 'Monthly' : '月度订阅',
            price: '$6',
            period: isEn ? '/month' : '/月',
            description: isEn ? 'Perfect for casual dreamers' : '适合偶尔解梦的用户',
            features: [
                isEn ? 'Unlimited dream interpretations' : '无限次解梦',
                isEn ? 'All analysis styles' : '全部分析风格',
                isEn ? 'Dream journal access' : '梦境日记功能',
                isEn ? 'Priority support' : '优先客服支持',
            ],
            popular: false,
            gradient: 'from-slate-500/20 to-slate-600/20',
            borderColor: 'border-slate-500/30',
            textColor: 'text-slate-300',
        },
        {
            key: 'yearly' as const,
            name: isEn ? 'Yearly' : '年度订阅',
            price: '$50',
            period: isEn ? '/year' : '/年',
            originalPrice: '$72',
            savings: isEn ? 'Save 30%' : '省30%',
            description: isEn ? 'Best value for regular dreamers' : '经常解梦的最佳选择',
            features: [
                isEn ? 'Unlimited dream interpretations' : '无限次解梦',
                isEn ? 'All analysis styles' : '全部分析风格',
                isEn ? 'Dream journal access' : '梦境日记功能',
                isEn ? 'Dream map visualization' : '梦境地图可视化',
                isEn ? 'Priority support' : '优先客服支持',
            ],
            popular: true,
            gradient: 'from-indigo-500/20 to-purple-500/20',
            borderColor: 'border-indigo-500/50',
            textColor: 'text-indigo-300',
        },
        {
            key: 'lifetime' as const,
            name: isEn ? 'Lifetime' : '终身会员',
            price: '$149',
            period: isEn ? ' one-time' : ' 一次性',
            description: isEn ? 'Unlock forever, pay once' : '一次购买，永久解锁',
            features: [
                isEn ? 'Unlimited dream interpretations' : '无限次解梦',
                isEn ? 'All analysis styles' : '全部分析风格',
                isEn ? 'Dream journal access' : '梦境日记功能',
                isEn ? 'Dream map visualization' : '梦境地图可视化',
                isEn ? 'All future features' : '所有未来新功能',
                isEn ? 'Lifetime priority support' : '终身优先支持',
            ],
            popular: false,
            gradient: 'from-amber-500/20 to-orange-500/20',
            borderColor: 'border-amber-500/30',
            textColor: 'text-amber-300',
        },
    ];

    // Check if plan is available
    const isPlanAvailable = (planKey: string) => {
        return prices.some(p => p.plan_key === planKey);
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] pt-24 pb-16 px-4">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/subscribe"
                lang={language}
            />
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm">{isEn ? 'Back' : '返回'}</span>
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
                    >
                        <Crown size={16} className="text-indigo-400" />
                        <span className="text-sm text-indigo-300">
                            {isEn ? 'Unlock Premium' : '解锁高级功能'}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif text-white mb-4"
                    >
                        {isEn ? 'Choose Your Plan' : '选择您的方案'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-xl mx-auto"
                    >
                        {isEn
                            ? 'Unlock unlimited dream interpretations and explore the depths of your subconscious mind.'
                            : '解锁无限次解梦，探索潜意识的奥秘。'
                        }
                    </motion.p>

                    {/* Current Status */}
                    {billingStatus && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full"
                        >
                            {billingStatus.access === 'lifetime' ? (
                                <>
                                    <Star size={16} className="text-amber-400" />
                                    <span className="text-sm text-amber-400">{isEn ? 'Lifetime Member' : '终身会员'}</span>
                                </>
                            ) : billingStatus.access === 'subscription' && billingStatus.isActive ? (
                                <>
                                    <Shield size={16} className="text-indigo-400" />
                                    <span className="text-sm text-indigo-400">{isEn ? 'Active Subscriber' : '订阅中'}</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={16} className="text-slate-400" />
                                    <span className="text-sm text-slate-400">
                                        {isEn
                                            ? `${billingStatus.trialRemaining} free trials remaining`
                                            : `剩余 ${billingStatus.trialRemaining} 次免费解梦`
                                        }
                                    </span>
                                </>
                            )}
                        </motion.div>
                    )}
                    {billingStatus?.access === 'subscription' && billingStatus?.isActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="mt-4 flex items-center justify-center"
                        >
                            <button
                                onClick={handleOpenPortal}
                                disabled={portalLoading}
                                className="px-4 py-2 text-xs font-medium rounded-full border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-colors disabled:opacity-60"
                            >
                                {portalLoading
                                    ? (isEn ? 'Opening...' : '正在打开...')
                                    : (isEn ? 'Cancel Subscription' : '取消订阅')}
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {plans.map((plan, index) => {
                        const hasActiveSub = billingStatus?.access === 'subscription' && billingStatus?.isActive;
                        const isCurrentPlan = hasActiveSub && currentPlanKey === plan.key;

                        return (
                            <motion.div
                                key={plan.key}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className={`relative bg-gradient-to-b ${plan.gradient} backdrop-blur-xl rounded-2xl border ${plan.borderColor} p-6 ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                            >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <div className="px-4 py-1 bg-indigo-500 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                                        {isEn ? 'Most Popular' : '最受欢迎'}
                                    </div>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="text-center mb-6 pt-2">
                                <h3 className={`text-lg font-semibold ${plan.textColor} mb-2`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-400 text-sm">{plan.period}</span>
                                </div>
                                {plan.originalPrice && (
                                    <div className="mt-1 flex items-center justify-center gap-2">
                                        <span className="text-sm text-slate-500 line-through">{plan.originalPrice}</span>
                                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                            {plan.savings}
                                        </span>
                                    </div>
                                )}
                                <p className="text-slate-400 text-xs mt-2">{plan.description}</p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                        <Check size={16} className="text-green-400 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleSubscribe(plan.key)}
                                disabled={loading !== null || !isPlanAvailable(plan.key) ||
                                    (billingStatus?.access === 'lifetime') ||
                                    (billingStatus?.access === 'subscription' && billingStatus?.isActive && plan.key !== 'lifetime')}
                                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${plan.popular
                                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                                        : plan.key === 'lifetime'
                                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                                            : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading === plan.key ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {isEn ? 'Loading...' : '加载中...'}
                                    </span>
                                ) : !isPlanAvailable(plan.key) ? (
                                    isEn ? 'Coming Soon' : '即将推出'
                                ) : billingStatus?.access === 'lifetime' ? (
                                    isEn ? 'Already Owned' : '已拥有'
                                ) : billingStatus?.access === 'subscription' && billingStatus?.isActive && plan.key !== 'lifetime' ? (
                                    isCurrentPlan
                                        ? (isEn ? 'Current Plan' : '当前方案')
                                        : (isEn ? 'Subscribed' : '已订阅')
                                ) : (
                                    isEn ? 'Get Started' : '立即开始'
                                )}
                            </button>
                        </motion.div>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-slate-500 text-xs mt-12"
                >
                    {isEn
                        ? 'Secure payment powered by Stripe. Cancel anytime.'
                        : '由 Stripe 提供安全支付。订阅可随时取消。'
                    }
                </motion.p>
            </div>
        </div>
    );
};

export default SubscribePage;
