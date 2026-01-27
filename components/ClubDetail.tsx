import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Share2, Copy, MessageCircle, MessageSquare, Check, X, Camera } from 'lucide-react';
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
    <div className="fixed inset-0 z-[300] bg-[#FDFBF7] flex flex-col font-['Plus_Jakarta_Sans'] animate-in slide-in-from-right duration-300">
      
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

      {/* Invite Friends Modal Overlay */}
      {showInvite && (
        <div className="absolute inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm mx-4 mb-8 sm:mb-0 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
            
            {/* Close button for modal */}
            {inviteStep === 'invite' && (
               <button 
                 onClick={closeInvite}
                 className="absolute top-5 right-5 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 active:scale-95"
               >
                 <X size={24} />
               </button>
            )}

            {inviteStep === 'invite' && (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#E8F5E8] rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <div className="w-12 h-12 bg-[#13EC13] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Check size={28} strokeWidth={4} className="text-white" />
                   </div>
                </div>
                
                <h2 className="text-4xl font-black text-[#003366] uppercase leading-none mb-2 tracking-tight">Group Created!</h2>
                <p className="text-gray-500 font-bold text-lg leading-tight mb-8">
                  Now invite your family to join <br/>
                  <span className="text-[#1152D4]">{room.name}</span>
                </p>

                <div className="w-full space-y-3">
                  <button 
                    onClick={() => handleShare('WhatsApp')}
                    className="w-full bg-[#25D366] text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-[0_4px_0_#128c7e] active:translate-y-1 active:shadow-none transition-all"
                  >
                    <MessageCircle size={24} fill="white" />
                    <span className="text-xl font-black uppercase tracking-tight">WhatsApp</span>
                  </button>

                  <button 
                    onClick={() => handleShare('iMessage')}
                    className="w-full bg-[#1152D4] text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-[0_4px_0_#003380] active:translate-y-1 active:shadow-none transition-all"
                  >
                    <MessageSquare size={24} fill="white" />
                    <span className="text-xl font-black uppercase tracking-tight">iMessage</span>
                  </button>

                  <button 
                    onClick={() => handleShare('Copied Link')}
                    className="w-full bg-gray-100 text-gray-500 py-4 rounded-[1.5rem] flex items-center justify-center gap-3 border-2 border-gray-200 active:bg-gray-200 transition-all"
                  >
                    <Copy size={24} />
                    <span className="text-xl font-black uppercase tracking-tight">Copy Link</span>
                  </button>
                </div>
              </div>
            )}

            {inviteStep === 'sending' && (
               <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-24 h-24 border-4 border-[#1152D4] border-t-transparent rounded-full animate-spin mb-6" />
                  <p className="text-2xl font-black text-[#003366] uppercase animate-pulse">Sending Invite...</p>
               </div>
            )}

            {inviteStep === 'success' && (
               <div className="p-8 flex flex-col items-center text-center bg-[#13EC13] h-full min-h-[400px] justify-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-300">
                     <Check size={64} strokeWidth={5} className="text-[#13EC13]" />
                  </div>
                  <h2 className="text-5xl font-black text-white uppercase mb-2">Sent!</h2>
                  <p className="text-white font-bold text-xl mb-10 opacity-90">Your friends will join soon.</p>
                  <button 
                    onClick={closeInvite}
                    className="w-full bg-white text-[#13EC13] py-5 rounded-[2rem] text-2xl font-black shadow-lg uppercase active:scale-95 transition-transform"
                  >
                    Okay
                  </button>
               </div>
            )}

          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-4 bg-white border-b border-gray-100 z-10 shadow-sm">
        <button 
          onClick={onClose} 
          className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#003366] active:scale-95 transition-transform"
        >
          <ArrowLeft size={28} strokeWidth={3} />
        </button>
        <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tight truncate flex-1">
          {room.name}
        </h1>
        <button 
          onClick={() => setShowInvite(true)}
          className="w-12 h-12 bg-[#F0F4F8] rounded-full flex items-center justify-center text-[#1152D4] active:scale-95 transition-transform"
        >
          <Share2 size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Section */}
        <div className="w-full h-72 relative bg-gray-200">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#003366] via-transparent to-transparent opacity-90" />
          
          <div className="absolute bottom-8 left-6 right-6 text-white">
            <div className="inline-flex items-center gap-2 font-bold text-xs bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full mb-3 border border-white/30">
              <Users size={14} />
              <span>{room.isGroupGrid ? '8 Members' : '1 Member'}</span>
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2 drop-shadow-lg">{room.name}</h2>
            <p className="text-white/80 font-medium text-lg line-clamp-2">
              A space for us to share memories, photos, and laughs together.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-8 bg-[#FDFBF7]">
            
            {/* Share to Group Button */}
            <div 
              onClick={() => setIsPostFlowOpen(true)}
              className="bg-white rounded-full p-3 border border-gray-200 flex items-center justify-center gap-4 cursor-pointer active:scale-95 transition-all hover:bg-gray-50 w-full shadow-sm"
            >
              <div className="w-10 h-10 bg-[#1152D4] rounded-full flex items-center justify-center text-white shrink-0">
                <Camera size={20} fill="white" />
              </div>
              <p className="text-xl font-black text-[#003366] tracking-tight whitespace-nowrap uppercase">Share to Group</p>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tight">Latest Memories</h3>
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
                <p className="text-2xl font-black text-[#003366] mb-1">No memories yet</p>
                <p className="font-medium text-gray-500">Share the first photo!</p>
              </div>
            )}
            
            <div className="h-12" />
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;