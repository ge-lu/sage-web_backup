
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
        <div className={`rounded-[24px] p-5 border shadow-lg relative overflow-hidden transition-all ${isSuggestion ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800'}`}>

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSuggestion ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        {isSuggestion ? <ShoppingBag size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white leading-tight">{item.title}</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{item.merchant} • {item.date}</p>
                    </div>
                </div>
                <span className="text-white font-bold text-lg">${item.amount.toFixed(2)}</span>
            </div>

            {isSuggestion && item.image && (
                <div className="flex gap-4 mb-4 bg-black/40 p-3 rounded-xl border border-zinc-800">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 flex flex-col justify-center">
                        <p className="text-zinc-300 text-sm leading-tight mb-1">Low stock detected based on usage history.</p>
                        <span className="text-neon text-xs font-bold">Smart Reorder</span>
                    </div>
                </div>
            )}

            {isSuggestion && status !== 'completed' ? (
                <button
                    onClick={handleApprove}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                >
                    <Package size={18} /> Approve Order
                </button>
            ) : (
                <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium bg-zinc-800/50 p-2 rounded-lg justify-center">
                    {status === 'completed' || status === 'shipped' ? (
                        <>
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span>{isSuggestion ? 'Order Placed' : 'Payment Successful'}</span>
                        </>
                    ) : (
                        <span>Pending</span>
                    )}
                </div>
            )}
        </div>
    );
};
