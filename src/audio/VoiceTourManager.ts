import { CHARMINAR_HOTSPOTS } from '../monument/Hotspots.ts';
import { HotspotData } from '../types.ts';

export type TourState = 'idle' | 'playing' | 'paused';

export class VoiceTourManager {
  private currentStopIndex = 0;
  private state: TourState = 'idle';
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public onStateChange?: (state: TourState, currentStop: HotspotData, index: number, total: number) => void;
  public onTextChunk?: (text: string) => void;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  }

  public ensureAudioResumed(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Synthesizes an elegant musical chime when changing stops or clicking hotspots
   */
  public playChime(type: 'select' | 'tourStart' | 'finish' = 'select'): void {
    this.ensureAudioResumed();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'select') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'tourStart') {
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
      }
    } catch (e) {
      console.warn('Failed to synthesize chime:', e);
    }
  }

  public startTour(fromIndex: number = 0): void {
    this.ensureAudioResumed();
    this.playChime('tourStart');
    this.goToStop(fromIndex);
  }

  public togglePlayPause(): void {
    this.ensureAudioResumed();
    if (this.state === 'playing') {
      this.pause();
    } else if (this.state === 'paused') {
      this.resume();
    } else {
      this.startTour(this.currentStopIndex);
    }
  }

  public pause(): void {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.state = 'paused';
      this.notifyChange();
    }
  }

  public resume(): void {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.state = 'playing';
      this.notifyChange();
    } else {
      this.speakCurrentStop();
    }
  }

  public stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.state = 'idle';
    this.notifyChange();
  }

  public nextStop(): void {
    const next = (this.currentStopIndex + 1) % CHARMINAR_HOTSPOTS.length;
    this.goToStop(next);
  }

  public prevStop(): void {
    const prev = (this.currentStopIndex - 1 + CHARMINAR_HOTSPOTS.length) % CHARMINAR_HOTSPOTS.length;
    this.goToStop(prev);
  }

  public goToStop(index: number): void {
    this.ensureAudioResumed();
    if (index < 0 || index >= CHARMINAR_HOTSPOTS.length) return;
    this.currentStopIndex = index;
    this.playChime('select');
    this.speakCurrentStop();
  }

  public goToHotspotId(id: string): void {
    const index = CHARMINAR_HOTSPOTS.findIndex((h) => h.id === id);
    if (index !== -1) {
      this.goToStop(index);
    }
  }

  private speakCurrentStop(): void {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      this.state = 'playing';
      this.notifyChange();
      return;
    }

    window.speechSynthesis.cancel();

    const stop = CHARMINAR_HOTSPOTS[this.currentStopIndex];
    const utterance = new SpeechSynthesisUtterance(stop.audioNarration);
    this.currentUtterance = utterance;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.name.includes('Natural')) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.96; // slightly measured, dignified museum guide tempo
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.state = 'playing';
      this.notifyChange();
    };

    utterance.onend = () => {
      this.state = 'idle';
      this.notifyChange();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.state = 'idle';
      this.notifyChange();
    };

    window.speechSynthesis.speak(utterance);
    this.state = 'playing';
    this.notifyChange();
  }

  public getCurrentStop(): HotspotData {
    return CHARMINAR_HOTSPOTS[this.currentStopIndex];
  }

  public getCurrentIndex(): number {
    return this.currentStopIndex;
  }

  public getState(): TourState {
    return this.state;
  }

  private notifyChange(): void {
    const stop = this.getCurrentStop();
    if (this.onStateChange) {
      this.onStateChange(this.state, stop, this.currentStopIndex, CHARMINAR_HOTSPOTS.length);
    }
  }

  public dispose(): void {
    this.stop();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }
}
