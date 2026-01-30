
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../constants';

interface RideDetailState {
  stage: 'PICKUP' | 'IN_TRIP';
  driver: {
    name: string;
    rating: number;
    photo: string;
    carModel: string;
    carColor: string;
    plateNumber: string;
    eta: number;
  };
}

const MOCK_DRIVER = {
  name: "Michael",
  rating: 4.9,
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
  carModel: "Toyota Camry",
  carColor: "Silver",
  plateNumber: "7ABC123",
  eta: 4
};

const RideDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get state from navigation, or use defaults
  const state = location.state as RideDetailState | null;
  const stage = state?.stage || 'PICKUP';
  const driver = state?.driver || MOCK_DRIVER;

  const handleCall = () => {
    window.location.href = `tel:5550123`;
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="absolute inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-300 h-full w-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pt-12">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Icons.ChevronDown className="w-6 h-6" />
        </button>
        <div className="backdrop-blur-md px-4 py-2 rounded-full border font-bold text-sm shadow-xl bg-white text-black border-gray-200">
          {stage === 'PICKUP' ? `Arriving in ${driver.eta} min` : 'On Trip'}
        </div>
      </div>

      {/* Full Map */}
      <div className="flex-1 bg-gray-100 relative w-full">
        <img 
          src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=80" 
          alt="Route Map" 
          className="w-full h-full object-cover" 
        />

        {/* Pins */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -ml-10 -mt-20">
              <div className="bg-black text-white p-2 rounded-lg shadow-xl mb-2 whitespace-nowrap text-xs font-bold animate-in fade-in zoom-in text-center">
                {driver.name}<br />{driver.eta} min
              </div>
              <div className="w-12 h-12 bg-black rounded-full border-4 border-white flex items-center justify-center shadow-2xl mx-auto">
                <Icons.Car className="w-6 h-6 text-white" />
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
            <h2 className="text-2xl font-bold text-text-main mb-1">{driver.name}</h2>
            <div className="flex items-center gap-2 text-text-sub text-sm">
              <span className="font-bold">{driver.carModel} ({driver.carColor})</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-text-main font-mono border border-gray-200">{driver.plateNumber}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-md overflow-hidden mb-1">
              <img src={driver.photo} alt={driver.name} className="w-full h-full bg-gray-50" />
            </div>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              <Icons.Star className="w-3 h-3 fill-current" /> {driver.rating}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-0.5 h-full bg-gray-200"></div>
            <div className="w-3 h-3 bg-black rounded-full"></div>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
              <p className="text-text-main font-medium text-lg border-b border-gray-100 pb-2">Home</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dropoff</p>
              <p className="text-text-main font-medium text-lg">Dr. Smith Clinic</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleBack}
            className="bg-gray-100 hover:bg-gray-200 text-text-main py-4 rounded-2xl font-bold text-sm transition-colors"
          >
            Done
          </button>
          <button
            onClick={handleCall}
            className="bg-black text-white hover:bg-gray-900 py-4 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            <Icons.Phone className="w-4 h-4" /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideDetailPage;
