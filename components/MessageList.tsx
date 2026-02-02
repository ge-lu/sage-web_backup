import React from 'react';
import { ChevronLeft, MessageCircle, Heart } from 'lucide-react';

export interface Message {
    id: string;
    sender: string;
    content: string;
    time: string;
    avatar: string;
    read: boolean;
    type?: 'message' | 'like';
}

interface MessageListProps {
    onBack: () => void;
    messages: Message[];
    onMessageClick: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ onBack, messages, onMessageClick }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-[#F5F7F9] flex flex-col h-full font-sans text-gray-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center gap-3 pt-[calc(1rem+env(safe-area-inset-top))]">
                <button
                    onClick={onBack}
                    className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-600"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold font-heading">Messages</h1>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        onClick={() => onMessageClick(msg)}
                        className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer ${!msg.read ? 'ring-2 ring-blue-500/20' : ''}`}
                    >
                        <div className="flex gap-4">
                            <div className="relative">
                                <img
                                    src={msg.avatar}
                                    alt={msg.sender}
                                    className="w-12 h-12 rounded-full bg-gray-100 object-cover"
                                />
                                {!msg.read && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-bold text-gray-900 truncate ${!msg.read ? 'text-blue-600' : ''}`}>
                                        {msg.sender}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-2">
                                        {msg.time}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed line-clamp-2 ${!msg.read ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {msg.type === 'like' && (
                                        <Heart size={14} className="inline mr-1 text-red-500 fill-red-500" />
                                    )}
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageList;
