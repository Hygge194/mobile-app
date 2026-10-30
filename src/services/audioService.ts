import * as Speech from 'expo-speech';
import {
  createAudioPlayer,
  AudioPlayer,
  requestRecordingPermissionsAsync,
  AudioModule,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import { Platform } from 'react-native';
import { CardItemData } from '../types';

class AudioService {
  private currentPlayer: AudioPlayer | null = null;
  private currentWebAudio: any = null;
  private currentRecorder: any = null;
  private webMediaRecorder: any = null;
  private webAudioChunks: any[] = [];
  private webMediaStream: any = null;
  private isConfigured = false;

  private async ensureAudioMode() {
    if (this.isConfigured) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      this.isConfigured = true;
    } catch (e) {
      // ignore on platforms where not supported
    }
  }

  // Phát âm thanh của 1 thẻ
  async playCardSound(card: CardItemData, speechRate = 0.9): Promise<void> {
    await this.ensureAudioMode();
    this.stopAll();

    // 1. Nếu thẻ có file ghi âm giọng nói của mẹ / giáo viên
    if (card.audioUri && card.audioType === 'recorded') {
      try {
        if (Platform.OS === 'web' && typeof Audio !== 'undefined') {
          const webAudio = new Audio(card.audioUri);
          this.currentWebAudio = webAudio;
          webAudio.onended = () => {
            if (this.currentWebAudio === webAudio) {
              this.currentWebAudio = null;
            }
          };
          await webAudio.play();
          return;
        }

        const player = createAudioPlayer(card.audioUri);
        this.currentPlayer = player;
        player.play();
        return;
      } catch (err) {
        console.warn('Lỗi khi phát audio ghi âm, fallback sang TTS:', err);
      }
    }

    // 2. Mặc định hoặc fallback: phát bằng Text-To-Speech tiếng Việt tự nhiên
    try {
      Speech.speak(card.label, {
        language: 'vi-VN',
        rate: speechRate,
        pitch: 1.0,
      });
    } catch (err) {
      console.warn('Lỗi Speech.speak:', err);
    }
  }

  // Đọc chuỗi văn bản tự do bằng giọng nói tiếng Việt
  async speakText(text: string, speechRate = 0.9): Promise<void> {
    if (!text || !text.trim()) return;
    this.stopAll();
    try {
      Speech.speak(text.trim(), {
        language: 'vi-VN',
        rate: speechRate,
        pitch: 1.0,
      });
    } catch (err) {
      console.warn('Lỗi khi đọc text:', err);
    }
  }

  // Đọc toàn bộ câu trên thanh Sentence Strip nối tiếp tự nhiên
  async speakSentence(cards: CardItemData[], speechRate = 0.9): Promise<void> {
    if (cards.length === 0) return;
    this.stopAll();

    // Nếu câu chỉ có 1 thẻ duy nhất và thẻ đó có giọng mẹ thu âm -> ưu tiên phát giọng mẹ
    if (cards.length === 1 && cards[0].audioUri && cards[0].audioType === 'recorded') {
      await this.playCardSound(cards[0], speechRate);
      return;
    }

    const sentenceText = cards.map((c) => c.label).join(' ');

    // Đọc liền mạch câu tiếng Việt
    try {
      Speech.speak(sentenceText, {
        language: 'vi-VN',
        rate: speechRate,
        pitch: 1.0,
      });
    } catch (err) {
      console.warn('Lỗi khi đọc câu:', err);
    }
  }

  // Đọc câu có tích hợp Kích thích Bật âm (Speech Induction & Expectant Pause)
  async speakSentenceWithInduction(
    cards: CardItemData[],
    speechRate = 0.9,
    delaySeconds = 3,
    phonemicCue = false,
    onPauseStart?: () => void,
    onPauseEnd?: () => void
  ): Promise<void> {
    if (cards.length === 0) return;
    this.stopAll();

    // Nếu chỉ có 1 thẻ hoặc thời gian chờ = 0, đọc bình thường
    if (cards.length === 1 || delaySeconds <= 0) {
      await this.speakSentence(cards, speechRate);
      return;
    }

    // Tách câu thành phần mồi (preamble) và từ đích trọng tâm (target word)
    const preambleCards = cards.slice(0, cards.length - 1);
    const targetCard = cards[cards.length - 1];

    const preambleText = preambleCards.map((c) => c.label).join(' ');
    let targetText = targetCard.label;

    if (phonemicCue) {
      const firstLetter = targetText.charAt(0).toLowerCase();
      targetText = `${firstLetter}... ${firstLetter}... ${targetText}`;
    }

    try {
      // 1. Đọc phần mồi câu
      Speech.speak(preambleText + '...', {
        language: 'vi-VN',
        rate: speechRate,
        pitch: 1.0,
        onDone: () => {
          // 2. Kích hoạt khoảng lặng chờ đợi (Expectant Pause) cho trẻ bật âm
          if (onPauseStart) onPauseStart();

          setTimeout(() => {
            if (onPauseEnd) onPauseEnd();
            // 3. Đọc từ then chốt sau khoảng lặng: ưu tiên phát giọng mẹ nếu có
            if (targetCard.audioUri && targetCard.audioType === 'recorded') {
              this.playCardSound(targetCard, speechRate);
            } else {
              Speech.speak(targetText, {
                language: 'vi-VN',
                rate: speechRate,
                pitch: 1.05,
              });
            }
          }, delaySeconds * 1000);
        },
        onError: () => {
          if (onPauseEnd) onPauseEnd();
        },
      });
    } catch (e) {
      await this.speakSentence(cards, speechRate);
    }
  }

  // Khen thưởng vui tươi khi trẻ trả lời đúng hoặc bật âm thành công
  playPraise(customText?: string): void {
    try {
      this.stopAll();
      Speech.speak(customText || 'Hoan hô! Bé giỏi quá!', {
        language: 'vi-VN',
        rate: 1.0,
        pitch: 1.2,
      });
    } catch (e) {
      // ignore
    }
  }

  // Khích lệ dịu dàng theo triết lý Không phán xét lỗi (Errorless Learning)
  // Tuyệt đối KHÔNG phát giọng nói tiêu cực "Chưa đúng rồi" lặp đi lặp lại gây ức chế/khó chịu cho trẻ
  playGentleRetry(): void {
    // Để môi trường yên tĩnh, phản hồi lỗi chỉ hiển thị trực quan (làm mờ thẻ/rung nhẹ), không phát âm thanh quấy rầy
  }

  // Đọc lời đố vui hoặc hướng dẫn
  playPrompt(text: string): void {
    try {
      this.stopAll();
      Speech.speak(text, {
        language: 'vi-VN',
        rate: 0.95,
        pitch: 1.05,
      });
    } catch (e) {
      // ignore
    }
  }

  private synthCtx: any = null;

  // Phát tiếng nổ "Pop" nhỏ, giòn tan, êm dịu khi trẻ chạm bóng Pop-It
  playPopSound(pitchMultiplier = 1.0): void {
    try {
      // 1. Thử phát bằng Web Audio API (Cực kỳ nhạy bén, 0ms trễ, tự nhiên)
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          if (!this.synthCtx || this.synthCtx.state === 'closed') {
            this.synthCtx = new AudioContextClass();
          }
          if (this.synthCtx.state === 'suspended') {
            this.synthCtx.resume();
          }

          const ctx = this.synthCtx;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Tần số nổ giòn êm dịu: bắt đầu từ ~680 - 880 Hz trượt nhanh xuống ~170 Hz
          const baseFreq = (720 + (Math.random() * 160 - 80)) * pitchMultiplier;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(170, now + 0.048);

          // Biên độ êm dịu (0.3), suy giảm nhanh trong 55ms để không chói tai trẻ tự kỷ
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.06);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Chế độ dự phòng khi không có Web Audio
    try {
      const wavBase64 = this.generateBubblePopWavBase64(750 * pitchMultiplier, 0.055);
      const player = createAudioPlayer(wavBase64);
      player.play();
    } catch (err) {
      // ignore
    }
  }

  // Hàm sinh chuỗi âm thanh sóng hình sin PCM WAV siêu nhẹ (<3KB)
  private generateBubblePopWavBase64(startFreq = 750, duration = 0.055): string {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (v: DataView, offset: number, s: string) => {
      for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i));
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const progress = t / duration;
      const freq = startFreq * Math.pow(170 / startFreq, progress);
      phase += (2 * Math.PI * freq) / sampleRate;
      const amp = 0.3 * Math.pow(0.01, progress);
      const sample = Math.max(-1, Math.min(1, Math.sin(phase) * amp));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + (typeof btoa !== 'undefined' ? btoa(binary) : '');
  }

  // Dừng mọi âm thanh đang phát
  stopAll() {
    try {
      Speech.stop();
      if (this.currentWebAudio) {
        this.currentWebAudio.pause();
        this.currentWebAudio.currentTime = 0;
        this.currentWebAudio = null;
      }
      if (this.currentPlayer) {
        this.currentPlayer.pause();
        this.currentPlayer.remove();
        this.currentPlayer = null;
      }
    } catch (e) {
      // ignore
    }
  }

  // --- HỆ THỐNG GHI ÂM ĐA NỀN TẢNG (DUAL-ENGINE RECORDING PIPELINE) ---

  // 1. Ghi âm Web HTML5 MediaRecorder (Hoạt động ổn định trên Chrome, Safari, Edge, Firefox)
  private async startRecordingWeb(): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        console.warn('Trình duyệt không hỗ trợ Web Audio getUserMedia');
        return false;
      }

      // Đảm bảo tắt mọi stream cũ nếu còn sót lại
      if (this.webMediaStream) {
        this.webMediaStream.getTracks().forEach((track: any) => track.stop());
        this.webMediaStream = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.webMediaStream = stream;
      this.webAudioChunks = [];

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          this.webAudioChunks.push(event.data);
        }
      };

      recorder.start(100);
      this.webMediaRecorder = recorder;
      return true;
    } catch (err) {
      console.error('Không thể bắt đầu ghi âm trên Web:', err);
      if (this.webMediaStream) {
        this.webMediaStream.getTracks().forEach((t: any) => t.stop());
        this.webMediaStream = null;
      }
      return false;
    }
  }

  private async stopRecordingWeb(): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        if (!this.webMediaRecorder) {
          if (this.webMediaStream) {
            this.webMediaStream.getTracks().forEach((track: any) => track.stop());
            this.webMediaStream = null;
          }
          resolve(null);
          return;
        }

        const recorder = this.webMediaRecorder;
        const stream = this.webMediaStream;

        recorder.onstop = () => {
          try {
            const mimeType = recorder.mimeType || 'audio/webm';
            const blob = new Blob(this.webAudioChunks, { type: mimeType });

            // Tắt microphone ngay lập tức để biểu tượng đỏ của trình duyệt biến mất
            if (stream) {
              stream.getTracks().forEach((track: any) => track.stop());
            }
            this.webMediaRecorder = null;
            this.webMediaStream = null;
            this.webAudioChunks = [];

            if (blob.size === 0) {
              resolve(null);
              return;
            }

            // Chuyển blob thành Base64 Data URI để lưu trữ vĩnh viễn trong SQLite (không bị mất khi tải lại trang)
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                resolve(URL.createObjectURL(blob));
              }
            };
            reader.onerror = () => {
              resolve(URL.createObjectURL(blob));
            };
            reader.readAsDataURL(blob);
          } catch (e) {
            console.error('Lỗi đóng gói file ghi âm web:', e);
            resolve(null);
          }
        };

        if (recorder.state === 'recording') {
          recorder.stop();
        } else {
          if (stream) {
            stream.getTracks().forEach((track: any) => track.stop());
          }
          this.webMediaRecorder = null;
          this.webMediaStream = null;
          resolve(null);
        }
      } catch (err) {
        console.error('Lỗi khi dừng MediaRecorder web:', err);
        if (this.webMediaStream) {
          this.webMediaStream.getTracks().forEach((track: any) => track.stop());
          this.webMediaStream = null;
        }
        this.webMediaRecorder = null;
        resolve(null);
      }
    });
  }

  // 2. Ghi âm Native Android / iOS bằng expo-audio
  private async startRecordingNative(): Promise<boolean> {
    await this.ensureAudioMode();
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        return false;
      }

      const AudioRecorderClass = (AudioModule as any)?.AudioRecorder;
      if (AudioRecorderClass) {
        const recorder = new AudioRecorderClass(RecordingPresets.HIGH_QUALITY);
        await recorder.prepareToRecordAsync();
        recorder.record();
        this.currentRecorder = recorder;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Không thể bắt đầu ghi âm native:', err);
      return false;
    }
  }

  private async stopRecordingNative(): Promise<string | null> {
    try {
      if (!this.currentRecorder) return null;
      await this.currentRecorder.stop();
      const uri = this.currentRecorder.uri;
      this.currentRecorder = null;
      return uri;
    } catch (err) {
      console.error('Lỗi khi dừng ghi âm native:', err);
      return null;
    }
  }

  // Phương thức hợp nhất: Tự động điều phối theo nền tảng chạy
  async startRecording(): Promise<boolean> {
    if (
      Platform.OS === 'web' ||
      (typeof window !== 'undefined' && !(AudioModule as any)?.AudioRecorder)
    ) {
      return this.startRecordingWeb();
    }
    return this.startRecordingNative();
  }

  async stopRecording(): Promise<string | null> {
    if (this.webMediaRecorder) {
      return this.stopRecordingWeb();
    }
    return this.stopRecordingNative();
  }

  // Kiểm tra trạng thái đang ghi âm
  isRecordingActive(): boolean {
    if (this.webMediaRecorder) {
      return this.webMediaRecorder.state === 'recording';
    }
    return this.currentRecorder != null;
  }
}

export const audioService = new AudioService();
