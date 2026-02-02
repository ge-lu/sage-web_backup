
import React, { useState } from 'react';
import { Plus, Bot, X, MessageSquare, Facebook, Twitter, Music, MessageCircle } from 'lucide-react';
import { MOCK_CONTACTS } from '../constants';
import { ViewType } from '../types';

interface SafetyNetProps {
	onNavigate?: (view: ViewType) => void;
	onSelectContact?: (contactId: string) => void;
	isExpanded?: boolean;
}

export const SafetyNet: React.FC<SafetyNetProps> = ({ onNavigate, onSelectContact, isExpanded = true }) => {
	const [showInviteModal, setShowInviteModal] = useState(false);

	const handleShare = (platform: string) => {
		console.log(`Sharing invite via ${platform}`);
		setShowInviteModal(false);
	};

	const handleRobotClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		console.log("Navigate to Robot triggered");
		if (onNavigate) {
			onNavigate('robot');
		}
	};

	const handleContactClick = (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		console.log("Select Contact triggered:", id);
		if (onSelectContact) {
			onSelectContact(id);
		}
	};

	return (
		<>
			<div className="bg-[#F5F7F9] pt-[calc(1rem+env(safe-area-inset-top))] px-6 border-b border-gray-200 z-50 relative sticky top-0 transition-all duration-300">
				<div className={`flex items-center justify-between transition-all duration-300 ${isExpanded ? 'mb-0' : 'mb-4'}`}>
					<div className="flex flex-col">
						<h1 className="text-2xl font-bold font-heading text-text-main">Trusted People</h1>
					</div>
				</div>

				<div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-40 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
					<div className="flex gap-6 items-center overflow-x-auto pb-4 no-scrollbar">

						{/* Robot Avatar - Always First - Converted to Button for reliability */}
						<button
							type="button"
							className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group bg-transparent border-none p-0"
							onClick={handleRobotClick}
							aria-label="Manage Robot"
						>
							<div className="relative transform transition-transform group-hover:scale-105 pointer-events-none">
								<div
									className="w-16 h-16 rounded-full border-2 border-emerald-100 shadow-sm flex items-center justify-center bg-emerald-50"
								>
									<Bot size={28} className="text-emerald-600" />
								</div>
								<div
									className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center"
								>
									<div className="w-1.5 h-1.5 bg-white rounded-full"></div>
								</div>
							</div>
							<span className="font-bold font-heading text-sm text-text-main pointer-events-none">
								Robot
							</span>
						</button>

						{MOCK_CONTACTS.map((contact) => (
							<button
								key={contact.id}
								type="button"
								className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group bg-transparent border-none p-0"
								onClick={(e) => handleContactClick(e, contact.id)}
							>
								<div className="relative transform transition-transform group-hover:scale-105 pointer-events-none">
									<div
										className={`w-16 h-16 rounded-full border-2 p-0.5 ${contact.isOnline ? 'border-emerald-200' : 'border-gray-100 grayscale'}`}
									>
										<img
											src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.avatarSeed}`}
											className="w-full h-full rounded-full bg-gray-50"
											alt={contact.name}
										/>
									</div>
									{contact.isOnline && (
										<div
											className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white bg-emerald-500"
										></div>
									)}
								</div>
								<span className={`font-bold font-heading text-sm ${contact.isOnline ? 'text-text-main' : 'text-gray-400'} pointer-events-none`}>
									{contact.name}
								</span>
							</button>
						))}

						<div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
							<button
								onClick={() => setShowInviteModal(true)}
								className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors"
							>
								<Plus size={24} className="text-gray-400 group-hover:text-gray-600" />
							</button>
							<span className="font-bold font-heading text-sm text-gray-400">Invite</span>
						</div>
					</div>
				</div>
			</div>

			{/* Invite Modal */}
			{showInviteModal && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
					<div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative flex flex-col">

						{/* Header */}
						<div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-white relative">
                            <h2 className="text-gray-900 font-heading text-xl font-bold tracking-tight whitespace-nowrap flex-1 text-center pl-8">ADD TO CIRCLE</h2>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform"
                            >
                                <X size={20} className="text-gray-500" strokeWidth={2.5} />
                            </button>
						</div>

						<div className="p-6 bg-white flex-1">
							<p className="text-center text-gray-400 font-bold font-heading uppercase tracking-widest text-xs mb-6">CHOOSE HOW TO INVITE:</p>

							<div className="space-y-3">
								<button
									onClick={() => handleShare('iMessage')}
									className="w-full py-3.5 bg-[#F5F9FF] rounded-xl flex items-center px-5 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
								>
									<div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
										<MessageSquare size={18} fill="white" className="text-white" />
									</div>
									<span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">iMessage</span>
								</button>

								<button
									onClick={() => handleShare('WhatsApp')}
									className="w-full py-3.5 bg-[#F5F9FF] rounded-xl flex items-center px-5 gap-4 border border-blue-100 shadow-sm active:scale-[0.98] transition-all hover:bg-blue-50"
								>
									<div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
										<MessageCircle size={18} fill="white" className="text-white" />
									</div>
									<span className="text-sm font-bold font-heading uppercase text-guardian-blue tracking-wide">WhatsApp</span>
								</button>

                                <button
									onClick={() => handleShare('Copy Link')}
									className="w-full py-3.5 bg-gray-50 rounded-xl flex items-center px-5 gap-4 border border-gray-200 shadow-sm active:scale-[0.98] transition-all hover:bg-gray-100"
								>
									<div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
										<Plus size={18} className="text-white" />
									</div>
									<span className="text-sm font-bold font-heading uppercase text-gray-900 tracking-wide">Copy Link</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
