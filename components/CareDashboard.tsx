
import React, { useState, useEffect } from 'react';
import { SafetyNet } from './SafetyNet';
import { TaskCard } from './TaskCard';
import { BillCard } from './BillCard';
import { SecurityCard } from './SecurityCard';
import { CommerceCard } from './CommerceCard';
import { RideCard } from './RideCard';
import { MOCK_BILLS, MOCK_SECURITY_EVENTS, MOCK_COMMERCE_ITEMS, MOCK_RIDE } from '../constants';
import { Task, Bill, ViewType, SecurityEvent, CommerceItem, RideSession } from '../types';
import { getTasks, deleteTask } from '../services/api';

interface DashboardProps {
    onNavigate: (view: ViewType) => void;
    onSelectContact: (contactId: string) => void;
}

export const CareDashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectContact }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(MOCK_SECURITY_EVENTS);
    const [commerceItems, setCommerceItems] = useState<CommerceItem[]>(MOCK_COMMERCE_ITEMS);
    const [ride, setRide] = useState<RideSession | null>(MOCK_RIDE);

    useEffect(() => {
        const loadTasks = async () => {
            const data = await getTasks();
            setTasks(data);
        };
        loadTasks();
    }, []);

    const handleCompleteTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    const handleUpdateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const handleUpdateBill = (id: string, updates: Partial<Bill>) => {
        setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleAskHelpBill = (billId: string, contactId: string) => {
        setBills(prev => prev.map(b => b.id === billId ? { ...b, assistanceStatus: 'requested' } : b));
        console.log(`Assistance requested for bill ${billId} from contact ${contactId}`);
    };

    const handleConfirmSecurity = (id: string, action: 'safe' | 'block') => {
        // For demo, just remove it if 'safe', or keep as blocked if 'block'
        if (action === 'safe') {
            setSecurityEvents(prev => prev.filter(e => e.id !== id));
        } else {
            setSecurityEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'blocked' } : e));
        }
    };

    const handleAskHelpSecurity = (id: string) => {
        setSecurityEvents(prev => prev.map(e => e.id === id ? { ...e, assistanceStatus: 'requested' } : e));
        console.log(`Assistance requested for security event ${id}`);
    };

    return (
        <div className="flex flex-col h-full bg-bg-soft">
            {/* Header Section */}
            <SafetyNet onNavigate={onNavigate} onSelectContact={onSelectContact} />

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-32">

                {/* Section Title */}
                <h2 className="text-xl font-bold text-text-main px-1">Today's Focus</h2>

                {/* Priority 1: Active Ride */}
                {ride && ride.status !== 'completed' && (
                    <RideCard ride={ride} />
                )}

                {/* Priority 2: Security Alerts */}
                {securityEvents.length > 0 && (
                    <div className="space-y-4">
                        {securityEvents.map(event => (
                            <SecurityCard
                                key={event.id}
                                event={event}
                                onConfirm={handleConfirmSecurity}
                                onAskForHelp={handleAskHelpSecurity}
                            />
                        ))}
                    </div>
                )}

                {/* Priority 3: Daily Timeline (Mixed Feed) */}
                <div className="space-y-6">
                    {/* Purchase Suggestions (Top of timeline) */}
                    {commerceItems.filter(i => i.type === 'purchase_suggestion').map(item => (
                        <CommerceCard key={item.id} item={item} />
                    ))}

                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={() => handleCompleteTask(task.id)}
                            onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                            onDelete={() => handleDeleteTask(task.id)}
                        />
                    ))}

                    {bills.map(bill => (
                        <BillCard
                            key={bill.id}
                            bill={bill}
                            onUpdate={(updates) => handleUpdateBill(bill.id, updates)}
                            onAskForHelp={handleAskHelpBill}
                        />
                    ))}

                    {/* Past Payments (Bottom of timeline) */}
                    {commerceItems.filter(i => i.type === 'payment_record').map(item => (
                        <CommerceCard key={item.id} item={item} />
                    ))}
                </div>

                {/* Placeholder for empty state if everything is done */}
                {tasks.every(t => t.status === 'completed') && bills.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-text-sub">All caught up! Great job.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
