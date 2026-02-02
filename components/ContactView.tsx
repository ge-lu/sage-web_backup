
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
      icon: <Pill size={20} />,
      status: null
    },
    {
      id: 2,
      title: 'Updated doctor visit',
      time: '9:15 AM · Today',
      icon: <Calendar size={20} />,
      status: 'You sent thanks'
    },
    {
      id: 3,
      title: 'Added milk to list',
      time: '6:45 PM · Yesterday',
      icon: <ShoppingBag size={20} />,
      status: null
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F7F9] text-text-main relative animate-in slide-in-from-right duration-300">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F5F7F9] border-b border-gray-200 px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 shadow-sm -ml-2 hover:bg-gray-100 active:scale-95 transition-all"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-xl font-bold font-heading flex-1 text-center pr-12 text-gray-900">Guardian Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar px-6">

        {/* Profile Section */}
        <div className="flex flex-col items-center mt-2 mb-8">
          <div className="relative mb-4 group">
            <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-md">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatarSeed}`}
                alt={contact.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {contact.isOnline && (
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-guardian-blue border-4 border-white rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-black font-heading mb-2 text-gray-900">{contact.name}</h1>

          <div className="flex items-center gap-2 bg-[#F5F9FF] border border-blue-100 px-4 py-1.5 rounded-full mb-2">
            <div className="w-2.5 h-2.5 bg-guardian-blue rounded-full animate-pulse"></div>
            <span className="text-guardian-blue font-bold text-sm">Online & Nearby</span>
          </div>

          <p className="text-lg text-gray-500 font-medium">{contact.role === 'caregiver' ? 'Primary Caregiver' : 'Family Member'}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <button className="bg-guardian-blue text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform hover:bg-blue-700 h-28">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Phone fill="currentColor" size={20} />
            </div>
            <span className="font-bold font-heading text-base text-center">Call</span>
          </button>

          <button className="bg-white text-gray-900 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-gray-50 h-28">
            <div className="w-10 h-10 rounded-full bg-[#F5F9FF] text-guardian-blue flex items-center justify-center">
              <Mic fill="currentColor" size={20} />
            </div>
            <span className="font-bold font-heading text-base text-center">Message</span>
          </button>

           <button className="bg-white text-gray-900 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-gray-50 h-28">
            <div className="w-10 h-10 rounded-full bg-[#F5F9FF] text-guardian-blue flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <span className="font-bold font-heading text-base text-center">Assign Task</span>
          </button>
        </div>

        {/* Care Footprints */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2 ml-2">Care Footprints</h3>
            <button className="text-guardian-blue font-bold font-heading text-sm hover:underline mb-2">View All</button>
          </div>

          <div className="space-y-4">
            {footprints.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl flex items-center gap-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] text-guardian-blue flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold font-heading text-gray-900 text-base mb-0.5 truncate">{item.title}</h4>
                  <p className="text-gray-500 text-sm font-medium">{item.time}</p>
                  {item.status && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <CheckCircle2 size={14} className="text-guardian-blue" />
                      <span className="text-guardian-blue text-xs font-bold">{item.status}</span>
                    </div>
                  )}
                </div>
                <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors">
                  <Heart size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
