import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.preloadSounds();
  }

  private async preloadSounds() {
    await this.loadSound('pen-write', this.generatePenSound());
    await this.loadSound('paper-crumple', this.generatePaperCrumpleSound());
    await this.loadSound('page-turn', this.generatePageTurnSound());
  }

  private generatePenSound(): AudioBuffer {
    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      // صوت قلم واقعي
      data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-4 * t) *
                Math.sin(2 * Math.PI * 120 * t) * 0.3;
    }

    return buffer;
  }

  private generatePaperCrumpleSound(): AudioBuffer {
    const duration = 1.5;
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      // صوت تكرميش ورق
      data[i] = (Math.random() - 0.5) * 0.4 * Math.exp(-2 * t) +
                Math.sin(2 * Math.PI * 200 * t) * 0.2 * Math.exp(-3 * t);
    }

    return buffer;
  }

private generatePageTurnSound(): AudioBuffer {
  const duration = 0.8;
  const sampleRate = this.audioContext.sampleRate; // ✅ التصحيح هنا
  const frameCount = duration * sampleRate;
  const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    // صوت تقليب صفحة
    data[i] = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-6 * t) * 0.5 +
              Math.sin(2 * Math.PI * 600 * t) * Math.exp(-8 * t) * 0.3;
  }

  return buffer;
}


  private async loadSound(name: string, buffer: AudioBuffer) {
    this.sounds.set(name, buffer);
  }

  playSound(name: string, volume: number = 0.7) {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const buffer = this.sounds.get(name);
    if (buffer) {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    }
  }
}
