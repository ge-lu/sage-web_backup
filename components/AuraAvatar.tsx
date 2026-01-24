
import React, { useEffect, useState } from 'react';
import { AuraEmotion } from '../types';

interface AuraAvatarProps {
  emotion: AuraEmotion;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
}

const AuraAvatar: React.FC<AuraAvatarProps> = ({ emotion, size = 'md' }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking Logic for Neutral State
  useEffect(() => {
    if (emotion !== 'NEUTRAL' && emotion !== 'LISTENING') {
      setIsBlinking(false);
      return;
    }
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      const nextBlink = Math.random() * 3000 + 2000;
      return setTimeout(blinkLoop, nextBlink);
    };
    
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, [emotion]);

  // Size Resolution
  let width = 60; // default md
  if (size === 'sm') width = 40;
  if (size === 'lg') width = 120;
  if (size === 'xl') width = 200;
  if (typeof size === 'number') width = size;
  const height = width * 0.85;

  // Colors
  const eyeColor = '#1A5F7A'; // Primary Blue
  const dangerColor = '#EF4444';
  const warningColor = '#F59E0B';

  let currentColor = eyeColor;
  if (['ANGRY', 'HATE', 'ANNOYANCE', 'DISGUST'].includes(emotion)) currentColor = dangerColor;
  if (['FEAR', 'UNEASE'].includes(emotion)) currentColor = '#8B5CF6'; // Violet
  if (['SURPRISE', 'CONFUSION'].includes(emotion)) currentColor = warningColor;

  // Eye Rendering Helper
  const Eye = ({ isLeft }: { isLeft: boolean }) => {
    const commonClasses = "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] absolute";
    
    // Default Style (Neutral Pill)
    const pillStyle: React.CSSProperties = {
        width: '30%',
        height: '60%',
        backgroundColor: currentColor,
        borderRadius: '999px',
        top: '20%',
        left: isLeft ? '15%' : 'auto',
        right: isLeft ? 'auto' : '15%',
        boxShadow: `0 0 10px ${currentColor}40`
    };

    if (isBlinking) {
        return (
            <div 
                className={commonClasses}
                style={{
                    ...pillStyle,
                    height: '10%',
                    top: '45%'
                }}
            />
        );
    }

    // Emotion: HAPPY (Cheek squeeze / Arch)
    if (['HAPPY', 'SURPRISED_JOY', 'SATISFACTION', 'CONTENT'].includes(emotion)) {
        return (
            <div 
                className={commonClasses}
                style={{
                    width: '35%',
                    height: '35%',
                    top: '35%',
                    left: isLeft ? '10%' : 'auto',
                    right: isLeft ? 'auto' : '10%',
                    borderTop: `6px solid ${currentColor}`,
                    borderRadius: '50% 50% 0 0',
                    boxShadow: `0 -2px 8px ${currentColor}20` // Subtle glow up
                }}
            />
        );
    }

    // Emotion: SAD (Tilted outwards)
    if (['SAD', 'MELANCHOLY', 'REGRET', 'PAIN'].includes(emotion)) {
        return (
            <div 
                className={commonClasses}
                style={{
                    ...pillStyle,
                    height: '50%',
                    transform: isLeft ? 'rotate(-15deg)' : 'rotate(15deg)',
                    top: '30%'
                }}
            />
        );
    }

    // Emotion: ANGRY (Tilted inwards, flattened top)
    if (['ANGRY', 'HATE', 'ANNOYANCE', 'CONTEMPT'].includes(emotion)) {
        return (
            <div 
                className={commonClasses}
                style={{
                    ...pillStyle,
                    height: '50%',
                    borderRadius: '4px 4px 50px 50px', // Flat top
                    transform: isLeft ? 'rotate(15deg)' : 'rotate(-15deg)',
                    top: '30%'
                }}
            />
        );
    }

    // Emotion: SURPRISE (Wide Circles)
    if (['SURPRISE', 'MILD_SURPRISE', 'CONFUSION'].includes(emotion)) {
         return (
            <div 
                className={commonClasses}
                style={{
                    width: '35%',
                    height: '50%', // More circular
                    backgroundColor: currentColor,
                    borderRadius: '50%',
                    top: '25%',
                    left: isLeft ? '12%' : 'auto',
                    right: isLeft ? 'auto' : '12%',
                    transform: 'scale(1.1)'
                }}
            />
        );
    }

    // Emotion: THINKING (Look Up/Side)
    if (['THINKING', 'CONTEMPLATION', 'EXPECTATION'].includes(emotion)) {
         return (
            <div 
                className={commonClasses}
                style={{
                    ...pillStyle,
                    height: '50%',
                    top: '15%', // Look up
                    transform: isLeft ? 'translate(-2px, 0)' : 'translate(-2px, 0)' // Look left
                }}
            />
        );
    }
    
    // Emotion: LISTENING (One eye blink/wink or slight asymmetry)
    if (['LISTENING'].includes(emotion)) {
        // Simple scale pulse
         return (
            <div 
                className={`${commonClasses} animate-pulse`}
                style={{
                    ...pillStyle,
                    height: '65%' // Slightly wider open
                }}
            />
        );
    }

    // Default Neutral
    return <div className={commonClasses} style={pillStyle} />;
  };

  return (
    <div 
        className="bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(26,95,122,0.1)] border border-[#E6E2D8] relative overflow-hidden transition-all duration-300"
        style={{ width, height }}
    >
        {/* Screen Reflection/Gloss */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-white/80 to-transparent rounded-tr-[2.5rem] opacity-50 z-10 pointer-events-none"></div>
        
        {/* Face Container */}
        <div className="w-full h-full relative">
            <Eye isLeft={true} />
            <Eye isLeft={false} />
        </div>
    </div>
  );
};

export default AuraAvatar;
