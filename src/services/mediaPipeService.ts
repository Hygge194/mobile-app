/**
 * mediaPipeService.ts
 * Dịch vụ tích hợp Google MediaPipe AI chuyên sâu cho:
 * 1. Nhận diện góc nghiêng đầu (Face Landmarker / Head Tilt Discrimination - Game 3)
 * 2. Nhận diện 33 điểm mốc tư thế cơ thể (Pose Landmarker - Game 5)
 * 
 * Kiến trúc:
 * - Tự động kết nối CDN Google MediaPipe Tasks Vision (@mediapipe/tasks-vision)
 * - Tải mô hình On-Device Wasm & Float16 Lite từ Google Cloud Storage
 * - Cơ chế Fallback Heuristic tự động: Nếu mất mạng / CDN lỗi / thiết bị yếu,
 *   tự chuyển sang thuật toán quang học cục bộ mà không gián đoạn trò chơi.
 */

export type ExercisePoseType = 'arms_up' | 'hands_head' | 'hands_chest' | 'arms_side' | 'none';

export type MediaPipeStatus = 'uninitialized' | 'loading' | 'ready' | 'fallback' | 'error';

export interface HeadTiltResult {
  success: boolean;
  angle: number; // Góc làm mượt (-45 đến +45 độ, âm = trái, dương = phải)
  rawAngle: number;
  direction: 'left' | 'right' | null;
  confidence: number;
  isMediaPipe: boolean;
  landmarks?: {
    nose: { x: number; y: number };
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    forehead?: { x: number; y: number };
    chin?: { x: number; y: number };
  };
}

export interface PoseResult {
  success: boolean;
  detectedPose: ExercisePoseType;
  confidence: number; // 0 - 100
  scores: {
    arms_up: number;
    hands_head: number;
    hands_chest: number;
    arms_side: number;
  };
  isMediaPipe: boolean;
  motionLevel?: number;
  landmarks?: {
    nose?: { x: number; y: number };
    leftShoulder?: { x: number; y: number };
    rightShoulder?: { x: number; y: number };
    leftElbow?: { x: number; y: number };
    rightElbow?: { x: number; y: number };
    leftWrist?: { x: number; y: number };
    rightWrist?: { x: number; y: number };
    leftHip?: { x: number; y: number };
    rightHip?: { x: number; y: number };
  };
}

// Cấu hình CDN Google MediaPipe
const CDN_CONFIG = {
  BUNDLE_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
  WASM_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
  FACE_MODEL_URL: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  POSE_MODEL_URL: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
};

class MediaPipeService {
  private visionModule: any = null;
  private filesetResolver: any = null;
  private faceLandmarker: any = null;
  private poseLandmarker: any = null;

  private faceStatus: MediaPipeStatus = 'uninitialized';
  private poseStatus: MediaPipeStatus = 'uninitialized';

  private faceInitPromise: Promise<boolean> | null = null;
  private poseInitPromise: Promise<boolean> | null = null;

  private listeners: Set<(type: 'face' | 'pose', status: MediaPipeStatus) => void> = new Set();

  // Biến bộ nhớ đệm cho phân tích nghiêng đầu
  private smoothedTiltAngle: number = 0;
  private lastFaceVideoTime: number = -1;

  // Biến bộ nhớ đệm cho phân tích tư thế thể dục
  private lastPoseVideoTime: number = -1;
  private fallbackBaselineData: Uint8ClampedArray | null = null;
  private fallbackPrevData: Uint8ClampedArray | null = null;
  private fallbackInitFrames: number = 0;
  private energyTopLeft = 0;
  private energyTopRight = 0;
  private energyHeadCenter = 0;
  private energyChest = 0;
  private energySideLeft = 0;
  private energySideRight = 0;

  // Canvas phụ để xử lý frame nếu cần
  private fallbackCanvas: HTMLCanvasElement | null = null;
  private fallbackCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.initFallbackCanvas();
  }

  private initFallbackCanvas() {
    if (typeof document !== 'undefined') {
      try {
        this.fallbackCanvas = document.createElement('canvas');
        this.fallbackCanvas.width = 64;
        this.fallbackCanvas.height = 48;
        this.fallbackCtx = this.fallbackCanvas.getContext('2d', { willReadFrequently: true });
      } catch {
        this.fallbackCanvas = null;
        this.fallbackCtx = null;
      }
    }
  }

  public subscribeStatus(cb: (type: 'face' | 'pose', status: MediaPipeStatus) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notifyStatus(type: 'face' | 'pose', status: MediaPipeStatus) {
    if (type === 'face') this.faceStatus = status;
    if (type === 'pose') this.poseStatus = status;
    this.listeners.forEach((cb) => {
      try {
        cb(type, status);
      } catch {}
    });
  }

  public getFaceStatus(): MediaPipeStatus {
    return this.faceStatus;
  }

  public getPoseStatus(): MediaPipeStatus {
    return this.poseStatus;
  }

  /**
   * Nạp động thư viện Vision Module từ CDN
   */
  private async loadVisionBundle(): Promise<any> {
    if (this.visionModule) return this.visionModule;

    if (typeof window === 'undefined') {
      throw new Error('Môi trường không hỗ trợ Window DOM');
    }

    // Dynamic import module từ CDN (sử dụng Function constructor để tránh bị Metro / Webpack tĩnh hoá)
    try {
      const dynamicImport = new Function('url', 'return import(url)');
      const module = await Promise.race([
        dynamicImport(CDN_CONFIG.BUNDLE_URL),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('CDN MediaPipe timeout sau 8s')), 8000)
        ),
      ]);
      this.visionModule = module;
      return module;
    } catch (err) {
      console.warn('[MediaPipe] Lỗi tải CDN Vision bundle, kích hoạt Fallback:', err);
      throw err;
    }
  }

  /**
   * Khởi tạo FilesetResolver từ CDN Wasm
   */
  private async getFilesetResolver(): Promise<any> {
    if (this.filesetResolver) return this.filesetResolver;
    const vision = await this.loadVisionBundle();
    this.filesetResolver = await vision.FilesetResolver.forVisionTasks(CDN_CONFIG.WASM_URL);
    return this.filesetResolver;
  }

  /**
   * Khởi tạo FaceLandmarker (Game 3: Nghiêng Đầu)
   */
  public async initFaceLandmarker(): Promise<boolean> {
    if (this.faceLandmarker) return true;
    if (this.faceInitPromise) return this.faceInitPromise;

    this.faceInitPromise = (async () => {
      this.notifyStatus('face', 'loading');
      try {
        const vision = await this.loadVisionBundle();
        const fileset = await this.getFilesetResolver();

        try {
          this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: CDN_CONFIG.FACE_MODEL_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFacialTransformationMatrixes: true,
          });
        } catch (gpuErr) {
          console.warn('[MediaPipe] GPU delegate failed for FaceLandmarker, retrying with CPU...', gpuErr);
          this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: CDN_CONFIG.FACE_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFacialTransformationMatrixes: true,
          });
        }

        this.notifyStatus('face', 'ready');
        return true;
      } catch (err) {
        console.warn('[MediaPipe] Không thể khởi tạo FaceLandmarker, chuyển sang chế độ Heuristic:', err);
        this.notifyStatus('face', 'fallback');
        return false;
      }
    })();

    return this.faceInitPromise;
  }

  /**
   * Khởi tạo PoseLandmarker (Game 5: Thể Dục)
   */
  public async initPoseLandmarker(): Promise<boolean> {
    if (this.poseLandmarker) return true;
    if (this.poseInitPromise) return this.poseInitPromise;

    this.poseInitPromise = (async () => {
      this.notifyStatus('pose', 'loading');
      try {
        const vision = await this.loadVisionBundle();
        const fileset = await this.getFilesetResolver();

        try {
          this.poseLandmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: CDN_CONFIG.POSE_MODEL_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        } catch (gpuErr) {
          console.warn('[MediaPipe] GPU delegate failed for PoseLandmarker, retrying with CPU...', gpuErr);
          this.poseLandmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: CDN_CONFIG.POSE_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        }

        this.notifyStatus('pose', 'ready');
        return true;
      } catch (err) {
        console.warn('[MediaPipe] Không thể khởi tạo PoseLandmarker, chuyển sang chế độ Heuristic:', err);
        this.notifyStatus('pose', 'fallback');
        return false;
      }
    })();

    return this.poseInitPromise;
  }

  /**
   * NHẬN DIỆN GÓC NGHIÊNG ĐẦU (GAME 3)
   * Sử dụng FaceLandmarker hoặc Fallback Heuristic
   */
  public detectHeadTilt(videoEl: HTMLVideoElement): HeadTiltResult {
    if (!videoEl || videoEl.readyState < 2) {
      return {
        success: false,
        angle: this.smoothedTiltAngle,
        rawAngle: 0,
        direction: null,
        confidence: 0,
        isMediaPipe: false,
      };
    }

    // 1. NẾU MEDIAPIPE FACE LANDMARKER SẴN SÀNG
    if (this.faceLandmarker && this.faceStatus === 'ready') {
      try {
        const now = performance.now();
        if (now > this.lastFaceVideoTime) {
          this.lastFaceVideoTime = now;
          const result = this.faceLandmarker.detectForVideo(videoEl, now);

          if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
            const landmarks = result.faceLandmarks[0];

            // Điểm mốc chuẩn quốc tế MediaPipe Face:
            // 33: Đuôi mắt trái (Viewer's left)
            // 263: Đuôi mắt phải (Viewer's right)
            // 1: Chóp mũi
            // 10: Đỉnh trán
            // 152: Cằm
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const nose = landmarks[1];
            const forehead = landmarks[10];
            const chin = landmarks[152];

            let calculatedDeg = 0;

            if (leftEye && rightEye) {
              // Điểm mốc chuẩn MediaPipe: 33 (mắt phải cơ thể) & 263 (mắt trái cơ thể)
              const eyeDx = rightEye.x - leftEye.x;
              const eyeDy = rightEye.y - leftEye.y;
              // Trục Y màn hình hướng xuống dưới (y=0 đỉnh, y=1 đáy).
              // Khi người dùng nghiêng đầu sang vai TRÁI của mình (hướng sang thẻ TRÁI trên màn hình gương):
              // Mắt trái (263) hạ thấp xuống -> eyeDy > 0.
              // Góc nghiêng sang TRÁI quy ước là ÂM (< -15°).
              // Do đó: calculatedDeg = -Math.round(Math.atan2(eyeDy, eyeDx) * (180 / Math.PI));
              const eyeAngle = -Math.atan2(eyeDy, eyeDx) * (180 / Math.PI);
              calculatedDeg = Math.round(eyeAngle);
            } else if (forehead && chin) {
              const headDx = chin.x - forehead.x;
              const headDy = chin.y - forehead.y;
              const headAngle = -Math.atan2(headDx, headDy) * (180 / Math.PI);
              calculatedDeg = Math.round(headAngle);
            }

            // Kẹp góc trong khoảng an toàn [-45, +45]
            const clamped = Math.max(-45, Math.min(45, calculatedDeg));
            // Vùng đệm yên lặng (Deadband): Dưới 5° coi như thẳng đầu (0°) để tránh rung nhiễu
            const stabilized = Math.abs(clamped) < 5 ? 0 : clamped;

            // Bộ lọc mượt mà Exponential Moving Average (alpha = 0.5)
            this.smoothedTiltAngle = Math.round(this.smoothedTiltAngle * 0.45 + stabilized * 0.55);

            let direction: 'left' | 'right' | null = null;
            if (this.smoothedTiltAngle < -15) direction = 'left';
            else if (this.smoothedTiltAngle > 15) direction = 'right';

            return {
              success: true,
              angle: this.smoothedTiltAngle,
              rawAngle: calculatedDeg,
              direction,
              confidence: 95,
              isMediaPipe: true,
              landmarks: {
                nose: { x: nose.x, y: nose.y },
                leftEye: { x: leftEye.x, y: leftEye.y },
                rightEye: { x: rightEye.x, y: rightEye.y },
                forehead: forehead ? { x: forehead.x, y: forehead.y } : undefined,
                chin: chin ? { x: chin.x, y: chin.y } : undefined,
              },
            };
          }
        }
      } catch (err) {
        console.warn('[MediaPipe] Lỗi xử lý frame khuôn mặt, chuyển fallback:', err);
      }
    }

    // 2. FALLBACK: THUẬT TOÁN QUANG HỌC LUMINANCE TRỌNG TÂM TRÊN CANVAS
    return this.detectHeadTiltFallback(videoEl);
  }

  private detectHeadTiltFallback(videoEl: HTMLVideoElement): HeadTiltResult {
    if (!this.fallbackCanvas || !this.fallbackCtx) {
      return {
        success: false,
        angle: this.smoothedTiltAngle,
        rawAngle: 0,
        direction: null,
        confidence: 0,
        isMediaPipe: false,
      };
    }

    try {
      this.fallbackCtx.drawImage(videoEl, 0, 0, 64, 48);
      const frame = this.fallbackCtx.getImageData(0, 0, 64, 48);
      const data = frame.data;
      const w = 64;

      let sumTopX = 0, weightTop = 0;
      let sumBotX = 0, weightBot = 0;

      for (let y = 10; y <= 40; y += 2) {
        for (let x = 14; x <= 50; x += 2) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const weight = 255 - lum + 20;

          if (y <= 24) {
            sumTopX += x * weight;
            weightTop += weight;
          } else if (y >= 26) {
            sumBotX += x * weight;
            weightBot += weight;
          }
        }
      }

      if (weightTop > 0 && weightBot > 0) {
        const avgTopX = sumTopX / weightTop;
        const avgBotX = sumBotX / weightBot;
        const deltaX = avgTopX - avgBotX;
        const deltaY = 16;

        const rawDeg = -Math.round(Math.atan2(deltaX, deltaY) * (180 / Math.PI) * 1.8);
        const clamped = Math.max(-45, Math.min(45, rawDeg));
        const stabilized = Math.abs(clamped) < 7 ? 0 : clamped;
        this.smoothedTiltAngle = Math.round(this.smoothedTiltAngle * 0.45 + stabilized * 0.55);

        let direction: 'left' | 'right' | null = null;
        if (this.smoothedTiltAngle < -15) direction = 'left';
        else if (this.smoothedTiltAngle > 15) direction = 'right';

        return {
          success: true,
          angle: this.smoothedTiltAngle,
          rawAngle: rawDeg,
          direction,
          confidence: 65,
          isMediaPipe: false,
        };
      }
    } catch {}

    return {
      success: false,
      angle: this.smoothedTiltAngle,
      rawAngle: 0,
      direction: null,
      confidence: 0,
      isMediaPipe: false,
    };
  }

  /**
   * NHẬN DIỆN TƯ THẾ THỂ DỤC (GAME 5)
   * Sử dụng PoseLandmarker hoặc Fallback Heuristic
   */
  public detectExercisePose(videoEl: HTMLVideoElement): PoseResult {
    if (!videoEl || videoEl.readyState < 2) {
      return {
        success: false,
        detectedPose: 'none',
        confidence: 0,
        scores: { arms_up: 0, hands_head: 0, hands_chest: 0, arms_side: 0 },
        isMediaPipe: false,
      };
    }

    // 1. NẾU MEDIAPIPE POSE LANDMARKER SẴN SÀNG
    if (this.poseLandmarker && this.poseStatus === 'ready') {
      try {
        const now = performance.now();
        if (now > this.lastPoseVideoTime) {
          this.lastPoseVideoTime = now;
          const result = this.poseLandmarker.detectForVideo(videoEl, now);

          if (result && result.landmarks && result.landmarks.length > 0) {
            const lm = result.landmarks[0];

            // 33 Điểm mốc chuẩn MediaPipe Pose:
            // 0: Mũi (Nose)
            // 11, 12: Vai trái, Vai phải (Shoulders)
            // 13, 14: Khuỷu tay trái, Khuỷu tay phải (Elbows)
            // 15, 16: Cổ tay trái, Cổ tay phải (Wrists)
            // 23, 24: Hông trái, Hông phải (Hips)
            const nose = lm[0];
            const leftShoulder = lm[11];
            const rightShoulder = lm[12];
            const leftElbow = lm[13];
            const rightElbow = lm[14];
            const leftWrist = lm[15];
            const rightWrist = lm[16];
            const leftHip = lm[23];
            const rightHip = lm[24];

            if (leftShoulder && rightShoulder && leftWrist && rightWrist) {
              const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
              const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x) || 0.25;

              // TÍNH ĐIỂM SỐ CHO TỪNG TƯ THẾ (0 - 100)
              let scoreArmsUp = 0;
              let scoreHandsHead = 0;
              let scoreHandsChest = 0;
              let scoreArmsSide = 0;

              const noseY = nose ? nose.y : shoulderMidY - 0.18;

              // TƯ THẾ 1: ARMS_UP (Vươn 2 tay chữ V lên cao)
              // Cả 2 cổ tay phải cao hơn vai và cao hơn chóp mũi
              const leftAboveShoulder = shoulderMidY - leftWrist.y;
              const rightAboveShoulder = shoulderMidY - rightWrist.y;
              const wristsAboveNose = leftWrist.y < noseY && rightWrist.y < noseY;

              if (leftAboveShoulder > 0.08 && rightAboveShoulder > 0.08 && wristsAboveNose) {
                const heightScore = Math.min(60, (leftAboveShoulder + rightAboveShoulder) * 120);
                const spreadScore = Math.abs(leftWrist.x - rightWrist.x) > shoulderWidth * 0.65 ? 35 : 15;
                scoreArmsUp = Math.min(100, Math.round(heightScore + spreadScore));
              }

              // TƯ THẾ 2: HANDS_HEAD (Làm 2 tai thỏ / tay trên đầu)
              // Cổ tay gần đỉnh đầu / tai, cao hơn vai nhưng KHÔNG vươn cao tít như arms_up
              const leftNearHead = Math.abs(leftWrist.y - noseY) < 0.16;
              const rightNearHead = Math.abs(rightWrist.y - noseY) < 0.16;
              const wristsNotTooHigh = leftWrist.y > noseY - 0.22 && rightWrist.y > noseY - 0.22;
              if (leftNearHead && rightNearHead && leftAboveShoulder > 0.04 && rightAboveShoulder > 0.04 && wristsNotTooHigh) {
                scoreHandsHead = 85;
              }

              // TƯ THẾ 3: HANDS_CHEST (Chắp tay trước ngực)
              // 2 Cổ tay ở ngang ngực (dưới vai, trên rốn/bụng), chụm gần nhau, và KHÔNG buông thõng xuống bàn phím/đùi
              const wristDistance = Math.hypot(leftWrist.x - rightWrist.x, leftWrist.y - rightWrist.y);
              const wristsBelowShoulder = leftWrist.y > shoulderMidY + 0.04 && rightWrist.y > shoulderMidY + 0.04;
              const wristsAtChestLevel = leftWrist.y < shoulderMidY + 0.22 && rightWrist.y < shoulderMidY + 0.22;
              const wristsAboveLap = leftWrist.y < 0.62 && rightWrist.y < 0.62;
              const wristsInCenter = Math.abs(leftWrist.x - 0.5) < 0.25 && Math.abs(rightWrist.x - 0.5) < 0.25;

              if (wristsBelowShoulder && wristsAtChestLevel && wristsAboveLap && wristsInCenter && wristDistance < shoulderWidth * 0.55) {
                const proximityScore = Math.max(50, 100 - (wristDistance / shoulderWidth) * 85);
                scoreHandsChest = Math.min(100, Math.round(proximityScore));
              }

              // TƯ THẾ 4: ARMS_SIDE (Dang hai tay sang ngang)
              // Cổ tay dang rộng hai bên, cao độ xấp xỉ ngang vai
              const wristSpread = Math.abs(rightWrist.x - leftWrist.x);
              const leftWristLevel = Math.abs(leftWrist.y - shoulderMidY);
              const rightWristLevel = Math.abs(rightWrist.y - shoulderMidY);
              if (wristSpread > shoulderWidth * 1.55 && leftWristLevel < 0.18 && rightWristLevel < 0.18) {
                scoreArmsSide = 85;
              }

              // XÁC ĐỊNH TƯ THẾ CÓ ĐIỂM SỐ CAO NHẤT
              const scores = {
                arms_up: scoreArmsUp,
                hands_head: scoreHandsHead,
                hands_chest: scoreHandsChest,
                arms_side: scoreArmsSide,
              };

              const poseKeys: (keyof typeof scores)[] = ['arms_up', 'hands_head', 'hands_chest', 'arms_side'];
              let bestPose: ExercisePoseType = 'none';
              let maxScore = 0;

              poseKeys.forEach((pose) => {
                if (scores[pose] > maxScore) {
                  maxScore = scores[pose];
                  bestPose = pose;
                }
              });

              // Ngưỡng phát hiện tin cậy 50 điểm
              const detectedPose = maxScore >= 50 ? bestPose : 'none';

              return {
                success: true,
                detectedPose,
                confidence: maxScore,
                scores,
                isMediaPipe: true,
                motionLevel: 80,
                landmarks: {
                  nose: nose ? { x: nose.x, y: nose.y } : undefined,
                  leftShoulder: { x: leftShoulder.x, y: leftShoulder.y },
                  rightShoulder: { x: rightShoulder.x, y: rightShoulder.y },
                  leftElbow: leftElbow ? { x: leftElbow.x, y: leftElbow.y } : undefined,
                  rightElbow: rightElbow ? { x: rightElbow.x, y: rightElbow.y } : undefined,
                  leftWrist: { x: leftWrist.x, y: leftWrist.y },
                  rightWrist: { x: rightWrist.x, y: rightWrist.y },
                  leftHip: leftHip ? { x: leftHip.x, y: leftHip.y } : undefined,
                  rightHip: rightHip ? { x: rightHip.x, y: rightHip.y } : undefined,
                },
              };
            }
          }
        }
      } catch (err) {
        console.warn('[MediaPipe] Lỗi xử lý frame tư thế, chuyển fallback:', err);
      }
    }

    // 2. FALLBACK: THUẬT TOÁN QUANG HỌC FRAME DIFFERENCE & SILHOUETTE PRESENCE
    return this.detectExercisePoseFallback(videoEl);
  }

  private detectExercisePoseFallback(videoEl: HTMLVideoElement): PoseResult {
    if (!this.fallbackCanvas || !this.fallbackCtx) {
      return {
        success: false,
        detectedPose: 'none',
        confidence: 0,
        scores: { arms_up: 0, hands_head: 0, hands_chest: 0, arms_side: 0 },
        isMediaPipe: false,
      };
    }

    try {
      this.fallbackCtx.drawImage(videoEl, 0, 0, 64, 48);
      const frame = this.fallbackCtx.getImageData(0, 0, 64, 48);
      const data = frame.data;
      const w = 64;
      const h = 48;

      if (!this.fallbackBaselineData || this.fallbackInitFrames < 5) {
        this.fallbackBaselineData = new Uint8ClampedArray(data);
        this.fallbackInitFrames++;
      }

      let totalDiff = 0;
      let frameTopLeftMotion = 0, frameTopRightMotion = 0, frameHeadMotion = 0, frameChestMotion = 0;
      let frameSideLeftMotion = 0, frameSideRightMotion = 0;
      let frameTopLeftPresence = 0, frameTopRightPresence = 0, frameHeadPresence = 0, frameChestPresence = 0;
      let frameSideLeftPresence = 0, frameSideRightPresence = 0;

      if (this.fallbackPrevData && this.fallbackBaselineData) {
        for (let y = 0; y < h; y += 2) {
          const ny = y / h;
          for (let x = 0; x < w; x += 2) {
            const screenX = 1 - x / w;
            const idx = (y * w + x) * 4;

            const instantDiff =
              Math.abs(data[idx] - this.fallbackPrevData[idx]) +
              Math.abs(data[idx + 1] - this.fallbackPrevData[idx + 1]) +
              Math.abs(data[idx + 2] - this.fallbackPrevData[idx + 2]);

            const baseDiff =
              Math.abs(data[idx] - this.fallbackBaselineData[idx]) +
              Math.abs(data[idx + 1] - this.fallbackBaselineData[idx + 1]) +
              Math.abs(data[idx + 2] - this.fallbackBaselineData[idx + 2]);

            if (instantDiff > 18) {
              totalDiff += instantDiff;
              if (ny < 0.38) {
                if (screenX < 0.38) frameTopLeftMotion += instantDiff;
                else if (screenX > 0.62) frameTopRightMotion += instantDiff;
                else if (screenX >= 0.36 && screenX <= 0.64) frameHeadMotion += instantDiff;
              } else if (ny >= 0.38 && ny <= 0.72) {
                if (screenX < 0.28) frameSideLeftMotion += instantDiff;
                else if (screenX > 0.72) frameSideRightMotion += instantDiff;
                else if (screenX >= 0.36 && screenX <= 0.64) frameChestMotion += instantDiff;
              }
            }

            if (baseDiff > 32) {
              if (ny < 0.38) {
                if (screenX < 0.38) frameTopLeftPresence += baseDiff;
                else if (screenX > 0.62) frameTopRightPresence += baseDiff;
                else if (screenX >= 0.36 && screenX <= 0.64) frameHeadPresence += baseDiff;
              } else if (ny >= 0.38 && ny <= 0.72) {
                if (screenX < 0.28) frameSideLeftPresence += baseDiff;
                else if (screenX > 0.72) frameSideRightPresence += baseDiff;
                else if (screenX >= 0.36 && screenX <= 0.64) frameChestPresence += baseDiff;
              }
            }
          }
        }

        const DECAY = 0.82;
        this.energyTopLeft = this.energyTopLeft * DECAY + frameTopLeftMotion * 0.05 + frameTopLeftPresence * 0.03;
        this.energyTopRight = this.energyTopRight * DECAY + frameTopRightMotion * 0.05 + frameTopRightPresence * 0.03;
        this.energyHeadCenter = this.energyHeadCenter * DECAY + frameHeadMotion * 0.06 + frameHeadPresence * 0.035;
        // Chỉ tích lũy năng lượng ngực khi có chuyển động đưa tay vào ngực, tránh việc cơ thể ngồi yên làm tăng điểm
        const chestContribution = frameChestMotion > 8 ? frameChestMotion * 0.06 + frameChestPresence * 0.02 : 0;
        this.energyChest = this.energyChest * DECAY + chestContribution;
        this.energySideLeft = this.energySideLeft * DECAY + frameSideLeftMotion * 0.05 + frameSideLeftPresence * 0.03;
        this.energySideRight = this.energySideRight * DECAY + frameSideRightMotion * 0.05 + frameSideRightPresence * 0.03;

        const scoreArmsUp = Math.max(0, Math.round((this.energyTopLeft + this.energyTopRight) * 1.5));
        const scoreHandsHead = Math.max(0, Math.round(this.energyHeadCenter * 2.0));
        const scoreHandsChest = Math.max(0, Math.round(this.energyChest * 2.0));
        const scoreArmsSide = Math.max(0, Math.round((this.energySideLeft + this.energySideRight) * 1.5));

        const scores = {
          arms_up: scoreArmsUp,
          hands_head: scoreHandsHead,
          hands_chest: scoreHandsChest,
          arms_side: scoreArmsSide,
        };

        const poseKeys: (keyof typeof scores)[] = ['arms_up', 'hands_head', 'hands_chest', 'arms_side'];
        let bestPose: ExercisePoseType = 'none';
        let maxScore = 0;
        poseKeys.forEach((p) => {
          if (scores[p] > maxScore) {
            maxScore = scores[p];
            bestPose = p;
          }
        });

        const motionPercent = Math.min(100, Math.round(totalDiff / 180));
        this.fallbackPrevData = new Uint8ClampedArray(data);

        return {
          success: true,
          detectedPose: maxScore >= 32 ? bestPose : 'none',
          confidence: maxScore,
          scores,
          isMediaPipe: false,
          motionLevel: motionPercent,
        };
      }

      this.fallbackPrevData = new Uint8ClampedArray(data);
    } catch {}

    return {
      success: false,
      detectedPose: 'none',
      confidence: 0,
      scores: { arms_up: 0, hands_head: 0, hands_chest: 0, arms_side: 0 },
      isMediaPipe: false,
    };
  }

  /**
   * Reset bộ nhớ đệm năng lượng khi đổi câu hỏi
   */
  public resetEnergies() {
    this.energyTopLeft = 0;
    this.energyTopRight = 0;
    this.energyHeadCenter = 0;
    this.energyChest = 0;
    this.energySideLeft = 0;
    this.energySideRight = 0;
    this.fallbackBaselineData = null;
    this.fallbackInitFrames = 0;
  }
}

export const mediaPipeService = new MediaPipeService();
