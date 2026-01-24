
import React, { useState } from 'react';
import { Car, MapPin, Star, Phone, X, Navigation, MessageSquare, PhoneCall, AlertTriangle, ChevronDown } from 'lucide-react';
import { RideSession } from '../types';

interface RideCardProps {
    ride: RideSession;
}

export const RideCard: React.FC<RideCardProps> = ({ ride: initialRide }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [status, setStatus] = useState(initialRide.status);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showContactOptions, setShowContactOptions] = useState(false);

    const isCancelled = status === 'cancelled';

    const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        setStatus('cancelled');
        setShowCancelConfirm(false);
        setTimeout(() => setIsExpanded(false), 2000);
    };

    const handleContactClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowContactOptions(true);
    };

    const simulateContact = (method: 'call' | 'message') => {
        if (method === 'call') {
            window.location.href = 'tel:+15550192834';
        } else {
            alert(`Opening messages with ${initialRide.driver}...`);
        }
        setShowContactOptions(false);
    };

    // Expanded View (Full Screen)
    if (isExpanded) {
        return (
            <div className="absolute inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-300 h-full w-full">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pt-12">
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                        <ChevronDown size={24} />
                    </button>
                    <div className={`backdrop-blur-md px-4 py-2 rounded-full border font-bold text-sm shadow-xl ${isCancelled ? 'bg-red-500 text-white border-red-600' : 'bg-white text-black border-gray-200'}`}>
                        {isCancelled ? 'CANCELLED' : `Arriving in ${initialRide.eta}`}
                    </div>
                </div>

                {/* Full Map */}
                <div className="flex-1 bg-gray-100 relative w-full">
                    <img src={initialRide.mapImage} alt="Route Map" className="w-full h-full object-cover" />

                    {/* Pins */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-full h-full">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -ml-10 -mt-20">
                                {!isCancelled && (
                                    <div className="bg-black text-white p-2 rounded-lg shadow-xl mb-2 whitespace-nowrap text-xs font-bold animate-in fade-in zoom-in text-center">
                                        {initialRide.driver}<br />{initialRide.eta}
                                    </div>
                                )}
                                <div className={`w-12 h-12 bg-black rounded-full border-4 border-white flex items-center justify-center shadow-2xl mx-auto transition-transform ${isCancelled ? 'grayscale opacity-50' : ''}`}>
                                    <Car size={24} className="text-white" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Sheet */}
                <div className="bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] -mt-6 relative z-10 p-6 pb-12">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-text-main mb-1">{initialRide.driver}</h2>
                            <div className="flex items-center gap-2 text-text-sub text-sm">
                                <span className="font-bold">{initialRide.car}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-text-main font-mono border border-gray-200">{initialRide.plate}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-md overflow-hidden mb-1">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${initialRide.driver}`} alt={initialRide.driver} className="w-full h-full bg-gray-50" />
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                                <Star size={10} fill="currentColor" /> {initialRide.driverRating}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-3 h-3 bg-text-sub rounded-full"></div>
                            <div className="w-0.5 h-full bg-gray-200"></div>
                            <div className="w-3 h-3 bg-black rounded-full"></div>
                        </div>
                        <div className="flex-1 space-y-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
                                <p className="text-text-main font-medium text-lg border-b border-gray-100 pb-2">{initialRide.pickup}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dropoff</p>
                                <p className="text-text-main font-medium text-lg">{initialRide.dropoff}</p>
                            </div>
                        </div>
                    </div>

                    {!isCancelled && (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleCancelClick}
                                className="bg-gray-100 hover:bg-gray-200 text-text-main py-4 rounded-2xl font-bold text-sm transition-colors"
                            >
                                Cancel Ride
                            </button>
                            <button
                                onClick={handleContactClick}
                                className="bg-black text-white hover:bg-gray-900 py-4 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                            >
                                <MessageSquare size={18} /> Contact
                            </button>
                        </div>
                    )}

                    {isCancelled && (
                        <div className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2">
                            <AlertTriangle size={20} /> RIDE CANCELLED
                        </div>
                    )}
                </div>

                {/* Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                        <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-text-main mb-2">Cancel this ride?</h3>
                            <p className="text-text-sub mb-6">A $5.00 fee may apply.</p>
                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={confirmCancel} className="bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600">
                                    Yes, Cancel
                                </button>
                                <button onClick={() => setShowCancelConfirm(false)} className="bg-gray-100 text-text-main font-bold py-3 rounded-xl hover:bg-gray-200">
                                    No, Keep Ride
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Options */}
                {showContactOptions && (
                    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end animate-in fade-in">
                        <div className="bg-white w-full rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-text-main">Contact Driver</h3>
                                <button onClick={() => setShowContactOptions(false)} className="bg-gray-100 p-2 rounded-full text-text-sub"><X size={20} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => simulateContact('call')} className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-green-50 transition-colors group border border-gray-100 hover:border-green-200">
                                    <div className="w-14 h-14 bg-white text-green-500 rounded-full flex items-center justify-center shadow-sm">
                                        <PhoneCall size={28} />
                                    </div>
                                    <span className="font-bold text-text-main">Call</span>
                                </button>
                                <button onClick={() => simulateContact('message')} className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-blue-50 transition-colors group border border-gray-100 hover:border-blue-200">
                                    <div className="w-14 h-14 bg-white text-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                        <MessageSquare size={28} />
                                    </div>
                                    <span className="font-bold text-text-main">Message</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Summary Card
    return (
        <div
            onClick={() => !isCancelled && setIsExpanded(true)}
            className={`bg-text-main text-white rounded-[28px] overflow-hidden shadow-xl mb-6 cursor-pointer group transition-all duration-300 relative ${isCancelled ? 'opacity-50 grayscale' : 'hover:scale-[1.01]'}`}
        >
            {/* Dark theme specifically for the active ride card to make it pop */}
            <div className="h-28 bg-zinc-800 relative">
                {initialRide.mapImage && (
                    <img src={initialRide.mapImage} alt="Route Map" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
                )}
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2">
                    {!isCancelled ? (
                        <>
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-white">Active Ride</span>
                        </>
                    ) : (
                        <span className="text-xs font-bold uppercase tracking-wider text-red-300">Cancelled</span>
                    )}
                </div>
            </div>

            <div className="p-6 pt-0 relative -mt-6">
                <div className="flex justify-between items-end mb-4">
                    <div className="w-16 h-16 bg-white rounded-2xl p-1 shadow-lg">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${initialRide.driver}`} className="w-full h-full rounded-xl bg-gray-100" />
                    </div>
                    <div className="text-right mb-1">
                        <p className="text-2xl font-bold">{initialRide.eta}</p>
                        <p className="text-zinc-400 text-sm font-medium">Estimated Arrival</p>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{initialRide.driver}</h3>
                        <p className="text-zinc-400 text-sm">{initialRide.car} • {initialRide.plate}</p>
                    </div>
                    {!isCancelled && (
                        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <Phone size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
