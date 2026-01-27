import React, { useState } from 'react';
import { ArrowLeft, Check, Mic, Sparkles } from 'lucide-react';
import { FamilyMember } from '../types';

const FAMILY_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Grandson Leo', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { id: '2', name: 'Daughter Sarah', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '3', name: 'Michael', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { id: '4', name: 'Emily', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
  { id: '5', name: 'Grandpa Joe', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joe' },
  { id: '6', name: 'Aunt Mary', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary' },
];

interface CreateGroupWizardProps {
  onCancel: () => void;
  onFinish: (name: string, members: string[]) => void;
}

const CreateGroupWizard: React.FC<CreateGroupWizardProps> = ({ onCancel, onFinish }) => {
  const [step, setStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['1', '3']);
  const [roomName, setRoomName] = useState('Nancy & Bob');

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const progress = (step / 3) * 100;

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col font-['Plus_Jakarta_Sans'] select-none">
      {/* Header */}
      <div className="px-6 py-8 flex items-center justify-between border-b border-gray-100">
        <button onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
          <ArrowLeft size={32} className="text-black" />
        </button>
        <span className="text-2xl font-bold text-black">Step {step} of 3</span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 flex flex-col gap-2">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-gray-900">Creating Group</span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* STEP 1: PICK FAMILY */}
      {step === 1 && (
        <div className="flex-1 flex flex-col p-8 overflow-y-auto no-scrollbar">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-4xl font-black text-black">Pick the Family</h2>
            <p className="text-xl text-gray-500 font-medium">Tap the people you want to add.</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {FAMILY_MEMBERS.map(member => {
              const isSelected = selectedMembers.includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className="flex flex-col items-center gap-4 group"
                >
                  <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-xl ring-4 ring-white group-active:scale-95 transition-all">
                    <img src={member.avatarUrl} className="w-full h-full object-cover bg-gray-100" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#13EC13]/60 flex items-center justify-center animate-in fade-in zoom-in duration-200">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Check size={32} strokeWidth={4} className="text-[#13EC13]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-2xl font-black text-black">{member.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-10">
            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#1152D4] text-white py-8 rounded-3xl text-2xl font-black shadow-xl active:scale-95 transition-all uppercase"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: NAME THE ROOM */}
      {step === 2 && (
        <div className="flex-1 flex flex-col p-8 overflow-y-auto no-scrollbar items-center">
          <div className="text-center mb-12 mt-4 space-y-8 w-full max-w-xs flex flex-col items-center">
            <h2 className="text-5xl font-black text-[#003366] leading-tight">
              What's this group's name?
            </h2>

            <div className="relative w-full">
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-white border-2 border-blue-200 p-8 rounded-[2.5rem] text-3xl font-black text-[#003366] text-center shadow-lg outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button className="bg-[#F0F4F8] text-[#003366] px-10 py-6 rounded-full flex items-center gap-3 font-bold shadow-md active:scale-95 transition-all">
              <Mic size={28} />
              <span className="text-2xl">Say Name</span>
            </button>

            <div className="bg-[#E8F5E8] text-[#13EC13] px-6 py-3 rounded-full inline-flex items-center gap-2 font-black text-sm uppercase shadow-sm">
              <Sparkles size={18} />
              AI SUGGESTED
            </div>
          </div>

          <div className="mt-auto w-full pt-8 pb-4">
            <button
              onClick={() => onFinish(roomName, selectedMembers)}
              className="w-full bg-[#001A33] text-white py-8 rounded-3xl text-3xl font-black shadow-xl active:scale-95 transition-all uppercase"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroupWizard;