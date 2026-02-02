
import React, { useState } from 'react';
import { ShieldCheck, Zap, HeartPulse, RefreshCw, FileText, Receipt, Phone, ChevronDown, ChevronUp, History, Clock, AlertCircle, Sparkles, Users, Send, Info, TrendingUp, Check, ArrowUpRight, HelpCircle, AlertTriangle } from 'lucide-react';
import { Bill, PaymentRecord } from '../types';
import { MOCK_CONTACTS } from '../constants';
import tts from '../util/TTSindex';

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
    const [showElectricDetails, setShowElectricDetails] = useState(false);
    const [showPhoneDetails, setShowPhoneDetails] = useState(false);
    const [showAbnormalReason, setShowAbnormalReason] = useState(false);
    const [showAiInsight, setShowAiInsight] = useState(false);

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
            case 'tax':
                return {
                    icon: <Receipt size={20} className="text-violet-600" aria-hidden="true" />,
                    label: 'Tax',
                    bg: 'bg-violet-100',
                    border: 'border-violet-200',
                    text: 'text-violet-800'
                };
            case 'phone':
                return {
                    icon: <Phone size={20} className="text-teal-600" aria-hidden="true" />,
                    label: 'Phone',
                    bg: 'bg-teal-100',
                    border: 'border-teal-200',
                    text: 'text-teal-800'
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

    const handleApprove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onUpdate?.({ status: 'paid' });
        if (tts.isSupported()) tts.speak('All set. Bill marked paid.');
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
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 group transition-all duration-300 relative overflow-hidden hover:shadow-md"
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
                                className={`appearance-none bg-transparent ${text} font-bold font-heading tracking-tight text-xs uppercase cursor-pointer focus:outline-none pr-1`}
                            >
                                <option value="utility">Utility</option>
                                <option value="phone">Phone</option>
                                <option value="medical">Medical</option>
                                <option value="subscription">Subs</option>
                                <option value="tax">Tax</option>
                                <option value="other">Other</option>
                            </select>
                            <ChevronDown size={12} className={text} aria-hidden="true" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {bill.status === 'paid' ? (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold font-heading uppercase border border-emerald-100 flex items-center gap-1">
                            <ShieldCheck size={12} /> Paid
                        </span>
                    ) : (
                        <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold font-heading uppercase border border-rose-100 flex items-center gap-1">
                            <Clock size={12} /> Unpaid
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex items-baseline justify-between mb-2">
                <h3 id={`bill-title-${bill.id}`} className="text-text-main text-xl font-bold font-heading">{bill.title}</h3>
                <p className="text-text-main text-3xl font-black font-heading tracking-tight" aria-label={`Amount: ${bill.amount} dollars`}>
                    ${bill.amount.toFixed(2)}
                </p>
            </div>
            <p className="text-text-sub text-sm font-medium mb-2 flex items-center gap-2">
                <Clock size={14} /> Due {bill.dueDate}
            </p>

            {/* Electric bill: one-line summary (Period · Usage), collapsible "Details" only when Account No exists */}
            {bill.category === 'utility' && (bill.period != null || bill.totalUsageKwh != null || bill.accountNo != null) && (
                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-amber-800">
                        {bill.period != null && <span className="font-medium">{bill.period}</span>}
                        {bill.totalUsageKwh != null && (
                            <span className="text-amber-700">{bill.totalUsageKwh.toLocaleString()} KWh</span>
                        )}
                        {bill.accountNo != null && (
                            <button
                                type="button"
                                onClick={() => setShowElectricDetails(!showElectricDetails)}
                                aria-expanded={showElectricDetails}
                                aria-controls={`electric-details-${bill.id}`}
                                className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 font-medium"
                            >
                                {showElectricDetails ? 'Hide details' : 'Details'}
                                {showElectricDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                    </div>
                    {showElectricDetails && bill.accountNo != null && (
                        <div id={`electric-details-${bill.id}`} className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                            <span className="text-[10px] font-bold font-heading uppercase tracking-wider text-amber-600/90">Account No</span>
                            <p className="mt-0.5 font-mono text-sm font-bold text-amber-900">{bill.accountNo}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Phone/telecom bill: plan · minutes · data, collapsible account details */}
            {bill.category === 'phone' && (bill.planName != null || bill.minutesUsed != null || bill.dataUsedGb != null || bill.accountNo != null) && (
                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-teal-800">
                        {bill.planName != null && <span className="font-medium">{bill.planName}</span>}
                        {bill.minutesUsed != null && (
                            <span className="text-teal-700">{bill.minutesUsed.toLocaleString()} min</span>
                        )}
                        {bill.dataUsedGb != null && (
                            <span className="text-teal-700">{bill.dataUsedGb} GB</span>
                        )}
                        {bill.accountNo != null && (
                            <button
                                type="button"
                                onClick={() => setShowPhoneDetails(!showPhoneDetails)}
                                aria-expanded={showPhoneDetails}
                                aria-controls={`phone-details-${bill.id}`}
                                className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium"
                            >
                                {showPhoneDetails ? 'Hide details' : 'Details'}
                                {showPhoneDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                    </div>
                    {showPhoneDetails && bill.accountNo != null && (
                        <div id={`phone-details-${bill.id}`} className="mt-3 rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600/90">Account No</span>
                            <p className="mt-0.5 font-mono text-sm font-bold text-teal-900">{bill.accountNo}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Abnormal usage: compact, collapsible for full reason */}
            {bill.usageStatus === 'abnormal' && bill.abnormalReason && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setShowAbnormalReason(!showAbnormalReason)}
                        aria-expanded={showAbnormalReason}
                        aria-controls={`abnormal-reason-${bill.id}`}
                        className="w-full flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left hover:bg-amber-50/80 transition-colors"
                    >
                        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                            <AlertTriangle size={16} className="text-amber-700" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold font-heading text-amber-900 text-sm">ABNORMAL USAGE DETECTED</p>
                            {showAbnormalReason ? (
                                <p id={`abnormal-reason-${bill.id}`} className="mt-1 text-sm text-amber-800 leading-relaxed">{bill.abnormalReason}</p>
                            ) : (
                                <p className="mt-0.5 text-xs text-amber-700">Tap for details</p>
                            )}
                        </div>
                        {showAbnormalReason ? <ChevronUp size={16} className="text-amber-600 shrink-0" /> : <ChevronDown size={16} className="text-amber-600 shrink-0" />}
                    </button>
                </div>
            )}

            {/* Tax bill: tax year / form type */}
            {bill.category === 'tax' && (bill.taxYear || bill.formType) ? (
                <div className="flex flex-wrap gap-2 mb-6">
                    {bill.taxYear && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-heading bg-violet-50 text-violet-700 border border-violet-100">
                            Tax Year {bill.taxYear}
                        </span>
                    )}
                    {bill.formType && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-heading bg-violet-50 text-violet-700 border border-violet-100">
                            Form {bill.formType}
                        </span>
                    )}
                </div>
            ) : (
                <div className="mb-6" />
            )}

            {/* AI Insight: collapsible for utility & phone bills, always open for others */}
            {bill.aiAnalysis && bill.status !== 'paid' && (
                <section className="mb-6" aria-label="AI Analysis">
                    {(bill.category === 'utility' || bill.category === 'phone') ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowAiInsight(!showAiInsight)}
                                aria-expanded={showAiInsight}
                                aria-controls={`ai-insight-${bill.id}`}
                                className="flex w-full items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-left hover:bg-indigo-50/80 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                        <Sparkles size={14} className="text-indigo-600" aria-hidden="true" />
                                    </div>
                                    <span className="font-bold  font-heading text-indigo-900 text-sm">AI Insight</span>
                                </div>
                                {showAiInsight ? <ChevronUp size={16} className="text-indigo-600" /> : <ChevronDown size={16} className="text-indigo-600" />}
                            </button>
                            {showAiInsight && (
                                <div id={`ai-insight-${bill.id}`} className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
                                    <p className="text-indigo-800 text-sm leading-relaxed">{bill.aiAnalysis}</p>
                                    <div className="flex justify-between items-center rounded-xl bg-white p-3 border border-indigo-50">
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold font-heading uppercase tracking-wider">6-Month Avg</span>
                                            <p className="font-bold font-heading text-gray-700">${historyAvg.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 font-bold font-heading uppercase tracking-wider">Current</span>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <span className="font-bold font-heading text-gray-900">${bill.amount.toFixed(2)}</span>
                                                {historyCount > 0 && (
                                                    <span className={`text-xs font-bold font-heading px-1.5 py-0.5 rounded ${diff > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {diff > 0 ? '+' : ''}{diffPercent.toFixed(0)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowExplain(!showExplain)}
                                        aria-expanded={showExplain}
                                        className="flex items-center gap-1.5 text-[10px] font-bold font-heading text-indigo-600"
                                    >
                                        <HelpCircle size={12} /> {showExplain ? 'Hide' : 'Explain'} analysis
                                    </button>
                                    {showExplain && (
                                        <p className="text-xs text-indigo-700 leading-relaxed">
                                            The system compared this bill to your past payments. A spike of {diffPercent.toFixed(0)}% was detected, possibly due to increased usage or rate changes.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-indigo-900 font-bold font-heading text-sm">AI Insight</h4>
                                <button
                                    onClick={() => setShowExplain(!showExplain)}
                                    aria-expanded={showExplain}
                                    className="flex items-center gap-1.5 text-[10px] font-bold font-heading bg-white text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-full hover:bg-indigo-50"
                                >
                                    <HelpCircle size={12} /> Explain
                                </button>
                            </div>
                            <p className="text-indigo-800 text-sm leading-relaxed">{bill.aiAnalysis}</p>
                            {showExplain && (
                                <p className="mt-2 text-xs text-indigo-700 leading-relaxed">
                                    The system analyzed your past payments. A spike of {diffPercent.toFixed(0)}% was detected compared to the average.
                                </p>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Actions: confirm paid, then move to Completed */}
            {bill.status === 'paid' ? (
                <div className="mb-6 py-3 px-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in-95 duration-300">
                    <Check size={20} className="text-emerald-600" strokeWidth={3} aria-hidden="true" />
                    <span className="text-emerald-800 font-bold font-heading text-sm uppercase tracking-wide">Payment approved</span>
                </div>
            ) : !assistanceRequested ? (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        type="button"
                        onClick={handleApprove}
                        className="bg-emerald-500 text-white font-bold font-heading py-3.5 rounded-xl text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transform uppercase tracking-wide"
                        aria-label={`Confirm paid for $${bill.amount}`}
                    >
                        <Check size={18} strokeWidth={3} /> CONFIRM PAID
                    </button>

                    {primaryCaregiver ? (
                        <button
                            type="button"
                            onClick={() => handleHelpRequest(primaryCaregiver.id)}
                            className="bg-gray-900 text-white font-bold font-heading py-3.5 rounded-xl text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200 active:scale-95 transform uppercase tracking-wide"
                            aria-label={`Ask ${primaryCaregiver.name} for help`}
                        >
                            <div className="w-5 h-5 rounded-full border border-white/30 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${primaryCaregiver.avatarSeed}`} alt="" className="w-full h-full bg-gray-700" />
                            </div>
                            Ask {primaryCaregiver.name}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowHelpSelector(!showHelpSelector)}
                            aria-expanded={showHelpSelector}
                            aria-controls={`help-selector-${bill.id}`}
                            className="bg-white text-text-main border border-gray-200 font-bold font-heading py-3.5 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 transform uppercase tracking-wide"
                        >
                            <Users size={18} /> Ask for Help
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-center justify-center gap-2 animate-in fade-in">
                    <Send size={18} className="text-emerald-600" />
                    <span className="text-emerald-800 font-bold font-heading text-sm uppercase tracking-wide">Request sent to Circle</span>
                </div>
            )}

            {/* Contact Selector Overlay (Fallback) */}
            {showHelpSelector && !assistanceRequested && (
                <div id={`help-selector-${bill.id}`} className="mb-6 bg-gray-50 rounded-xl p-3 animate-in slide-in-from-top-2 border border-gray-100">
                    <p className="text-xs font-bold font-heading text-gray-400 uppercase tracking-wider mb-2">Who to ask?</p>
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
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    aria-expanded={showHistory}
                    aria-controls={`history-list-${bill.id}`}
                    className="flex items-center justify-between w-full text-text-sub hover:text-text-main font-bold font-heading text-xs uppercase tracking-wider group p-1 rounded-lg hover:bg-gray-50 transition-colors"
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
                                    <span className="font-bold font-heading text-text-main text-sm">${record.amount.toFixed(2)}</span>
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
