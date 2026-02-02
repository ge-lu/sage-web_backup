
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({ isOpen, onClose, children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setMounted(false), 500);
            document.body.style.overflow = 'auto';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted) return null;

    return (
        <div className={`absolute inset-0 z-[300] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-2xl transition-transform duration-500 transform ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10 active:scale-95"
                >
                    <X size={20} />
                </button>

                <div className="px-6 pb-12 pt-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BottomDrawer;
