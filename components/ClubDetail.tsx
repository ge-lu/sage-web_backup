import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Share2, Copy, MessageCircle, MessageSquare, Check, X, Camera, Send } from 'lucide-react';
import { Room, Post } from '../types';
import FeedCard from './FeedCard';
import PostFlow from './PostFlow';
import ShareModal from './ShareModal';

interface ClubDetailProps {
  room: Room;
  onClose: () => void;
  posts: Post[];
  isNew?: boolean;
  onAddPost: (title: string, imageUrl: string) => void;
}

const ClubDetail: React.FC<ClubDetailProps> = ({ room, onClose, posts, isNew, onAddPost }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteStep, setInviteStep] = useState<'invite' | 'sending' | 'success'>('invite');
  const [inviteDest, setInviteDest] = useState('');
  const [isPostFlowOpen, setIsPostFlowOpen] = useState(false);
  const [sharingPost, setSharingPost] = useState<{ post: Post; message: string } | null>(null);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShowInvite(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handleShare = (dest: string) => {
    setInviteDest(dest);
    setInviteStep('sending');
    setTimeout(() => {
      setInviteStep('success');
    }, 1500);
  };

  const closeInvite = () => {
    setShowInvite(false);
    setInviteStep('invite');
  };

  const handlePostCreated = (title: string, imageUrl: string) => {
    onAddPost(title, imageUrl);
    setIsPostFlowOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#F5F7F9] flex flex-col font-sans animate-in slide-in-from-right duration-300">
      {isPostFlowOpen && (
        <PostFlow
          onClose={() => setIsPostFlowOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {sharingPost && (
        <ShareModal
          post={sharingPost.post}
          message={sharingPost.message}
          onClose={() => setSharingPost(null)}
        />
      )}

      {/* Invite Friends Modal Overlay - Standardized Share Interface */}
      {showInvite && (
        <div className="fixed inset-0 z-[600] bg-[#F5F7F9] flex flex-col font-sans select-none overflow-hidden animate-in fade-in slide-in-from-right duration-300">
          
          {inviteStep === 'invite' && (
            <>
              {/* Header */}
              <div className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={closeInvite}
                    className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-transform -ml-2"
                  >
                    <ArrowLeft size={28} className="text-gray-900" strokeWidth={3} />
                  </button>
                  <h2 className="text-gray-900 font-heading text-2xl font-bold tracking-tight whitespace-nowrap">INVITE FAMILY</h2>
                </div>
                <div className="w-12" />
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-10 space-y-4">
                {/* Horizontal Preview Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                     <img
                        src={room.imageUrl || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop"}
                        className="w-full h-full object-cover"
                        alt={room.name}
                      />
                  </div>

                  <div className="flex-1 flex flex-col justify-center overflow-hidden">
                    <span className="text-gray-500 font-bold font-heading uppercase tracking-wider text-xs mb-1">YOU ARE INVITING TO</span>
                    <p className="text-lg font-bold font-heading text-guardian-blue italic leading-snug line-clamp-2">
                      "{room.name}"
                    </p>
                  </div>
                </div>

                {/* Destination Buttons */}
                <div>
                  <p className="text-center text-gray-400 font-bold font-heading uppercase tracking-widest text-xs mb-4">CHOOSE HOW TO INVITE:</p>
                  <div className="space-y-3">

                    {/* 1. WhatsApp */}
                    <button
                      onClick={() => handleShare('WhatsApp')}
                      className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                        <MessageCircle size={18} fill="white" className="text-white" />
                      </div>
                      <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">WhatsApp</span>
                    </button>

                    {/* 2. iMessage */}
                    <button
                      onClick={() => handleShare('iMessage')}
                      className="w-full py-4 bg-[#F5F9FF] rounded-xl flex items-center px-6 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                        <MessageSquare size={18} fill="white" className="text-white" />
                      </div>
                      <span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">iMessage</span>
                    </button>

                    {/* 3. Copy Link */}
                    <button
                      onClick={() => handleShare('Copied Link')}
                      className="w-full py-4 bg-white rounded-xl flex items-center px-6 gap-4 border border-gray-200 shadow-sm active:scale-[0.98] transition-all hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 shadow-sm border border-gray-200">
                        <Copy size={18} className="text-gray-500" />
                      </div>
                      <span className="text-sm font-bold font-heading uppercase text-gray-500 tracking-wide">Copy Link</span>
                    </button>

                  </div>
                </div>
              </div>
            </>
          )}

          {inviteStep === 'sending' && (
            <div className="flex-1 bg-guardian-blue flex flex-col items-center justify-center p-10">
              <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-12 relative">
                <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <Send size={64} className="text-white animate-bounce" />
              </div>
              <h2 className="text-4xl font-black font-heading text-white text-center">Sending Invite...</h2>
            </div>
          )}

          {inviteStep === 'success' && (
            <div className="absolute inset-0 bg-[#F5F7F9] flex flex-col items-center justify-center p-6 z-[800] text-center animate-in zoom-in-95 duration-500">
              <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-gray-100 animate-in zoom-in duration-500">
                <Check size={96} strokeWidth={5} className="text-guardian-blue" />
              </div>
              <h2 className="text-4xl font-bold font-heading text-guardian-blue mb-4 uppercase tracking-tight">Good News!</h2>
              <p className="text-xl text-gray-500 font-medium mb-12 px-6 leading-relaxed max-w-md">
                Your family will be here soon! ❤️
              </p>
              <button
                onClick={closeInvite}
                className="w-full max-w-sm h-16 bg-guardian-blue text-white rounded-2xl text-xl font-bold font-heading shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                Finish
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-900 active:scale-95 transition-transform hover:bg-gray-50 shadow-sm shrink-0"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <h1 className="text-gray-900 font-heading text-2xl font-bold tracking-tight truncate pr-4">
            {room.name}
          </h1>
        </div>

        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm active:bg-gray-50 transition-all font-heading font-black text-sm uppercase tracking-wide text-gray-900 shrink-0"
        >
          <Share2 size={18} strokeWidth={2.5} className="text-guardian-blue" />
          <span>Invite</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-12 no-scrollbar">
        {/* Hero Section */}
        <div className="w-full h-72 relative rounded-2xl overflow-hidden shadow-sm bg-gray-200">
          {room.isGroupGrid && room.groupImages ? (
            <div className="w-full h-full grid grid-cols-2">
              {room.groupImages.slice(0, 4).map((img, i) => (
                <img key={i} src={img} className="w-full h-full object-cover border-white border-[0.5px]" alt="Member" />
              ))}
            </div>
          ) : (
            <img
              src={room.imageUrl || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop"}
              className="w-full h-full object-cover"
              alt={room.name}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />

          <div className="absolute bottom-8 left-6 right-6 text-white">
            <div className="inline-flex items-center gap-2 font-bold text-xs bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full mb-3 border border-white/30">
              <Users size={14} />
              <span>{room.isGroupGrid ? '8 Members' : '1 Member'}</span>
            </div>
            <h2 className="text-3xl font-heading font-black uppercase tracking-tighter leading-none mb-2 drop-shadow-lg">{room.name}</h2>
            <p className="text-white/80 font-sans font-medium text-lg line-clamp-2">
              A space for us to share memories, photos, and laughs together.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="py-8 space-y-8 bg-[#F5F7F9] min-h-screen">

          {/* Share to Group Button */}
          <div
            onClick={() => setIsPostFlowOpen(true)}
            className="w-full h-16 bg-white rounded-2xl border border-gray-200 flex items-center justify-center gap-4 cursor-pointer active:scale-95 transition-all hover:bg-gray-50 shadow-sm"
          >
            <div className="w-10 h-10 bg-guardian-blue rounded-full flex items-center justify-center text-white shrink-0">
              <Camera size={20} fill="white" />
            </div>
            <p className="text-lg font-heading font-bold text-gray-900 tracking-tight whitespace-nowrap uppercase">Share to Group</p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-black text-gray-900 uppercase tracking-tight">Latest Memories</h3>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map(post => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onShare={(msg) => setSharingPost({ post, message: msg })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 opacity-50 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Plus size={40} className="text-gray-400" />
              </div>
              <p className="text-xl font-heading font-bold text-gray-900 mb-1">No memories yet</p>
              <p className="font-sans font-medium text-gray-500">Share the first photo!</p>
            </div>
          )}

          <div className="h-12" />
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;