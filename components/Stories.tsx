import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Room } from '../types';

interface StoriesProps {
    rooms: Room[];
    onAllRoomsClick: () => void;
    onClubClick: (room: Room) => void;
}

const Stories: React.FC<StoriesProps> = ({ rooms, onAllRoomsClick, onClubClick }) => {
    return (
        <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-6">
            {rooms.map((room) => (
                <div key={room.id} className="flex flex-col items-center gap-2 shrink-0">
                    {room.isAll ? (
                        <button
                            onClick={onAllRoomsClick}
                            className="w-20 h-20 bg-[#003366] rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform"
                        >
                            <LayoutGrid size={32} />
                        </button>
                    ) : (
                        <button
                            onClick={() => onClubClick(room)}
                            className="w-20 h-20 rounded-full bg-gray-200 shadow-md overflow-hidden ring-2 ring-white border border-gray-100 active:scale-95 transition-transform"
                        >
                            <img src={room.imageUrl} className="w-full h-full object-cover" alt={room.name} />
                        </button>
                    )}
                    <div className={`text-[10px] font-black uppercase text-center leading-tight w-16 truncate ${room.isAll ? 'text-[#3b82f6]' : 'text-gray-500'}`}>
                        {room.name}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Stories;
