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
    <div className="fixed inset-0 z-[100] bg-[#F6F6F8] flex flex-col font-['Plus_Jakarta_Sans'] select-none">
      {/* Header */}
      <div className="pt-16 pb-8 text-center bg-[#F6F6F8]">
        <h2 className="text-5xl font-black text-black tracking-tight">My Groups</h2>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar">
        <div className="grid grid-cols-2 gap-6">
          {/* Start New Group Card */}
          <button
            onClick={onStartNewGroup}
            className="aspect-square bg-[#E8F5E8] rounded-[2.5rem] border-[5px] border-[#13EC13] flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-transform"
          >
            <div className="w-20 h-20 bg-[#13EC13] rounded-full flex items-center justify-center text-white shadow-lg">
              <Plus size={54} strokeWidth={4} />
            </div>
            <span className="text-3xl font-black text-black leading-tight text-center px-4">
              Start New<br />Group
            </span>
          </button>

          {/* Room Cards */}
          {displayRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onClubClick(room)}
              className="relative bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col group active:scale-95 transition-transform text-left"
            >
              {room.isNew && (
                <div className="absolute top-0 right-0 z-20">
                  <div className="bg-[#EA4335] text-white text-xs font-black px-4 py-2 rounded-bl-3xl shadow-lg uppercase tracking-wider">
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
                    <div className="bg-[#E8F5E8] flex items-center justify-center text-[#13EC13] text-3xl font-black">
                      +8
                    </div>
                  </div>
                ) : (
                  <img src={room.imageUrl} className="w-full h-full object-cover" alt={room.name} />
                )}
              </div>

              <div className="py-6 px-4 text-center bg-white w-full">
                <span className="text-3xl font-black text-black">{room.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-8 pb-12 bg-[#F6F6F8] border-t border-gray-200/50">
        <button
          onClick={onDone}
          className="w-full bg-[#0047AB] text-white py-10 rounded-[2.5rem] text-5xl font-black flex items-center justify-center gap-4 shadow-[0_12px_0_#003380] active:translate-y-2 active:shadow-none transition-all uppercase tracking-tighter"
        >
          DONE
          <ChevronDown size={44} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default MyRooms;