
import React from 'react';
import { CareDashboard } from '../components/CareDashboard';
import { RobotView } from '../components/RobotView';
import { ContactView } from '../components/ContactView';
import { CircleView } from '../components/CircleView';
import { HistoryItem, TaskCard, ViewType, Contact } from '../types';
import { MOCK_CONTACTS } from '../constants';

interface PlanViewProps {
    onOpenGuide?: () => void;
    items?: HistoryItem[]; // Kept for interface compatibility
    tasks?: TaskCard[]; // Kept for interface compatibility
    onUpdateTasks?: (tasks: TaskCard[]) => void;
    onToggleImportant?: (id: string) => void;
    onDelete?: (id: string) => void;
    onShare?: (item: HistoryItem) => void;
}

const PlanView: React.FC<PlanViewProps> = () => {
    const [currentView, setCurrentView] = React.useState<ViewType>('care');
    const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

    const handleNavigate = (view: ViewType) => {
        console.log("PlanView: Navigating to", view);
        setCurrentView(view);
    };

    const handleSelectContact = (id: string) => {
        console.log("PlanView: Select Contact", id);
        const contact = MOCK_CONTACTS.find(c => c.id === id);
        if (contact) {
            setSelectedContact(contact);
            setCurrentView('contact');
        }
    };

    const handleBack = () => {
        console.log("PlanView: Back to Care");
        setCurrentView('care');
        setSelectedContact(null);
    };

    const renderView = () => {
        console.log("PlanView: Rendering", currentView);
        switch (currentView) {
            case 'care':
                return <CareDashboard onNavigate={handleNavigate} onSelectContact={handleSelectContact} />;
            case 'robot':
                return <RobotView onBack={handleBack} />;
            case 'contact':
                if (selectedContact) {
                    return <ContactView contact={selectedContact} onBack={handleBack} />;
                }
                return <CareDashboard onNavigate={handleNavigate} onSelectContact={handleSelectContact} />;
            case 'circle':
                return <CircleView />;
            case 'me':
                return <CareDashboard onNavigate={handleNavigate} onSelectContact={handleSelectContact} />; // Fallback
            case 'ai':
                return <CareDashboard onNavigate={handleNavigate} onSelectContact={handleSelectContact} />; // Fallback
            default:
                return <CareDashboard onNavigate={handleNavigate} onSelectContact={handleSelectContact} />;
        }
    };

    return (
        <div className="w-full h-full bg-[#F6F8F6]">
            {renderView()}
        </div>
    );
};

export default PlanView;