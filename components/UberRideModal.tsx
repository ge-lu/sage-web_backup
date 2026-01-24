
import React, { useState } from 'react';
import { Icons } from '../constants';

interface UberRideModalProps {
    onClose: () => void;
}

const UberRideModal: React.FC<UberRideModalProps> = ({ onClose }) => {
    const [step, setStep] = useState<'DESTINATION' | 'CONFIRM' | 'TRACKING'>('DESTINATION');

    // Mock Data based on PRD
    const destination = "Dr. Smith's Clinic";
    const address = "450 Medical Plaza, Suite 100";
    const price = "$14.50";
    const eta = "4 mins";
    const car = "Toyota Camry";
    const plate = "ABC-123";

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                
                {/* Header */}
                <div className="bg-black text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
                           <span className="font-bold text-xs">Uber</span>
                        </div>
                        <span className="font-bold text-lg">Health & Life Assistant</span>
                    </div>
                    <button onClick={onClose}><Icons.X className="w-6 h-6" /></button>
                </div>

                <div className="p-6">
                    {step === 'DESTINATION' && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Where to?</h2>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 border border-gray-100 mb-6">
                                <Icons.Home className="w-6 h-6 text-gray-400" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{destination}</p>
                                    <p className="text-xs text-gray-500">{address}</p>
                                </div>
                                <Icons.Check className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-gray-500 text-sm mb-6">
                                Based on your calendar, you have an appointment at 10:00 AM.
                            </p>
                            <button 
                                onClick={() => setStep('CONFIRM')}
                                className="w-full h-14 bg-black text-white rounded-full font-bold text-lg"
                            >
                                Check Prices
                            </button>
                        </>
                    )}

                    {step === 'CONFIRM' && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Ride</h2>
                            
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                                    <p className="text-3xl font-bold text-gray-900">{price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Pickup In</p>
                                    <p className="text-3xl font-bold text-[#10B981]">{eta}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-8 bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
                                <Icons.Info className="w-5 h-5 shrink-0" />
                                Payment linked to Family Account (Ends in 4242)
                            </div>

                            <button 
                                onClick={() => setStep('TRACKING')}
                                className="w-full h-14 bg-[#00E341] text-black rounded-full font-bold text-lg shadow-lg mb-3"
                            >
                                Confirm Ride
                            </button>
                            <button onClick={() => setStep('DESTINATION')} className="w-full py-3 text-gray-500 font-bold">Cancel</button>
                        </>
                    )}

                    {step === 'TRACKING' && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Icons.Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Driver is on the way!</h2>
                            <p className="text-gray-500 mb-6">Look for a {car} ({plate})</p>
                            
                            <div className="bg-gray-100 rounded-xl h-48 w-full flex items-center justify-center mb-6">
                                <span className="text-gray-400 font-medium">Map Simulation</span>
                            </div>

                            <button onClick={onClose} className="w-full h-14 bg-gray-900 text-white rounded-full font-bold">
                                Close & Monitor
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UberRideModal;
