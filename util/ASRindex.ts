
import { IpuMobile } from "@/ipuframe";

const isApp = IpuMobile.isApp();

export interface ASRStartOptions {
  onResult?: (text: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  lang?: string;
  continuous?: boolean;
}

class WebASR {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.interimResults = true; // Support partial results
      }
    }
  }

  start(options: ASRStartOptions = {}) {
    if (!this.recognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    // Reset configuration
    this.recognition.lang = options.lang || 'en-US';
    this.recognition.continuous = options.continuous ?? false;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // For continuous, we might have multiple results. 
      // We usually want the latest one or the accumulated one depending on usage.
      // But to keep interface simple:
      // return the text of the *latest* result that changed.

      // Actually, for simplicity in standard usage:
      const latestResult = event.results[event.results.length - 1];
      const text = latestResult[0].transcript;
      const isFinal = latestResult.isFinal;

      if (options.onResult) {
        options.onResult(text, isFinal);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // It stopped but we marked it as listening? 
        // Maybe naturally stopped (silence) or network error
      }
      this.isListening = false;

      if (options.onEnd) options.onEnd();
    };

    this.recognition.onerror = (event: any) => {
      // this.isListening = false; 
      if (options.onError) options.onError(event);
    };

    try {
      // Stop if already running to avoid errors
      if (this.isListening) {
        this.recognition.stop();
      }
      this.recognition.start();
    } catch (e) {
      console.error("ASR Start Error", e);
      if (options.onError) options.onError(e);
    }
  }

  stop() {
    if (this.recognition) this.recognition.stop();
    this.isListening = false;
  }
}

class AppASR {
  start(options: ASRStartOptions = {}) {
    // Start
    try {
      IpuMobile.startAsr((res: any) => {
        // const text = typeof res === 'string' ? res : JSON.stringify(res);
        if (options.onResult) options.onResult(res, true);
      }, (err: any) => {
        if (options.onError) options.onError(err);
      });
    } catch (e) {
      console.error("App ASR Start Error", e);
      if (options.onError) options.onError(e);
    }
  }

  stop(options: ASRStartOptions = {}) {
    try {
      IpuMobile.stopAsr((res: any) => {
        // const text = typeof res === 'string' ? res : JSON.stringify(res);
        if (options.onResult) options.onResult(res, true);
      }, (err: any) => {
        if (options.onError) options.onError(err);
      });
    } catch (e) {
      console.error("App ASR Stop Error", e);
    }
  }
}

const asr = isApp ? new AppASR() : new WebASR();
export default asr;
