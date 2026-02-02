import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Room } from '../types';

interface MyRoomsProps {
  rooms: Room[];
  onStartNewGroup: () => void;
  onDone: () => void;
  onClubClick: (room: Room) => void;
}

const MyRooms: React.FC<MyRoomsProps> = ({ rooms, onStartNewGroup, onDone, onClubClick }) => {
  const displayRooms = rooms.filter(r => !r.isAll);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F7F9] flex flex-col font-sans select-none">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-gray-900 font-heading text-2xl font-bold tracking-tight">My Groups</h1>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-12 no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          {/* Start New Group Card */}
          <button
            onClick={onStartNewGroup}
            className="aspect-square bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 shadow-sm active:scale-95 transition-transform hover:bg-gray-50"
          >
            <div className="w-20 h-20 bg-[#F5F9FF] rounded-full flex items-center justify-center text-guardian-blue shadow-none">
              <Plus size={44} strokeWidth={4} />
            </div>
            <span className="text-xl font-heading font-bold text-gray-900 leading-tight text-center px-4">
              Start New<br />Group
            </span>
          </button>

          {/* Room Cards */}
          {displayRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onClubClick(room)}
              className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group active:scale-95 transition-transform text-left"
            >
              {room.isNew && (
                <div className="absolute top-0 right-0 z-20">
                  <div className="bg-[#EA4335] text-white text-xs font-black px-4 py-2 rounded-bl-2xl shadow-lg uppercase tracking-wider">
                    NEW
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-hidden bg-gray-100 w-full h-full">
                {room.isGroupGrid ? (
                  <div className="grid grid-cols-2 h-full">
                    {room.groupImages?.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} className="w-full h-full object-cover border-[1px] border-white" alt="Group member" />
                    ))}
                    <div className="bg-[#F5F9FF] flex items-center justify-center text-guardian-blue text-3xl font-heading font-black">
                      +8
                    </div>
                  </div>
                ) : (
                  <img src={room.imageUrl} className="w-full h-full object-cover" alt={room.name} />
                )}
              </div>

              <div className="py-6 px-4 text-center bg-white w-full">
                <span className="text-xl font-heading font-bold text-gray-900 leading-tight">{room.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 pb-24 bg-[#F5F7F9] border-t border-gray-200">
        <button
          onClick={onDone}
          className="w-full h-16 bg-guardian-blue text-white rounded-2xl text-xl font-heading font-black flex items-center justify-center gap-4 shadow-lg active:scale-95 transition-all uppercase tracking-wide"
        >
          DONE
          <ChevronDown size={32} strokeWidth={4} />
        </button>
      </div>
    </div>
  );
};

export default MyRooms;