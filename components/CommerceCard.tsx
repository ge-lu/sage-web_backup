
import React, { useState } from 'react';
import { ShoppingBag, CreditCard, ChevronRight, CheckCircle2, Package } from 'lucide-react';
import { CommerceItem } from '../types';

interface CommerceCardProps {
  item: CommerceItem;
}

export const CommerceCard: React.FC<CommerceCardProps> = ({ item }) => {
  const [status, setStatus] = useState(item.status);

  const handleApprove = () => {
    setStatus('completed');
  };

  const isSuggestion = item.type === 'purchase_suggestion';

  return (
    <div className={`rounded-xl p-5 border shadow-sm relative overflow-hidden transition-all hover:shadow-md ${isSuggestion ? 'bg-white border-gray-200' : 'bg-white border-gray-200'}`}>

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSuggestion ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-500'}`}>
            {isSuggestion ? <ShoppingBag size={20} /> : <CreditCard size={20} />}
          </div>
          <div>
            <h3 className="font-bold font-heading text-lg text-gray-900 leading-tight">{item.title}</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{item.merchant} • {item.date}</p>
          </div>
        </div>
        <span className="text-gray-900 font-black font-heading text-lg">${item.amount.toFixed(2)}</span>
      </div>

      {isSuggestion && item.image && (
        <div className="flex gap-4 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover mix-blend-multiply" />
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-gray-600 text-sm leading-tight mb-1 font-medium">Low stock detected based on usage history.</p>
            <span className="text-blue-600 text-xs font-black font-heading uppercase tracking-wide">Smart Reorder</span>
          </div>
        </div>
      )}

      {isSuggestion && status !== 'completed' ? (
        <button
          onClick={handleApprove}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold font-heading uppercase tracking-wide text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Package size={18} /> Approve Order
        </button>
      ) : (
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50 p-2 rounded-lg justify-center border border-gray-100">
          {status === 'completed' || status === 'shipped' ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="font-heading font-bold uppercase tracking-wide text-xs text-emerald-600">{isSuggestion ? 'Order Placed' : 'Payment Successful'}</span>
            </>
          ) : (
            <span>Pending</span>
          )}
        </div>
      )}
    </div>
  );
};
