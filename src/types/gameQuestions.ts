export type GameTabType = 'flip' | 'matching' | 'puzzle' | 'quiz' | 'movement';

// 1. Game Thẻ Lật
export interface FlipQuestionOption {
  id: string;
  label: string;
  emoji: string;
  isCorrect: boolean;
}

export interface FlipQuestionItem {
  id: number | string;
  question: string;
  target: { label: string; emoji: string };
  options: FlipQuestionOption[];
  isCustom?: boolean;
}

// 2. Game Nối Ý Logic
export interface MatchingOptionItem {
  id: string;
  label: string;
  icon: string;
  isCorrect: boolean;
}

export interface MatchingPairData {
  id: number | string;
  question: string;
  questionIcon: string;
  options: MatchingOptionItem[];
  isCustom?: boolean;
}

// 3. Game Nghiêng Đầu (Head Tilt)
export interface HeadTiltOption {
  direction: 'left' | 'right';
  label: string;
  emoji: string;
  isCorrect: boolean;
}

export interface HeadTiltQuestion {
  id: number | string;
  question: string;
  options: {
    left: HeadTiltOption;
    right: HeadTiltOption;
  };
  isCustom?: boolean;
}

// 4. Game Trắc Nghiệm Cảm Xúc
export interface EmotionalQuizOption {
  label: string;
  emoji: string;
  praise: string;
}

export interface EmotionalQuizItem {
  id: number | string;
  question: string;
  tip: string;
  options: EmotionalQuizOption[];
  isCustom?: boolean;
}

// 5. Game Thể Dục Nhận Diện Tư Thế Camera
export type AllowedPoseType = 'arms_up' | 'hands_head' | 'hands_chest' | 'arms_side';

export interface PoseOption {
  id: 'A' | 'B';
  label: string;
  poseName: string;
  emoji: string;
  isCorrect: boolean;
  requiredPose: AllowedPoseType;
  theme: 'blue' | 'green';
}

export interface PoseExerciseQuestion {
  id: number | string;
  question: string;
  hint: string;
  options: PoseOption[];
  isCustom?: boolean;
}

// Cấu trúc lưu trữ tổng hợp các câu hỏi do cha mẹ thêm vào
export interface CustomGameQuestionsState {
  flip: FlipQuestionItem[];
  matching: MatchingPairData[];
  puzzle: HeadTiltQuestion[];
  quiz: EmotionalQuizItem[];
  movement: PoseExerciseQuestion[];
}

export const INITIAL_CUSTOM_GAME_QUESTIONS: CustomGameQuestionsState = {
  flip: [],
  matching: [],
  puzzle: [],
  quiz: [],
  movement: [],
};

