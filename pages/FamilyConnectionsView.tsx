import React, { useState, useEffect } from 'react';
import { Camera, Mic, Share2, Plus, Heart, Sparkles, Gift, Newspaper, BookOpen, Send, Star, LayoutGrid, ChevronRight, Image as ImageIcon, Loader2, Check, Mail } from 'lucide-react';
import Stories from '../components/Stories';
import FeedCard from '../components/FeedCard';
import JourneyBanner from '../components/JourneyBanner';
import PhotoFixBanner from '../components/PhotoFixBanner';
import PhotoFixFlow from '../components/PhotoFixFlow';
import MyRooms from '../components/MyRooms';
import CreateGroupWizard from '../components/CreateGroupWizard';
import PostFlow from '../components/PostFlow';
import JourneyFlow from '../components/JourneyFlow';
import ShareModal from '../components/ShareModal';
import PostDetail, { MOCK_COMMENTS, Comment } from '../components/PostDetail';
import ClubDetail from '../components/ClubDetail';
import ClubSuggestionCard from '../components/ClubSuggestionCard';
import GuardianButton from '../components/GuardianButton';
import SectionTitle from '../components/SectionTitle';
import UpdateCard from '../components/UpdateCard';
import MessageList, { Message } from '../components/MessageList';
import { Post, Room, FamilyMemberUpdate } from '../types';

const INITIAL_ROOMS: Room[] = [
  { id: '1', name: 'Groups', imageUrl: '', isAll: true },
  { id: '2', name: 'Nancy', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nancy' },
  {
    id: '3',
    name: 'History Buffs',
    imageUrl: '',
    isGroupGrid: true,
    groupImages: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    ]
  },
  { id: '4', name: 'Garden Club', imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&auto=format&fit=crop', isNew: true },
  { id: '5', name: 'Weekly Poker', imageUrl: 'https://images.unsplash.com/photo-1544253100-348615017282?w=400&auto=format&fit=crop' },
  { id: '6', name: 'Grandkids', imageUrl: 'https://images.unsplash.com/photo-1520121401995-928cd50d4e27?w=400&auto=format&fit=crop' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Grandchildren at the park',
    author: 'Me',
    time: 'today',
    imageUrl: 'https://images.unsplash.com/photo-1510563800743-aed236490d08?q=80&w=1000&auto=format&fit=crop',
    likes: 12
  },
  {
    id: 'p2',
    title: 'My World War II - This is me.',
    author: 'John',
    time: 'today',
    imageUrl: '/ww2_soldier.png',
    likes: 45
  },
  {
    id: 'p3',
    title: 'Trump 2.0: Taking Stock',
    author: 'News Feed',
    time: 'today',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000&auto=format&fit=crop',
    likes: 8
  }
];

const LUCY_UPDATE: FamilyMemberUpdate = {
  id: '2',
  name: 'LUCY',
  relation: 'Granddaughter',
  location: 'London',
  temperature: 22,
  feelsLike: 24,
  weatherTitle: 'Clear Skies',
  condition: 'Sunny',
  message: 'Perfect day for a walk in Hyde Park!',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJKcnh2e7dkj7DkmBbG0rloN_bq8E6l4Fi4VIyeMWyayrvhRwXexIH1hjeeVvoNXIM_qM7efXyChahIPKdKpG1EPPzmhkdYcXklJJLA-p0vquGaMbB0MxvXaq5nXg9lUWkG2bvDHnBr04pdj5OJUzN2uQEW0GMFaW_24LMWgbL5p8sIQ0l8PMJBdySlzcXLevGEHQvp6pbatVuGC9eJmXzYq35rFOKMqdqp3UvYt3E5bG4M5-gyFQF9n08CSL6WOF6_gIyMCXa2qO9',
  alertLevel: 'FAIR',
  actionType: 'voice',
};

const SUSAN_UPDATE: FamilyMemberUpdate = {
  id: '3',
  name: 'SUSAN',
  relation: 'Daughter',
  location: 'London',
  temperature: 22,
  feelsLike: 24,
  weatherTitle: 'Clear Skies',
  condition: 'Sunny',
  message: 'Perfect day for a walk in Hyde Park!',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJKcnh2e7dkj7DkmBbG0rloN_bq8E6l4Fi4VIyeMWyayrvhRwXexIH1hjeeVvoNXIM_qM7efXyChahIPKdKpG1EPPzmhkdYcXklJJLA-p0vquGaMbB0MxvXaq5nXg9lUWkG2bvDHnBr04pdj5OJUzN2uQEW0GMFaW_24LMWgbL5p8sIQ0l8PMJBdySlzcXLevGEHQvp6pbatVuGC9eJmXzYq35rFOKMqdqp3UvYt3E5bG4M5-gyFQF9n08CSL6WOF6_gIyMCXa2qO9',
  alertLevel: 'FAIR',
  actionType: 'voice',
};

type ViewState = 'feed' | 'rooms' | 'create-group';
type FixStatus = 'idle' | 'processing' | 'ready';

interface FamilyConnectionsViewProps {
  onPhotoFixUsed?: () => void;
}

const FamilyConnectionsView: React.FC<FamilyConnectionsViewProps> = ({ onPhotoFixUsed }) => {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  // Photo Fix State
  const [isPhotoFixOpen, setIsPhotoFixOpen] = useState(false);
  const [fixStatus, setFixStatus] = useState<FixStatus>('idle');
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [showFixNotification, setShowFixNotification] = useState(false);

  const [isPostFlowOpen, setIsPostFlowOpen] = useState(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [sharingPost, setSharingPost] = useState<{ post: Post; message: string } | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(undefined);
  const [selectedClub, setSelectedClub] = useState<Room | null>(null);
  const [isNewClub, setIsNewClub] = useState(false);
  const [view, setView] = useState<ViewState>('feed');

  // Generate consistent messages based on unread count
  const [messages, setMessages] = useState<Message[]>(() => {
    const defaultMessages = MOCK_COMMENTS.map((comment, i) => ({
      id: `msg-${i}`,
      sender: comment.author,
      content: comment.text,
      time: comment.time,
      avatar: comment.avatar,
      read: false,
      type: 'message' as const
    }));
    
    // Add a mock like notification for Post
    const likePostNotification: Message = {
      id: 'like-post-1',
      sender: 'Nancy',
      content: 'Liked your photo "Grandchildren at the park"',
      time: '5 mins ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nancy',
      read: false,
      type: 'like'
    };

    // Add a mock like notification for Comment
    const likeCommentNotification: Message = {
      id: 'like-comment-c0', // Target 'Me' comment
      sender: 'Leo',
      content: 'Liked your comment "ni Hong Kong"',
      time: '15 mins ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
      read: false,
      type: 'like'
    };

    return [likePostNotification, likeCommentNotification, ...defaultMessages];
  });

  const unreadCount = messages.filter(m => !m.read).length;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  const [showSuggestion, setShowSuggestion] = useState(true);
  const [showSecondUpdateCard, setShowSecondUpdateCard] = useState(false);
  const [secondCardLiked, setSecondCardLiked] = useState(false);
  const [showThankYouCard, setShowThankYouCard] = useState(false);
  const [showMessageCard, setShowMessageCard] = useState(false);
  const [sentMessage, setSentMessage] = useState<string>('');

  // Tactile feedback helper
  const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle the Photo Fix Submission
  const handlePhotoFixSubmit = (imageUrl: string) => {
    setRestoredImage(imageUrl);
    setFixStatus('processing');
    setIsPhotoFixOpen(false); // Close the modal so user can do other things

    // Trigger global paywall check if provided
    if (onPhotoFixUsed) {
      onPhotoFixUsed();
    }

    // Simulate a delay (e.g., 8 seconds for demo purposes, representing the "5 minutes")
    setTimeout(() => {
      setFixStatus('ready');
      setShowFixNotification(true);
      vibrate();
    }, 8000);
  };

  const handleOpenPhotoFix = () => {
    vibrate();
    if (fixStatus === 'processing') {
      // Optional: Could show a toast saying "Still working..."
      return;
    }
    setIsPhotoFixOpen(true);
  };

  const handleCreateGroup = (name: string, members: string[]) => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name,
      imageUrl: '',
      isGroupGrid: true,
      isNew: true,
      groupImages: members.map(id => `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`)
    };
    setRooms(prev => [...prev, newRoom]);
    setView('feed');
    setSelectedClub(newRoom);
    setIsNewClub(true);
  };

  const handleJoinSuggestion = () => {
    vibrate();
    const newClub: Room = {
      id: 'suggested-fruit',
      name: 'Organic Fruit',
      imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=1000&auto=format&fit=crop',
      isNew: true
    };
    setRooms(prev => [...prev, newClub]);
    setShowSuggestion(false);
    setSelectedClub(newClub);
    setIsNewClub(true);
  };

  const handleShareSuggestion = () => {
    vibrate();
    setSharingPost({
      post: {
        id: 'share-suggestion',
        title: 'You\'ll love this group!',
        author: 'With App',
        time: 'Just now',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000&auto=format&fit=crop',
        likes: 0
      },
      message: "I found this great gardening group for us to join!"
    });
  };

  const handleNewPost = (title: string, imageUrl: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      imageUrl,
      author: 'Me',
      time: 'just now',
      likes: 0
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleClubClick = (room: Room) => {
    vibrate();
    if (room.isAll) {
      setView('rooms');
    } else {
      setSelectedClub(room);
      setIsNewClub(false);
    }
  };

  const openJourney = () => {
    vibrate();
    setIsJourneyOpen(true);
  };

  const openPostFlow = () => {
    vibrate();
    setIsPostFlowOpen(true);
  };

  return (
    <div className="w-full h-full bg-[#F5F7F9] shadow-2xl overflow-hidden relative flex flex-col font-sans">

      {/* Toast Notification for Photo Fix Ready */}
      {showFixNotification && (
        <div
          onClick={() => {
            setShowFixNotification(false);
            setIsPhotoFixOpen(true); // Open directly to result
          }}
          className="absolute top-[calc(5rem+env(safe-area-inset-top))] left-6 right-6 z-[90] bg-guardian-blue text-white p-4 rounded-xl shadow-xl flex items-center justify-between cursor-pointer animate-in slide-in-from-top-4 duration-500 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={24} fill="white" className="text-white" />
            </div>
            <div>
              <p className="font-heading font-black uppercase text-sm tracking-widest opacity-80">Good News!</p>
              <p className="text-xl font-heading font-black leading-none">Your photo is fixed</p>
            </div>
          </div>
          <div className="bg-white text-guardian-blue px-4 py-2 rounded-lg font-heading font-black text-sm uppercase tracking-wider shadow-sm">
            View
          </div>
        </div>
      )}

      {/* Modals */}
      {isPhotoFixOpen && (
        <PhotoFixFlow
          onClose={() => setIsPhotoFixOpen(false)}
          onSubmitCapture={handlePhotoFixSubmit}
          mode={fixStatus === 'ready' ? 'view' : 'capture'}
          restoredImage={restoredImage}
          onReset={() => {
            setFixStatus('idle');
            setRestoredImage(null);
          }}
        />
      )}

      {isPostFlowOpen && <PostFlow onClose={() => setIsPostFlowOpen(false)} onPostCreated={handleNewPost} />}
      {isJourneyOpen && <JourneyFlow onClose={() => setIsJourneyOpen(false)} />}
      {sharingPost && <ShareModal post={sharingPost.post} message={sharingPost.message} onClose={() => setSharingPost(null)} />}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => {
            setSelectedPost(null);
            setSelectedMessageId(undefined);
          }}
          onShare={(msg) => setSharingPost({ post: selectedPost, message: msg })}
          initialScrollId={selectedMessageId}
          onNewComment={(comment) => {
            // 将新评论添加到消息列表
            const newMessage: Message = {
              id: `msg-${Date.now()}`,
              sender: comment.author,
              content: comment.text,
              time: comment.time,
              avatar: comment.avatar,
              read: false
            };
            setMessages(prev => [newMessage, ...prev]);
          }}
        />
      )}

      {selectedClub && (
        <ClubDetail
          room={selectedClub}
          onClose={() => {
            setSelectedClub(null);
            setIsNewClub(false);
          }}
          posts={posts}
          isNew={isNewClub}
          onAddPost={handleNewPost}
        />
      )}

      {view === 'rooms' && (
        <MyRooms
          rooms={rooms}
          onStartNewGroup={() => setView('create-group')}
          onDone={() => setView('feed')}
          onClubClick={handleClubClick}
        />
      )}

      {view === 'create-group' && <CreateGroupWizard onCancel={() => setView('rooms')} onFinish={handleCreateGroup} />}

      {view === 'messages' && (
        <MessageList
          onBack={() => setView('feed')}
          messages={messages}
          onMessageClick={(msg) => {
            // Mark as read
            if (!msg.read) {
              setMessages(prev => prev.map(m =>
                m.id === msg.id ? { ...m, read: true } : m
              ));
              // Optional: Decrement global unread count
              // setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Match the message to the corresponding comment ID or Post
            if (msg.id.startsWith('like-post-')) {
               // Open the target post directly (top)
               const targetPost = posts.find(p => p.id === 'p1') || posts[0];
               setSelectedPost(targetPost);
               setSelectedMessageId(undefined); // No scroll
            } else if (msg.id.startsWith('like-comment-')) {
               // Extract comment ID and scroll to it
               const commentId = msg.id.replace('like-comment-', '');
               const targetPost = posts.find(p => p.id === 'p1') || posts[0];
               setSelectedPost(targetPost);
               setSelectedMessageId(commentId);
            } else {
               const index = parseInt(msg.id.split('-')[1]);
               // Assuming MOCK_COMMENTS is available in this scope
               const commentId = MOCK_COMMENTS[index % MOCK_COMMENTS.length].id;
  
               const targetPost = posts.find(p => p.id === 'p1') || posts[0];
               setSelectedPost(targetPost);
               setSelectedMessageId(commentId);
             }
          }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F7F9] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-gray-900 font-heading text-2xl font-bold tracking-tight">With</h1>

        <div
          onClick={openJourney}
          className="flex flex-col bg-white px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer active:bg-gray-50 transition-all gap-2"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-heading font-black text-gray-900 uppercase tracking-widest leading-none">My Life Story</span>
            <ChevronRight size={14} strokeWidth={3} className="text-gray-400 ml-2" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-[2px] border-[#FFB800] p-0.5 bg-white shrink-0 overflow-hidden shadow-sm">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma" className="w-full h-full object-cover" alt="Avatar" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-heading font-black text-gray-900 leading-none">12</span>
                <ImageIcon size={16} strokeWidth={2.5} className="text-gray-500" />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xl font-heading font-black text-gray-900 leading-none">80</span>
                <Heart size={16} fill="#FF4D4D" strokeWidth={2.5} className="text-[#FF4D4D]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-[calc(6rem+env(safe-area-inset-bottom))] bg-[#F5F7F9]">

        {/* New Message Notification Card */}
        <div className="px-6 pt-6">
          <div
            onClick={() => setView('messages')}
            className="bg-white rounded-xl p-5 border border-gray-200 flex items-center justify-between active:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-gray-900">New Messages</h3>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread messages` : 'No new messages'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        </div>

        {/* Photo Fix Banner */}
        <div className="px-6 pt-4">
          <div onClick={handleOpenPhotoFix}>
            <PhotoFixBanner status={fixStatus} />
          </div>
        </div>

        {/* Stories */}
        <section className="mt-8">
          <Stories
            rooms={rooms}
            onAllRoomsClick={() => setView('rooms')}
            onClubClick={handleClubClick}
          />
        </section>

        {/* Post Launcher */}
        <section className="mt-4 px-6">
          <GuardianButton onClick={openPostFlow} className="gap-4">
            <Camera size={24} fill="white" />
            <span className="text-lg font-black uppercase tracking-wide">Click here to post</span>
          </GuardianButton>
        </section>

        {/* Feed */}
        <section className="mt-8 px-4 space-y-6">
          <SectionTitle className="ml-0">What's New</SectionTitle>

          {/* 1. Newly Created Posts (appear first) */}
          {posts.filter(p => !p.id.startsWith('p')).map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              isNews={false}
              onClick={() => setSelectedPost(post)}
              onShare={(msg) => setSharingPost({ post, message: msg })}
            />
          ))}

          {/* 2. Family Member Update Card (Pinned/Feature) */}
          <UpdateCard
            update={LUCY_UPDATE}
            onShare={(msg) => {
              // Create a temporary Post object for sharing
              const tempPost: Post = {
                id: 'update-' + LUCY_UPDATE.id,
                title: `Lovely weather for ${LUCY_UPDATE.name}!`,
                author: LUCY_UPDATE.name,
                time: 'today',
                imageUrl: LUCY_UPDATE.imageUrl,
                likes: 0
              };
              setSharingPost({ post: tempPost, message: msg });
            }}
            onLike={(liked) => {
              if (liked) {
                setShowSecondUpdateCard(true);
              }
            }}
            showLikedLabel={secondCardLiked}
            likedByName={secondCardLiked ? LUCY_UPDATE.name : undefined}
            onMessageSent={(message) => {
              setSentMessage(message);
              setShowMessageCard(true);
            }}
          />
          {/* Family Member Update Card - Second Card (from Message) */}
          {showMessageCard && (
            <UpdateCard
              update={SUSAN_UPDATE}
              customTitle={sentMessage}
              showSendBy={true}
              messageButtonText="Got it!"
              onMessageButtonClick={() => {
                setShowMessageCard(false);
                setShowThankYouCard(true);
              }}
              onShare={(msg) => {
                // Create a temporary Post object for sharing
                const tempPost: Post = {
                  id: 'update-' + SUSAN_UPDATE.id,
                  title: "Susan is thinking of you and your lovely weather!",
                  author: SUSAN_UPDATE.name,
                  time: 'today',
                  imageUrl: SUSAN_UPDATE.imageUrl,
                  likes: 0
                };
                setSharingPost({ post: tempPost, message: msg });
              }}
            />
          )}
          {/* Family Member Update Card - Second Card (from Like) */}
          {showSecondUpdateCard && (
            <UpdateCard
              update={SUSAN_UPDATE}
              customTitle="Susan is thinking of you and your lovely weather!"
              messageButtonText="Got it!"
              onMessageButtonClick={() => {
                setShowSecondUpdateCard(false);
                setShowThankYouCard(true);
              }}
              onShare={(msg) => {
                // Create a temporary Post object for sharing
                const tempPost: Post = {
                  id: 'update-' + SUSAN_UPDATE.id,
                  title: "Susan is thinking of you and your lovely weather!",
                  author: SUSAN_UPDATE.name,
                  time: 'today',
                  imageUrl: SUSAN_UPDATE.imageUrl,
                  likes: 0
                };
                setSharingPost({ post: tempPost, message: msg });
              }}
              onLike={(liked) => {
                if (liked) {
                  setSecondCardLiked(true);
                  setShowThankYouCard(true);
                }
              }}
            />
          )}
          {/* Thank You Card - Shows after second card is liked */}
          {showThankYouCard && (
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="p-8 space-y-6">
                {/* Heart Icon and Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Heart size={48} fill="#ff4d4d" className="text-[#ff4d4d]" strokeWidth={1.5} />
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${LUCY_UPDATE.name}`}
                      alt={LUCY_UPDATE.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Messages */}
                <div className="text-center space-y-2">
                  <h3 className="font-bold font-heading text-xl text-gray-900">
                    {LUCY_UPDATE.name} felt your care!
                  </h3>
                  <p className="text-base text-gray-500 mt-4">
                    "She sent a heart back to you"
                  </p>
                </div>

                {/* Confirm Button */}
                <GuardianButton
                  onClick={() => setShowThankYouCard(false)}
                  className="w-full justify-center"
                >
                  <span className="text-lg font-black uppercase tracking-wide">That's great!</span>
                </GuardianButton>
              </div>
            </div>
          )}

          {/* 3. Existing Feed Posts */}
          {posts.filter(p => p.id.startsWith('p')).map((post, index) => (
            <React.Fragment key={post.id}>
              <FeedCard
                post={post}
                isNews={post.id === 'p3'}
                onClick={() => setSelectedPost(post)}
                onShare={(msg) => setSharingPost({ post, message: msg })}
              />
              {index === 0 && showSuggestion && (
                <ClubSuggestionCard
                  onJoin={handleJoinSuggestion}
                  onShare={handleShareSuggestion}
                />
              )}
            </React.Fragment>
          ))}
        </section>
      </main>
    </div>
  );
};

export default FamilyConnectionsView;
