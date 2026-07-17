export interface CoachScriptLine {
  fen: string;
  text: string;
  audioUrl: string | null;
}

export interface AudioProvider {
  speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void>;
  stop(): void;
}

export class BrowserTTSProvider implements AudioProvider {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    const voices = this.synth.getVoices();
    // Try to find a good authoritative voice
    this.voice = voices.find(v => v.name.includes('Google UK English Male')) || 
                 voices.find(v => v.lang === 'en-GB') || 
                 voices[0] || null;
  }

  async speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.synth.cancel(); // Stop any currently playing audio

      if (!this.voice && this.synth.getVoices().length === 0) {
        // Wait for voices to load if they haven't yet
        this.synth.onvoiceschanged = () => {
          this.loadVoices();
          this.doSpeak(text, resolve, reject, onStart, onEnd);
        };
      } else {
        this.doSpeak(text, resolve, reject, onStart, onEnd);
      }
    });
  }

  private doSpeak(
    text: string, 
    resolve: () => void, 
    reject: (e: any) => void,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 0.9; // Slightly slower for dramatic "coach" effect
    utterance.pitch = 0.8;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
      resolve();
    };

    utterance.onerror = (e) => {
      console.error('TTS Error', e);
      if (onEnd) onEnd();
      resolve(); // Resolve anyway so UI doesn't hang
    };

    this.synth.speak(utterance);
  }

  stop(): void {
    this.synth.cancel();
  }
}
