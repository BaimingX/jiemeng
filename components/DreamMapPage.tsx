import React from 'react';
import DreamMapPanel from './DreamMap';
import { Language } from '../types';
import { useNavigate } from 'react-router-dom';
import Seo from './Seo';

interface DreamMapPageProps {
    language: Language;
}

const DreamMapPage: React.FC<DreamMapPageProps> = ({ language }) => {
    const navigate = useNavigate();
    const isZh = language === 'zh';
    const seoTitle = isZh ? '梦境地图 | Oneiro AI' : 'Dream Map | Oneiro AI';
    const seoDescription = isZh
        ? '查看你的梦境地图与历史梦境记录。'
        : 'Explore your dream map and historical dream records.';

    const handleSelectDate = (dateId: string) => {
        // Navigate to home with the selected date
        navigate(`/?date=${dateId}`);
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path="/map"
                lang={language}
                noIndex={true}
            />
            <DreamMapPanel
                language={language}
                onSelectDate={handleSelectDate}
                onBack={() => navigate('/')}
            />
        </div>
    );
};

export default DreamMapPage;
