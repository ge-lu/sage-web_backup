
import React, { useState } from 'react';
import { Send, Instagram, Twitter, MessageCircle, Check, Users, Plus, ArrowLeft, MoreHorizontal, X } from 'lucide-react';

interface ShareContentProps {
    onClose: () => void;
    onShareSuccess?: () => void;
}

const ShareContent: React.FC<ShareContentProps> = ({ onClose, onShareSuccess }) => {
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [showFullList, setShowFullList] = useState(false);

    const platforms = [
        { name: 'WeChat', icon: <MessageCircle className="text-green-500" />, color: 'bg-green-50' },
        { name: 'Instagram', icon: <Instagram className="text-pink-500" />, color: 'bg-pink-50' },
        { name: 'X', icon: <Twitter className="text-blue-500" />, color: 'bg-blue-50' },
        { name: 'WhatsApp', icon: <Send className="text-emerald-500" />, color: 'bg-emerald-50' },
    ];

    const recentFriends = [
        // Individuals first
        { name: 'Alex', img: 'https://picsum.photos/seed/alex/80', isGroup: false },
        { name: 'Sarah', img: 'https://picsum.photos/seed/sarah/80', isGroup: false },
        { name: 'Jordan', img: 'https://picsum.photos/seed/jordan/80', isGroup: false },
        { name: 'Mike', img: 'https://picsum.photos/seed/mike/80', isGroup: false },
        // Groups second
        { name: 'Family', img: 'https://picsum.photos/seed/family/80', isGroup: true },
        { name: 'Work', img: 'https://picsum.photos/seed/office/80', isGroup: true },
        { name: 'Design', img: 'https://picsum.photos/seed/design/80', isGroup: true },
    ];

    const allContacts = [
        ...recentFriends,
        { name: 'BFFs', img: 'https://picsum.photos/seed/friends/80', isGroup: true },
        { name: 'Alice', img: 'https://picsum.photos/seed/alice/80', isGroup: false },
        { name: 'Bob', img: 'https://picsum.photos/seed/bob/80', isGroup: false },
        { name: 'Charlie', img: 'https://picsum.photos/seed/charlie/80', isGroup: false },
        { name: 'David', img: 'https://picsum.photos/seed/david/80', isGroup: false },
        { name: 'Emma', img: 'https://picsum.photos/seed/emma/80', isGroup: false },
        { name: 'Frank', img: 'https://picsum.photos/seed/frank/80', isGroup: false },
        { name: 'Grace', img: 'https://picsum.photos/seed/grace/80', isGroup: false },
    ];

    const toggleFriend = (name: string) => {
        setSelectedFriends(prev =>
            prev.includes(name)
                ? prev.filter(f => f !== name)
                : [...prev, name]
        );
    };

    const togglePlatform = (name: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(name)
                ? prev.filter(p => p !== name)
                : [...prev, name]
        );
    };

    const totalSelected = selectedFriends.length + selectedPlatforms.length;

    const handlePrimaryAction = () => {
        if (totalSelected > 0) {
            if (onShareSuccess) {
                onShareSuccess();
            } else {
                onClose();
            }
        } else {
            onClose();
        }
    };

    if (showFullList) {
        return (
            <div className="flex flex-col h-[70vh] -mx-6 -mt-10 animate-in slide-in-from-right duration-300 bg-white">
                <div className="px-6 py-6 border-b border-gray-100 flex items-center gap-4 bg-white sticky top-0 z-10">
                    <button
                        onClick={() => setShowFullList(false)}
                        className="p-3 hover:bg-gray-100 rounded-full transition-colors text-slate-700 active:scale-90"
                    >
                        <ArrowLeft size={28} strokeWidth={3} />
                    </button>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Select Friends</h3>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar">
                    {allContacts.map((friend) => {
                        const isSelected = selectedFriends.includes(friend.name);
                        const borderRadius = friend.isGroup ? 'rounded-2xl' : 'rounded-full';

                        return (
                            <button
                                key={friend.name}
                                onClick={() => toggleFriend(friend.name)}
                                className={`w-full flex items-center gap-5 p-4 rounded-3xl transition-all active:scale-[0.98] ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`w-16 h-16 ${borderRadius} overflow-hidden border-2 relative shrink-0 ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-100'}`}>
                                    <img src={friend.img} alt={friend.name} className="w-full h-full object-cover" />
                                    {friend.isGroup && (
                                        <div className="absolute bottom-0 right-0 bg-blue-600 border border-white rounded-lg p-1">
                                            <Users size={10} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className={`text-xl font-bold flex-1 text-left ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                    {friend.name}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-blue-600 border-blue-600 shadow-blue-200 shadow-lg' : 'border-gray-200'}`}>
                                    {isSelected && <Check size={20} className="text-white" strokeWidth={4} />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 bg-white border-t border-gray-100">
                    <button
                        onClick={() => setShowFullList(false)}
                        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xl font-black tracking-widest active:scale-95"
                    >
                        DONE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 select-none bg-white h-full overflow-y-auto px-6 py-8">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Share with Friends</h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 active:scale-95 hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-y-10 gap-x-2">
                    {recentFriends.map((friend) => {
                        const isSelected = selectedFriends.includes(friend.name);
                        const borderRadius = friend.isGroup ? 'rounded-[1.5rem]' : 'rounded-full';

                        return (
                            <button
                                key={friend.name}
                                onClick={() => toggleFriend(friend.name)}
                                className="flex flex-col items-center gap-3 group relative active:scale-95 transition-transform"
                            >
                                <div className={`w-18 h-18 ${borderRadius} overflow-hidden border-[3px] transition-all p-1 relative ${isSelected ? 'border-blue-500 scale-105 shadow-xl' : 'border-transparent active:border-gray-200'} ${friend.isGroup ? 'bg-blue-50/30' : ''}`}>
                                    <img src={friend.img} alt={friend.name} className={`w-full h-full object-cover ${borderRadius}`} />

                                    {friend.isGroup && (
                                        <div className="absolute bottom-0 right-0 bg-blue-600 border-2 border-white rounded-xl p-1.5 shadow-md ring-2 ring-white translate-x-1.5 translate-y-1.5">
                                            <Users size={12} className="text-white" strokeWidth={3} />
                                        </div>
                                    )}

                                    {isSelected && (
                                        <div className={`absolute inset-0 bg-blue-500/30 flex items-center justify-center ${borderRadius}`}>
                                            <div className="bg-blue-600 text-white rounded-full p-1 shadow-lg ring-2 ring-white">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-sm font-bold transition-colors mt-1 truncate w-full text-center ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                                    {friend.name}
                                </span>
                            </button>
                        );
                    })}

                    {/* "More" Button */}
                    <button
                        onClick={() => setShowFullList(true)}
                        className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
                    >
                        <div className="w-18 h-18 rounded-full bg-gray-50 border-[3px] border-transparent active:border-gray-200 flex items-center justify-center text-slate-400 group-hover:bg-gray-100 group-hover:text-slate-600 transition-all p-1">
                            <div className="w-full h-full rounded-full bg-gray-100/50 flex items-center justify-center relative overflow-hidden">
                                <div className="flex items-center justify-center relative scale-90">
                                    <Plus size={28} strokeWidth={3} className="absolute opacity-10" />
                                    <MoreHorizontal size={32} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wide">More</span>
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-8 tracking-tight">Send to Platform</h3>
                <div className="grid grid-cols-4 gap-y-10 gap-x-2">
                    {platforms.map((platform) => {
                        const isSelected = selectedPlatforms.includes(platform.name);
                        return (
                            <button
                                key={platform.name}
                                className="flex flex-col items-center gap-4 group active:scale-95 transition-transform"
                                onClick={() => togglePlatform(platform.name)}
                            >
                                <div className={`w-18 h-18 rounded-[1.5rem] relative flex items-center justify-center transition-all ${isSelected ? 'ring-4 ring-blue-500 scale-105 bg-blue-50 shadow-xl' : `${platform.color} shadow-sm border border-gray-100/50`}`}>
                                    {React.cloneElement(platform.icon as React.ReactElement, { size: 36, strokeWidth: 2.5 })}
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 shadow-lg ring-2 ring-white">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[12px] font-extrabold uppercase tracking-widest text-center transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                                    {platform.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="pt-4 pb-12">
                <button
                    onClick={handlePrimaryAction}
                    className={`w-full py-6 rounded-[2rem] text-xl font-black uppercase tracking-[0.15em] transition-all shadow-xl active:scale-[0.97] ${totalSelected > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                        : 'bg-gray-100 text-slate-500 shadow-none'
                        }`}
                >
                    {totalSelected > 0 ? `SHARE (${totalSelected})` : 'CANCEL'}
                </button>
            </div>
        </div>
    );
};

export default ShareContent;
