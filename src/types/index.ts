export type FitzgeraldType = 'people' | 'action' | 'object' | 'emotion' | 'social';

export interface Category {
  id: string;
  name: string;
  type: FitzgeraldType;
  colorHex: string;
  borderColor: string;
  icon: string;
  sortOrder: number;
}

export type AudioSourceType = 'preloaded' | 'recorded' | 'tts';

export interface CardItemData {
  id: string;
  categoryId: string;
  label: string;
  emojiIcon?: string;
  imageUri?: string | null;
  audioUri?: string | null;
  audioType: AudioSourceType;
  isHidden: boolean;
  usageCount: number;
  createdAt: number;
  
  // Các trường hỗ trợ luồng thông minh (Smart Guided Flow)
  isStarter?: boolean;           // Thẻ khởi đầu câu (VD: "Con muốn", "Con thích")
  suggestedCategoryId?: string;  // Danh mục tiếp theo mà thẻ này dẫn tới
  emergencyPhrase?: string;      // Câu nói đầy đủ nếu dùng làm thẻ khẩn cấp 1 chạm
}

export interface SentenceItem {
  id: string;
  card: CardItemData;
  addedAt: number;
}

export interface FamilyNotification {
  id: string;
  childName: string;
  sentenceText: string;
  timestamp: string;
  isEmergency: boolean;
}

export interface AppSettings {
  gridColumns: number; // 1, 2, 3, 4
  gridRows: number;    // 1, 2, 3, 4
  cooldownSeconds: number; // 0.5 to 2.5
  voiceRegion: 'north' | 'central' | 'south';
  autoSpeakOnAdd: boolean;
  speechRate: number; // 0.8 to 1.2
  guidedFlowEnabled: boolean; // Bật chế độ tự động điều hướng thông minh

  // Tính năng 7: Chế độ Hai thiết bị (Dual-Device Family Notification)
  familySyncRole: 'child_device' | 'parent_receiver';
  childName: string;

  // Tính năng 8: Cảnh báo Quá tải Giác quan (Sensory Overload Sound Shield)
  noiseShieldEnabled: boolean;
  noiseThresholdDb: number; // ngưỡng decibel (mặc định 75 dB)

  // Tính năng 9: Kích thích Bật âm Tự nhiên (Speech Induction & Expectant Pause)
  speechInductionEnabled: boolean; // Bật chế độ tạo khoảng lặng chờ bé tự nói
  expectantDelaySeconds: number;   // Thời gian chờ (2, 3, 5 giây)
  phonemicCueEnabled: boolean;     // Mớm âm tiết đầu (/b/... /b/... bánh)
  vocalRewardEnabled: boolean;     // Lắng nghe và thưởng sao khi bé phát âm
}

export interface CommunicationLog {
  id: number;
  sentenceText: string;
  cardIdsJson: string;
  cardCount: number;
  timestamp: string;
}
