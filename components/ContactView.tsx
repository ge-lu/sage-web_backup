
import React from 'react';
import { ChevronLeft, Phone, Mic, Heart, CheckCircle2, Pill, Calendar, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Contact } from '../types';

interface ContactViewProps {
    contact: Contact;
    onBack: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ contact, onBack }) => {
    // Mock data matching the design
    const footprints = [
        {
            id: 1,
            title: 'Checked medication log',
            time: '10:30 AM · Today',
            icon: <Pill size={24} className="text-blue-500" />,
            iconBg: 'bg-blue-50',
            liked: true,
            status: null
        },
        {
            id: 2,
            title: 'Updated doctor visit',
            time: '9:15 AM · Today',
            icon: <Calendar size={24} className="text-emerald-500" />,
            iconBg: 'bg-emerald-50',
            liked: true,
            status: 'You sent thanks'
        },
        {
            id: 3,
            title: 'Added milk to list',
            time: '6:45 PM · Yesterday',
            icon: <ShoppingBag size={24} className="text-orange-500" />,
            iconBg: 'bg-orange-50',
            liked: true,
            status: null
        }
    ];

    return (
        <div className="flex flex-col h-full bg-bg-soft text-text-main relative animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="p-6 flex items-center gap-4 relative z-10">
                <button
                    onClick={onBack}
                    className="bg-white border border-gray-200 rounded-full px-4 py-2.5 flex items-center gap-2 font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm"
                >
                    <ArrowLeft size={18} strokeWidth={2.5} /> Back
                </button>
                <h2 className="text-xl font-bold flex-1 text-center pr-20">Guardian Profile</h2>
            </div>

            <div className="flex-1 overflow-y-auto pb-24 no-scrollbar px-6">

                {/* Profile Section */}
                <div className="flex flex-col items-center mt-2 mb-8">
                    <div className="relative mb-4 group">
                        <div className="w-32 h-32 rounded-full p-1 bg-white shadow-soft">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatarSeed}`}
                                alt={contact.name}
                                className="w-full h-full rounded-full bg-gray-50 object-cover"
                            />
                        </div>
                        {contact.isOnline && (
                            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-black mb-2 text-gray-900">{contact.name}</h1>

                    <div className="flex items-center gap-2 bg-emerald-100/50 px-4 py-1.5 rounded-full mb-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-emerald-700 font-bold text-sm">Online & Nearby</span>
                    </div>

                    <p className="text-gray-500 font-medium">{contact.role === 'caregiver' ? 'Primary Caregiver' : 'Family Member'}</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <button className="bg-blue-500 text-white rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform hover:bg-blue-600 h-36">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Phone fill="currentColor" size={24} />
                        </div>
                        <span className="font-bold text-lg">Call</span>
                    </button>

                    <button className="bg-[#111827] text-white rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-gray-900/20 active:scale-95 transition-transform hover:bg-black h-36">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <Mic fill="currentColor" size={24} />
                        </div>
                        <span className="font-bold text-lg">Voice Msg</span>
                    </button>
                </div>

                {/* Care Footprints */}
                <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-xl font-bold text-gray-900">Care Footprints</h3>
                        <button className="text-blue-500 font-bold text-sm hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {footprints.map((item) => (
                            <div key={item.id} className="bg-white p-5 rounded-[28px] flex items-center gap-4 shadow-card border border-white hover:border-gray-100 transition-colors">
                                <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-base mb-0.5 truncate">{item.title}</h4>
                                    <p className="text-gray-500 text-sm font-medium">{item.time}</p>
                                    {item.status && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <CheckCircle2 size={14} className="text-blue-500" />
                                            <span className="text-blue-500 text-xs font-bold">{item.status}</span>
                                        </div>
                                    )}
                                </div>
                                <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors">
                                    <Heart size={20} fill={item.liked ? "#EF4444" : "none"} className={item.liked ? "text-red-500" : ""} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
