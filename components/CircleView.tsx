
import React from 'react';
import { Users } from 'lucide-react';

export const CircleView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4 bg-black">
            <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center border-4 border-zinc-800">
                <Users size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white">Your Circle</h2>
            <p className="text-center px-8">Manage family members and caregivers here.</p>
        </div>
    );
};
