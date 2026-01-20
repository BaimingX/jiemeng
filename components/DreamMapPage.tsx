import React from 'react';
import DreamMapPanel from './DreamMap';
import { Language } from '../types';
import { useNavigate } from 'react-router-dom';

interface DreamMapPageProps {
    language: Language;
}

const DreamMapPage: React.FC<DreamMapPageProps> = ({ language }) => {
    const navigate = useNavigate();

    const handleSelectDate = (dateId: string) => {
        // Navigate to home with the selected date
        navigate(`/?date=${dateId}`);
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4">
            <DreamMapPanel
                language={language}
                onSelectDate={handleSelectDate}
                onBack={() => navigate('/')}
            />
        </div>
    );
};

export default DreamMapPage;
