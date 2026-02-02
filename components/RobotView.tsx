
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
        <div className="flex flex-col h-full bg-[#F5F7F9] text-gray-900 relative">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#F5F7F9] border-b border-gray-200 px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm -ml-2 active:scale-95"
                    aria-label="Back to dashboard"
                >
                    <ChevronLeft size={28} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold truncate max-w-[150px] text-gray-900">{robotName}</h2>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <Settings size={16} />
                        </button>
                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm ml-auto md:ml-2">
                            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-guardian-blue' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-bold font-heading text-gray-500 uppercase">{connectionStatus}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-guardian-blue text-sm font-bold font-heading uppercase tracking-wide">
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
                <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[32px] border border-gray-200 p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full p-1"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2 text-gray-900">
                            <UserCog size={24} className="text-guardian-blue" /> Personalization
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Robot Name</label>
                                <input
                                    type="text"
                                    value={robotName}
                                    onChange={(e) => setRobotName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 font-bold focus:border-guardian-blue outline-none transition-colors focus:ring-2 focus:ring-guardian-blue/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personality</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Caring Companion', 'Strict Guardian'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPersonality(p)}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${personality === p ? 'bg-guardian-blue text-white border-guardian-blue' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notification Sound</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 px-3">
                                    <Volume2 size={20} className="text-gray-500" />
                                    <select
                                        value={soundTheme}
                                        onChange={(e) => setSoundTheme(e.target.value)}
                                        className="bg-transparent text-gray-900 font-bold text-sm w-full p-2 outline-none"
                                    >
                                        <option>Soft Chime</option>
                                        <option>Alert Beep</option>
                                        <option>Human Voice</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full bg-guardian-blue text-white font-bold font-heading text-lg py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200"
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
                    className={`rounded-[32px] overflow-hidden aspect-video relative border transition-all duration-500 shadow-xl group ${videoState === 'emergency' ? 'border-red-500 shadow-red-900/20' : 'border-gray-200 bg-white'} ${videoState === 'blurred' ? 'cursor-pointer hover:border-gray-300' : ''}`}
                >
                    <div className={`absolute inset-0 bg-zinc-800 bg-[url('https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center transition-all duration-700 ${videoState === 'blurred' || videoState === 'requesting' ? 'blur-2xl scale-110 opacity-50' : 'blur-0 opacity-100'}`}></div>

                    {privacyShieldActive && (
                        <div className="absolute inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center text-zinc-500">
                            <EyeOff size={48} className="mb-4" />
                            <h3 className="text-xl font-bold font-heading text-zinc-300">Privacy Shield Closed</h3>
                            <p className="text-sm font-sans">Cam & Mic Disabled</p>
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
                                            <span className="text-xs font-bold font-heading uppercase tracking-wider">Live Feed</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-zinc-400" />
                                            <span className="text-xs font-bold font-heading uppercase tracking-wider text-zinc-300">Encrypted</span>
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
                                    <div className="bg-white text-black px-6 py-3 rounded-full font-bold font-heading flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-white/10 pointer-events-auto">
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
                    className={`w-full p-4 rounded-[20px] flex items-center gap-4 transition-all border shadow-sm ${isListening ? 'bg-neon/10 border-neon' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening ? 'bg-neon text-black animate-pulse' : 'bg-[#F5F9FF] text-guardian-blue'}`}>
                        <Mic size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className={`font-bold font-heading text-lg ${isListening ? 'text-neon' : 'text-gray-900'}`}>{isListening ? 'Listening...' : 'Voice Command'}</div>
                        <div className="text-gray-500 font-sans text-sm">{isListening ? `Try "${robotName}, look left"` : 'Tap to speak'}</div>
                    </div>
                </button>

                {/* --- HOME ENVIRONMENT --- */}
                <div>
                    <h3 className="text-2xl font-bold font-heading text-gray-900 mb-4 ml-2">Home Environment</h3>

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

                <div className="grid grid-cols-2 gap-4"> {/* Increased gap */}
                    <div className={`p-4 rounded-xl border flex flex-col gap-3 shadow-sm ${tempAlert || humidAlert ? 'bg-white border-red-500 shadow-red-100' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                                <Thermometer size={20} />
                            </div>
                            <span className={`font-bold font-heading text-2xl ${tempAlert ? 'text-red-500' : 'text-gray-900'}`}>{envData.temp}°F</span>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                                <Droplets size={20} />
                            </div>
                            <span className={`font-bold font-heading text-2xl ${humidAlert ? 'text-red-500' : 'text-gray-900'}`}>{envData.humidity}%</span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wider">Comfort</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                                <Wind size={20} />
                            </div>
                            <span className="font-bold font-heading text-2xl text-gray-900">{envData.airQuality}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Air Quality</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                                {envData.light === 'Low' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <span className="font-bold font-heading text-2xl text-gray-900">{envData.light}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lighting</p>
                    </div>

                    {/* Gas Detection Card */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between shadow-sm ${gasAlert ? 'bg-white border-red-500 shadow-red-100' : 'bg-white border-gray-200'}`}>
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${gasAlert ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                                <Flame size={20} />
                            </div>
                            <span className={`font-bold font-heading text-2xl ${gasAlert ? 'text-red-500' : 'text-gray-900'}`}>{envData.gas}</span>
                        </div>
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Gas Level</p>
                    </div>
                </div>
                </div>

                {/* --- ELDERLY ACTIVITY & SECURITY --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-5 rounded-xl border transition-colors col-span-2 shadow-sm ${activityData.anomalies > 0 ? 'bg-white border-guardian-blue shadow-blue-100' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-guardian-blue">
                                    <UserCheck size={20} />
                                </div>
                                <h4 className="font-bold font-heading text-lg text-gray-900">Elderly Activity</h4>
                            </div>
                            {activityData.anomalies > 0 && (
                                <span className="bg-guardian-blue text-white text-xs font-black font-heading px-3 py-1 rounded-full uppercase tracking-wider">Anomaly</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-4 px-1">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Last Seen</p>
                                <p className="text-gray-900 font-bold text-lg font-heading">{activityData.lastSeen}</p>
                                <p className="text-sm text-gray-500 font-medium">{activityData.location}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Movement</p>
                                <p className="text-gray-900 font-bold text-lg font-heading">{activityData.movements} walks</p>
                            </div>
                        </div>

                        {/* Detailed Anomaly Logs */}
                        {activityData.anomalies > 0 && (
                            <div className="bg-[#F5F9FF] rounded-xl p-4 border border-blue-100 mt-2">
                                <p className="text-xs text-guardian-blue font-bold uppercase mb-3 flex items-center gap-2 tracking-wider">
                                    <AlertTriangle size={14} /> Detection Log
                                </p>
                                <div className="space-y-3">
                                    {activityData.anomalyLogs.map((log, i) => (
                                        <div key={i} className="flex gap-3 items-start text-sm">
                                            <span className="text-guardian-blue font-mono font-bold whitespace-nowrap bg-white px-2 py-0.5 rounded border border-blue-100">{log.time}</span>
                                            <span className="text-gray-700 font-medium">{log.desc}</span>
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
                            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2 ml-2">Activity Log</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activityLogs.map((log) => (
                            <div key={log.id} className="bg-white border border-gray-200 p-5 rounded-xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${log.type === 'warning' ? 'bg-red-50 text-red-500' : 'bg-[#F5F9FF] text-guardian-blue'}`}>
                                    {log.icon === 'check' && <ShieldCheck size={20} />}
                                    {log.icon === 'activity' && <Activity size={20} />}
                                    {log.icon === 'alert' && <AlertTriangle size={20} />}
                                    {log.icon === 'shield' && <ShieldCheck size={20} />}
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold font-heading text-gray-900 text-base">{log.title}</h4>
                                        <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">{log.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{log.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SECURITY EVENTS (NEW) --- */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-2 mt-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2 ml-2">Security Events</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {securityLogs.map((log) => (
                            <div key={log.id} className="bg-white border border-gray-200 p-5 rounded-xl flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                                    <ShieldAlert size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold font-heading text-gray-900 text-base">{log.type}</h4>
                                        <span className="bg-red-50 text-red-600 border border-red-100 text-xs font-black font-heading px-2 py-0.5 rounded-lg uppercase tracking-wide">{log.action}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-500 font-medium">{log.source}</p>
                                        <p className="text-xs text-gray-400 font-bold">{log.time}</p>
                                    </div>
                                </div>
                                <div className="text-center px-3 border-l border-gray-100 ml-2">
                                    <div className="text-xl font-black font-heading text-red-500">{log.risk}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risk</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
