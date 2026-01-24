
import React, { useState } from 'react';
import { Camera, ChevronRight, Heart, Image as ImageIcon, Sparkles } from 'lucide-react';
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
import PostDetail from '../components/PostDetail';
import ClubDetail from '../components/ClubDetail';
import ClubSuggestionCard from '../components/ClubSuggestionCard';
import { Post, Room } from '../types';

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
        author: 'Sarah',
        time: 'today',
        imageUrl: 'https://images.unsplash.com/photo-1510563800743-aed236490d08?q=80&w=1000&auto=format&fit=crop',
        likes: 12
    },
    {
        id: 'p2',
        title: 'My World War II - This is me.',
        author: 'John',
        time: 'today',
        imageUrl: 'https://images.unsplash.com/photo-1544211911-2f01ad4d2ee7?q=80&w=1000&auto=format&fit=crop',
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

type ViewState = 'feed' | 'rooms' | 'create-group';
type FixStatus = 'idle' | 'processing' | 'ready';

const FamilyConnectionsView: React.FC = () => {
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
    const [selectedClub, setSelectedClub] = useState<Room | null>(null);
    const [isNewClub, setIsNewClub] = useState(false);
    const [view, setView] = useState<ViewState>('feed');
    const [showSuggestion, setShowSuggestion] = useState(true);

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
        <div className="w-full h-full bg-[#FDFBF7] shadow-2xl overflow-hidden relative flex flex-col font-['Plus_Jakarta_Sans']">

            {/* Toast Notification for Photo Fix Ready */}
            {showFixNotification && (
                <div
                    onClick={() => {
                        setShowFixNotification(false);
                        setIsPhotoFixOpen(true); // Open directly to result
                    }}
                    className="absolute top-[calc(5rem+env(safe-area-inset-top))] left-4 right-4 z-[90] bg-[#13EC13] text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between cursor-pointer animate-in slide-in-from-top-4 duration-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Sparkles size={24} fill="white" />
                        </div>
                        <div>
                            <p className="font-black uppercase text-sm tracking-widest opacity-80">Good News!</p>
                            <p className="text-xl font-black leading-none">Your photo is fixed</p>
                        </div>
                    </div>
                    <div className="bg-white text-[#13EC13] px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider">
                        View
                    </div>
                </div>
            )}

            {/* Modals */}
            {isPhotoFixOpen && (
                <PhotoFixFlow
                    onClose={() => setIsPhotoFixOpen(false)}
                    onPostCreated={handleNewPost}
                />
            )}

            {isPostFlowOpen && <PostFlow onClose={() => setIsPostFlowOpen(false)} onPostCreated={handleNewPost} />}
            {isJourneyOpen && <JourneyFlow onClose={() => setIsJourneyOpen(false)} />}
            {sharingPost && <ShareModal post={sharingPost.post} message={sharingPost.message} onClose={() => setSharingPost(null)} />}

            {selectedPost && (
                <PostDetail
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onShare={(msg) => setSharingPost({ post: selectedPost, message: msg })}
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

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7] px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between shadow-sm border-b border-gray-100">
                <h1 className="text-[#003366] font-lexend text-3xl font-black tracking-tighter">With</h1>

                <div
                    onClick={openJourney}
                    className="flex flex-col bg-[#F2F4F7] px-4 py-2.5 rounded-[1.8rem] border border-gray-200 cursor-pointer active:scale-95 active:bg-[#E5E9F0] transition-all shadow-md hover:shadow-lg gap-2"
                >
                    <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-black text-[#4267B2] uppercase tracking-widest leading-none">My Life Story</span>
                        <ChevronRight size={14} strokeWidth={3} className="text-[#4267B2]/50 ml-2" />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border-[2px] border-[#FFB800] p-0.5 bg-white shrink-0 overflow-hidden shadow-sm">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Grandma" className="w-full h-full object-cover" alt="Avatar" />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black text-[#003366] leading-none">12</span>
                                <ImageIcon size={16} strokeWidth={2.5} className="text-[#003366]/70" />
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black text-[#003366] leading-none">80</span>
                                <Heart size={16} fill="#FF4D4D" strokeWidth={2.5} className="text-[#FF4D4D]" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-[calc(6rem+env(safe-area-inset-bottom))] bg-[#FDFBF7]">

                {/* Photo Fix Banner */}
                <div className="px-6 pt-8">
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
                    <div
                        onClick={openPostFlow}
                        className="bg-[#EBF5FF] rounded-full p-3 border-[4px] border-[#1152D4] shadow-xl flex items-center justify-center gap-5 cursor-pointer active:scale-95 transition-all hover:bg-[#DBEAFE] w-full group"
                    >
                        <div className="w-11 h-11 bg-[#1152D4] rounded-full flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform">
                            <Camera size={22} fill="white" />
                        </div>
                        <p className="text-2xl font-black text-[#003366] tracking-tight whitespace-nowrap uppercase">Click here to post</p>
                    </div>
                </section>

                {/* Feed */}
                <section className="mt-8 px-6 space-y-10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-2.5 h-10 bg-[#13EC13] rounded-full shadow-sm" />
                        <h2 className="text-4xl font-black text-[#003366] tracking-tight">What's New</h2>
                    </div>
                    {posts.map((post, index) => (
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
