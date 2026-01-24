
import React, { useState } from 'react';
import { ShieldCheck, Zap, HeartPulse, RefreshCw, FileText, ChevronDown, ChevronUp, History, Clock, AlertCircle, Sparkles, Users, Send, Info, TrendingUp, Check, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Bill, PaymentRecord } from '../types';
import { MOCK_CONTACTS } from '../constants';

interface BillCardProps {
    bill: Bill;
    onUpdate?: (updates: Partial<Bill>) => void;
    onAskForHelp?: (billId: string, contactId: string) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onUpdate, onAskForHelp }) => {
    const [showHistory, setShowHistory] = useState(false);
    const [showHelpSelector, setShowHelpSelector] = useState(false);
    const [assistanceRequested, setAssistanceRequested] = useState(bill.assistanceStatus === 'requested');
    const [showExplain, setShowExplain] = useState(false);

    // Find primary caregiver (John) for quick access
    const primaryCaregiver = MOCK_CONTACTS.find(c => c.name === 'John');

    const getCategoryConfig = (category: string) => {
        switch (category) {
            case 'utility':
                return {
                    icon: <Zap size={20} className="text-amber-600" aria-hidden="true" />,
                    label: 'Utility',
                    bg: 'bg-amber-100',
                    border: 'border-amber-200',
                    text: 'text-amber-800'
                };
            case 'medical':
                return {
                    icon: <HeartPulse size={20} className="text-rose-600" aria-hidden="true" />,
                    label: 'Medical',
                    bg: 'bg-rose-100',
                    border: 'border-rose-200',
                    text: 'text-rose-800'
                };
            case 'subscription':
                return {
                    icon: <RefreshCw size={20} className="text-sky-600" aria-hidden="true" />,
                    label: 'Subscription',
                    bg: 'bg-sky-100',
                    border: 'border-sky-200',
                    text: 'text-sky-800'
                };
            default:
                return {
                    icon: <FileText size={20} className="text-gray-600" aria-hidden="true" />,
                    label: 'Bill',
                    bg: 'bg-gray-100',
                    border: 'border-gray-200',
                    text: 'text-gray-800'
                };
        }
    };

    const { icon, label, bg, border, text } = getCategoryConfig(bill.category);

    // Stats
    const historyTotal = bill.history.reduce((sum, record) => sum + record.amount, 0);
    const historyCount = bill.history.length;
    const historyAvg = historyCount > 0 ? historyTotal / historyCount : 0;
    const diff = bill.amount - historyAvg;
    const diffPercent = historyAvg > 0 ? (diff / historyAvg) * 100 : 0;

    const handleHelpRequest = (contactId: string) => {
        setAssistanceRequested(true);
        setShowHelpSelector(false);
        if (onAskForHelp) onAskForHelp(bill.id, contactId);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onUpdate) {
            onUpdate({ category: e.target.value as Bill['category'] });
        }
    };

    const handleApprove = () => {
        if (onUpdate) {
            onUpdate({ status: 'paid' });
        }
    };

    const getStatusIcon = (status: PaymentRecord['status']) => {
        switch (status) {
            case 'paid': return <ShieldCheck size={16} className="text-emerald-500" aria-label="Paid" />;
            case 'pending': return <Clock size={16} className="text-amber-500" aria-label="Pending" />;
            case 'failed': return <AlertCircle size={16} className="text-red-500" aria-label="Failed" />;
            default: return null;
        }
    };

    return (
        <article
            className="bg-white rounded-[28px] p-6 shadow-card border border-white group transition-all duration-300 relative overflow-hidden"
            aria-labelledby={`bill-title-${bill.id}`}
        >
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative group/cat">
                    <label htmlFor={`category-select-${bill.id}`} className="sr-only">Bill Category</label>
                    <div className={`flex items-center gap-2 ${bg} ${border} border rounded-full pl-1 pr-3 py-1 transition-colors`}>
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                            {icon}
                        </div>
                        <div className="flex items-center">
                            <select
                                id={`category-select-${bill.id}`}
                                value={bill.category}
                                onChange={handleCategoryChange}
                                className={`appearance-none bg-transparent ${text} font-bold tracking-tight text-xs uppercase cursor-pointer focus:outline-none pr-1`}
                            >
                                <option value="utility">Utility</option>
                                <option value="medical">Medical</option>
                                <option value="subscription">Subs</option>
                                <option value="other">Other</option>
                            </select>
                            <ChevronDown size={12} className={text} aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {bill.status === 'paid' ? (
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck size={12} /> Paid
                    </span>
                ) : (
                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-rose-100 flex items-center gap-1">
                        <Clock size={12} /> Unpaid
                    </span>
                )}
            </div>

            {/* Main Content */}
            <div className="flex items-baseline justify-between mb-2">
                <h3 id={`bill-title-${bill.id}`} className="text-text-main text-xl font-bold">{bill.title}</h3>
                <p className="text-text-main text-3xl font-black tracking-tight" aria-label={`Amount: ${bill.amount} dollars`}>
                    ${bill.amount.toFixed(2)}
                </p>
            </div>
            <p className="text-text-sub text-sm font-medium mb-6 flex items-center gap-2">
                <Clock size={14} /> Due {bill.dueDate}
            </p>

            {/* AI Insight Section */}
            {bill.aiAnalysis && bill.status !== 'paid' && (
                <section
                    className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mb-6 relative overflow-hidden"
                    aria-label="AI Analysis"
                >
                    <div className="flex gap-3 mb-4">
                        <div className="mt-0.5 p-1.5 bg-indigo-100 rounded-lg">
                            <Sparkles size={16} className="text-indigo-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-indigo-900 font-bold text-sm">AI Insight</h4>
                                <button
                                    onClick={() => setShowExplain(!showExplain)}
                                    aria-expanded={showExplain}
                                    aria-controls={`explain-${bill.id}`}
                                    className="flex items-center gap-1.5 text-[10px] font-bold bg-white text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
                                >
                                    <HelpCircle size={12} /> Explain Analysis
                                </button>
                            </div>
                            <p className="text-indigo-800 text-sm leading-relaxed">{bill.aiAnalysis}</p>

                            {/* Expandable Explanation */}
                            {showExplain && (
                                <div
                                    id={`explain-${bill.id}`}
                                    className="mt-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 text-xs text-indigo-700 animate-in fade-in slide-in-from-top-1"
                                >
                                    <strong>Detailed Breakdown:</strong>
                                    <p className="mt-1 leading-relaxed opacity-90">
                                        The system analyzed your past 6 months of payments. A spike of {diffPercent.toFixed(0)}% was detected compared to the seasonal average, possibly due to increased usage or rate changes.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Data Visualization */}
                    <div className="bg-white rounded-xl p-3 border border-indigo-50 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">6-Month Avg</span>
                            <span className="text-gray-600 font-bold text-lg">${historyAvg.toFixed(2)}</span>
                        </div>

                        <div className="h-8 w-px bg-gray-100"></div>

                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Current Bill</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-900 font-bold text-lg">${bill.amount.toFixed(2)}</span>
                                {historyCount > 0 && (
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${diff > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {diff > 0 ? '+' : ''}{diffPercent.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Actions */}
            {!assistanceRequested ? (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={handleApprove}
                        className="bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transform"
                        aria-label={`Approve payment of $${bill.amount}`}
                    >
                        <Check size={18} strokeWidth={3} /> Approve
                    </button>

                    {primaryCaregiver ? (
                        <button
                            onClick={() => handleHelpRequest(primaryCaregiver.id)}
                            className="bg-gray-900 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200 active:scale-95 transform"
                            aria-label={`Ask ${primaryCaregiver.name} for help`}
                        >
                            <div className="w-5 h-5 rounded-full border border-white/30 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${primaryCaregiver.avatarSeed}`} alt="" className="w-full h-full bg-gray-700" />
                            </div>
                            Ask {primaryCaregiver.name}
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowHelpSelector(!showHelpSelector)}
                            aria-expanded={showHelpSelector}
                            aria-controls={`help-selector-${bill.id}`}
                            className="bg-white text-text-main border border-gray-200 font-bold py-3.5 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 transform"
                        >
                            <Users size={18} /> Ask for Help
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-center justify-center gap-2 animate-in fade-in">
                    <Send size={18} className="text-emerald-600" />
                    <span className="text-emerald-800 font-bold text-sm">Request sent to Circle</span>
                </div>
            )}

            {/* Contact Selector Overlay (Fallback) */}
            {showHelpSelector && !assistanceRequested && (
                <div id={`help-selector-${bill.id}`} className="mb-6 bg-gray-50 rounded-xl p-3 animate-in slide-in-from-top-2 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Who to ask?</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {MOCK_CONTACTS.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => handleHelpRequest(contact.id)}
                                className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 pr-3 rounded-full hover:border-gray-400 transition-colors min-w-max"
                                aria-label={`Ask ${contact.name}`}
                            >
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatarSeed}`} className="w-6 h-6 rounded-full bg-gray-100" alt="" />
                                <span className="font-bold text-xs text-text-main">{contact.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* History Section */}
            <div className="border-t border-gray-100 pt-4">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    aria-expanded={showHistory}
                    aria-controls={`history-list-${bill.id}`}
                    className="flex items-center justify-between w-full text-text-sub hover:text-text-main font-bold text-xs uppercase tracking-wide group p-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <History size={14} />
                        <span>Payment History</span>
                    </div>
                    {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showHistory && (
                    <ul id={`history-list-${bill.id}`} className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                        {bill.history.map(record => (
                            <li key={record.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-500 font-medium text-xs">{record.date}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-text-main text-sm">${record.amount.toFixed(2)}</span>
                                    {getStatusIcon(record.status)}
                                </div>
                            </li>
                        ))}
                        {bill.history.length === 0 && (
                            <li className="text-center text-gray-400 text-xs py-2 italic">No previous history available</li>
                        )}
                    </ul>
                )}
            </div>
        </article>
    );
};
