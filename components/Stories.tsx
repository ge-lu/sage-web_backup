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
              className="w-20 h-20 bg-guardian-blue rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform border border-[#F5F9FF]"
            >
              <LayoutGrid size={32} />
            </button>
          ) : (
            <button
              onClick={() => onClubClick(room)}
              className="w-20 h-20 rounded-full bg-gray-200 shadow-sm overflow-hidden border border-[#F5F9FF] active:scale-95 transition-transform"
            >
              <img src={room.imageUrl} className="w-full h-full object-cover" alt={room.name} />
            </button>
          )}
          <div className={`text-sm font-bold text-gray-900 font-sans text-center leading-tight w-24 ${room.isAll ? 'text-guardian-blue' : ''}`}>
            {room.name.split(' ')[0]}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stories;