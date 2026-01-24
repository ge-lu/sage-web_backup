
import React, { useState } from 'react';
import { Plus, Bot, X, MessageSquare, Facebook, Twitter, Music, MessageCircle } from 'lucide-react';
import { MOCK_CONTACTS } from '../constants';
import { ViewType } from '../types';

interface SafetyNetProps {
    onNavigate?: (view: ViewType) => void;
    onSelectContact?: (contactId: string) => void;
}

export const SafetyNet: React.FC<SafetyNetProps> = ({ onNavigate, onSelectContact }) => {
    const [showInviteModal, setShowInviteModal] = useState(false);

    const handleShare = (platform: string) => {
        console.log(`Sharing invite via ${platform}`);
        setShowInviteModal(false);
    };

    const handleRobotClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Navigate to Robot triggered");
        if (onNavigate) {
            onNavigate('robot');
        }
    };

    const handleContactClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Select Contact triggered:", id);
        if (onSelectContact) {
            onSelectContact(id);
        }
    };

    return (
        <>
            <div className="bg-white pt-10 pb-4 px-6 rounded-b-[40px] shadow-soft z-50 relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-text-main">Care Circle</h1>
                        <p className="text-text-sub text-xs font-medium">Your safety network is active</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
                    </span>
                </div>

                <div className="flex gap-6 items-center overflow-x-auto pb-4 no-scrollbar">

                    {/* Robot Avatar - Always First - Converted to Button for reliability */}
                    <button
                        type="button"
                        className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group bg-transparent border-none p-0"
                        onClick={handleRobotClick}
                        aria-label="Manage Robot"
                    >
                        <div className="relative transform transition-transform group-hover:scale-105 pointer-events-none">
                            <div
                                className="w-16 h-16 rounded-full border-2 border-emerald-100 shadow-sm flex items-center justify-center bg-emerald-50"
                            >
                                <Bot size={28} className="text-emerald-600" />
                            </div>
                            <div
                                className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center"
                            >
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <span className="font-semibold text-sm text-text-main pointer-events-none">
                            Robot
                        </span>
                    </button>

                    {MOCK_CONTACTS.map((contact) => (
                        <button
                            key={contact.id}
                            type="button"
                            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group bg-transparent border-none p-0"
                            onClick={(e) => handleContactClick(e, contact.id)}
                        >
                            <div className="relative transform transition-transform group-hover:scale-105 pointer-events-none">
                                <div
                                    className={`w-16 h-16 rounded-full border-2 p-0.5 ${contact.isOnline ? 'border-emerald-200' : 'border-gray-100 grayscale'}`}
                                >
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatarSeed}`}
                                        className="w-full h-full rounded-full bg-gray-50"
                                        alt={contact.name}
                                    />
                                </div>
                                {contact.isOnline && (
                                    <div
                                        className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white bg-emerald-500"
                                    ></div>
                                )}
                            </div>
                            <span className={`font-semibold text-sm ${contact.isOnline ? 'text-text-main' : 'text-gray-400'} pointer-events-none`}>
                                {contact.name}
                            </span>
                        </button>
                    ))}

                    <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors"
                        >
                            <Plus size={24} className="text-gray-400 group-hover:text-gray-600" />
                        </button>
                        <span className="font-semibold text-sm text-gray-400">Invite</span>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">

                        {/* Header */}
                        <div className="p-6 pb-2 text-center relative border-b border-gray-100">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="absolute left-6 top-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                            <h3 className="text-2xl font-bold text-text-main tracking-tight mt-1">Add to Circle</h3>
                        </div>

                        <div className="p-6 bg-gray-50">
                            <p className="text-text-sub text-xs font-bold uppercase tracking-widest text-center mb-6">Choose how to invite</p>

                            <div className="space-y-3">
                                <button onClick={() => handleShare('iMessage')} className="w-full bg-white hover:bg-gray-50 text-text-main p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-sm border border-gray-100 transform transition-transform active:scale-95 group">
                                    <MessageSquare size={24} className="text-green-500" /> Message
                                </button>

                                <button onClick={() => handleShare('WhatsApp')} className="w-full bg-white hover:bg-gray-50 text-text-main p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-sm border border-gray-100 transform transition-transform active:scale-95 group">
                                    <MessageCircle size={24} className="text-teal-600" /> WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
