
import React, { useState, useEffect, useRef } from 'react';
import {
    Battery, Wifi, ChevronLeft, Siren, EyeOff,
    Mic, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    ScrollText, Thermometer, Droplets, Wind, Sun,
    UserCheck, ShieldCheck, Eye, Activity,
    Moon, Lock, Hand, AlertTriangle, PhoneOff, CheckCircle2, MicOff,
    Flame, Settings, UserCog, Volume2, ShieldAlert, X, Save, AlertOctagon,
    Play, Loader2
} from 'lucide-react';

interface RobotViewProps {
    onBack: () => void;
}

export const RobotView: React.FC<RobotViewProps> = ({ onBack }) => {
    const [videoState, setVideoState] = useState<'blurred' | 'requesting' | 'live' | 'emergency'>('blurred');
    const [privacyShieldActive, setPrivacyShieldActive] = useState(false);

    const [activeDirection, setActiveDirection] = useState<string | null>(null);

    const [isListening, setIsListening] = useState(false);
    const [connectionStatus] = useState<'Connected' | 'Connecting' | 'Offline'>('Connected');

    // Personalization State
    const [robotName, setRobotName] = useState('Aura');
    const [showSettings, setShowSettings] = useState(false);
    const [personality, setPersonality] = useState('Caring Companion');
    const [soundTheme, setSoundTheme] = useState('Soft Chime');

    // New State for detailed metrics (Updated with Alert values for demo)
    const [envData] = useState({ temp: 82, humidity: 62, airQuality: 'Moderate', light: 'Low', gas: 'Normal' });

    // Activity Data with Mock Anomalies
    const [activityData] = useState({
        lastSeen: '20m ago',
        location: 'Living Room',
        movements: 5,
        anomalies: 2,
        anomalyLogs: [
            { time: '10:15 AM', desc: 'Stationary > 30 mins' },
            { time: '01:45 PM', desc: 'Abnormal sound (Glass)' }
        ]
    });

    // Security Event Logs
    const [securityLogs] = useState([
        { id: 1, type: 'Spam Call', source: 'Unknown', time: '11:23 AM', risk: 85, action: 'Blocked' },
        { id: 2, type: 'Scam SMS', source: '+1(555)...', time: '09:42 AM', risk: 92, action: 'Filtered' },
        { id: 3, type: 'Door Cam', source: 'Front Door', time: 'Yesterday', risk: 45, action: 'Flagged' }
    ]);

    // Mock Activity Logs
    const [activityLogs, setActivityLogs] = useState([
        { id: 1, time: '09:42 AM', title: 'Patrol Complete', desc: 'Living room check finished.', icon: 'check', type: 'info' },
        { id: 2, time: '08:30 AM', title: 'Health Check', desc: 'Morning diagnostics passed. Battery at 100%.', icon: 'activity', type: 'success' },
    ]);

    const logsEndRef = useRef<HTMLDivElement>(null);

    const addLog = (title: string, desc: string, type: 'info' | 'warning' | 'success' = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newLog = {
            id: Date.now(),
            time,
            title,
            desc,
            icon: type === 'warning' ? 'alert' : 'check',
            type
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    // Simulate remote approval for demo purposes
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (videoState === 'requesting') {
            // addLog('Connection Request', 'Initiating secure handshake...', 'info');
            timeout = setTimeout(() => {
                setVideoState('live');
                addLog('Connection Established', 'Live video feed active.', 'success');
            }, 2000);
        }
        return () => clearTimeout(timeout);
    }, [videoState]);

    const handleConnect = () => {
        setVideoState('requesting');
    };

    const handleEmergency = () => {
        setVideoState('emergency');
        if (privacyShieldActive) {
            setPrivacyShieldActive(false);
            addLog('Emergency Override', 'Privacy shield automatically disabled.', 'warning');
        }
        addLog('EMERGENCY MODE', 'Emergency SOS triggered. AI detection active.', 'warning');
    };

    const handleEndVisit = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setVideoState('blurred');
        addLog('Session Ended', 'Remote visit concluded.', 'info');
    };

    const handleDirection = (direction: 'up' | 'down' | 'left' | 'right', e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveDirection(direction);

        // Simulate movement log occasionally
        if (Math.random() > 0.7) {
            addLog('Manual Control', `Camera moved ${direction}`, 'info');
        }

        setTimeout(() => setActiveDirection(null), 200);
    };

    const handleVoiceCommand = () => {
        if (isListening) return;
        setIsListening(true);
        setTimeout(() => {
            setIsListening(false);
            const r = Math.random();
            if (r > 0.5) {
                addLog('Voice Command', `"${robotName}, turn on privacy mode"`, 'info');
                setPrivacyShieldActive(true);
                addLog('Privacy Mode', 'Enabled by voice command.', 'info');
            } else {
                addLog('Voice Command', `"${robotName}, return to base"`, 'info');
                addLog('Navigation', 'Returning to charging station...', 'info');
            }
        }, 2000);
    };

    const canControl = !privacyShieldActive && (videoState === 'live' || videoState === 'emergency');

    // Environment Alerts
    const tempAlert = envData.temp > 80;
    const humidAlert = envData.humidity > 60;
    const gasAlert = envData.gas !== 'Normal';

    return (
        <div className="flex flex-col h-full bg-black text-white relative">
            {/* Header */}
            <div className="p-6 pb-2 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    aria-label="Back to dashboard"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold truncate max-w-[150px]">{robotName}</h2>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                        >
                            <Settings size={16} />
                        </button>
                        <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 ml-auto md:ml-2">
                            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-neon' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">{connectionStatus}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`${privacyShieldActive ? 'text-orange-500' : 'text-neon'} text-xs font-bold uppercase`}>
                            {privacyShieldActive ? 'Privacy Mode Active' : 'System Online'}
                        </span>
                    </div>
                </div>
                <div>
                    <button
                        onClick={handleEmergency}
                        className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/50 animate-pulse hover:bg-red-500 hover:text-white transition-all"
                        title="Trigger Emergency SOS"
                    >
                        <Siren size={20} />
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-zinc-900 w-full max-w-sm rounded-[32px] border border-zinc-800 p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-6 right-6 text-zinc-500 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <UserCog size={24} className="text-neon" /> Personalization
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Robot Name</label>
                                <input
                                    type="text"
                                    value={robotName}
                                    onChange={(e) => setRobotName(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white font-bold focus:border-neon outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Personality</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Caring Companion', 'Strict Guardian'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPersonality(p)}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${personality === p ? 'bg-neon text-black border-neon' : 'bg-black text-zinc-400 border-zinc-800'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notification Sound</label>
                                <div className="flex items-center gap-2 bg-black border border-zinc-700 rounded-xl p-2">
                                    <Volume2 size={20} className="text-zinc-500 ml-2" />
                                    <select
                                        value={soundTheme}
                                        onChange={(e) => setSoundTheme(e.target.value)}
                                        className="bg-transparent text-white font-bold text-sm w-full p-2 outline-none"
                                    >
                                        <option>Soft Chime</option>
                                        <option>Alert Beep</option>
                                        <option>Human Voice</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full bg-white text-black font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24">

                {/* Video Feed Area */}
                <div
                    onClick={() => videoState === 'blurred' && handleConnect()}
                    className={`rounded-[32px] overflow-hidden aspect-video relative border transition-all duration-500 shadow-2xl group ${videoState === 'emergency' ? 'border-red-500 shadow-red-900/20' : 'border-zinc-800'} ${videoState === 'blurred' ? 'cursor-pointer hover:border-zinc-600' : ''}`}
                >
                    <div className={`absolute inset-0 bg-zinc-800 bg-[url('https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center transition-all duration-700 ${videoState === 'blurred' || videoState === 'requesting' ? 'blur-2xl scale-110 opacity-50' : 'blur-0 opacity-100'}`}></div>

                    {privacyShieldActive && (
                        <div className="absolute inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center text-zinc-500">
                            <EyeOff size={48} className="mb-4" />
                            <h3 className="text-xl font-bold text-zinc-300">Privacy Shield Closed</h3>
                            <p className="text-sm">Cam & Mic Disabled</p>
                        </div>
                    )}

                    {!privacyShieldActive && (
                        <div className="absolute inset-0 z-40 flex flex-col p-4">
                            {/* Video Header: Status and End Button */}
                            <div className="flex justify-between items-start pointer-events-auto">
                                <div className={`backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border ${videoState === 'emergency' ? 'bg-red-500/80 border-red-400 text-white' : 'bg-black/50 border-white/10'}`}>
                                    {videoState === 'emergency' ? (
                                        <>
                                            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                                            <span className="text-xs font-bold uppercase tracking-wider">EMERGENCY LIVE</span>
                                        </>
                                    ) : videoState === 'live' ? (
                                        <>
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            <span className="text-xs font-bold uppercase tracking-wider">Live Feed</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-zinc-400" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Encrypted</span>
                                        </>
                                    )}
                                </div>

                                {videoState === 'live' && (
                                    <button onClick={handleEndVisit} className="bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-red-400/50 transition-colors pointer-events-auto">
                                        End
                                    </button>
                                )}
                            </div>

                            {/* Central Area for Connect/Loading */}
                            <div className="flex-1 flex items-center justify-center pointer-events-none">
                                {videoState === 'blurred' && (
                                    <div className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-white/10 pointer-events-auto">
                                        <Play size={20} fill="currentColor" /> Tap to Connect
                                    </div>
                                )}
                                {videoState === 'requesting' && (
                                    <div className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 animate-in zoom-in-95">
                                        <Loader2 size={40} className="text-neon animate-spin" />
                                        <div>
                                            <p className="font-bold text-lg text-white text-center">Connecting...</p>
                                            <p className="text-zinc-400 text-xs text-center mt-0.5">Establishing Secure Feed</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* On-Screen Directional Controls */}
                    {canControl && (
                        <>
                            {/* Up */}
                            <button
                                className={`absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 z-50 ${activeDirection === 'up' ? 'bg-neon text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                onClick={(e) => handleDirection('up', e)}
                            >
                                <ArrowUp size={24} />
                            </button>

                            {/* Down */}
                            <button
                                className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 z-50 ${activeDirection === 'down' ? 'bg-neon text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                onClick={(e) => handleDirection('down', e)}
                            >
                                <ArrowDown size={24} />
                            </button>

                            {/* Left */}
                            <button
                                className={`absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 z-50 ${activeDirection === 'left' ? 'bg-neon text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                onClick={(e) => handleDirection('left', e)}
                            >
                                <ArrowLeft size={24} />
                            </button>

                            {/* Right */}
                            <button
                                className={`absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 z-50 ${activeDirection === 'right' ? 'bg-neon text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                onClick={(e) => handleDirection('right', e)}
                            >
                                <ArrowRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Voice Command Bar */}
                <button
                    onClick={handleVoiceCommand}
                    className={`w-full p-4 rounded-[20px] flex items-center gap-4 transition-all border ${isListening ? 'bg-neon/10 border-neon text-neon' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening ? 'bg-neon text-black animate-pulse' : 'bg-black text-white'}`}>
                        <Mic size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-lg text-white">{isListening ? 'Listening...' : 'Voice Command'}</div>
                        <div className="text-zinc-500 text-sm">{isListening ? `Try "${robotName}, look left"` : 'Tap to speak'}</div>
                    </div>
                </button>

                {/* --- HOME ENVIRONMENT --- */}
                <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 pl-2">Home Environment</h3>

                    {/* AI Alert Banner */}
                    {(tempAlert || humidAlert || gasAlert) && (
                        <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-start gap-3 animate-pulse">
                            <AlertTriangle className="text-red-500 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-red-400 text-sm">Environmental Warning</h4>
                                <div className="text-xs text-red-200">
                                    {tempAlert && <span className="block">• Temperature High ({envData.temp}°F)</span>}
                                    {humidAlert && <span className="block">• Humidity High ({envData.humidity}%)</span>}
                                    {gasAlert && <span className="block">• Gas Detected</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-[24px] border flex flex-col gap-2 ${tempAlert || humidAlert ? 'bg-red-900/10 border-red-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex items-center gap-2 text-orange-400">
                                <Thermometer size={18} />
                                <span className={`font-bold text-sm ${tempAlert ? 'text-red-400' : ''}`}>{envData.temp}°F</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                                <Droplets size={18} />
                                <span className={`font-bold text-sm ${humidAlert ? 'text-red-400' : ''}`}>{envData.humidity}%</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Comfort</p>
                        </div>

                        <div className="bg-zinc-900 p-4 rounded-[24px] border border-zinc-800 flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-green-500">
                                <Wind size={20} />
                                <span className="font-bold text-sm">{envData.airQuality}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Air Quality</p>
                        </div>

                        <div className="bg-zinc-900 p-4 rounded-[24px] border border-zinc-800 flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-yellow-500">
                                {envData.light === 'Low' ? <Moon size={20} /> : <Sun size={20} />}
                                <span className="font-bold text-sm">{envData.light}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Lighting</p>
                        </div>

                        {/* Gas Detection Card */}
                        <div className={`p-4 rounded-[24px] border flex flex-col justify-between ${gasAlert ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                            <div className="flex items-center gap-2">
                                <Flame size={20} className={gasAlert ? 'text-red-500 animate-bounce' : 'text-zinc-500'} />
                                <span className={`font-bold text-sm ${gasAlert ? 'text-white' : 'text-zinc-300'}`}>{envData.gas}</span>
                            </div>
                            <p className="text-[10px] font-bold uppercase">Gas Level</p>
                        </div>
                    </div>
                </div>

                {/* --- ELDERLY ACTIVITY & SECURITY --- */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-5 rounded-[24px] border transition-colors col-span-2 ${activityData.anomalies > 0 ? 'bg-zinc-900 border-orange-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-neon">
                                <UserCheck size={20} />
                                <h4 className="font-bold text-sm uppercase tracking-wide text-white">Elderly Activity</h4>
                            </div>
                            {activityData.anomalies > 0 && (
                                <span className="bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Anomaly</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Last Seen</p>
                                <p className="text-zinc-300 font-bold text-sm">{activityData.lastSeen}</p>
                                <p className="text-xs text-zinc-500">{activityData.location}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Movement</p>
                                <p className="text-zinc-300 font-bold text-sm">{activityData.movements} walks today</p>
                            </div>
                        </div>

                        {/* Detailed Anomaly Logs */}
                        {activityData.anomalies > 0 && (
                            <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
                                <p className="text-[10px] text-orange-400 font-bold uppercase mb-2 flex items-center gap-1">
                                    <AlertTriangle size={10} /> Detection Log
                                </p>
                                <div className="space-y-2">
                                    {activityData.anomalyLogs.map((log, i) => (
                                        <div key={i} className="flex gap-2 items-start text-xs">
                                            <span className="text-orange-300 font-mono whitespace-nowrap">{log.time}</span>
                                            <span className="text-zinc-300">{log.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ACTIVITY LOGS --- */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-2">
                        <div className="flex items-center gap-2">
                            <ScrollText size={16} className="text-zinc-500" />
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Activity Log</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {activityLogs.map((log) => (
                            <div key={log.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-[20px] flex gap-4 items-start">
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                    log.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {log.icon === 'check' && <ShieldCheck size={16} />}
                                    {log.icon === 'activity' && <Activity size={16} />}
                                    {log.icon === 'alert' && <AlertTriangle size={16} />}
                                    {log.icon === 'shield' && <ShieldCheck size={16} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-white text-sm">{log.title}</h4>
                                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">{log.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SECURITY EVENTS (NEW) --- */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-2 mt-2">
                        <div className="flex items-center gap-2">
                            <AlertOctagon size={16} className="text-red-500" />
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Security Events</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {securityLogs.map((log) => (
                            <div key={log.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-[20px] flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                                    <ShieldAlert size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-white text-sm">{log.type}</h4>
                                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{log.action}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-zinc-400">{log.source}</p>
                                        <p className="text-[10px] text-zinc-600 font-bold">{log.time}</p>
                                    </div>
                                </div>
                                <div className="text-center px-2 border-l border-zinc-800">
                                    <div className="text-lg font-black text-red-500">{log.risk}</div>
                                    <div className="text-[8px] font-bold text-zinc-500 uppercase">Risk</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
