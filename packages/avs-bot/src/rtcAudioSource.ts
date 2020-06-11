import path from 'path';
import fs from 'fs';
const wrtc = require('wrtc');

const AUDIO_FILE_PATH = path.join(__dirname, 'sound.wav');
const audioFile = fs.readFileSync(AUDIO_FILE_PATH);

export class RTCAudioSourceWrapper extends wrtc.nonstandard.RTCAudioSource {
  cache: Buffer;
  interval?: NodeJS.Timeout;

  constructor() {
    super();
    this.cache = Buffer.alloc(0);
  }

  createTrack() {
    const track = super.createTrack();
    this.cache = audioFile;

    this.interval = setInterval(this.start, 10);
    return track;
  }

  start = () => {
    const buffer = this.cache.slice(0, 960);
    this.cache = this.cache.slice(960);
    const samples = new Int16Array(new Uint8Array(buffer).buffer);
    this.onData({
      bitsPerSample: 16,
      channelCount: 1,
      numberOfFrames: 48000 / 100,
      sampleRate: 48000,
      samples,
      type: 'data',
    });

    if (this.cache.length < 960) {
      this.cache = audioFile;
    }
  };

  stop() {
    if (!this.interval) {
      return;
    }
    clearInterval(this.interval);
  }
}
