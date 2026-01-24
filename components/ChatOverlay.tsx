
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { ChatMessage, HistoryItem, AuraEmotion } from '../types';
import { chatWithAura } from '../services/geminiService';
import AuraAvatar from './AuraAvatar';

interface ChatOverlayProps {
    onClose: () => void;
    onTriggerAction: (action: string) => void;
    initialQuery?: string;
    initialAction?: string | null; 
    initialImage?: string | null;
    onVoiceInteraction?: () => void;
    onSaveHistory?: (item: HistoryItem) => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose, onTriggerAction, initialQuery, initialAction, initialImage, onVoiceInteraction, onSaveHistory }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    // Default to listening immediately on entry
    const [isListening, setIsListening] = useState(true);
    
    // Ref to track if user explicitly stopped listening
    const userStoppedRef = useRef(false);

    const [currentTranscript, setCurrentTranscript] = useState("");
    
    // Internal emotion state
    const [currentEmotion, setCurrentEmotion] = useState<AuraEmotion>('HAPPY');
    
    const [inputValue, setInputValue] = useState("");
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [inputMode, setInputMode] = useState<'VOICE' | 'TEXT'>('VOICE');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (messages.length > 1 && onSaveHistory) {
            const firstUserMsg = messages.find(m => m.role === 'user');
            const lastMsg = messages[messages.length - 1];
            
            if (firstUserMsg) {
                onSaveHistory({
                    id: Date.now().toString(),
                    title: firstUserMsg.text.length > 30 ? firstUserMsg.text.substring(0, 30) + '...' : firstUserMsg.text,
                    subtitle: lastMsg.text.length > 50 ? lastMsg.text.substring(0, 50) + '...' : lastMsg.text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'chat',
                    chatMessages: messages
                });
            }
        }
        onClose();
    };

    const handleMicTap = () => {
        if (!isListening) {
            userStoppedRef.current = false;
            speak("I'm listening.");
            setIsListening(true);
        } else {
            userStoppedRef.current = true;
            setIsListening(false);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        }
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); 
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.volume = 1.0; 
            utterance.rate = 0.90; 
            utterance.pitch = 1.0;
            
            // Auto-resume listening after speaking if not stopped by user
            utterance.onend = () => {
                setCurrentEmotion('NEUTRAL');
                if (!userStoppedRef.current) {
                    setIsListening(true);
                }
            };
            
            window.speechSynthesis.speak(utterance);
        }
    };

    const processFileAnalysis = async (fileType: 'IMAGE' | 'DOC') => {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: fileType === 'IMAGE' ? "[Photo Uploaded]" : "[Document Uploaded]",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setCurrentEmotion('THINKING');

        setTimeout(() => {
             const resultMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                agentType: 'MEDICARE',
                text: "I've received the file. Analyzing it now...",
                timestamp: new Date(),
                action: 'SHOW_BILL_ANALYSIS' 
            };
            setMessages(prev => [...prev, resultMsg]);
            setCurrentEmotion('EXPECTATION'); // Anticipation
            
            setTimeout(() => {
                onTriggerAction('SHOW_BILL_ANALYSIS');
            }, 1500);

        }, 1500);
    };

    const handleUserMessage = async (text: string) => {
        if (!text.trim()) return;

        // Add User Message
        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date()
        };
        
        // Optimistically update UI
        const updatedMessages = [...messages, newUserMsg];
        setMessages(updatedMessages);
        setInputValue("");
        setIsListening(false); // Pause listening while thinking
        setCurrentEmotion('THINKING');
        
        // Prepare history for API
        const history = messages
            .filter(m => m.id !== 'init' && !m.text.includes('Uploaded'))
            .map(m => ({ role: m.role, text: m.text }));

        try {
            // Call Gemini 3 Pro
            const response = await chatWithAura(text, history);

            // Update Emotion based on Gemini's analysis
            setCurrentEmotion(response.emotion);

            const newAgentMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                agentType: 'SOUL',
                text: response.reply,
                timestamp: new Date(),
                action: response.action as any
            };

            setMessages(prev => [...prev, newAgentMsg]);
            speak(response.reply);

            // Handle actions triggered by the LLM
            if (response.action === 'TRIGGER_SAFETY') {
                setCurrentEmotion('FEAR');
            }

            if (response.action) {
                setTimeout(() => {
                    onTriggerAction(response.action!);
                }, 1500);
            }

        } catch (error) {
            // Fallback error handling
            setCurrentEmotion('SAD');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'agent',
                text: "I'm having trouble connecting right now. Please try again.",
                timestamp: new Date()
            }]);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'DOC') => {
      if (event.target.files && event.target.files.length > 0) {
          setShowUploadMenu(false);
          processFileAnalysis(type);
      }
    };

    const handleCameraAction = () => {
        setShowUploadMenu(false);
        onTriggerAction('SHOW_BILL_ANALYSIS'); 
    };

    // Initialize Greeting & Context
    useEffect(() => {
        const initMsgs: ChatMessage[] = [];
        
        // 1. Initial Greeting
        initMsgs.push({
            id: 'init',
            role: 'agent',
            agentType: 'SOUL',
            text: initialImage ? "I see the image you scanned. Let's talk about it." : "Welcome back! I'm ready to help you. What's on your mind?",
            timestamp: new Date()
        });

        // 2. Initial Image Context
        if (initialImage) {
            initMsgs.push({
                id: 'img_context',
                role: 'user',
                text: `[Image Scanned]`,
                timestamp: new Date()
            });
        }

        // 3. Initial Text Context (Summary from Scan)
        if (initialQuery && initialImage) {
             initMsgs.push({
                id: 'agent_analysis',
                role: 'agent',
                text: `Analysis: ${initialQuery}`,
                timestamp: new Date()
            });
        }

        setMessages(initMsgs);
        setCurrentEmotion('HAPPY'); 

        // If simple text query without image (Typed query from previous screen)
        if (initialQuery && !initialImage) {
            handleUserMessage(initialQuery);
        }

        if (initialAction === 'ANALYZE_FILE') {
            processFileAnalysis('IMAGE');
        }
        
        // Start listening on mount
        setIsListening(true);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Voice Input Processing
    useEffect(() => {
        let recognition: any = null;
        if (isListening) {
            setCurrentEmotion('LISTENING');
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            
            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.continuous = false;
                
                recognition.onresult = async (event: any) => {
                    const text = event.results[0][0].transcript;
                    setCurrentTranscript(text);
                    if (onVoiceInteraction) onVoiceInteraction();
                    handleUserMessage(text);
                };
                
                recognition.onend = () => {
                   setIsListening(false); 
                };

                try { recognition.start(); } catch(e) {}
            }
        }
        return () => {
            if (recognition) recognition.stop();
        };
    }, [isListening]);

    return (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col font-sans">
            {/* Header - Safe Area Top */}
            <div className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 bg-white shadow-sm z-20 border-b border-[#E6E2D8]">
                <div className="flex items-center gap-4">
                     <div className="relative">
                         {/* Robot Avatar State: Only Listening or Neutral (Not Listening) */}
                         <AuraAvatar emotion={isListening ? 'LISTENING' : currentEmotion} size={70} />
                     </div>
                     <div>
                         <h3 className="font-bold text-2xl text-[#2C3333] leading-none">Aura</h3>
                         <div className="flex items-center gap-2 mt-1">
                             <span className={`w-3 h-3 rounded-full ${isListening ? 'bg-[#00E341] animate-pulse' : 'bg-[#1A5F7A]'}`}></span>
                             <span className={`text-base font-bold uppercase tracking-wide ${isListening ? 'text-[#00E341]' : 'text-[#1A5F7A]'}`}>
                                 {isListening ? 'Listening...' : 'Online'}
                             </span>
                         </div>
                     </div>
                </div>
                {/* Back / Home Button */}
                <button 
                    onClick={handleClose} 
                    className="flex items-center gap-3 px-8 py-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors active:scale-95 border border-gray-200 shadow-sm"
                >
                     <Icons.ChevronLeft className="w-8 h-8 text-[#546E7A]" />
                     <span className="text-xl font-bold text-[#546E7A]">Home</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 bg-[#FDFBF7] pb-48" ref={chatContainerRef}>
                <div className="flex flex-col items-center mb-8 opacity-60">
                     <div className="bg-[#E6E2D8] px-4 py-1.5 rounded-full mb-2">
                         <span className="text-xs font-bold text-[#546E7A] uppercase tracking-widest">History</span>
                     </div>
                     <span className="text-xs text-[#90A4AE] font-medium">Last interaction: Yesterday</span>
                </div>

                {messages.map((msg, index) => {
                    const isNewSession = index === 1; 
                    const isUser = msg.role === 'user';
                    
                    return (
                        <React.Fragment key={msg.id}>
                            {isNewSession && (
                                <div className="flex items-center justify-center my-8">
                                    <div className="h-px bg-[#E6E2D8] w-16"></div>
                                    <span className="mx-4 text-sm font-bold text-[#1A5F7A] uppercase tracking-wider">New Conversation</span>
                                    <div className="h-px bg-[#E6E2D8] w-16"></div>
                                </div>
                            )}

                            {isUser ? (
                                <div className="w-full flex justify-end mb-8">
                                   <div className="bg-[#1A5F7A] rounded-[2.5rem] rounded-tr-sm p-6 max-w-[90%] shadow-lg shadow-[#1A5F7A]/20">
                                      {msg.text.includes('[Image Scanned]') && initialImage ? (
                                          <div className="mb-2 rounded-2xl overflow-hidden border-2 border-white/20">
                                              <img src={`data:image/jpeg;base64,${initialImage}`} alt="Scanned Context" className="w-full h-auto object-cover" />
                                          </div>
                                      ) : (
                                          <p className="text-2xl font-medium text-white leading-relaxed tracking-tight">
                                              {msg.text}
                                          </p>
                                      )}
                                      <div className="flex items-center justify-end gap-1 mt-3 opacity-80">
                                          <span className="text-xs font-bold text-white/90">Delivered</span>
                                          <Icons.Check className="w-4 h-4 text-white" />
                                      </div>
                                   </div>
                                </div>
                            ) : (
                                <div className="w-full mb-8">
                                   <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_4px_20px_rgba(44,51,51,0.05)] border border-[#E6E2D8] relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A5F7A] to-transparent opacity-50"></div>
                                      
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-2">
                                              <Icons.Sparkles className="w-5 h-5 text-[#1A5F7A]" />
                                              <span className="text-[#1A5F7A] font-bold text-xs tracking-widest uppercase">Aura Suggests</span>
                                          </div>
                                          <button 
                                            onClick={() => speak(msg.text)} 
                                            className="w-10 h-10 bg-[#E0F7FA] rounded-full flex items-center justify-center text-[#1A5F7A] active:scale-95 transition-transform"
                                          >
                                              <Icons.Speaker className="w-5 h-5" />
                                          </button>
                                      </div>
                                      <p className="text-3xl font-bold text-[#2C3333] leading-tight tracking-tight">
                                          {msg.text}
                                      </p>
                                   </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Controls */}
            <div className="bg-white px-6 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-6 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(44,51,51,0.05)] z-30 relative border-t border-[#E6E2D8]">
                
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'DOC')} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                <input type="file" ref={photoInputRef} onChange={(e) => handleFileUpload(e, 'IMAGE')} className="hidden" accept="image/*" />

                {showUploadMenu && (
                    <div className="absolute bottom-36 left-6 right-6 bg-white rounded-3xl shadow-2xl p-5 border border-[#E6E2D8] flex justify-around items-center animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
                        <button onClick={handleCameraAction} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-2xl bg-[#E0F7FA] border border-[#B2EBF2] flex items-center justify-center text-[#1A5F7A] shadow-sm group-active:scale-95 transition-transform"><Icons.Camera className="w-8 h-8" /></div>
                            <span className="text-sm font-bold text-[#546E7A]">Camera</span>
                        </button>
                        <button onClick={() => { setShowUploadMenu(false); photoInputRef.current?.click(); }} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-2xl bg-[#F3E5F5] border border-[#E1BEE7] flex items-center justify-center text-[#7B1FA2] shadow-sm group-active:scale-95 transition-transform"><Icons.Image className="w-8 h-8" /></div>
                            <span className="text-sm font-bold text-[#546E7A]">Photos</span>
                        </button>
                        <button onClick={() => { setShowUploadMenu(false); fileInputRef.current?.click(); }} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-[#E65100] shadow-sm group-active:scale-95 transition-transform"><Icons.Paperclip className="w-8 h-8" /></div>
                            <span className="text-sm font-bold text-[#546E7A]">Files</span>
                        </button>
                    </div>
                )}

                {inputMode === 'VOICE' ? (
                    <div className="flex flex-col items-center">
                        <p className={`text-sm font-bold uppercase tracking-widest mb-6 transition-colors ${isListening ? 'text-[#00E341] animate-pulse' : 'text-[#90A4AE]'}`}>
                            {isListening ? 'Listening...' : 'Tap or speak to respond'}
                        </p>
                        
                        <div className="flex items-center justify-between w-full mb-4">
                            <button 
                                onClick={() => setShowUploadMenu(!showUploadMenu)}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${showUploadMenu ? 'bg-[#2C3333] text-white rotate-45' : 'bg-gray-100 text-[#546E7A] hover:bg-gray-200'}`}
                            >
                                <Icons.Plus className="w-8 h-8" />
                            </button>

                            {/* Left Sound Stripes (Enhanced) */}
                            <div className={`flex gap-1.5 h-10 items-center transition-all duration-300 ${isListening ? 'opacity-100' : 'opacity-30'}`}>
                                <div className={`w-1.5 h-5 rounded-full transition-colors ${isListening ? 'bg-[#00E341] animate-[pulse_1.5s_infinite]' : 'bg-[#1A5F7A]'}`}></div>
                                <div className={`w-1.5 h-8 rounded-full transition-colors ${isListening ? 'bg-[#00E341] animate-[pulse_1.5s_infinite_0.2s]' : 'bg-[#1A5F7A]'}`}></div>
                                <div className={`w-1.5 h-4 rounded-full transition-colors ${isListening ? 'bg-[#00E341] animate-[pulse_1.5s_infinite_0.4s]' : 'bg-[#1A5F7A]'}`}></div>
                            </div>

                            <button 
                                onClick={handleMicTap}
                                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(26,95,122,0.3)] transition-all transform hover:scale-105 active:scale-95 ${isListening ? 'bg-[#E57C23] animate-pulse' : 'bg-gradient-to-tr from-[#1A5F7A] to-[#548CA8]'}`}
                            >
                                <Icons.Mic className="w-12 h-12 text-white" />
                            </button>

                            {/* Right Sound Stripes (Enhanced) */}
                            <div className={`flex gap-1.5 h-10 items-center transition-all duration-300 ${isListening ? 'opacity-100' : 'opacity-30'}`}>
                                <div className={`w-1.5 h-4 rounded-full transition-colors ${isListening ? 'bg-[#00E341] animate-[pulse_1.5s_infinite_0.4s]' : 'bg-[#1A5F7A]'}`}></div>
                                <div className={`w-1.5 h-8 rounded-full transition-colors ${isListening ? 'bg-[#00E341] animate-[pulse_1.5s_infinite_0.2s]' : 'bg-[#1A5F7A]'}`}></div>
                                <div className={`w-1.5 h-5 rounded-full transition-colors ${isListening ? 'bg-[#00E341] animate-[pulse_1.5s_infinite]' : 'bg-[#1A5F7A]'}`}></div>
                            </div>

                            <button 
                                onClick={() => setInputMode('TEXT')}
                                className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-[#546E7A] hover:bg-gray-200 transition-colors active:scale-95"
                            >
                                <Icons.Keyboard className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-end gap-3 pb-4">
                         <button onClick={() => setInputMode('VOICE')} className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mb-1 active:scale-95"><Icons.X className="w-6 h-6 text-[#546E7A]" /></button>
                         <textarea 
                             value={inputValue}
                             onChange={(e) => setInputValue(e.target.value)}
                             onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserMessage(inputValue); }}}
                             className="flex-1 bg-[#F2EFE9] rounded-3xl p-5 text-xl outline-none resize-none max-h-32 focus:ring-2 focus:ring-[#1A5F7A] text-[#2C3333]"
                             rows={1} placeholder="Type here..." autoFocus
                         />
                         <button onClick={() => handleUserMessage(inputValue)} disabled={!inputValue.trim()} className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 mb-1 shadow-md transition-colors ${inputValue.trim() ? 'bg-[#1A5F7A] text-white active:scale-95' : 'bg-gray-200 text-gray-400'}`}><Icons.Send className="w-6 h-6" /></button>
                    </div>
                )}
            </div>
            
        </div>
    )
}

export default ChatOverlay;
