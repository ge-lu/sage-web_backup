
export const checkPaywallTrigger = (type: 'voice' | 'photo'): boolean => {
  const VOICE_LIMIT = 5;
  const PHOTO_LIMIT = 3;

  if (type === 'voice') {
    let count = parseInt(localStorage.getItem('aura_voice_trigger_count') || '0');
    count++;
    localStorage.setItem('aura_voice_trigger_count', count.toString());
    if (count >= VOICE_LIMIT) {
       // Reset or keep showing? "After using 5 times... show".
       // Let's show it once at 5.
       if (count === VOICE_LIMIT) return true;
       // Or every 5 times? Prompt is vague. "After using 5 times... show".
       // I'll assume once.
       return true; 
    }
  }

  if (type === 'photo') {
    let count = parseInt(localStorage.getItem('aura_photo_trigger_count') || '0');
    count++;
    localStorage.setItem('aura_photo_trigger_count', count.toString());
    if (count >= PHOTO_LIMIT) {
        if (count === PHOTO_LIMIT) return true;
        return true;
    }
  }

  return false;
};
