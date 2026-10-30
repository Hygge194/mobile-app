import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Vibration,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { audioService } from '../../services/audioService';
import { UI_COLORS } from '../../constants/colors';
import { mediaPipeService, MediaPipeStatus } from '../../services/mediaPipeService';
import {
  FlipQuestionItem,
  EmotionalQuizItem,
} from '../../types/gameQuestions';

type GameTab = 'flip' | 'matching' | 'puzzle' | 'quiz' | 'movement';

// DỮ LIỆU GAME 1: THẺ LẬT - THẺ HỌC NHÓM
const FLIP_QUESTIONS: FlipQuestionItem[] = [
  {
    id: 1,
    question: 'Đâu là quả táo?',
    target: { label: 'Táo', emoji: '🍎' },
    options: [
      { id: '1a', label: 'Táo', emoji: '🍎', isCorrect: true },
      { id: '1b', label: 'Chuối', emoji: '🍌', isCorrect: false },
      { id: '1c', label: 'Sữa', emoji: '🥛', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: 'Con nào kêu meo meo?',
    target: { label: 'Con mèo', emoji: '🐱' },
    options: [
      { id: '2a', label: 'Con chó', emoji: '🐶', isCorrect: false },
      { id: '2b', label: 'Con mèo', emoji: '🐱', isCorrect: true },
      { id: '2c', label: 'Con cá', emoji: '🐟', isCorrect: false },
    ],
  },
  {
    id: 3,
    question: 'Vật nào dùng để đánh răng?',
    target: { label: 'Bàn chải', emoji: '🪥' },
    options: [
      { id: '3a', label: 'Bàn chải', emoji: '🪥', isCorrect: true },
      { id: '3b', label: 'Cái thìa', emoji: '🥄', isCorrect: false },
      { id: '3c', label: 'Quả bóng', emoji: '⚽', isCorrect: false },
    ],
  },
  {
    id: 4,
    question: 'Đâu là đồ vật dùng để uống nước?',
    target: { label: 'Cốc', emoji: '🥤' },
    options: [
      { id: '4a', label: 'Giày', emoji: '👟', isCorrect: false },
      { id: '4b', label: 'Cốc', emoji: '🥤', isCorrect: true },
      { id: '4c', label: 'Sách', emoji: '📚', isCorrect: false },
    ],
  },
  {
    id: 5,
    question: 'Con nào sống dưới nước?',
    target: { label: 'Cá', emoji: '🐟' },
    options: [
      { id: '5a', label: 'Cá', emoji: '🐟', isCorrect: true },
      { id: '5b', label: 'Gà', emoji: '🐔', isCorrect: false },
      { id: '5c', label: 'Mèo', emoji: '🐈', isCorrect: false },
    ],
  },
];

// DỮ LIỆU GAME 2: KÉO THẢ - NỐI Ý LOGIC (MỖI CÂU 3 LỰA CHỌN ĐỂ CHỌN 1)
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

const MATCHING_PAIRS: MatchingPairData[] = [
  {
    id: 1,
    question: 'Con chó ăn gì?',
    questionIcon: '🐶',
    options: [
      { id: '1a', label: 'Thức ăn cho chó / Xương', icon: '🦴', isCorrect: true },
      { id: '1b', label: 'Cà rốt tươi', icon: '🥕', isCorrect: false },
      { id: '1c', label: 'Kem ốc quế', icon: '🍦', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: 'Trời mưa dùng gì?',
    questionIcon: '🌧️',
    options: [
      { id: '2a', label: 'Ô (dù) che mưa', icon: '☂️', isCorrect: true },
      { id: '2b', label: 'Kính râm thời trang', icon: '🕶️', isCorrect: false },
      { id: '2c', label: 'Cái quạt nan', icon: '🪭', isCorrect: false },
    ],
  },
  {
    id: 3,
    question: 'Đánh răng dùng gì?',
    questionIcon: '🦷',
    options: [
      { id: '3a', label: 'Bàn chải đánh răng', icon: '🪥', isCorrect: true },
      { id: '3b', label: 'Cái thìa ăn cơm', icon: '🥄', isCorrect: false },
      { id: '3c', label: 'Cây bút chì', icon: '✏️', isCorrect: false },
    ],
  },
  {
    id: 4,
    question: 'Đi học mang gì?',
    questionIcon: '🏫',
    options: [
      { id: '4a', label: 'Cặp sách đi học', icon: '🎒', isCorrect: true },
      { id: '4b', label: 'Cái gối ngủ', icon: '🛌', isCorrect: false },
      { id: '4c', label: 'Cái chảo rán', icon: '🍳', isCorrect: false },
    ],
  },
  {
    id: 5,
    question: 'Buồn ngủ thì đi đâu?',
    questionIcon: '😴',
    options: [
      { id: '5a', label: 'Giường ngủ êm ái', icon: '🛏️', isCorrect: true },
      { id: '5b', label: 'Bàn ăn gia đình', icon: '🍽️', isCorrect: false },
      { id: '5c', label: 'Cầu trượt công viên', icon: '🛝', isCorrect: false },
    ],
  },
  {
    id: 6,
    question: 'Rửa tay dùng gì?',
    questionIcon: '🧼',
    options: [
      { id: '6a', label: 'Nước và xà phòng', icon: '🧴', isCorrect: true },
      { id: '6b', label: 'Hộp sữa tươi', icon: '🧃', isCorrect: false },
      { id: '6c', label: 'Bút sáp màu', icon: '🖍️', isCorrect: false },
    ],
  },
  {
    id: 7,
    question: 'Trời nắng có thể dùng gì?',
    questionIcon: '☀️',
    options: [
      { id: '7a', label: 'Mũ (nón) che nắng', icon: '🧢', isCorrect: true },
      { id: '7b', label: 'Găng tay len ấm', icon: '🧤', isCorrect: false },
      { id: '7c', label: 'Khăn quàng cổ', icon: '🧣', isCorrect: false },
    ],
  },
  {
    id: 8,
    question: 'Muốn cắt giấy dùng gì?',
    questionIcon: '📄',
    options: [
      { id: '8a', label: 'Kéo an toàn (bố mẹ giúp)', icon: '✂️', isCorrect: true },
      { id: '8b', label: 'Đôi đũa ăn cơm', icon: '🥢', isCorrect: false },
      { id: '8c', label: 'Cái búa đinh', icon: '🔨', isCorrect: false },
    ],
  },
];

const DAILY_LIFE_QUESTIONS: MatchingPairData[] = [
  {
    id: 'd1',
    question: 'Trước khi ăn cơm, con nên làm gì?',
    questionIcon: '🍚',
    options: [
      { id: 'd1a', label: 'Rửa tay sạch sẽ', icon: '🧼', isCorrect: true },
      { id: 'd1b', label: 'Đi giày vào chân', icon: '👟', isCorrect: false },
      { id: 'd1c', label: 'Bật tivi xem', icon: '📺', isCorrect: false },
    ],
  },
  {
    id: 'd2',
    question: 'Khi tay bị bẩn, con nên làm gì?',
    questionIcon: '🖐️',
    options: [
      { id: 'd2a', label: 'Rửa tay bằng xà phòng', icon: '🧴', isCorrect: true },
      { id: 'd2b', label: 'Quệt tay vào áo', icon: '👕', isCorrect: false },
      { id: 'd2c', label: 'Cầm vào gấu bông', icon: '🧸', isCorrect: false },
    ],
  },
  {
    id: 'd3',
    question: 'Khi muốn uống nước, con làm gì?',
    questionIcon: '🥤',
    options: [
      { id: 'd3a', label: 'Lấy cốc và rót nước uống', icon: '💧', isCorrect: true },
      { id: 'd3b', label: 'Lấy bát ăn cơm', icon: '🥣', isCorrect: false },
      { id: 'd3c', label: 'Đi lên giường nằm', icon: '🛏️', isCorrect: false },
    ],
  },
];

// DỮ LIỆU GAME 3: QUIZ NGHIÊNG ĐẦU (HEAD TILT DISCRIMINATION - 6 CÂU HỎI)
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

const HEAD_TILT_QUESTIONS: HeadTiltQuestion[] = [
  {
    id: 1,
    question: 'Đâu là quả ngọt màu đỏ bé thích ăn?',
    options: {
      left: { direction: 'left', label: 'Quả táo đỏ', emoji: '🍎', isCorrect: true },
      right: { direction: 'right', label: 'Đôi giày thể thao', emoji: '👟', isCorrect: false },
    },
  },
  {
    id: 2,
    question: 'Con vật nào kêu gâu gâu và trông nhà giúp bố mẹ?',
    options: {
      left: { direction: 'left', label: 'Con mèo con', emoji: '🐱', isCorrect: false },
      right: { direction: 'right', label: 'Con chó trung thành', emoji: '🐶', isCorrect: true },
    },
  },
  {
    id: 3,
    question: 'Khi khát nước, con chọn đồ vật nào để uống?',
    options: {
      left: { direction: 'left', label: 'Cốc nước mát', emoji: '🥤', isCorrect: true },
      right: { direction: 'right', label: 'Cái ghế ngồi', emoji: '🪑', isCorrect: false },
    },
  },
  {
    id: 4,
    question: 'Đồ vật nào dùng để chải răng trắng tinh mỗi sáng?',
    options: {
      left: { direction: 'left', label: 'Cái thìa ăn cơm', emoji: '🥄', isCorrect: false },
      right: { direction: 'right', label: 'Bàn chải đánh răng', emoji: '🪥', isCorrect: true },
    },
  },
  {
    id: 5,
    question: 'Con nào bơi lội tung tăng dưới nước?',
    options: {
      left: { direction: 'left', label: 'Con cá bơi lội', emoji: '🐟', isCorrect: true },
      right: { direction: 'right', label: 'Con gà trống', emoji: '🐔', isCorrect: false },
    },
  },
  {
    id: 6,
    question: 'Trời nắng gắt, con đội gì lên đầu để che nắng?',
    options: {
      left: { direction: 'left', label: 'Đôi găng tay len', emoji: '🧤', isCorrect: false },
      right: { direction: 'right', label: 'Chiếc mũ lưỡi trai', emoji: '🧢', isCorrect: true },
    },
  },
];

// DỮ LIỆU GAME 4: TRẮC NGHIỆM CẢM XÚC & GIAO TIẾP
const EMOTIONAL_QUIZZES: EmotionalQuizItem[] = [
  {
    id: 1,
    question: 'Khi vui, con có thể cảm thấy thế nào?',
    tip: 'Khích lệ con mỉm cười và chia sẻ niềm vui.',
    options: [
      { label: 'Vui vẻ, muốn cười to', emoji: '😊', praise: 'Đúng rồi! Khi vui con hãy cười thật tươi nhé!' },
      { label: 'Cảm thấy buồn ngủ', emoji: '😴', praise: 'Khi mệt con muốn ngủ, bố mẹ luôn hiểu con!' },
    ],
  },
  {
    id: 2,
    question: 'Khi khát nước, con có thể làm gì?',
    tip: 'Hướng dẫn con lấy cốc hoặc dùng thẻ AAC xin nước.',
    options: [
      { label: 'Lấy cốc uống nước / Xin bố mẹ', emoji: '🥤', praise: 'Bé giỏi lắm! Khát nước là lấy cốc uống ngay nhé!' },
      { label: 'Đi xỏ giày vào chân', emoji: '👟', praise: 'Giày để đi chơi, còn khát nước thì con nhớ uống nước nhé!' },
    ],
  },
  {
    id: 3,
    question: 'Khi cần giúp đỡ, con có thể nói gì?',
    tip: 'Tập cho con chủ động tìm kiếm sự trợ giúp thay vì bất lực khóc.',
    options: [
      { label: '“Bố mẹ giúp con với!”', emoji: '🗣️', praise: 'Hoan hô! Bố mẹ luôn ở đây sẵn sàng giúp đỡ con!' },
      { label: 'Ngồi im lặng một mình', emoji: '🤐', praise: 'Đừng ngại nhé, con hãy gọi bố mẹ giúp con ngay!' },
    ],
  },
  {
    id: 4,
    question: 'Khi muốn chơi cùng bạn, con có thể nói gì?',
    tip: 'Kỹ năng kết nối xã hội tích cực.',
    options: [
      { label: '“Mình chơi cùng nhé?”', emoji: '🤝', praise: 'Tuyệt vời! Con biết rủ bạn cùng chơi thật đáng yêu!' },
      { label: 'Bỏ chạy ra chỗ khác', emoji: '🏃', praise: 'Nếu con chưa sẵn sàng, con có thể quan sát bạn trước nhé.' },
    ],
  },
  {
    id: 5,
    question: 'Khi không thích một việc, con có thể làm gì?',
    tip: 'Dạy con từ chối đúng cách thay vì giận dữ ném đồ.',
    options: [
      { label: 'Nói “Con không thích” lịch sự', emoji: '✋', praise: 'Rất ngoan! Bố mẹ tôn trọng ý kiến của con!' },
      { label: 'Hét to và gào khóc', emoji: '😡', praise: 'Khi khó chịu, con hãy hít sâu và nói cho bố mẹ biết nhé!' },
    ],
  },
  {
    id: 6,
    question: 'Khi bạn đưa đồ chơi cho con, con có thể làm gì?',
    tip: 'Rèn luyện phản xạ đón nhận và cảm ơn.',
    options: [
      { label: 'Cầm đồ chơi và nói “Cảm ơn”', emoji: '🎁', praise: 'Bé ngoan quá! Biết nói cảm ơn bạn thật tuyệt!' },
      { label: 'Ném đồ chơi xuống đất', emoji: '💥', praise: 'Đồ chơi bạn tặng con, con hãy giữ gìn cẩn thận nhé!' },
    ],
  },
  {
    id: 7,
    question: 'Khi làm rơi đồ xuống đất, con có thể làm gì?',
    tip: 'Hành vi trách nhiệm và giải quyết vấn đề.',
    options: [
      { label: 'Cúi xuống nhặt lên hoặc nhờ giúp', emoji: '🧹', praise: 'Đúng rồi! Mình nhặt lên cho nhà sạch sẽ nhé!' },
      { label: 'Chạy đi chỗ khác', emoji: '🏃', praise: 'Nếu đồ nặng, con gọi bố mẹ nhặt cùng con nhé!' },
    ],
  },
  {
    id: 8,
    question: 'Khi gặp tình huống khiến con sợ hãi, con có thể làm gì?',
    tip: 'Điểm tựa an toàn: Luôn tìm đến bố mẹ.',
    options: [
      { label: 'Chạy lại ôm bố mẹ và nhờ giúp', emoji: '🫂', praise: 'Bố mẹ luôn bên cạnh bảo vệ con, con đừng sợ nhé!' },
      { label: 'Trốn một mình trong góc', emoji: '🚪', praise: 'Đừng trốn một mình nhé, hãy chạy lại ôm bố mẹ nào!' },
    ],
  },
];

// DỮ LIỆU GAME 5: THỂ DỤC NHẬN DIỆN TƯ THẾ CAMERA (AI CAMERA POSE RECOGNITION - 6 BÀI TẬP)
export interface PoseOption {
  id: 'A' | 'B';
  label: string;
  poseName: string;
  emoji: string;
  isCorrect: boolean;
  requiredPose: 'arms_up' | 'hands_head' | 'hands_chest' | 'arms_side';
  theme: 'blue' | 'green';
}

export interface PoseExerciseQuestion {
  id: number | string;
  question: string;
  hint: string;
  options: PoseOption[];
  isCustom?: boolean;
}

// COMPONENT HÌNH MINH HỌA BÉ TẬP THỂ DỤC SVG THEO TỪNG TƯ THẾ (ARMS_UP, HANDS_HEAD, HANDS_CHEST, ARMS_SIDE)
export const PoseKidAvatar: React.FC<{
  pose: 'arms_side' | 'arms_up' | 'hands_head' | 'hands_chest';
  width?: number;
  height?: number;
}> = ({ pose, width = 78, height = 104 }) => {
  return (
    <div style={{ width, height, position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.22))' }}
      >
        {/* Tóc sau */}
        <ellipse cx="50" cy="36" rx="26" ry="24" fill="#291807" />

        {/* Cẳng chân & Giày thể thao */}
        <rect x="36" y="86" width="9" height="28" rx="4.5" fill="#FED7AA" />
        <rect x="55" y="86" width="9" height="28" rx="4.5" fill="#FED7AA" />
        {/* Tất trắng */}
        <rect x="35" y="104" width="11" height="10" rx="3" fill="#FFFFFF" />
        <rect x="54" y="104" width="11" height="10" rx="3" fill="#FFFFFF" />
        {/* Giày xanh thể thao */}
        <path d="M33 116 C33 112 40 112 47 114 C48 119 45 122 34 122 Z" fill="#0284C7" />
        <path d="M53 114 C60 112 67 112 67 116 C56 122 52 119 53 114 Z" fill="#0284C7" />

        {/* Quần soóc xanh học sinh */}
        <path d="M32 72 L68 72 L65 89 L52 89 L50 78 L48 89 L35 89 Z" fill="#1D4ED8" />
        <line x1="32" y1="74" x2="68" y2="74" stroke="#1E40AF" strokeWidth="2" />

        {/* Thân áo trắng đồng phục */}
        <path d="M34 46 L66 46 L68 73 L32 73 Z" fill="#FFFFFF" />
        <line x1="50" y1="46" x2="50" y2="72" stroke="#E2E8F0" strokeWidth="1.5" />

        {/* Khăn quàng đỏ học sinh */}
        <path d="M44 46 L50 58 L56 46 Z" fill="#EF4444" />
        <circle cx="50" cy="48" r="3" fill="#DC2626" />
        <path d="M48 48 L44 60 L49 58 Z" fill="#EF4444" />

        {/* Cổ áo trắng */}
        <path d="M38 46 L46 51 L46 46 Z" fill="#F1F5F9" />
        <path d="M62 46 L54 51 L54 46 Z" fill="#F1F5F9" />

        {/* 1. DANG HAI TAY SANG NGANG (arms_side) */}
        {pose === 'arms_side' && (
          <g>
            <path d="M34 48 L14 54" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M14 54 L4 58" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            <circle cx="4" cy="58" r="5" fill="#FED7AA" />
            <path d="M66 48 L86 54" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M86 54 L96 58" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            <circle cx="96" cy="58" r="5" fill="#FED7AA" />
            <path d="M2 68 C-2 64 2 60 8 62" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M98 68 C102 64 98 60 92 62" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 2. VƯƠN HAI TAY CHỮ V LÊN CAO (arms_up) */}
        {pose === 'arms_up' && (
          <g>
            <path d="M34 48 L22 28" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M22 28 L14 12" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            <circle cx="14" cy="11" r="5.5" fill="#FED7AA" />
            <path d="M66 48 L78 28" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M78 28 L86 12" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            <circle cx="86" cy="11" r="5.5" fill="#FED7AA" />
            <path d="M10 8 L16 14" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M90 8 L84 14" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* 3. LÀM HAI TAI THỎ TRÊN ĐẦU (hands_head) */}
        {pose === 'hands_head' && (
          <g>
            {/* Đôi tai thỏ hồng xinh trên đỉnh đầu */}
            <ellipse cx="38" cy="11" rx="5" ry="11" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2.2" />
            <ellipse cx="38" cy="11" rx="2.5" ry="7" fill="#F472B6" />
            <ellipse cx="62" cy="11" rx="5" ry="11" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2.2" />
            <ellipse cx="62" cy="11" rx="2.5" ry="7" fill="#F472B6" />

            {/* Tay trái chạm vành tai/đầu */}
            <path d="M34 48 L20 34" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M20 34 L30 20" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            <circle cx="30" cy="20" r="5.5" fill="#FED7AA" />

            {/* Tay phải chạm vành tai/đầu */}
            <path d="M66 48 L80 34" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M80 34 L70 20" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            <circle cx="70" cy="20" r="5.5" fill="#FED7AA" />
          </g>
        )}

        {/* 4. CHẮP TAY TRƯỚC NGỰC (hands_chest) */}
        {pose === 'hands_chest' && (
          <g>
            {/* Tay trái gập vào ngực */}
            <path d="M34 48 L28 60" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M28 60 L45 56" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            {/* Tay phải gập vào ngực */}
            <path d="M66 48 L72 60" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M72 60 L55 56" stroke="#FED7AA" strokeWidth="9" strokeLinecap="round" />
            {/* Hai bàn tay chắp tâm điểm */}
            <ellipse cx="50" cy="56" rx="6" ry="7.5" fill="#FED7AA" stroke="#E2E8F0" strokeWidth="1" />
            {/* Trái tim hòa nhã */}
            <path d="M50 49 C48 46 44 48 44 51 C44 54 50 56 50 56 C50 56 56 54 56 51 C56 48 52 46 50 49 Z" fill="#EF4444" opacity="0.9" />
          </g>
        )}

        {/* Khuôn mặt bé */}
        <circle cx="50" cy="34" r="19" fill="#FED7AA" />
        <ellipse cx="32" cy="35" rx="3" ry="4.5" fill="#FED7AA" />
        <ellipse cx="68" cy="35" rx="3" ry="4.5" fill="#FED7AA" />

        {/* Tóc mái trước */}
        <path d="M32 30 C32 18 68 18 68 30 C64 26 58 28 54 26 C49 28 44 26 40 28 C36 26 33 28 32 30 Z" fill="#3D2109" />
        <path d="M38 23 C46 16 54 16 62 23 C58 20 42 20 38 23 Z" fill="#583210" />

        {/* Má hồng hào */}
        <circle cx="41" cy="39" r="3.5" fill="#F472B6" opacity="0.65" />
        <circle cx="59" cy="39" r="3.5" fill="#F472B6" opacity="0.65" />

        {/* Đôi mắt to tròn vui vẻ */}
        <ellipse cx="43" cy="33" rx="2.8" ry="3.8" fill="#1E293B" />
        <ellipse cx="57" cy="33" rx="2.8" ry="3.8" fill="#1E293B" />
        <circle cx="44" cy="32" r="1.2" fill="#FFFFFF" />
        <circle cx="58" cy="32" r="1.2" fill="#FFFFFF" />

        {/* Nụ cười tươi rói */}
        <path d="M46 40 Q50 45 54 40" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};

// LỚP KHUNG XƯƠNG AI WIREFRAME OVERLAY THỜI GIAN THỰC TRÊN CAMERA
export const SkeletonWireframeOverlay: React.FC<{
  currentPose: 'neutral' | 'arms_side' | 'arms_up' | 'hands_head' | 'hands_chest';
  activePose: 'A' | 'B' | null;
}> = ({ currentPose, activePose }) => {
  let leftElbowX = 22, leftElbowY = 74;
  let leftHandX = 18, leftHandY = 88;
  let rightElbowX = 78, rightElbowY = 74;
  let rightHandX = 82, rightHandY = 88;

  if (currentPose === 'arms_up') {
    leftElbowX = 18; leftElbowY = 36;
    leftHandX = 12; leftHandY = 14;
    rightElbowX = 82; rightElbowY = 36;
    rightHandX = 88; rightHandY = 14;
  } else if (currentPose === 'hands_head') {
    leftElbowX = 22; leftElbowY = 36;
    leftHandX = 34; leftHandY = 18;
    rightElbowX = 78; rightElbowY = 36;
    rightHandX = 66; rightHandY = 18;
  } else if (currentPose === 'hands_chest') {
    leftElbowX = 30; leftElbowY = 60;
    leftHandX = 46; leftHandY = 56;
    rightElbowX = 70; rightElbowY = 60;
    rightHandX = 54; rightHandY = 56;
  } else if (currentPose === 'arms_side') {
    leftElbowX = 14; leftElbowY = 56;
    leftHandX = 4; leftHandY = 56;
    rightElbowX = 86; rightElbowY = 56;
    rightHandX = 96; rightHandY = 56;
  }

  const strokeColor = activePose ? '#22C55E' : '#38BDF8';
  const jointColor = activePose ? '#4ADE80' : '#7DD3FC';

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Vòng oval định vị khuôn mặt */}
      <ellipse
        cx="50"
        cy="32"
        rx="18"
        ry="22"
        stroke={strokeColor}
        strokeWidth="1.8"
        fill="rgba(56, 189, 248, 0.05)"
        strokeDasharray="4 2"
        filter="url(#glow)"
      />

      {/* Cung định vị tai 2 bên */}
      <path d="M30 26 C28 32 28 38 30 42" stroke={strokeColor} strokeWidth="1.5" fill="none" opacity="0.8" />
      <path d="M70 26 C72 32 72 38 70 42" stroke={strokeColor} strokeWidth="1.5" fill="none" opacity="0.8" />

      {/* Khớp cổ & Đường xương sống xuống ngực */}
      <line x1="50" y1="50" x2="50" y2="58" stroke={strokeColor} strokeWidth="2.5" filter="url(#glow)" />
      <line x1="50" y1="58" x2="50" y2="76" stroke={strokeColor} strokeWidth="2" opacity="0.8" />

      {/* Thanh xà ngang bả vai */}
      <line x1="26" y1="58" x2="74" y2="58" stroke={strokeColor} strokeWidth="2.5" filter="url(#glow)" />

      {/* Xương tay trái (Vai -> Khuỷu tay -> Bàn tay) */}
      <line x1="26" y1="58" x2={leftElbowX} y2={leftElbowY} stroke={strokeColor} strokeWidth="2.2" filter="url(#glow)" />
      <line x1={leftElbowX} y1={leftElbowY} x2={leftHandX} y2={leftHandY} stroke={strokeColor} strokeWidth="2.2" filter="url(#glow)" />

      {/* Xương tay phải (Vai -> Khuỷu tay -> Bàn tay) */}
      <line x1="74" y1="58" x2={rightElbowX} y2={rightElbowY} stroke={strokeColor} strokeWidth="2.2" filter="url(#glow)" />
      <line x1={rightElbowX} y1={rightElbowY} x2={rightHandX} y2={rightHandY} stroke={strokeColor} strokeWidth="2.2" filter="url(#glow)" />

      {/* CÁC ĐIỂM KHỚP SÁNG (GLOWING JOINTS) */}
      <circle cx="50" cy="14" r="2.2" fill={jointColor} filter="url(#glow)" />
      <circle cx="50" cy="50" r="2.2" fill={jointColor} filter="url(#glow)" />
      <circle cx="50" cy="58" r="2.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1" filter="url(#glow)" />
      <circle cx="26" cy="58" r="3" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1" filter="url(#glow)" />
      <circle cx="74" cy="58" r="3" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1" filter="url(#glow)" />
      <circle cx={leftElbowX} cy={leftElbowY} r="2.8" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1" filter="url(#glow)" />
      <circle cx={leftHandX} cy={leftHandY} r="3.5" fill={jointColor} filter="url(#glow)" />
      <circle cx={rightElbowX} cy={rightElbowY} r="2.8" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1" filter="url(#glow)" />
      <circle cx={rightHandX} cy={rightHandY} r="3.5" fill={jointColor} filter="url(#glow)" />
    </svg>
  );
};

// BỘ 6 BÀI TẬP THỂ DỤC NHẬN DIỆN TƯ THẾ CAMERA THEO CHƯƠNG 4
const POSE_EXERCISE_QUESTIONS: PoseExerciseQuestion[] = [
  {
    id: 1,
    question: 'Buổi sáng thức dậy, bé hãy vươn hai tay chữ V lên cao để chào ngày mới nào!',
    hint: 'Vươn 2 tay lên cao (Tư thế A) hoặc Chắp tay trước ngực (Tư thế B)',
    options: [
      {
        id: 'A',
        label: 'Chào ngày mới tràn đầy năng lượng',
        poseName: 'Vươn hai tay chữ V lên cao',
        emoji: '🙆',
        isCorrect: true,
        requiredPose: 'arms_up',
        theme: 'blue',
      },
      {
        id: 'B',
        label: 'Chắp tay trước ngực tĩnh tâm',
        poseName: 'Chắp tay trước ngực',
        emoji: '🧘',
        isCorrect: false,
        requiredPose: 'hands_chest',
        theme: 'green',
      },
    ],
  },
  {
    id: 2,
    question: 'Chú thỏ con có đôi tai dài xinh xắn, bé hãy làm hai tai thỏ trên đầu nào!',
    hint: 'Dang hai tay sang ngang (Tư thế A) hoặc Làm hai tai thỏ trên đầu (Tư thế B)',
    options: [
      {
        id: 'A',
        label: 'Dang hai tay sang ngang',
        poseName: 'Dang hai tay sang ngang',
        emoji: '🤸',
        isCorrect: false,
        requiredPose: 'arms_side',
        theme: 'blue',
      },
      {
        id: 'B',
        label: 'Chú thỏ tai dài tinh nghịch',
        poseName: 'Làm hai tai thỏ trên đầu',
        emoji: '🐰',
        isCorrect: true,
        requiredPose: 'hands_head',
        theme: 'green',
      },
    ],
  },
  {
    id: 3,
    question: 'Đôi cánh chim hải âu bay lượn trên bầu trời, bé hãy dang rộng hai cánh tay nào!',
    hint: 'Dang 2 tay sang ngang (Tư thế A) hoặc Vươn hai tay lên cao (Tư thế B)',
    options: [
      {
        id: 'A',
        label: 'Cánh chim bay lượn trên trời',
        poseName: 'Dang hai tay sang ngang',
        emoji: '🕊️',
        isCorrect: true,
        requiredPose: 'arms_side',
        theme: 'blue',
      },
      {
        id: 'B',
        label: 'Vươn hai tay chữ V lên cao',
        poseName: 'Vươn hai tay chữ V lên cao',
        emoji: '🙆',
        isCorrect: false,
        requiredPose: 'arms_up',
        theme: 'green',
      },
    ],
  },
  {
    id: 4,
    question: 'Khi nói lời cảm ơn bố mẹ lễ phép, bé hãy chắp hai tay trước ngực nhé!',
    hint: 'Làm hai tai thỏ trên đầu (Tư thế A) hoặc Chắp tay trước ngực (Tư thế B)',
    options: [
      {
        id: 'A',
        label: 'Làm hai tai thỏ trên đầu',
        poseName: 'Làm hai tai thỏ trên đầu',
        emoji: '🐰',
        isCorrect: false,
        requiredPose: 'hands_head',
        theme: 'blue',
      },
      {
        id: 'B',
        label: 'Chắp tay cảm ơn lễ phép',
        poseName: 'Chắp hai tay trước ngực',
        emoji: '🧘',
        isCorrect: true,
        requiredPose: 'hands_chest',
        theme: 'green',
      },
    ],
  },
  {
    id: 5,
    question: 'Khi chiến thắng hoặc vui sướng reo hò, bé giơ hai tay lên cao reo hò nào!',
    hint: 'Dang hai tay sang ngang (Tư thế A) hoặc Giơ hai tay lên cao reo hò (Tư thế B)',
    options: [
      {
        id: 'A',
        label: 'Dang hai tay sang ngang',
        poseName: 'Dang hai tay sang ngang',
        emoji: '🤸',
        isCorrect: false,
        requiredPose: 'arms_side',
        theme: 'blue',
      },
      {
        id: 'B',
        label: 'Hoan hô chiến thắng vui tươi!',
        poseName: 'Giơ hai tay lên cao reo hò',
        emoji: '🙌',
        isCorrect: true,
        requiredPose: 'arms_up',
        theme: 'green',
      },
    ],
  },
  {
    id: 6,
    question: 'Bé tập hít thở sâu và giữ tâm trạng bình tĩnh, hãy chắp hai tay trước ngực nào!',
    hint: 'Chắp tay trước ngực (Tư thế A) hoặc Vươn hai tay lên cao (Tư thế B)',
    options: [
      {
        id: 'A',
        label: 'Hít thở điều hòa, tâm trí vui tươi',
        poseName: 'Chắp hai tay trước ngực',
        emoji: '🧘',
        isCorrect: true,
        requiredPose: 'hands_chest',
        theme: 'blue',
      },
      {
        id: 'B',
        label: 'Vươn hai tay chữ V lên cao',
        poseName: 'Vươn hai tay chữ V lên cao',
        emoji: '🙆',
        isCorrect: false,
        requiredPose: 'arms_up',
        theme: 'green',
      },
    ],
  },
];

export const ParentChildGamesModal: React.FC = () => {
  const {
    gamesCenterOpen,
    setGamesCenterOpen,
    activeGameTab,
    setActiveGameTab,
    tokenStars,
    addTokenStar,
    settings,
    customGameQuestions,
    setGameQuestionEditorOpen,
  } = useAppStore();

  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 680;
  const isSmallMobile = windowWidth < 400;

  const [tab, setTab] = useState<GameTab>(activeGameTab || 'flip');

  // Trạng thái Game 1 (Thẻ Lật)
  const [flipQIndex, setFlipQIndex] = useState(0);
  const [flipSuccess, setFlipSuccess] = useState(false);
  const [flipWrongIds, setFlipWrongIds] = useState<string[]>([]);

  // Trạng thái Game 2 (Kéo Thả Nối Ý - 3 Lựa Chọn)
  const [matchingIndex, setMatchingIndex] = useState(0);
  const [matchingSuccess, setMatchingSuccess] = useState(false);
  const [matchingWrongIds, setMatchingWrongIds] = useState<string[]>([]);
  const [selectedMatchingId, setSelectedMatchingId] = useState<string | null>(null);
  const [showDailyLife, setShowDailyLife] = useState(false);

  // Trạng thái Game 3 (Quiz Nghiêng Đầu - 6 câu hỏi, Nghiêng > 15°)
  const [tiltQIndex, setTiltQIndex] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(0); // Góc nghiêng từ -45° đến +45°
  const [activeTiltChoice, setActiveTiltChoice] = useState<'left' | 'right' | null>(null);
  const [tiltHoldProgress, setTiltHoldProgress] = useState(0); // 0.0 -> 1.0 (Giữ nghiêng 1s)
  const [tiltSuccess, setTiltSuccess] = useState(false);
  const [isTiltCooldown, setIsTiltCooldown] = useState(false);
  const [tiltFeedbackText, setTiltFeedbackText] = useState<string | null>(null);
  const [wrongTiltChoice, setWrongTiltChoice] = useState<'left' | 'right' | null>(null);

  // Trạng thái Game 4 (Trắc Nghiệm Cảm Xúc)
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  // Trạng thái Game 5 (Thể Dục Nhận Diện Tư Thế Camera - 6 câu hỏi, Giữ dáng 1.5s Dwell Hold Timer)
  const [poseQIndex, setPoseQIndex] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [activeDetectedPose, setActiveDetectedPose] = useState<'A' | 'B' | null>(null);
  const [skeletonPose, setSkeletonPose] = useState<'neutral' | 'arms_up' | 'hands_head' | 'hands_chest' | 'arms_side'>('neutral');
  const [holdProgress, setHoldProgress] = useState(0); // 0.0 -> 1.0 (Giữ dáng 1.5s)
  const [poseSuccess, setPoseSuccess] = useState(false);
  const [completedPoseCount, setCompletedPoseCount] = useState(0);
  const [cameraMotionLevel, setCameraMotionLevel] = useState(0);
  const [detectedPoseFeedback, setDetectedPoseFeedback] = useState<string>('Đang quét chuyển động cơ thể...');
  const [isPoseCooldown, setIsPoseCooldown] = useState(false);
  const [isPoseMuted, setIsPoseMuted] = useState(false);

  // Trạng thái tích hợp Google MediaPipe AI (CDN Vision)
  const [faceAiStatus, setFaceAiStatus] = useState<MediaPipeStatus>(mediaPipeService.getFaceStatus());
  const [poseAiStatus, setPoseAiStatus] = useState<MediaPipeStatus>(mediaPipeService.getPoseStatus());
  const [isFaceAiMediaPipe, setIsFaceAiMediaPipe] = useState(false);
  const [isPoseAiMediaPipe, setIsPoseAiMediaPipe] = useState(false);

  useEffect(() => {
    const unsub = mediaPipeService.subscribeStatus((type, status) => {
      if (type === 'face') setFaceAiStatus(status);
      if (type === 'pose') setPoseAiStatus(status);
    });
    return unsub;
  }, []);

  // Hiệu ứng thở / nhịp điệu
  const [scaleAnim] = useState(new Animated.Value(1));

  const childCallName = settings.childName?.trim()
    ? settings.childName.trim().startsWith('Bé ') || settings.childName.trim().startsWith('Bạn ')
      ? settings.childName.trim()
      : `Bé ${settings.childName.trim()}`
    : 'Bé';

  useEffect(() => {
    if (activeGameTab) {
      setTab(activeGameTab);
    }
  }, [activeGameTab]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerVibrate = () => {
    try {
      if (Platform.OS !== 'web') Vibration.vibrate(35);
    } catch {}
  };

  // --- XỬ LÝ GAME 1: THẺ LẬT ---
  const allFlipQuestions = [...FLIP_QUESTIONS, ...(customGameQuestions?.flip || [])];
  const currentFlip = allFlipQuestions[flipQIndex % allFlipQuestions.length] || allFlipQuestions[0];
  const handleFlipChoose = (option: { id: string; label: string; isCorrect: boolean }) => {
    if (flipSuccess) return;
    if (option.isCorrect) {
      triggerVibrate();
      setFlipSuccess(true);
      audioService.playPraise(`Đúng rồi! Đây chính là ${option.label}!`);
      addTokenStar();
    } else {
      triggerVibrate();
      if (!flipWrongIds.includes(option.id)) {
        setFlipWrongIds([...flipWrongIds, option.id]);
      }
      audioService.playGentleRetry();
    }
  };

  const nextFlipQuestion = () => {
    setFlipSuccess(false);
    setFlipWrongIds([]);
    setFlipQIndex((prev) => (prev + 1) % allFlipQuestions.length);
  };

  // --- XỬ LÝ GAME 2: NỐI Ý (3 LỰA CHỌN) ---
  const currentPairList = showDailyLife
    ? DAILY_LIFE_QUESTIONS
    : [...MATCHING_PAIRS, ...(customGameQuestions?.matching || [])];
  const currentPair = currentPairList[matchingIndex % currentPairList.length] || currentPairList[0];

  const handleMatchingOptionChoose = (opt: MatchingOptionItem) => {
    if (matchingSuccess) return;

    if (opt.isCorrect) {
      triggerVibrate();
      setMatchingSuccess(true);
      setSelectedMatchingId(opt.id);
      audioService.playPopSound(1.2);
      audioService.playPraise(`Ghép đúng rồi! ${currentPair.question} đi cùng ${opt.label}!`);
      addTokenStar();
    } else {
      triggerVibrate();
      if (!matchingWrongIds.includes(opt.id)) {
        setMatchingWrongIds([...matchingWrongIds, opt.id]);
      }
      audioService.playGentleRetry();
    }
  };

  const nextPair = () => {
    setMatchingSuccess(false);
    setMatchingWrongIds([]);
    setSelectedMatchingId(null);
    setMatchingIndex((prev) => (prev + 1) % currentPairList.length);
  };

  // --- XỬ LÝ GAME 3: QUIZ NGHIÊNG ĐẦU CAMERA (6 CÂU HỎI, NGHIÊNG > 15°) ---
  const allTiltQuestions = [...HEAD_TILT_QUESTIONS, ...(customGameQuestions?.puzzle || [])];
  const currentTiltQ = allTiltQuestions[tiltQIndex % allTiltQuestions.length] || allTiltQuestions[0];

  // Kích hoạt nạp mô hình Google MediaPipe Face AI khi mở Tab Game 3
  useEffect(() => {
    if (gamesCenterOpen && tab === 'puzzle' && isCameraActive) {
      mediaPipeService.initFaceLandmarker().catch(() => {});
    }
  }, [gamesCenterOpen, tab, isCameraActive]);

  // Thuật toán nhận diện góc nghiêng đầu và đếm thời gian giữ yên 1.0s liên tục (Dwell Time 1000ms)
  useEffect(() => {
    if (!gamesCenterOpen || tab !== 'puzzle' || !isCameraActive || tiltSuccess || isTiltCooldown) {
      return;
    }

    let isCancelled = false;
    let timerId: any = null;
    let currentHoldingDir: 'left' | 'right' | null = null;
    let holdStartTime = 0;

    const scanTiltFrame = () => {
      if (isCancelled) return;

      const videoEl = document.getElementById('headTiltCam') as HTMLVideoElement;
      if (videoEl && videoEl.readyState >= 2) {
        try {
          const res = mediaPipeService.detectHeadTilt(videoEl);
          if (res.success) {
            setTiltAngle(res.angle);
            setIsFaceAiMediaPipe(res.isMediaPipe);

            const now = Date.now();
            const detectedDir = res.direction; // 'left' | 'right' | null

            if (detectedDir) {
              if (currentHoldingDir !== detectedDir) {
                currentHoldingDir = detectedDir;
                holdStartTime = now;
                setActiveTiltChoice(detectedDir);
                setTiltHoldProgress(0);
              } else {
                const elapsed = now - holdStartTime;
                const progress = Math.min(1.0, elapsed / 1000); // 1.0 giây Dwell Time
                setTiltHoldProgress(progress);

                if (progress >= 1.0) {
                  const finalDir = currentHoldingDir;
                  currentHoldingDir = null;
                  holdStartTime = 0;
                  setTiltHoldProgress(0);
                  setActiveTiltChoice(null);
                  handleTiltAnswerConfirmed(finalDir);
                  return; // Tạm dừng quét cho vòng hiện tại
                }
              }
            } else {
              // Đầu thẳng hoặc về vùng giữa (<15°) -> Reset tiến trình ngay lập tức
              if (currentHoldingDir !== null) {
                currentHoldingDir = null;
                holdStartTime = 0;
                setTiltHoldProgress(0);
                setActiveTiltChoice(null);
              }
            }
          }
        } catch {}
      }

      timerId = setTimeout(scanTiltFrame, 65);
    };

    timerId = setTimeout(scanTiltFrame, 150);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      currentHoldingDir = null;
      holdStartTime = 0;
    };
  }, [gamesCenterOpen, tab, isCameraActive, tiltSuccess, tiltQIndex, isTiltCooldown]);

  const handleTiltAnswerConfirmed = (direction: 'left' | 'right') => {
    if (isTiltCooldown || tiltSuccess) return;
    triggerVibrate();
    const chosen = currentTiltQ.options[direction];
    const targetCorrect = currentTiltQ.options.left.isCorrect ? currentTiltQ.options.left : currentTiltQ.options.right;

    if (chosen.isCorrect) {
      setTiltSuccess(true);
      setWrongTiltChoice(null);
      setTiltFeedbackText(null);
      audioService.playPopSound(1.25);
      audioService.playPraise(`Chính xác! ${childCallName} đã nghiêng đầu chọn đúng ${chosen.label}!`);
      addTokenStar();
    } else {
      // Phản hồi êm dịu, thông báo rõ ràng cho bé biết đáp án chưa đúng và hướng dẫn bé đổi bên
      setTiltHoldProgress(0);
      setActiveTiltChoice(null);
      setWrongTiltChoice(direction);
      setIsTiltCooldown(true);
      audioService.playGentleRetry();
      setTiltFeedbackText(`💡 Gợi ý: "${chosen.label}" chưa đúng. Bé hãy nghiêng đầu sang "${targetCorrect.label}" nhé!`);

      // Khoảng nghỉ 2.2 giây để bé đổi hướng đầu
      setTimeout(() => {
        setIsTiltCooldown(false);
        setWrongTiltChoice(null);
        setTiltFeedbackText(null);
      }, 2200);
    }
  };

  const nextTiltQuestion = () => {
    setTiltSuccess(false);
    setTiltHoldProgress(0);
    setActiveTiltChoice(null);
    setWrongTiltChoice(null);
    setTiltFeedbackText(null);
    setIsTiltCooldown(false);
    setTiltAngle(0);
    setTiltQIndex((prev) => (prev + 1) % allTiltQuestions.length);
  };

  // --- XỬ LÝ GAME 4: TRẮC NGHIỆM CẢM XÚC ---
  const allQuizQuestions = [...EMOTIONAL_QUIZZES, ...(customGameQuestions?.quiz || [])];
  const currentQuiz = allQuizQuestions[quizIndex % allQuizQuestions.length] || allQuizQuestions[0];
  const handleQuizChoose = (optIndex: number) => {
    triggerVibrate();
    setQuizAnswered(optIndex);
    const chosen = currentQuiz.options[optIndex];
    audioService.playPrompt(chosen.praise);
    addTokenStar();
  };

  const nextQuiz = () => {
    setQuizAnswered(null);
    setQuizIndex((prev) => (prev + 1) % allQuizQuestions.length);
  };

  // Tự động kích hoạt Camera khi mở Tab Nghiêng đầu hoặc Thể dục
  useEffect(() => {
    if (gamesCenterOpen && (tab === 'puzzle' || tab === 'movement')) {
      setIsCameraActive(true);
    }
  }, [gamesCenterOpen, tab]);

  // Khởi tạo / Dừng Camera người dùng (Triệt để ngắt mic & audio để không bị ồn/rít)
  useEffect(() => {
    let localStream: any = null;

    if (gamesCenterOpen && (tab === 'puzzle' || tab === 'movement') && isCameraActive) {
      if (typeof navigator !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          })
          .then((stream) => {
            localStream = stream;
            // Triệt để ngắt và dừng mọi track audio nếu driver webcam gắn kèm
            try {
              stream.getAudioTracks().forEach((track: any) => {
                track.enabled = false;
                track.stop();
              });
            } catch {}

            setCameraPermissionGranted(true);
            const camId = tab === 'puzzle' ? 'headTiltCam' : 'exercisePoseCam';
            const videoEl = document.getElementById(camId) as HTMLVideoElement;
            if (videoEl) {
              videoEl.muted = true;
              videoEl.defaultMuted = true;
              videoEl.volume = 0;
              videoEl.srcObject = stream;
              videoEl.onloadedmetadata = () => {
                videoEl.muted = true;
                videoEl.volume = 0;
                videoEl.play().catch(() => {});
              };
              videoEl.play().catch(() => {});
            }
          })
          .catch((err) => {
            console.warn('Lỗi Camera hoặc người dùng từ chối quyền:', err);
            setCameraPermissionGranted(false);
          });
      } else {
        setCameraPermissionGranted(false);
      }
    }

    return () => {
      if (localStream) {
        try {
          localStream.getTracks().forEach((track: any) => track.stop());
        } catch {}
      }
    };
  }, [gamesCenterOpen, tab, isCameraActive]);

  // --- XỬ LÝ GAME 5: THỂ DỤC NHẬN DIỆN TƯ THẾ CAMERA (6 CÂU HỎI & GIỮ DÁNG 1.5s) ---
  const allPoseQuestions = [...POSE_EXERCISE_QUESTIONS, ...(customGameQuestions?.movement || [])];
  const currentPoseQ = allPoseQuestions[poseQIndex % allPoseQuestions.length] || allPoseQuestions[0];

  // Kích hoạt nạp mô hình Google MediaPipe Pose AI khi mở Tab Game 5
  useEffect(() => {
    if (gamesCenterOpen && tab === 'movement' && isCameraActive) {
      mediaPipeService.initPoseLandmarker().catch(() => {});
    }
  }, [gamesCenterOpen, tab, isCameraActive]);

  // Đổi câu hỏi thì reset bộ nhớ năng lượng
  useEffect(() => {
    mediaPipeService.resetEnergies();
  }, [poseQIndex]);

  // THUẬT TOÁN NHẬN DIỆN TƯ THẾ THỰC THỜI VÀ ĐẾM GIỮ DÁNG 1.5s LIÊN TỤC (Google MediaPipe AI 33 Landmarks kèm Fallback Heuristic)
  useEffect(() => {
    if (!gamesCenterOpen || tab !== 'movement' || !isCameraActive || poseSuccess || isPoseCooldown) {
      return;
    }

    let isCancelled = false;
    let timerId: any = null;
    let activeHoldingPose: 'A' | 'B' | null = null;
    let holdStartTime = 0;

    const runVisionScan = () => {
      if (isCancelled) return;

      const videoEl = document.getElementById('exercisePoseCam') as HTMLVideoElement;
      if (videoEl && videoEl.readyState >= 2) {
        try {
          const res = mediaPipeService.detectExercisePose(videoEl);
          if (res.success) {
            setIsPoseAiMediaPipe(res.isMediaPipe);
            if (res.motionLevel !== undefined) {
              setCameraMotionLevel(res.motionLevel);
            }

            const optA = currentPoseQ.options.find((o) => o.id === 'A')!;
            const optB = currentPoseQ.options.find((o) => o.id === 'B')!;

            const scoreA = res.scores[optA.requiredPose] || 0;
            const scoreB = res.scores[optB.requiredPose] || 0;

            const THRESHOLD = res.isMediaPipe ? 45 : 30;
            let currentDetected: 'A' | 'B' | null = null;

            if (scoreA > THRESHOLD && scoreA > scoreB * 1.2) {
              currentDetected = 'A';
            } else if (scoreB > THRESHOLD && scoreB > scoreA * 1.2) {
              currentDetected = 'B';
            }

            const now = Date.now();

            if (currentDetected) {
              if (activeHoldingPose !== currentDetected) {
                activeHoldingPose = currentDetected;
                holdStartTime = now;
                setActiveDetectedPose(currentDetected);
                setHoldProgress(0);
                const matched = currentDetected === 'A' ? optA : optB;
                setDetectedPoseFeedback(`🟢 Đang nhận diện: ${matched.poseName}`);
                setSkeletonPose(matched.requiredPose);
              } else {
                const elapsed = now - holdStartTime;
                const progress = Math.min(1.0, elapsed / 1500); // 1.5 giây giữ dáng liên tục
                setHoldProgress(progress);
                const matched = currentDetected === 'A' ? optA : optB;
                setDetectedPoseFeedback(`🟢 Đang giữ dáng: ${matched.poseName} (${Math.round(progress * 100)}%)`);

                if (progress >= 1.0) {
                  const finalPose = activeHoldingPose;
                  activeHoldingPose = null;
                  holdStartTime = 0;
                  setHoldProgress(0);
                  setActiveDetectedPose(null);
                  handlePoseConfirmed(finalPose);
                  return; // Tạm dừng quét cho vòng hiện tại
                }
              }
            } else {
              // Bé hạ tay hoặc không duy trì dáng -> Reset tiến trình ngay lập tức
              if (activeHoldingPose !== null) {
                activeHoldingPose = null;
                holdStartTime = 0;
                setHoldProgress(0);
                setActiveDetectedPose(null);
                setSkeletonPose('neutral');
                setDetectedPoseFeedback('🔍 Đang quét chuyển động cơ thể...');
              }
            }
          }
        } catch {}
      }

      timerId = setTimeout(runVisionScan, 80);
    };

    timerId = setTimeout(runVisionScan, 200);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      activeHoldingPose = null;
      holdStartTime = 0;
    };
  }, [gamesCenterOpen, tab, isCameraActive, poseSuccess, poseQIndex, isPoseCooldown]);

  const handleManualPoseSelect = (poseId: 'A' | 'B') => {
    if (poseSuccess || isPoseCooldown) return;
    triggerVibrate();
    setActiveDetectedPose(poseId);
    const chosen = currentPoseQ.options.find((o) => o.id === poseId);
    if (chosen) {
      setDetectedPoseFeedback(`🟢 Đã chọn: ${chosen.poseName}`);
      setSkeletonPose(chosen.requiredPose);
      handlePoseConfirmed(poseId);
    }
  };

  const handlePoseConfirmed = (poseId: 'A' | 'B') => {
    if (isPoseCooldown) return;
    triggerVibrate();
    const chosen = currentPoseQ.options.find((o) => o.id === poseId);
    const targetCorrect = currentPoseQ.options.find((o) => o.isCorrect);

    if (chosen?.isCorrect) {
      setPoseSuccess(true);
      setCompletedPoseCount((c) => c + 1);
      if (!isPoseMuted) {
        audioService.playPopSound(1.25);
        audioService.playPraise(`Tuyệt vời! ${childCallName} đã làm đúng tư thế ${chosen.poseName}!`);
      }
      addTokenStar();
    } else {
      // Phản hồi êm dịu, âm thanh thử lại nhẹ nhàng và hướng dẫn bé đổi sang tư thế đúng
      setHoldProgress(0);
      setActiveDetectedPose(null);
      setSkeletonPose('neutral');
      setIsPoseCooldown(true);
      audioService.playGentleRetry();
      setDetectedPoseFeedback(`💡 Bé vừa làm "${chosen?.poseName || ''}". Gợi ý: Hãy thử động tác "${targetCorrect?.poseName || ''}" nhé!`);

      // Khoảng lặng 2.5s để bé đổi tư thế
      setTimeout(() => {
        setIsPoseCooldown(false);
        setDetectedPoseFeedback('🔍 Đang quét chuyển động cơ thể...');
      }, 2500);
    }
  };

  const nextPoseQuestion = () => {
    audioService.stopAll();
    setPoseSuccess(false);
    setHoldProgress(0);
    setActiveDetectedPose(null);
    setIsPoseCooldown(false);
    setSkeletonPose('neutral');
    setDetectedPoseFeedback('🔍 Đang quét chuyển động cơ thể...');
    setPoseQIndex((prev) => (prev + 1) % allPoseQuestions.length);
  };

  return (
    <Modal visible={gamesCenterOpen} animationType="slide" transparent>
      <View style={[styles.modalOverlay, isMobile && { padding: 0 }]}>
        <View
          style={[
            styles.modalContainer,
            isMobile && {
              maxWidth: '100%',
              maxHeight: '100%',
              height: '100%',
              borderRadius: 0,
            },
          ]}
        >
          {/* HEADER MODAL */}
          <View style={[styles.header, isMobile && { paddingHorizontal: 12, paddingVertical: 10 }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.mascotIconBadge, isMobile && { width: 36, height: 36, borderRadius: 18 }]}>
                <Text style={{ fontSize: isMobile ? 18 : 22 }}>🦖</Text>
              </View>
              <View>
                <Text style={[styles.headerTitle, isMobile && { fontSize: 15 }]}>Góc Vui Học Cùng Bố Mẹ</Text>
                <Text style={[styles.headerSubtitle, isMobile && { fontSize: 11 }]}>
                  {childCallName} • ⭐ {tokenStars}/3
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={[styles.addQuestionHeaderBtn, isMobile && { paddingHorizontal: 8, paddingVertical: 5 }]}
                onPress={() => setGameQuestionEditorOpen(true, tab)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={isMobile ? 16 : 18} color={UI_COLORS.primary} />
                <Text style={[styles.addQuestionHeaderBtnText, isMobile && { fontSize: 11 }]}>
                  {isSmallMobile ? 'Thêm' : 'Thêm câu hỏi'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeBtn, isMobile && { width: 32, height: 32, borderRadius: 16 }]}
                onPress={() => setGamesCenterOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={isMobile ? 20 : 24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* TAB BAR 5 TRÒ CHƠI */}
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabScroll, isMobile && { paddingHorizontal: 8, paddingVertical: 6, gap: 6 }]}>
              <TouchableOpacity
                style={[styles.tabItem, isMobile && { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, tab === 'flip' && styles.tabItemActive]}
                onPress={() => {
                  setTab('flip');
                  setActiveGameTab('flip');
                }}
              >
                <Text style={[styles.tabEmoji, isMobile && { fontSize: 14 }]}>🎴</Text>
                <Text style={[styles.tabText, isMobile && { fontSize: 11 }, tab === 'flip' && styles.tabTextActive]}>1. Thẻ Lật</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, isMobile && { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, tab === 'matching' && styles.tabItemActive]}
                onPress={() => {
                  setTab('matching');
                  setActiveGameTab('matching');
                }}
              >
                <Text style={[styles.tabEmoji, isMobile && { fontSize: 14 }]}>🧩</Text>
                <Text style={[styles.tabText, isMobile && { fontSize: 11 }, tab === 'matching' && styles.tabTextActive]}>2. Nối Ý</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, isMobile && { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, tab === 'puzzle' && styles.tabItemActive]}
                onPress={() => {
                  setTab('puzzle');
                  setActiveGameTab('puzzle');
                }}
              >
                <Text style={[styles.tabEmoji, isMobile && { fontSize: 14 }]}>↔️</Text>
                <Text style={[styles.tabText, isMobile && { fontSize: 11 }, tab === 'puzzle' && styles.tabTextActive]}>3. Nghiêng Đầu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, isMobile && { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, tab === 'quiz' && styles.tabItemActive]}
                onPress={() => {
                  setTab('quiz');
                  setActiveGameTab('quiz');
                }}
              >
                <Text style={[styles.tabEmoji, isMobile && { fontSize: 14 }]}>💖</Text>
                <Text style={[styles.tabText, isMobile && { fontSize: 11 }, tab === 'quiz' && styles.tabTextActive]}>4. Trắc Nghiệm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, isMobile && { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, tab === 'movement' && styles.tabItemActive]}
                onPress={() => {
                  setTab('movement');
                  setActiveGameTab('movement');
                }}
              >
                <Text style={[styles.tabEmoji, isMobile && { fontSize: 14 }]}>🤸</Text>
                <Text style={[styles.tabText, isMobile && { fontSize: 11 }, tab === 'movement' && styles.tabTextActive]}>5. Thể Dục</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* NỘI DUNG TỪNG TRÒ CHƠI */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* ============================================================ */}
            {/* GAME 1: THẺ LẬT - THẺ HỌC NHÓM */}
            {/* ============================================================ */}
            {tab === 'flip' && (
              <View style={styles.gameWrapper}>
                <View style={[styles.parentTipBox, isMobile && { padding: 8, marginBottom: 8 }]}>
                  <Text style={[styles.parentTipTitle, isMobile && { fontSize: 11, marginBottom: 2 }]}>💡 Lời khuyên cho Bố Mẹ:</Text>
                  <Text style={[styles.parentTipText, isMobile && { fontSize: 11, lineHeight: 15 }]}>
                    Bố mẹ cùng con lật mở thẻ và gọi to tên đồ vật. Khi con chạm đúng, hãy khen ngợi và ôm con nhé!
                  </Text>
                </View>

                <View style={[styles.questionCard, isMobile && { padding: 10, marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={styles.questionIndexText}>Câu {flipQIndex + 1} / {allFlipQuestions.length}</Text>
                    {currentFlip.isCustom && (
                      <View style={styles.customBadge}>
                        <Ionicons name="sparkles" size={11} color="#D97706" />
                        <Text style={styles.customBadgeText}>Câu hỏi của Bố Mẹ</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.questionTitle, isMobile && { fontSize: 15, lineHeight: 20, marginBottom: 6 }]}>{currentFlip.question}</Text>

                  <TouchableOpacity
                    style={[styles.audioPromptBtn, isMobile && { paddingHorizontal: 10, paddingVertical: 4 }]}
                    onPress={() => audioService.playPrompt(`${childCallName} ơi! ${currentFlip.question}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="volume-high" size={isMobile ? 16 : 20} color="#0284C7" />
                    <Text style={[styles.audioPromptText, isMobile && { fontSize: 11 }]}>Đọc câu hỏi</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.cardsRow, isMobile && { gap: 8 }]}>
                  {currentFlip.options.map((opt) => {
                    const isDimmed = flipWrongIds.includes(opt.id);
                    const isChosenCorrect = flipSuccess && opt.isCorrect;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.flipCardItem,
                          isMobile && {
                            width: isSmallMobile ? 94 : 102,
                            height: isSmallMobile ? 108 : 118,
                            padding: 4,
                            borderRadius: 12,
                          },
                          isDimmed && styles.cardDimmed,
                          isChosenCorrect && styles.cardCorrectGlow,
                        ]}
                        onPress={() => handleFlipChoose(opt)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.cardEmojiLarge, isMobile && { fontSize: 36, marginBottom: 2 }]}>{opt.emoji}</Text>
                        <Text style={[styles.cardLabelText, isMobile && { fontSize: 12, lineHeight: 15 }, isChosenCorrect && styles.cardLabelCorrect]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {flipSuccess && (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>🎉 Hoan hô! {childCallName} giỏi lắm!</Text>
                    <TouchableOpacity style={styles.nextQuestionBtn} onPress={nextFlipQuestion}>
                      <Text style={styles.nextQuestionBtnText}>Sang câu tiếp theo ➡️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ============================================================ */}
            {/* GAME 2: KÉO THẢ - NỐI Ý LOGIC */}
            {/* ============================================================ */}
            {tab === 'matching' && (
              <View style={styles.gameWrapper}>
                <View style={[styles.parentTipBox, isMobile && { padding: 8, marginBottom: 8 }]}>
                  <Text style={[styles.parentTipTitle, isMobile && { fontSize: 11, marginBottom: 2 }]}>💡 Hướng dẫn Bố Mẹ:</Text>
                  <Text style={[styles.parentTipText, isMobile && { fontSize: 11, lineHeight: 15 }]}>
                    Tập cho con nhận biết công dụng đồ vật hàng ngày. Con có thể chỉ tay và bố mẹ chạm giúp con nhé!
                  </Text>
                </View>

                <View style={[styles.toggleRow, isMobile && { gap: 6, marginBottom: 8 }]}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, isMobile && { paddingHorizontal: 10, paddingVertical: 5 }, !showDailyLife && styles.toggleBtnActive]}
                    onPress={() => {
                      setShowDailyLife(false);
                      setMatchingIndex(0);
                      setMatchingSuccess(false);
                      setMatchingWrongIds([]);
                      setSelectedMatchingId(null);
                    }}
                  >
                    <Text style={[styles.toggleBtnText, isMobile && { fontSize: 11 }, !showDailyLife && styles.toggleBtnTextActive]}>
                      Đồ vật & Công dụng ({currentPairList.length} câu)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, isMobile && { paddingHorizontal: 10, paddingVertical: 5 }, showDailyLife && styles.toggleBtnActive]}
                    onPress={() => {
                      setShowDailyLife(true);
                      setMatchingIndex(0);
                      setMatchingSuccess(false);
                      setMatchingWrongIds([]);
                      setSelectedMatchingId(null);
                    }}
                  >
                    <Text style={[styles.toggleBtnText, isMobile && { fontSize: 11 }, showDailyLife && styles.toggleBtnTextActive]}>
                      Thói quen sinh hoạt (3 câu)
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.matchingQuestionBox, isMobile && { padding: 10, gap: 4 }]}>
                  {currentPair.isCustom && (
                    <View style={styles.customBadge}>
                      <Ionicons name="sparkles" size={11} color="#D97706" />
                      <Text style={styles.customBadgeText}>Câu hỏi của Bố Mẹ</Text>
                    </View>
                  )}
                  <Text style={[styles.matchingIcon, isMobile && { fontSize: 32 }]}>{currentPair.questionIcon || (currentPair as any).icon}</Text>
                  <Text style={[styles.matchingQuestionText, isMobile && { fontSize: 15, lineHeight: 20 }]}>{currentPair.question}</Text>
                  <TouchableOpacity
                    style={[styles.speakerMiniBtn, isMobile && { paddingHorizontal: 8, paddingVertical: 3 }]}
                    onPress={() => audioService.playPrompt(`${childCallName} ơi! ${currentPair.question}`)}
                  >
                    <Ionicons name="volume-medium" size={isMobile ? 15 : 18} color="#0369A1" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.matchingTargetBox, isMobile && { gap: 6, marginTop: 4 }]}>
                  <Text style={[styles.matchingTargetLabel, isMobile && { fontSize: 12 }]}>Chọn 1 trong 3 đáp án ghép đôi:</Text>
                  <View style={[styles.matchingOptionsList, isMobile && { gap: 8 }]}>
                    {currentPair.options.map((opt) => {
                      const isDimmed = matchingWrongIds.includes(opt.id);
                      const isChosenCorrect = matchingSuccess && opt.isCorrect;

                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.matchingAnswerBtn,
                            isMobile && { padding: 10, borderRadius: 12, gap: 8 },
                            isDimmed && styles.matchingCardDimmed,
                            isChosenCorrect && styles.matchingAnswerBtnSuccess,
                          ]}
                          onPress={() => handleMatchingOptionChoose(opt)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.matchingAnswerEmoji, isMobile && { fontSize: 24 }]}>{opt.icon}</Text>
                          <Text
                            style={[
                              styles.matchingAnswerText,
                              isMobile && { fontSize: 13 },
                              isChosenCorrect && styles.matchingAnswerTextSuccess,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isChosenCorrect && (
                            <Ionicons name="checkmark-circle" size={isMobile ? 18 : 24} color="#16A34A" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {matchingSuccess && (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>⭐ Ghép đúng rồi! Bé được thưởng sao!</Text>
                    <TouchableOpacity style={styles.nextQuestionBtn} onPress={nextPair}>
                      <Text style={styles.nextQuestionBtnText}>Câu tiếp theo ➡️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ============================================================ */}
            {/* GAME 3: QUIZ NGHIÊNG ĐẦU (HEAD TILT DISCRIMINATION - 6 CÂU HỎI) */}
            {/* ============================================================ */}
            {tab === 'puzzle' && (
              <View style={styles.gameWrapper}>
                {/* BANNER HƯỚNG DẪN QUIZ NGHIÊNG ĐẦU */}
                {isMobile ? (
                  <View style={[styles.tiltRulesBox, { padding: 8, marginBottom: 8 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 15 }}>↔️</Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E', flex: 1 }}>
                        Nghiêng đầu sang Trái hoặc Phải &gt; 15° để chọn đáp án tương ứng
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.tiltRulesBox}>
                    <View style={styles.tiltRuleRow}>
                      <Text style={styles.tiltRuleIcon}>📷</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tiltRuleTitle}>1. Cho phép truy cập camera</Text>
                        <Text style={styles.tiltRuleDesc}>
                          Trò chơi cần camera để nhận diện khuôn mặt. Bấm "Cho phép" (Allow) ở góc trên trình duyệt.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tiltRuleRow}>
                      <Text style={styles.tiltRuleIcon}>↔️</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tiltRuleTitle}>2. Nghiêng đầu để chọn đáp án</Text>
                        <Text style={styles.tiltRuleDesc}>
                          Nghiêng sang trái hoặc phải để chọn đáp án. Cần nghiêng hơn 15° để xác nhận.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tiltRuleRow}>
                      <Text style={styles.tiltRuleIcon}>⏱️</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tiltRuleTitle}>3. Giữ yên nghiêng đầu 1 giây</Text>
                        <Text style={styles.tiltRuleDesc}>
                          Giữ yên góc nghiêng trong 1 giây để hoàn tất lựa chọn và nhận sao thưởng cho {childCallName}.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* KHUNG CÂU HỎI */}
                <View style={[styles.questionCard, isMobile && { padding: 10, marginBottom: 8 }]}>
                  <View style={styles.questionBadgeRow}>
                    <Text style={[styles.questionIndexText, isMobile && { fontSize: 11 }]}>
                      Câu {tiltQIndex + 1} / {allTiltQuestions.length}
                    </Text>
                    {currentTiltQ.isCustom && (
                      <View style={styles.customBadge}>
                        <Ionicons name="sparkles" size={11} color="#D97706" />
                        <Text style={styles.customBadgeText}>Câu hỏi của Bố Mẹ</Text>
                      </View>
                    )}
                    <View style={styles.tiltStudentBadge}>
                      <Text style={[styles.tiltStudentBadgeText, isMobile && { fontSize: 10 }]}>
                        👶 Lượt của {childCallName}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.questionTitle, isMobile && { fontSize: 16, lineHeight: 22, marginVertical: 4 }]}>{currentTiltQ.question}</Text>

                  <TouchableOpacity
                    style={[styles.audioPromptBtn, isMobile && { paddingHorizontal: 12, paddingVertical: 6 }]}
                    onPress={() => audioService.playPrompt(`${childCallName} ơi! ${currentTiltQ.question}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="volume-high" size={isMobile ? 16 : 20} color="#0284C7" />
                    <Text style={[styles.audioPromptText, isMobile && { fontSize: 12 }]}>Đọc to câu hỏi</Text>
                  </TouchableOpacity>
                </View>

                {/* KHUNG CAMERA NHẬN DIỆN NGHIÊNG ĐẦU */}
                <View style={[styles.cameraContainer, isMobile && { marginBottom: 8 }]}>
                  <View style={styles.liveCameraBox}>
                    {Platform.OS === 'web' ? (
                      <div
                        style={{
                          width: '100%',
                          height: isMobile ? (isSmallMobile ? 150 : 170) : 220,
                          position: 'relative',
                          backgroundColor: '#0F172A',
                          borderRadius: isMobile ? 12 : 16,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <video
                          id="headTiltCam"
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                          }}
                        />
                      </div>
                    ) : (
                      <View style={styles.nativeCameraFallback}>
                        <Text style={{ fontSize: 40 }}>🧑‍🦱</Text>
                        <Text style={styles.nativeCameraText}>Camera nhận diện nghiêng đầu đang chạy</Text>
                      </View>
                    )}

                    {/* VẠCH ĐỊNH VỊ GÓC NGHIÊNG & THƯỚC ĐỘ THỰC TẾ */}
                    <View style={styles.tiltOverlay} pointerEvents="none">
                      {/* Vạch trục dọc và góc nghiêng */}
                      <View style={[styles.tiltHeadGuideBox, { transform: [{ rotate: `${tiltAngle}deg` }] }]}>
                        <View style={styles.tiltHeadCircle} />
                        <View style={styles.tiltCenterLine} />
                      </View>

                      {/* Badge trạng thái AI MediaPipe góc trên bên trái */}
                      <View style={[styles.aiStatusBadge, isFaceAiMediaPipe ? styles.aiStatusBadgeMediaPipe : styles.aiStatusBadgeFallback]}>
                        <Ionicons name={isFaceAiMediaPipe ? 'sparkles' : 'flash-outline'} size={11} color="#FFFFFF" />
                        <Text style={styles.aiStatusBadgeText}>
                          {faceAiStatus === 'loading'
                            ? 'Đang nạp MediaPipe...'
                            : isFaceAiMediaPipe
                            ? 'Google MediaPipe Face AI'
                            : 'AI Quang Học (Offline)'}
                        </Text>
                      </View>

                      {/* Thước đo góc nghiêng hiển thị số độ */}
                      <View style={styles.tiltAngleBadge}>
                        <Ionicons name="compass-outline" size={14} color="#38BDF8" />
                        <Text style={styles.tiltAngleBadgeText}>
                          Góc: {tiltAngle > 0 ? `+${tiltAngle}°` : `${tiltAngle}°`}
                        </Text>
                      </View>

                      {/* Nhãn hướng dẫn góc 15° */}
                      <View style={styles.tiltThresholdRow}>
                        <View style={[styles.tiltZonePill, tiltAngle < -15 && styles.tiltZonePillActive]}>
                          <Text style={styles.tiltZonePillText}>⬅️ Trái (&gt;15°)</Text>
                        </View>
                        <View style={[styles.tiltZonePill, tiltAngle > 15 && styles.tiltZonePillActive]}>
                          <Text style={styles.tiltZonePillText}>Phải (&gt;15°) ➡️</Text>
                        </View>
                      </View>
                    </View>

                    {/* BĂNG TRẠNG THÁI TIẾN TRÌNH XÁC NHẬN */}
                    <View style={styles.poseStatusFloatingBar}>
                      {activeTiltChoice ? (
                        <View style={styles.poseDetectedBanner}>
                          <Text style={styles.poseDetectedText}>
                            🟢 Đang nghiêng {activeTiltChoice === 'left' ? 'TRÁI ⬅️' : 'PHẢI ➡️'} ({Math.abs(tiltAngle)}° &gt; 15°)! Giữ yên để chọn...
                          </Text>
                          <View style={styles.holdProgressBarBg}>
                            <View
                              style={[
                                styles.holdProgressBarFill,
                                { width: `${Math.round(tiltHoldProgress * 100)}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.holdProgressPercentText}>
                            Xác nhận: {Math.round(tiltHoldProgress * 100)}%
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.poseScanningRow}>
                          <Ionicons name={tiltFeedbackText ? "bulb-outline" : "swap-horizontal-outline"} size={18} color={tiltFeedbackText ? "#F59E0B" : "#38BDF8"} />
                          <Text style={[styles.scanningPoseText, tiltFeedbackText && { color: '#F59E0B', fontWeight: '700' }]}>
                            {tiltFeedbackText || 'Nghiêng đầu sang Trái hoặc Phải hơn 15° để chọn'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* 2 Ô ĐÁP ÁN TRÁI / PHẢI ĐỐI XỨNG */}
                <View style={[styles.tiltCardsRow, isMobile && { gap: 8 }]}>
                  {/* Ô ĐÁP ÁN TRÁI */}
                  <TouchableOpacity
                    style={[
                      styles.tiltCardItem,
                      isMobile && { padding: 8, borderRadius: 14 },
                      activeTiltChoice === 'left' && styles.tiltCardActive,
                      wrongTiltChoice === 'left' && styles.tiltCardWrong,
                      tiltSuccess && currentTiltQ.options.left.isCorrect && styles.tiltCardSuccess,
                    ]}
                    onPress={() => handleTiltAnswerConfirmed('left')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.tiltSideBadge, { backgroundColor: '#EFF6FF' }]}>
                      <Text style={[styles.tiltSideBadgeText, isMobile && { fontSize: 9 }, { color: '#1D4ED8' }]}>⬅️ TRÁI</Text>
                    </View>
                    <Text style={[styles.tiltEmojiLarge, isMobile && { fontSize: 34, marginVertical: 2 }]}>{currentTiltQ.options.left.emoji}</Text>
                    <Text style={[styles.tiltLabelText, isMobile && { fontSize: 13 }]}>{currentTiltQ.options.left.label}</Text>

                    {activeTiltChoice === 'left' && !tiltSuccess && (
                      <View style={styles.tiltCardHoldBox}>
                        <View style={styles.tiltCardHoldBg}>
                          <View style={[styles.tiltCardHoldFill, { width: `${Math.round(tiltHoldProgress * 100)}%` }]} />
                        </View>
                        <Text style={styles.tiltCardHoldText}>Đang chọn: {Math.round(tiltHoldProgress * 100)}%</Text>
                      </View>
                    )}

                    {wrongTiltChoice === 'left' && !tiltSuccess && (
                      <View style={[styles.cardSuccessPill, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }, isMobile && { paddingHorizontal: 6, paddingVertical: 3 }]}>
                        <Ionicons name="alert-circle" size={isMobile ? 14 : 18} color="#D97706" />
                        <Text style={[styles.cardSuccessPillText, { color: '#B45309' }, isMobile && { fontSize: 11 }]}>Thử lại 💡</Text>
                      </View>
                    )}

                    {tiltSuccess && currentTiltQ.options.left.isCorrect && (
                      <View style={[styles.cardSuccessPill, isMobile && { paddingHorizontal: 6, paddingVertical: 3 }]}>
                        <Ionicons name="checkmark-circle" size={isMobile ? 14 : 18} color="#16A34A" />
                        <Text style={[styles.cardSuccessPillText, isMobile && { fontSize: 11 }]}>Đúng! ⭐</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Ô ĐÁP ÁN PHẢI */}
                  <TouchableOpacity
                    style={[
                      styles.tiltCardItem,
                      isMobile && { padding: 8, borderRadius: 14 },
                      activeTiltChoice === 'right' && styles.tiltCardActive,
                      wrongTiltChoice === 'right' && styles.tiltCardWrong,
                      tiltSuccess && currentTiltQ.options.right.isCorrect && styles.tiltCardSuccess,
                    ]}
                    onPress={() => handleTiltAnswerConfirmed('right')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.tiltSideBadge, { backgroundColor: '#FDF2F8' }]}>
                      <Text style={[styles.tiltSideBadgeText, isMobile && { fontSize: 9 }, { color: '#BE185D' }]}>PHẢI ➡️</Text>
                    </View>
                    <Text style={[styles.tiltEmojiLarge, isMobile && { fontSize: 34, marginVertical: 2 }]}>{currentTiltQ.options.right.emoji}</Text>
                    <Text style={[styles.tiltLabelText, isMobile && { fontSize: 13 }]}>{currentTiltQ.options.right.label}</Text>

                    {activeTiltChoice === 'right' && !tiltSuccess && (
                      <View style={styles.tiltCardHoldBox}>
                        <View style={styles.tiltCardHoldBg}>
                          <View style={[styles.tiltCardHoldFill, { width: `${Math.round(tiltHoldProgress * 100)}%` }]} />
                        </View>
                        <Text style={styles.tiltCardHoldText}>Đang chọn: {Math.round(tiltHoldProgress * 100)}%</Text>
                      </View>
                    )}

                    {wrongTiltChoice === 'right' && !tiltSuccess && (
                      <View style={[styles.cardSuccessPill, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }, isMobile && { paddingHorizontal: 6, paddingVertical: 3 }]}>
                        <Ionicons name="alert-circle" size={isMobile ? 14 : 18} color="#D97706" />
                        <Text style={[styles.cardSuccessPillText, { color: '#B45309' }, isMobile && { fontSize: 11 }]}>Thử lại 💡</Text>
                      </View>
                    )}

                    {tiltSuccess && currentTiltQ.options.right.isCorrect && (
                      <View style={[styles.cardSuccessPill, isMobile && { paddingHorizontal: 6, paddingVertical: 3 }]}>
                        <Ionicons name="checkmark-circle" size={isMobile ? 14 : 18} color="#16A34A" />
                        <Text style={[styles.cardSuccessPillText, isMobile && { fontSize: 11 }]}>Đúng! ⭐</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* BANNER CHÚC MỪNG HOÀN THÀNH CÂU HỎI */}
                {tiltSuccess && (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>
                      🎉 Xuất sắc! {childCallName} đã nghiêng đầu chọn đúng!
                    </Text>
                    {tiltQIndex + 1 < allTiltQuestions.length ? (
                      <TouchableOpacity style={styles.nextQuestionBtn} onPress={nextTiltQuestion}>
                        <Text style={styles.nextQuestionBtnText}>
                          Câu tiếp theo ({tiltQIndex + 2}/{allTiltQuestions.length}) ➡️
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.nextQuestionBtn} onPress={nextTiltQuestion}>
                        <Text style={styles.nextQuestionBtnText}>
                          🎉 Hoàn thành cả {allTiltQuestions.length} câu! Chơi lại từ đầu 🔄
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* ============================================================ */}
            {/* GAME 4: TRẮC NGHIỆM CẢM XÚC & GIAO TIẾP */}
            {/* ============================================================ */}
            {tab === 'quiz' && (
              <View style={styles.gameWrapper}>
                <View style={[styles.parentTipBox, isMobile && { padding: 8, marginBottom: 8 }]}>
                  <Text style={[styles.parentTipTitle, isMobile && { fontSize: 11, marginBottom: 2 }]}>❤️ Nguyên tắc vàng cho Bố Mẹ:</Text>
                  <Text style={[styles.parentTipText, isMobile && { fontSize: 11, lineHeight: 15 }]}>
                    Không bao giờ xem là "sai" khi con chọn cảm xúc khác dự kiến. Hãy lắng nghe cảm xúc chân thật của con nhé!
                  </Text>
                </View>

                <View style={[styles.questionCard, isMobile && { padding: 10, marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={styles.questionIndexText}>Tình huống {quizIndex + 1} / {allQuizQuestions.length}</Text>
                    {currentQuiz.isCustom && (
                      <View style={styles.customBadge}>
                        <Ionicons name="sparkles" size={11} color="#D97706" />
                        <Text style={styles.customBadgeText}>Câu hỏi của Bố Mẹ</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.questionTitle, isMobile && { fontSize: 15, lineHeight: 20, marginBottom: 4 }]}>{currentQuiz.question}</Text>
                  <Text style={[styles.quizSubTip, isMobile && { fontSize: 10, marginBottom: 6 }]}>({currentQuiz.tip})</Text>

                  <TouchableOpacity
                    style={[styles.audioPromptBtn, isMobile && { paddingHorizontal: 10, paddingVertical: 4 }]}
                    onPress={() => audioService.playPrompt(currentQuiz.question)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="volume-high" size={isMobile ? 16 : 20} color="#0284C7" />
                    <Text style={[styles.audioPromptText, isMobile && { fontSize: 11 }]}>Đọc tình huống</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.quizOptionsCol, isMobile && { gap: 8 }]}>
                  {currentQuiz.options.map((opt, idx) => {
                    const isSelected = quizAnswered === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.quizOptionCard,
                          isMobile && { padding: 10, borderRadius: 12, gap: 8 },
                          isSelected && styles.quizOptionCardSelected,
                        ]}
                        onPress={() => handleQuizChoose(idx)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.quizOptionEmoji, isMobile && { fontSize: 24 }]}>{opt.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.quizOptionLabel, isMobile && { fontSize: 13 }, isSelected && styles.quizOptionLabelSelected]}>
                            {opt.label}
                          </Text>
                        </View>
                        {isSelected && <Ionicons name="heart" size={isMobile ? 18 : 22} color="#E11D48" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {quizAnswered !== null && (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>
                      💬 {currentQuiz.options[quizAnswered].praise}
                    </Text>
                    <TouchableOpacity style={styles.nextQuestionBtn} onPress={nextQuiz}>
                      <Text style={styles.nextQuestionBtnText}>Tình huống tiếp theo ➡️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ============================================================ */}
            {/* GAME 5: THỂ DỤC NHẬN DIỆN TƯ THẾ CAMERA (AI POSE RECOGNITION) */}
            {/* ============================================================ */}
            {tab === 'movement' && (
              <View style={styles.gameWrapper}>
                {/* BANNER HƯỚNG DẪN CHI TIẾT THEO YÊU CẦU */}
                {isMobile ? (
                  <View style={[styles.poseRulesBox, { padding: 6, marginBottom: 6, gap: 4 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 13 }}>🧍</Text>
                      <Text style={{ fontSize: 11, color: '#475569', fontWeight: '600', flex: 1 }}>
                        Thực hiện tư thế theo hình, giữ 1.5s trước camera hoặc chạm vào thẻ để chọn.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.poseRulesBox}>
                    <View style={styles.poseRuleRow}>
                      <Text style={styles.poseRuleIcon}>📷</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.poseRuleTitle}>Camera nhận diện tư thế cơ thể</Text>
                        <Text style={styles.poseRuleDesc}>
                          Đứng cách camera ~1m, đảm bảo ánh sáng tốt và thấy rõ từ đầu đến hông.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.poseRuleRow}>
                      <Text style={styles.poseRuleIcon}>🧍</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.poseRuleTitle}>Mỗi đáp án gắn với 1 tư thế</Text>
                        <Text style={styles.poseRuleDesc}>
                          Xem tên tư thế trên mỗi ô đáp án rồi thực hiện đúng động tác trước camera.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.poseRuleRow}>
                      <Text style={styles.poseRuleIcon}>✅</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.poseRuleTitle}>Giữ dáng 1.5 giây để chọn</Text>
                        <Text style={styles.poseRuleDesc}>
                          Thanh tiến trình sẽ chạy khi camera nhận diện đúng tư thế. Giữ yên cho đến khi đầy!
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 1. TOP QUESTION BANNER (KHUNG CÂU HỎI TRỰC QUAN ĐẦY ĐỦ BỀ NGANG) */}
                <View style={[styles.poseHeaderCard, isMobile && { padding: 8, marginBottom: 6 }]}>
                  <View style={[styles.poseHeaderTopRow, isMobile && { flexWrap: 'wrap', gap: 4 }]}>
                    <View style={styles.poseBadgePill}>
                      <Text style={styles.poseBadgePillText}>
                        CÂU {poseQIndex + 1} / {allPoseQuestions.length}
                      </Text>
                    </View>
                    {currentPoseQ.isCustom && (
                      <View style={styles.customBadge}>
                        <Ionicons name="sparkles" size={11} color="#D97706" />
                        <Text style={styles.customBadgeText}>Bài tập của Bố Mẹ</Text>
                      </View>
                    )}
                    <View style={styles.liveCameraIndicator}>
                      <View style={[styles.statusDot, isCameraActive && styles.statusDotActive]} />
                      <Text style={styles.liveCameraText}>
                        {isCameraActive ? (isMobile ? 'Camera đang bật' : 'Camera AI đang hoạt động') : 'Camera chưa bật'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        style={[styles.poseSpeakerBtn, isMobile && { paddingHorizontal: 6, paddingVertical: 3 }]}
                        onPress={() => {
                          if (isPoseMuted) return;
                          audioService.playPrompt(`${childCallName} ơi! ${currentPoseQ.question}`);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="volume-high" size={isMobile ? 15 : 18} color="#0284C7" />
                        <Text style={[styles.poseSpeakerBtnText, isMobile && { fontSize: 10 }]}>Đọc câu</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.poseMuteToggleBtn, isMobile && { paddingHorizontal: 6, paddingVertical: 3 }, isPoseMuted && styles.poseMuteToggleBtnActive]}
                        onPress={() => {
                          const nextMuted = !isPoseMuted;
                          setIsPoseMuted(nextMuted);
                          audioService.stopAll();
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isPoseMuted ? 'volume-mute' : 'volume-medium'}
                          size={isMobile ? 14 : 16}
                          color={isPoseMuted ? '#EF4444' : '#059669'}
                        />
                        <Text style={[styles.poseMuteToggleText, isMobile && { fontSize: 10 }, isPoseMuted && styles.poseMuteToggleTextActive]}>
                          {isPoseMuted ? 'Tắt' : 'Bật'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.poseMainQuestionText, isMobile && { fontSize: isSmallMobile ? 15 : 17, marginVertical: 2 }]}>
                    {currentPoseQ.question}
                  </Text>
                  <Text style={[styles.poseSubHintText, isMobile && { fontSize: 11 }]}>({currentPoseQ.hint})</Text>
                </View>

                {/* 2. KHÔNG GIAN ĐẤU TRƯỜNG THỂ DỤC: TƯ THẾ A | CAMERA AI | TƯ THẾ B */}
                {(() => {
                  const optA = currentPoseQ.options.find((o) => o.id === 'A');
                  const optB = currentPoseQ.options.find((o) => o.id === 'B');

                  const isDetectA = activeDetectedPose === 'A';
                  const isDetectB = activeDetectedPose === 'B';

                  const isSuccessA = poseSuccess && optA?.isCorrect;
                  const isSuccessB = poseSuccess && optB?.isCorrect;

                  const renderPoseCard = (id: 'A' | 'B', compact: boolean) => {
                    const opt = id === 'A' ? optA : optB;
                    const isDetect = id === 'A' ? isDetectA : isDetectB;
                    const isSuccess = id === 'A' ? isSuccessA : isSuccessB;
                    const cardBgStyle = id === 'A' ? styles.poseCardBlue : styles.poseCardGreen;
                    const defaultAvatarPose = id === 'A' ? 'arms_up' : 'hands_chest';

                    return (
                      <TouchableOpacity
                        key={id}
                        style={[
                          styles.poseActionCard,
                          cardBgStyle,
                          compact && { minHeight: 0, padding: 8, borderRadius: 14, gap: 4, flex: 1 },
                          isDetect && styles.poseCardActiveHighlight,
                          isSuccess && styles.poseCardSuccessHighlight,
                        ]}
                        onPress={() => handleManualPoseSelect(id)}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.poseCardTopBadge, compact && { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }]}>
                          <Text style={[styles.poseCardTopBadgeText, compact && { fontSize: 9 }]}>TƯ THẾ {id}</Text>
                        </View>
                        <View style={styles.poseAvatarWrapper}>
                          <PoseKidAvatar
                            pose={opt?.requiredPose || defaultAvatarPose}
                            width={compact ? (isSmallMobile ? 42 : 52) : 82}
                            height={compact ? (isSmallMobile ? 56 : 70) : 108}
                          />
                        </View>
                        <View style={[styles.poseCardContentCenter, compact && { gap: 2 }]}>
                          <Text style={[styles.poseCardLabelText, compact && { fontSize: isSmallMobile ? 12 : 13, lineHeight: 16 }]} numberOfLines={2}>
                            {opt?.poseName}
                          </Text>
                          <Text style={[styles.poseCardSubText, compact && { fontSize: 10, lineHeight: 13 }]} numberOfLines={2}>
                            {opt?.label}
                          </Text>
                          {isDetect && !poseSuccess && (
                            <View style={[styles.cardHoldProgressBox, compact && { padding: 4, marginTop: 3 }]}>
                              <View style={[styles.cardHoldProgressBg, compact && { height: 5 }]}>
                                <View
                                  style={[
                                    styles.cardHoldProgressFill,
                                    { width: `${Math.round(holdProgress * 100)}%` },
                                  ]}
                                />
                              </View>
                              <Text style={[styles.cardHoldProgressText, compact && { fontSize: 9 }]}>
                                {Math.round(holdProgress * 100)}%
                              </Text>
                            </View>
                          )}
                          {isSuccess && (
                            <View style={[styles.cardSuccessPill, compact && { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }]}>
                              <Ionicons name="checkmark-circle" size={compact ? 12 : 16} color="#16A34A" />
                              <Text style={[styles.cardSuccessPillText, compact && { fontSize: 10 }]}>Đúng rồi! ⭐</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  };

                  const renderCamera = (compact: boolean) => {
                    const camHeight = compact ? (isSmallMobile ? 175 : 200) : 320;
                    return !isCameraActive ? (
                      <View style={[styles.cameraPlaceholderBox, compact && { padding: 12, minHeight: camHeight }]}>
                        <Text style={{ fontSize: compact ? 26 : 40 }}>📷</Text>
                        <Text style={[styles.cameraPlaceholderTitle, compact && { fontSize: 14 }]}>Bật Camera Nhận Diện</Text>
                        <Text style={[styles.cameraPlaceholderSub, compact && { fontSize: 11, lineHeight: 14 }]}>
                          Đứng cách ~1m, giữ dáng 1.5s để chọn!
                        </Text>
                        <TouchableOpacity
                          style={[styles.startCameraBtn, compact && { paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 }]}
                          onPress={() => setIsCameraActive(true)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam" size={compact ? 15 : 18} color="#FFFFFF" />
                          <Text style={[styles.startCameraBtnText, compact && { fontSize: 12 }]}>Bật Camera AI ngay</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: camHeight,
                          backgroundColor: '#0F172A',
                          borderRadius: 16,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <video
                          id="exercisePoseCam"
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                          }}
                        />

                        {/* LỚP KHUNG XƯƠNG AI WIREFRAME OVERLAY THỰC THỜI */}
                        <SkeletonWireframeOverlay
                          currentPose={skeletonPose}
                          activePose={activeDetectedPose}
                        />

                        {/* Badge chỉ số chuyển động */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: 'rgba(15, 23, 42, 0.78)',
                            padding: '3px 6px',
                            borderRadius: 6,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            zIndex: 10,
                          }}
                        >
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8' }}>Cử động:</span>
                          <div style={{ width: 30, height: 5, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${cameraMotionLevel}%`,
                                height: '100%',
                                backgroundColor: '#22C55E',
                                transition: 'width 0.15s ease',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#4ADE80' }}>{cameraMotionLevel}%</span>
                        </div>

                        {/* Badge AI MediaPipe */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            backgroundColor: isPoseAiMediaPipe ? 'rgba(16, 185, 129, 0.88)' : 'rgba(30, 41, 59, 0.82)',
                            padding: '2px 6px',
                            borderRadius: 6,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            zIndex: 10,
                          }}
                        >
                          <span style={{ fontSize: 9 }}>{isPoseAiMediaPipe ? '✨' : '⚡'}</span>
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#FFFFFF' }}>
                            {poseAiStatus === 'loading'
                              ? 'Nạp MediaPipe...'
                              : isPoseAiMediaPipe
                              ? 'MediaPipe AI'
                              : 'Quang học'}
                          </span>
                        </div>

                        {/* Badge khoảng cách */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            backgroundColor: 'rgba(15, 23, 42, 0.78)',
                            padding: '3px 6px',
                            borderRadius: 6,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            zIndex: 10,
                          }}
                        >
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#38BDF8' }}>~1m</span>
                        </div>

                        {/* Thanh trạng thái nhận diện & Đồng hồ giữ dáng 1.5s */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.90)',
                            backdropFilter: 'blur(6px)',
                            padding: compact ? '4px 8px' : '8px 12px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            zIndex: 10,
                          }}
                        >
                          {activeDetectedPose ? (
                            <>
                              <span style={{ fontSize: compact ? 10 : 11, fontWeight: 800, color: '#4ADE80' }}>
                                {detectedPoseFeedback} • Giữ yên 1.5s...
                              </span>
                              <div
                                style={{
                                  width: '85%',
                                  height: compact ? 6 : 8,
                                  backgroundColor: '#334155',
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.round(holdProgress * 100)}%`,
                                    height: '100%',
                                    backgroundColor: '#22C55E',
                                    transition: 'width 0.05s linear',
                                  }}
                                />
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: 11, color: '#38BDF8' }}>🔍</span>
                              <span style={{ fontSize: compact ? 10 : 11, fontWeight: 700, color: '#38BDF8' }}>
                                {detectedPoseFeedback}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  if (isMobile) {
                    return (
                      <View style={{ width: '100%', gap: 8, marginVertical: 4 }}>
                        {/* Hàng 1: Camera AI Viewfinder */}
                        <View style={{ width: '100%', borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#38BDF8', backgroundColor: '#0F172A' }}>
                          {renderCamera(true)}
                        </View>

                        {/* Hàng 2: Hai thẻ tư thế A & B song song */}
                        <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
                          {renderPoseCard('A', true)}
                          {renderPoseCard('B', true)}
                        </View>
                      </View>
                    );
                  }

                  // Layout Desktop / Tablet (3 cột song song)
                  return (
                    <View style={styles.poseArenaRow}>
                      <View style={styles.poseArenaLeftCol}>
                        {renderPoseCard('A', false)}
                      </View>
                      <View style={styles.poseArenaCenterCol}>
                        {renderCamera(false)}
                      </View>
                      <View style={styles.poseArenaRightCol}>
                        {renderPoseCard('B', false)}
                      </View>
                    </View>
                  );
                })()}

                {/* LỜI NHẮC TRỢ GIÚP DÀNH CHO PHỤ HUYNH */}
                <View style={styles.parentHelperRow}>
                  <Text style={styles.parentHelperText}>
                    💡 Bố mẹ đứng cách camera 1m cùng con làm mẫu, hoặc bấm trực tiếp vào thẻ nếu con mỏi tay chân.
                  </Text>
                </View>

                {/* BANNER CHÚC MỪNG HOÀN THÀNH */}
                {poseSuccess && (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>
                      ⭐ Xuất sắc! {childCallName} đã hoàn thành bài tập {poseQIndex + 1}!
                    </Text>
                    {poseQIndex + 1 < allPoseQuestions.length ? (
                      <TouchableOpacity style={styles.nextQuestionBtn} onPress={nextPoseQuestion}>
                        <Text style={styles.nextQuestionBtnText}>Sang câu tiếp theo ({poseQIndex + 2}/{allPoseQuestions.length}) ➡️</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.nextQuestionBtn} onPress={nextPoseQuestion}>
                        <Text style={styles.nextQuestionBtnText}>🎉 Hoàn thành cả {allPoseQuestions.length} câu! Chơi lại 🔄</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 680,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascotIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addQuestionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addQuestionHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  gameWrapper: {
    gap: 14,
  },
  parentTipBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  parentTipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 4,
  },
  parentTipText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  questionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  questionIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  questionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0369A1',
    textAlign: 'center',
    marginBottom: 10,
  },
  audioPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  audioPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  flipCardItem: {
    width: 140,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDimmed: {
    opacity: 0.35,
  },
  cardCorrectGlow: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
    transform: [{ scale: 1.05 }],
  },
  cardEmojiLarge: {
    fontSize: 54,
    marginBottom: 6,
  },
  cardLabelText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  cardLabelCorrect: {
    color: '#15803D',
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginTop: 6,
  },
  successBannerText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
    textAlign: 'center',
  },
  nextQuestionBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  nextQuestionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  toggleBtnActive: {
    backgroundColor: '#0284C7',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  matchingQuestionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  matchingIcon: {
    fontSize: 48,
  },
  matchingQuestionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  speakerMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
  },
  speakerMiniBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  matchingTargetBox: {
    gap: 8,
  },
  matchingTargetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  matchingOptionsList: {
    gap: 10,
  },
  matchingAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  matchingCardDimmed: {
    opacity: 0.35,
  },
  matchingAnswerBtnSuccess: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  matchingAnswerEmoji: {
    fontSize: 32,
  },
  matchingAnswerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  matchingAnswerTextSuccess: {
    color: '#15803D',
  },
  tiltRulesBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    gap: 10,
  },
  tiltRuleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tiltRuleIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  tiltRuleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  tiltRuleDesc: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  tiltStudentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  tiltStudentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  tiltOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiltHeadGuideBox: {
    width: 90,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiltHeadCircle: {
    width: 74,
    height: 84,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.75)',
    borderStyle: 'dashed',
  },
  tiltCenterLine: {
    width: 2,
    height: 20,
    backgroundColor: '#38BDF8',
    marginTop: -10,
  },
  tiltAngleBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  tiltAngleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  tiltThresholdRow: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  tiltZonePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  tiltZonePillActive: {
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    borderColor: '#86EFAC',
  },
  tiltZonePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tiltCardsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  tiltCardItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 6,
  },
  tiltCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.03 }],
  },
  tiltCardWrong: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  tiltCardSuccess: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  tiltSideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tiltSideBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tiltEmojiLarge: {
    fontSize: 48,
    marginVertical: 4,
  },
  tiltLabelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  tiltCardHoldBox: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  tiltCardHoldBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tiltCardHoldFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  tiltCardHoldText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  quizSubTip: {
    fontSize: 11,
    color: '#0369A1',
    fontStyle: 'italic',
    marginTop: 2,
  },
  quizOptionsCol: {
    gap: 10,
  },
  quizOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  quizOptionCardSelected: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
  },
  quizOptionEmoji: {
    fontSize: 32,
  },
  quizOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  quizOptionLabelSelected: {
    color: '#BE123C',
    fontWeight: '800',
  },
  poseRulesBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    gap: 10,
  },
  poseRuleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  poseRuleIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  poseRuleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  poseRuleDesc: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 16,
  },
  questionBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  liveCameraIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  statusDotActive: {
    backgroundColor: '#22C55E',
  },
  liveCameraText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  cameraContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#334155',
  },
  cameraPlaceholderBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
  },
  cameraPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  cameraPlaceholderSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
    marginBottom: 8,
  },
  startCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startCameraBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveCameraBox: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  nativeCameraFallback: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nativeCameraText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  silhouetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headGuideCircle: {
    width: 64,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.65)',
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  shoulderGuideLine: {
    width: 140,
    height: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.45)',
    borderRadius: 2,
    marginBottom: 6,
  },
  chestGuideZone: {
    width: 90,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderStyle: 'dashed',
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  motionGaugeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  motionGaugeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  motionGaugeBarBg: {
    width: 44,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  motionGaugeBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  motionGaugePercent: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ADE80',
  },
  poseStatusFloatingBar: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
  },
  poseScanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scanningPoseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    textAlign: 'center',
  },
  poseDetectedBanner: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  poseDetectedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4ADE80',
    textAlign: 'center',
  },
  holdProgressBarBg: {
    width: '80%',
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    overflow: 'hidden',
  },
  holdProgressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 5,
  },
  holdProgressPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
  },
  // CÁC STYLE MỚI CHO BỐ CỤC 3 CỘT GAME 5 (THEO ẢNH MẪU CỦA NGƯỜI DÙNG)
  poseHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  poseHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  poseBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  poseBadgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  poseSpeakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  poseSpeakerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  poseMuteToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  poseMuteToggleBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  poseMuteToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  poseMuteToggleTextActive: {
    color: '#DC2626',
  },
  poseMainQuestionText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
    marginVertical: 4,
  },
  poseSubHintText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  poseArenaRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 6,
    flexWrap: 'wrap',
  },
  poseArenaLeftCol: {
    flex: 1.1,
    minWidth: 200,
    gap: 12,
    justifyContent: 'space-between',
  },
  poseArenaCenterCol: {
    width: 320,
    minHeight: 310,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 2.5,
    borderColor: '#38BDF8',
  },
  poseArenaRightCol: {
    flex: 1.1,
    minWidth: 200,
    justifyContent: 'center',
  },
  poseActionCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 3.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 290,
  },
  poseCardBlue: {
    backgroundColor: '#0284C7',
  },
  poseCardRed: {
    backgroundColor: '#EF4444',
  },
  poseCardGreen: {
    backgroundColor: '#059669',
  },
  poseCardTopBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'center',
  },
  poseCardTopBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  poseCardContentCenter: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  poseAvatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseCardContent: {
    flex: 1,
    gap: 4,
  },
  poseCardLabelText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  poseCardSubText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
  },
  poseCardActiveHighlight: {
    borderColor: '#FDE047',
    transform: [{ scale: 1.03 }],
  },
  poseCardSuccessHighlight: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.04 }],
  },
  cardHoldProgressBox: {
    width: '100%',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 6,
    borderRadius: 8,
  },
  cardHoldProgressBg: {
    width: '100%',
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  cardHoldProgressFill: {
    height: '100%',
    backgroundColor: '#FDE047',
    borderRadius: 3.5,
  },
  cardHoldProgressText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  cardSuccessPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  aiStatusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
  },
  aiStatusBadgeMediaPipe: {
    backgroundColor: 'rgba(16, 185, 129, 0.88)',
    borderColor: '#34D399',
  },
  aiStatusBadgeFallback: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  aiStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  parentHelperRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  parentHelperText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
