// Web Audio API engine for loud stadium alarm and sound alerts
// Zero external dependencies - works 100% offline and on all modern mobile & desktop browsers.

class AmericanaAudioEngine {
  private ctx: AudioContext | null = null;
  private alarmInterval: number | null = null;
  private isAlarmPlaying = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pre-unlock audio on user tap
  public unlockAudio(): void {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  // Plays a single loud stadium air horn blast
  private playHornBlast(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.2;

      // Master gain with compression
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.gain.linearRampToValueAtTime(0.9, now + 0.05);
      masterGain.gain.setValueAtTime(0.9, now + duration - 0.1);
      masterGain.gain.linearRampToValueAtTime(0.001, now + duration);

      // Waveshaper distortion for raw "stadium air horn" crunch
      const waveShaper = ctx.createWaveShaper();
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      const k = 20;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      waveShaper.curve = curve;
      waveShaper.oversample = '4x';

      // 4 harmonic oscillators typical of a dual-trumpet sports air horn
      const freqs = [233.08, 293.66, 349.23, 466.16]; // Bb3, D4, F4, Bb4 chord
      const types: OscillatorType[] = ['sawtooth', 'sawtooth', 'square', 'sawtooth'];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = types[idx];
        osc.frequency.setValueAtTime(freq, now);
        // Slight pitch drop like a physical pressurized horn blowing
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + duration);

        oscGain.gain.setValueAtTime(0.35, now);

        osc.connect(oscGain);
        oscGain.connect(waveShaper);
        osc.start(now);
        osc.stop(now + duration);
      });

      waveShaper.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Trigger phone vibration if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([400, 150, 400, 150, 600]);
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Starts looping the loud alarm until manually stopped
  public startLoudAlarm(onPulse?: () => void): void {
    if (this.isAlarmPlaying) return;
    this.unlockAudio();
    this.isAlarmPlaying = true;

    // Play first blast immediately
    this.playHornBlast();
    if (onPulse) onPulse();

    // Repeat blast every 1.6s
    this.alarmInterval = window.setInterval(() => {
      if (!this.isAlarmPlaying) return;
      this.playHornBlast();
      if (onPulse) onPulse();
    }, 1600);
  }

  // Stops any running alarm loop
  public stopAlarm(): void {
    this.isAlarmPlaying = false;
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  // Short sports referee whistle for starting matches
  public playWhistle(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.6;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const tremolo = ctx.createOscillator();
      const tremoloGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.exponentialRampToValueAtTime(2850, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(2500, now + duration);

      // Fluttering tremolo (whistle pea effect)
      tremolo.frequency.setValueAtTime(32, now);
      tremoloGain.gain.setValueAtTime(150, now);
      tremolo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gain.gain.setValueAtTime(0.5, now + duration - 0.08);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      tremolo.start(now);
      osc.start(now);
      tremolo.stop(now + duration);
      osc.stop(now + duration);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(200);
      }
    } catch (e) {
      console.warn('Whistle audio error:', e);
    }
  }

  // Countdown tick (last 5 seconds)
  public playCountdownTick(isFinal: boolean = false): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isFinal ? 'square' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(isFinal ? 150 : 50);
      }
    } catch {
      // ignore
    }
  }
}

export const americanaAudio = new AmericanaAudioEngine();
