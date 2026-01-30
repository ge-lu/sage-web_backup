import React from 'react';

interface GuardianButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary'; // Prepare for future variants if needed, default to primary
}

const GuardianButton: React.FC<GuardianButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  return (
    <button
      className={`w-full h-16 bg-guardian-blue rounded-2xl text-white font-bold text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center relative overflow-hidden group font-heading ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export default GuardianButton;
