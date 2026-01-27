
import React from 'react';
import { Icons } from '../constants';

interface ProductOption {
    vendor: string;
    price: string;
    delivery: string;
    recommended: boolean;
}

interface PriceComparisonCardProps {
    products: ProductOption[];
    onSelect: (vendor: string) => void;
    onCancel: () => void;
}

const PriceComparisonCard: React.FC<PriceComparisonCardProps> = ({ products, onSelect, onCancel }) => {
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] w-full animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Icons.ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Best Prices Found</h3>
            </div>

            <p className="text-gray-500 mb-6 text-sm">
                I found the exact same item. Left is faster, Right is cheaper. Which one?
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {products.map((p, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(p.vendor)}
                        className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all active:scale-95 ${p.recommended ? 'border-[#00E341] bg-green-50/50' : 'border-gray-100 bg-white'}`}
                    >
                        {p.recommended && (
                            <div className="absolute -top-3 px-3 py-1 bg-[#00E341] text-black text-[10px] font-bold uppercase rounded-full shadow-sm">
                                Best Value
                            </div>
                        )}
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{p.vendor}</span>
                        <span className="text-2xl font-bold text-gray-900 mb-1">{p.price}</span>
                        <span className="text-xs text-gray-500 font-medium text-center">{p.delivery}</span>
                    </button>
                ))}
            </div>

            <button
                onClick={onCancel}
                className="w-full h-12 rounded-full bg-gray-100 text-gray-600 font-bold"
            >
                No thanks
            </button>
        </div>
    );
};

export default PriceComparisonCard;
