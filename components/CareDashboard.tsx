
import React, { useState, useEffect } from 'react';
import { SafetyNet } from './SafetyNet';
import { TaskCard } from './TaskCard';
import { BillCard } from './BillCard';
import { SecurityCard } from './SecurityCard';
import { CommerceCard } from './CommerceCard';
import { RideCard } from './RideCard';
import { SmartRideCard } from './SmartRideCard';
import { MedicationCard } from './MedicationCard';
import { MOCK_BILLS, MOCK_SECURITY_EVENTS, MOCK_COMMERCE_ITEMS, MOCK_RIDE, MOCK_MEDICATIONS } from '../constants';
import { Task, Bill, ViewType, SecurityEvent, CommerceItem, RideSession, Medication } from '../types';
import { getTasks, deleteTask, getMedications, updateMedication, deleteMedication } from '../services/api';

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
    const [medications, setMedications] = useState<Medication[]>([]);
    const [reminderStates, setReminderStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadTasks = async () => {
            const data = await getTasks();
            setTasks(data);
        };
        loadTasks();
    }, []);

    useEffect(() => {
        const loadMedications = async () => {
            try {
                const data = await getMedications();
                // If no data in database, use mock data
                if (data.length === 0) {
                    setMedications(MOCK_MEDICATIONS.filter(m => m.status === 'active'));
                } else {
                    setMedications(data.filter(m => m.status === 'active'));
                }
            } catch (error) {
                console.warn("Error loading medications, using mock data:", error);
                // If loading fails, use mock data
                setMedications(MOCK_MEDICATIONS.filter(m => m.status === 'active'));
            }
        };
        loadMedications();

        // Listen for medication update events
        const handleMedicationsUpdated = () => {
            loadMedications();
        };
        window.addEventListener('medications-updated', handleMedicationsUpdated);
        
        // Listen for pharmacy navigation events
        const handleNavigateToPharmacy = (event: CustomEvent) => {
            // Navigate to shopping/pharmacy page
            // You can customize this based on your routing
            console.log('Navigate to pharmacy for:', event.detail?.medication);
            // Example: onNavigate('shopping') or navigate to a pharmacy page
        };
        window.addEventListener('navigate-to-pharmacy', handleNavigateToPharmacy as EventListener);
        
        return () => {
            window.removeEventListener('medications-updated', handleMedicationsUpdated);
            window.removeEventListener('navigate-to-pharmacy', handleNavigateToPharmacy as EventListener);
        };
    }, []);

    // Check reminder times periodically
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeInMinutes = currentHours * 60 + currentMinutes;
            
            const newReminderStates: Record<string, boolean> = {};
            
            medications.forEach(med => {
                if (med.status !== 'active' || !med.times || med.times.length === 0) {
                    newReminderStates[med.id] = false;
                    return;
                }
                
                // Check if any medication time is reached (5-minute window before/after)
                const isReminderTime = med.times.some(time => {
                    const [hours, minutes] = time.split(':').map(Number);
                    const reminderTimeInMinutes = hours * 60 + minutes;
                    
                    // Calculate time difference (in minutes)
                    let timeDiff = Math.abs(currentTimeInMinutes - reminderTimeInMinutes);
                    
                    // Handle cross-day scenarios (e.g., 23:55 and 00:05)
                    if (timeDiff > 12 * 60) {
                        timeDiff = 24 * 60 - timeDiff;
                    }
                    
                    // Remind within 5 minutes before/after medication time
                    return timeDiff <= 5;
                });
                
                newReminderStates[med.id] = isReminderTime;
            });
            
            setReminderStates(newReminderStates);
        };

        // Check immediately once
        checkReminders();
        
        // Check every 10 seconds (more frequent checks for timely reminders)
        const interval = setInterval(checkReminders, 10000);
        
        return () => clearInterval(interval);
    }, [medications]);

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
        setBills(prev => prev.map(b => {
            if (b.id !== id) return b;
            const next = { ...b, ...updates };
            // 支付/标记 → 归档 & 记录历史：标记为已付时追加一条支付记录
            if (updates.status === 'paid') {
                const today = new Date();
                const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: today.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
                next.history = [
                    ...(b.history || []),
                    { id: `p-${Date.now()}`, date: dateStr, amount: b.amount, status: 'paid' as const }
                ];
            }
            return next;
        }));
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

    const handleTakeMedication = async (id: string) => {
        try {
            // Keep active status for next reminder
            await updateMedication(id, { status: 'active' });
            setMedications(prev => prev.map(m => m.id === id ? { ...m, status: 'active' } : m));
            // Clear current reminder state (user has taken medication, no need to remind)
            setReminderStates(prev => ({ ...prev, [id]: false }));
            
            // Set a temporary flag to prevent immediate re-reminder (e.g., if user is within 5-minute window)
            // Can be implemented by adding a temporary state, simplified here
        } catch (error) {
            console.error("Failed to update medication:", error);
        }
    };

    const handleUpdateMedication = async (id: string, updates: Partial<Medication>) => {
        try {
            await updateMedication(id, updates);
            setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
        } catch (error) {
            console.error("Failed to update medication:", error);
        }
    };

    const handleDeleteMedication = async (id: string) => {
        try {
            await deleteMedication(id);
            setMedications(prev => prev.filter(m => m.id !== id));
            setReminderStates(prev => {
                const newStates = { ...prev };
                delete newStates[id];
                return newStates;
            });
        } catch (error) {
            console.error("Failed to delete medication:", error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg-soft">
            {/* Header Section */}
            <SafetyNet onNavigate={onNavigate} onSelectContact={onSelectContact} />

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-32">

                {/* Section Title */}
                <h2 className="text-xl font-bold text-text-main px-1">Today's Focus</h2>

                {/* Priority 1: Smart Ride Card */}
                <SmartRideCard />

                {/* Priority 2: Active Ride */}
                {ride && ride.status !== 'completed' && (
                    <RideCard ride={ride} />
                )}

                {/* Priority 2: Medication Reminders (Active) */}
                {medications.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-bold text-text-main">Medication Reminders</h3>
                            <span className="text-sm text-gray-500 font-medium">
                                {medications.length} {medications.length === 1 ? 'medication' : 'medications'}
                            </span>
                        </div>
                        {medications.map(medication => (
                            <MedicationCard
                                key={medication.id}
                                medication={medication}
                                isReminderActive={reminderStates[medication.id] || false}
                                onTake={() => handleTakeMedication(medication.id)}
                                onUpdate={(updates) => handleUpdateMedication(medication.id, updates)}
                                onDelete={() => handleDeleteMedication(medication.id)}
                            />
                        ))}
                    </div>
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

                    {bills.filter(b => b.status !== 'paid').map(bill => (
                        <BillCard
                            key={bill.id}
                            bill={bill}
                            onUpdate={(updates) => handleUpdateBill(bill.id, updates)}
                            onAskForHelp={handleAskHelpBill}
                        />
                    ))}

                    {/* Completed Bills (移入 Completed 列表) */}
                    {bills.filter(b => b.status === 'paid').length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</h3>
                            {bills.filter(b => b.status === 'paid').map(bill => (
                                <BillCard
                                    key={bill.id}
                                    bill={bill}
                                    onUpdate={(updates) => handleUpdateBill(bill.id, updates)}
                                    onAskForHelp={handleAskHelpBill}
                                />
                            ))}
                        </div>
                    )}

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
