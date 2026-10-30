type OverloadListener = (decibels: number) => void;

class NoiseMonitorService {
  private isMonitoring = false;
  private audioContext: any = null;
  private mediaStream: any = null;
  private intervalId: any = null;
  private lastAlertTime = 0;
  private listeners: OverloadListener[] = [];
  private currentDb = 42;
  private isUsingRealMic = false;

  subscribe(listener: OverloadListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getCurrentDb() {
    return this.currentDb;
  }

  getIsUsingRealMic() {
    return this.isUsingRealMic;
  }

  async startMonitoring(thresholdDb = 75) {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // 1. KẾT NỐI MICRO THẬT (Web Audio API - Phân tích theo miền thời gian RMS)
    try {
      if (typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false, // Tắt khử ồn để đo chính xác tạp âm môi trường
            autoGainControl: false,  // Tắt tự động tăng âm để không bóp méo biên độ thực
          },
          video: false,
        });

        this.mediaStream = stream;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          this.audioContext = audioCtx;

          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.3;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const timeData = new Float32Array(analyser.fftSize);
          this.isUsingRealMic = true;

          // Chu kỳ lấy mẫu liên tục mỗi 250ms (4 lần/giây)
          this.intervalId = setInterval(() => {
            if (!this.isMonitoring) return;

            analyser.getFloatTimeDomainData(timeData);

            // 1. Tính toán Năng lượng Sóng âm RMS (Root Mean Square) trên miền thời gian
            let sumSquares = 0;
            for (let i = 0; i < timeData.length; i++) {
              const sample = timeData[i];
              sumSquares += sample * sample;
            }
            const rms = Math.sqrt(sumSquares / timeData.length);

            // 2. Chuyển đổi sang Decibel toàn dải (dBFS - Logarithmic scale)
            let calculatedDb = 35; // Ngưỡng nền yên tĩnh phòng kín
            if (rms > 0.00003) {
              const dbFS = 20 * Math.log10(rms);
              // 3. Hiệu chuẩn dBSPL (Cộng hệ số bù độ nhạy micro tiêu chuẩn ~96 - 98 dB)
              // Ví dụ:
              // - Im lặng (rms ~ 0.0005, dbFS = -66) -> 32 dBSPL
              // - Nói bình thường (rms ~ 0.01, dbFS = -40) -> 58 dBSPL
              // - Tiếng ồn lớn (rms ~ 0.08, dbFS = -22) -> 76 dBSPL (Vượt ngưỡng cảnh báo)
              // - Hét to / Vỗ tay (rms ~ 0.4, dbFS = -8) -> 90 dBSPL
              calculatedDb = Math.round(Math.max(30, Math.min(100, dbFS + 98)));
            }

            // 4. Bộ lọc mượt (Exponential Moving Average) để trị số dao động êm và tự nhiên
            this.currentDb = Math.round(0.35 * calculatedDb + 0.65 * this.currentDb);

            // 5. Kiểm tra nếu vượt ngưỡng an toàn do phụ huynh cài đặt
            if (this.currentDb >= thresholdDb) {
              this.checkAndTriggerAlert(this.currentDb);
            }
          }, 250);

          return;
        }
      }
    } catch (e) {
      console.log('Micro thật chưa được cấp quyền hoặc không khả dụng, sử dụng chế độ nền:', e);
    }

    // 2. Chế độ dự phòng khi không truy cập được Micro phần cứng
    this.isUsingRealMic = false;
    this.intervalId = setInterval(() => {
      // Dao động nhẹ nhàng mô phỏng mức ồn trong nhà bình thường
      const randomFluctuation = Math.floor(Math.random() * 9) - 4;
      this.currentDb = Math.max(38, Math.min(58, 46 + randomFluctuation));
    }, 2000);
  }

  // Kích hoạt thủ công tiếng ồn lớn giả lập (Kiểm thử tính năng)
  triggerSimulatedLoudNoise(db = 82) {
    this.currentDb = db;
    this.notifyListeners(db);
  }

  private checkAndTriggerAlert(db: number) {
    const now = Date.now();
    // Giãn cách ít nhất 15 giây giữa 2 lần cảnh báo để không làm phiền bé
    if (now - this.lastAlertTime > 15000) {
      this.lastAlertTime = now;
      this.notifyListeners(db);
    }
  }

  private notifyListeners(db: number) {
    this.listeners.forEach((listener) => listener(db));
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.isUsingRealMic = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track: any) => track.stop());
      } catch {}
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
  }
}

export const noiseMonitorService = new NoiseMonitorService();
