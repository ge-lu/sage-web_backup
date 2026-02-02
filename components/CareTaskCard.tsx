import React, { useState } from 'react';
import { Heart, Activity, Pill, CheckCircle2, Repeat, Settings, Bell, BellOff, Volume2, X } from 'lucide-react';
import { Task } from '../types';

interface CareTaskCardProps {
    task: Task;
    onComplete: () => void;
    onUpdate: (updates: Partial<Task>) => void;
}

export const CareTaskCard: React.FC<CareTaskCardProps> = ({ task, onComplete, onUpdate }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [snoozed, setSnoozed] = useState(false);

    const isCompleted = task.status === 'completed';
    const settingsPanelId = `settings-${task.id}`;

    const getIcon = () => {
        switch (task.icon) {
            case 'heart': return <Heart size={28} className="text-rose-500" fill="currentColor" aria-hidden="true" />;
            case 'pill': return <Pill size={28} className="text-blue-500" aria-hidden="true" />;
            case 'activity': return <Activity size={28} className="text-orange-500" aria-hidden="true" />;
            default: return <Heart size={28} className="text-rose-500" aria-hidden="true" />;
        }
    };

    const getIconBg = () => {
        switch (task.icon) {
            case 'heart': return 'bg-rose-50';
            case 'pill': return 'bg-blue-50';
            case 'activity': return 'bg-orange-50';
            default: return 'bg-rose-50';
        }
    };

    const toggleSettings = () => setShowSettings(!showSettings);

    const handleSnooze = () => {
        setSnoozed(true);
        setTimeout(() => setSnoozed(false), 2000); // Reset for demo
    };

    const updateRecurrence = (value: string) => {
        onUpdate({ recurrence: value as Task['recurrence'] });
    };

    const toggleSnoozeOption = () => {
        onUpdate({
            reminderSettings: {
                ...task.reminderSettings,
                snoozeEnabled: !task.reminderSettings.snoozeEnabled
            }
        });
    };

    const updateSound = (value: string) => {
        onUpdate({
            reminderSettings: {
                ...task.reminderSettings,
                alertSound: value as Task['reminderSettings']['alertSound']
            }
        });
    };

    return (
        <article
            className={`rounded-[28px] p-6 shadow-card transition-all duration-300 relative overflow-hidden border border-white ${isCompleted ? 'bg-gray-100 opacity-60 grayscale' : 'bg-white'}`}
            aria-labelledby={`task-title-${task.id}`}
            aria-describedby={`task-desc-${task.id}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getIconBg()}`}>
                        {getIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-text-sub font-bold text-sm bg-gray-100 px-2 py-0.5 rounded-lg" aria-label={`Scheduled for ${task.time}`}>
                                {task.time}
                            </span>
                            {task.recurrence !== 'none' && (
                                <div className="flex items-center gap-1 text-xs text-text-sub font-semibold uppercase tracking-wide">
                                    <Repeat size={10} aria-hidden="true" />
                                    <span className="sr-only">Repeats</span>
                                    {task.recurrence}
                                </div>
                            )}
                        </div>
                        <h3 id={`task-title-${task.id}`} className={`text-xl font-bold ${isCompleted ? 'text-gray-500' : 'text-text-main'}`}>
                            {task.title}
                        </h3>
                        <p id={`task-desc-${task.id}`} className="text-text-sub text-sm font-medium">
                            {task.subtitle}
                        </p>
                    </div>
                </div>

                {!isCompleted && (
                    <button
                        onClick={toggleSettings}
                        aria-expanded={showSettings}
                        aria-controls={settingsPanelId}
                        aria-label="Task Settings"
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showSettings ? 'bg-gray-200 text-text-main' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                        {showSettings ? <X size={18} /> : <Settings size={18} />}
                    </button>
                )}
            </div>

            {/* Settings Panel */}
            {showSettings && !isCompleted && (
                <div id={settingsPanelId} className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 animate-in fade-in zoom-in-95" role="region" aria-label="Task Configuration">

                    {/* Recurrence Setting */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-text-main">
                            <Repeat size={16} aria-hidden="true" />
                            <label htmlFor={`recurrence-${task.id}`} className="font-medium text-sm">Repeat</label>
                        </div>
                        <select
                            id={`recurrence-${task.id}`}
                            className="bg-white border border-gray-200 text-text-main text-sm rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={task.recurrence}
                            onChange={(e) => updateRecurrence(e.target.value)}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="none">Never</option>
                        </select>
                    </div>

                    {/* Snooze Toggle */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-text-main">
                            <Bell size={16} aria-hidden="true" />
                            <span id={`snooze-label-${task.id}`} className="font-medium text-sm">Snooze Option</span>
                        </div>
                        <button
                            role="switch"
                            aria-checked={task.reminderSettings.snoozeEnabled}
                            aria-labelledby={`snooze-label-${task.id}`}
                            onClick={toggleSnoozeOption}
                            className={`w-10 h-5 rounded-full relative transition-colors ${task.reminderSettings.snoozeEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${task.reminderSettings.snoozeEnabled ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* Sound Setting */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-text-main">
                            <Volume2 size={16} aria-hidden="true" />
                            <label htmlFor={`sound-${task.id}`} className="font-medium text-sm">Alert Sound</label>
                        </div>
                        <select
                            id={`sound-${task.id}`}
                            className="bg-white border border-gray-200 text-text-main text-sm rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={task.reminderSettings.alertSound}
                            onChange={(e) => updateSound(e.target.value)}
                        >
                            <option value="chime">Chime</option>
                            <option value="bell">Bell</option>
                            <option value="silent">Silent</option>
                        </select>
                    </div>
                </div>
            )}

            {!isCompleted ? (
                <div className="flex gap-3">
                    <button
                        onClick={onComplete}
                        aria-label={`Mark ${task.title} as completed`}
                        className="flex-1 bg-neon text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                    >
                        <CheckCircle2 size={24} /> Take Now
                    </button>
                    {task.reminderSettings.snoozeEnabled && !snoozed && (
                        <button
                            onClick={handleSnooze}
                            className="flex-shrink-0 w-16 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center active:scale-95 transition-transform hover:bg-gray-200"
                            aria-label={`Snooze ${task.title}`}
                        >
                            <BellOff size={24} />
                        </button>
                    )}
                    {snoozed && (
                        <div role="status" className="flex-shrink-0 px-4 flex items-center justify-center bg-gray-50 text-emerald-600 font-bold text-sm rounded-2xl border border-dashed border-emerald-200">
                            Snoozing...
                        </div>
                    )}
                </div>
            ) : (
                <div role="status" className="w-full bg-gray-50 text-gray-400 font-bold text-lg py-3 rounded-2xl flex items-center justify-center gap-2 border border-gray-100">
                    <CheckCircle2 size={24} /> Completed
                </div>
            )}
        </article>
    );
};
