
import React, { useState } from 'react';
import { Icons, Logos } from '../constants';
import ShoppingCard from '../components/ShoppingCard';
import { ShoppingOption, AppMode } from '../types';

interface ProcurerShopProps {
    onBack?: () => void;
    setMode?: (mode: AppMode) => void;
}

const ProcurerShop: React.FC<ProcurerShopProps> = ({ onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSelect = (vendor: string) => {
      // Deep Link Logic Simulation
      const confirm = window.confirm(`Opening ${vendor} App to complete purchase...`);
      if(confirm && onBack) {
          onBack();
      }
  };

  const handleToggle = (id: string) => {
      setExpandedId(prev => prev === id ? null : id);
  };

  // Mock Data for Tide Detergent
  const options: ShoppingOption[] = [
      {
          id: 'walmart',
          vendor: 'Walmart',
          logo: Logos.Walmart,
          price: '$4.97',
          deliveryTime: 'In Store Pickup',
          distance: '1.2 miles away',
          tag: '🔥 Best Price',
          tagColor: '#EF4444', // Red for hot price
          theme: {
              bg: 'bg-[#EFF6FF]', // Blue-50
              border: 'border-[#DBEAFE]', // Blue-100
              text: 'text-[#1E40AF]', // Blue-800
              button: 'bg-[#2563EB] text-white hover:bg-blue-700'
          },
          isAffiliate: true
      },
      {
          id: 'instacart',
          vendor: 'Instacart',
          logo: Logos.Instacart,
          price: '~ $6.50', // Higher due to fees
          deliveryTime: '2 Hours Delivery',
          tag: '🏠 Stay Home',
          tagColor: '#10B981', // Green
          theme: {
              bg: 'bg-[#F0FDF4]', // Green-50
              border: 'border-[#DCFCE7]',
              text: 'text-[#166534]',
              button: 'bg-[#16A34A] text-white hover:bg-green-700'
          },
          isAffiliate: true
      },
      {
          id: 'amazon',
          vendor: 'Amazon',
          logo: Logos.Amazon,
          price: '$3.85',
          deliveryTime: 'Tomorrow',
          tag: '⚡ Fastest Ship',
          tagColor: '#F59E0B', // Amber
          theme: {
              bg: 'bg-[#FFFBEB]', // Amber-50
              border: 'border-[#FEF3C7]',
              text: 'text-[#92400E]',
              button: 'bg-[#D97706] text-white hover:bg-amber-700'
          },
          isAffiliate: true
      }
  ];

  return (
    <div className="w-full h-full bg-[#F9FAFB] flex flex-col relative overflow-hidden">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 z-10 shadow-sm pt-safe-top">
         <button onClick={onBack} className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform -ml-2">
             <Icons.ChevronLeft className="w-8 h-8 text-gray-900" />
         </button>
         <span className="text-xl font-bold text-gray-900">Shopping Assistant</span>
         <button className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-900 -mr-2">
             <Icons.Settings className="w-7 h-7" />
         </button>
      </div>

      {/* Scrollable Content - Added Extra Padding Bottom (pb-48) to clear floating footer */}
      <div className="flex-1 overflow-y-auto pb-48">
          
          {/* Hero Product Section */}
          <div className="bg-white p-6 pb-8 mb-6 shadow-sm border-b border-gray-100 flex flex-col items-center text-center">
              <div className="w-56 h-56 bg-gray-50 rounded-3xl mb-6 p-6 flex items-center justify-center relative border border-gray-100">
                   {/* Placeholder for Product Image */}
                   <img src="https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&q=80&w=300" className="max-h-full object-contain mix-blend-multiply" alt="Tide" />
                   <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">Scanned</div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                  Tide Original Liquid
              </h1>
              <p className="text-gray-500 font-medium text-lg">
                  100 oz • 汰渍 原味洗衣液
              </p>
          </div>

          {/* Guide Text */}
          <div className="px-6 mb-4">
              <p className="text-gray-900 font-bold text-xl mb-4">Choose Purchase Option</p>
              
              {/* Cards List */}
              <div className="space-y-5">
                  {options.map(opt => (
                      <ShoppingCard 
                        key={opt.id} 
                        option={opt} 
                        isExpanded={expandedId === opt.id}
                        onToggle={() => handleToggle(opt.id)}
                        onSelect={() => handleSelect(opt.vendor)} 
                      />
                  ))}
              </div>
          </div>
          
          {/* Disclaimer */}
          <div className="px-8 text-center mt-6">
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                   Aura is an independent assistant. Prices are estimates and subject to change by the vendor.
               </p>
          </div>

      </div>

      {/* Floating Footer - Lifted with pb-safe-offset */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-safe-offset pt-8 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <div className="flex gap-4 pointer-events-auto">
              <button className="flex-1 h-18 py-4 rounded-full bg-gray-900 text-white font-bold text-xl shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-transform border border-gray-800">
                  <Icons.Mic className="w-7 h-7" /> Speak
              </button>
              <button 
                onClick={onBack}
                className="w-18 px-6 rounded-full bg-white text-gray-900 shadow-lg flex items-center justify-center active:scale-95 transition-transform border border-gray-100"
              >
                  <Icons.Camera className="w-7 h-7" />
              </button>
          </div>
      </div>

    </div>
  );
};
export default ProcurerShop;
