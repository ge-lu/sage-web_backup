import { IpuMobile, Mobile } from "@/ipuframe";
console.log(Mobile, IpuMobile, 'IpuMobile');
const isApp = IpuMobile.isApp();

class WebTTS {
  private static instance: WebTTS;

  private constructor() { }

  public static getInstance(): WebTTS {
    if (!WebTTS.instance) {
      WebTTS.instance = new WebTTS();
    }
    return WebTTS.instance;
  }

  public speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onStart?: () => void;
    onError?: (e: any) => void;
  }) {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.90;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options?.onStart) {
      utterance.onstart = options.onStart;
    }
    if (options?.onError) {
      utterance.onerror = options.onError;
    }

    window.speechSynthesis.speak(utterance);
  }

  public cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

class AppTTS {
  speak(text: string, options: { onEnd?: () => void, onError?: (e: any) => void } = {}) {
    const { onEnd, onError } = options;
    // Start
    try {
      IpuMobile.startTts(text, onEnd, onError);
    } catch (e) {
      console.error("App ASR Start Error", e);
    }
  }
  cancel() {
    try {
      IpuMobile.stopTts();
    } catch (e) {
      console.error("App ASR Stop Error", e);
    }
  }
  isSupported() {
    return true;
  }
}
const appTTS = isApp ? new AppTTS() : WebTTS.getInstance();

export default appTTS;
