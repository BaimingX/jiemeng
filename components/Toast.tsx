import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 3000
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-400" />;
            case 'error': return <XCircle size={20} className="text-red-400" />;
            default: return <Info size={20} className="text-indigo-400" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success': return 'bg-green-500/10 border-green-500/20 text-green-100';
            case 'error': return 'bg-red-500/10 border-red-500/20 text-red-100';
            default: return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl ${getStyles()}`}
                    >
                        <div className="flex-shrink-0">
                            {getIcon()}
                        </div>
                        <p className="flex-1 text-sm font-medium">{message}</p>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                        >
                            <X size={16} className="opacity-60" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
