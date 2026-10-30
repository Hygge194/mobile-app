import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { UI_COLORS } from '../../constants/colors';
import {
  GameTabType,
  AllowedPoseType,
  FlipQuestionItem,
  MatchingPairData,
  HeadTiltQuestion,
  EmotionalQuizItem,
  PoseExerciseQuestion,
} from '../../types/gameQuestions';

const QUICK_EMOJIS = ['🍎', '🍌', '🥛', '🐶', '🐱', '🐟', '🚗', '🧸', '🪥', '🥤', '🧥', '☀️', '🌧️', '⭐', '❤️', '😊', '🎉'];

const POSE_OPTIONS_META: Array<{ key: AllowedPoseType; label: string; defaultEmoji: string }> = [
  { key: 'arms_up', label: 'Vươn hai tay chữ V lên cao', defaultEmoji: '🙆' },
  { key: 'hands_head', label: 'Làm hai tai thỏ trên đầu', defaultEmoji: '🐰' },
  { key: 'hands_chest', label: 'Chắp hai tay trước ngực', defaultEmoji: '🧘' },
  { key: 'arms_side', label: 'Dang hai tay sang ngang', defaultEmoji: '🤸' },
];

export const GameQuestionEditorModal: React.FC = () => {
  const {
    gameQuestionEditorOpen,
    setGameQuestionEditorOpen,
    gameQuestionEditorTab,
    customGameQuestions,
    addCustomGameQuestion,
    deleteCustomGameQuestion,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<GameTabType>(gameQuestionEditorTab || 'flip');

  useEffect(() => {
    if (gameQuestionEditorTab) {
      setActiveTab(gameQuestionEditorTab);
    }
  }, [gameQuestionEditorTab]);

  // Form State - Game 1: Thẻ Lật
  const [flipQText, setFlipQText] = useState('');
  const [flipTargetLabel, setFlipTargetLabel] = useState('');
  const [flipTargetEmoji, setFlipTargetEmoji] = useState('🍎');
  const [flipWrong1Label, setFlipWrong1Label] = useState('');
  const [flipWrong1Emoji, setFlipWrong1Emoji] = useState('🍌');
  const [flipWrong2Label, setFlipWrong2Label] = useState('');
  const [flipWrong2Emoji, setFlipWrong2Emoji] = useState('🥛');

  // Form State - Game 2: Nối Ý
  const [matchingQText, setMatchingQText] = useState('');
  const [matchingQIcon, setMatchingQIcon] = useState('🐶');
  const [matchingCorrectLabel, setMatchingCorrectLabel] = useState('');
  const [matchingCorrectIcon, setMatchingCorrectIcon] = useState('🦴');
  const [matchingWrong1Label, setMatchingWrong1Label] = useState('');
  const [matchingWrong1Icon, setMatchingWrong1Icon] = useState('🥕');
  const [matchingWrong2Label, setMatchingWrong2Label] = useState('');
  const [matchingWrong2Icon, setMatchingWrong2Icon] = useState('🍦');

  // Form State - Game 3: Nghiêng Đầu
  const [tiltQText, setTiltQText] = useState('');
  const [tiltLeftLabel, setTiltLeftLabel] = useState('');
  const [tiltLeftEmoji, setTiltLeftEmoji] = useState('🍎');
  const [tiltRightLabel, setTiltRightLabel] = useState('');
  const [tiltRightEmoji, setTiltRightEmoji] = useState('👟');
  const [tiltCorrectSide, setTiltCorrectSide] = useState<'left' | 'right'>('left');

  // Form State - Game 4: Trắc Nghiệm Cảm Xúc
  const [quizQText, setQuizQText] = useState('');
  const [quizTip, setQuizTip] = useState('');
  const [quizOpt1Label, setQuizOpt1Label] = useState('');
  const [quizOpt1Emoji, setQuizOpt1Emoji] = useState('😊');
  const [quizOpt1Praise, setQuizOpt1Praise] = useState('Đúng rồi! Bố mẹ luôn hiểu và yêu con!');
  const [quizOpt2Label, setQuizOpt2Label] = useState('');
  const [quizOpt2Emoji, setQuizOpt2Emoji] = useState('😢');
  const [quizOpt2Praise, setQuizOpt2Praise] = useState('Không sao nhé con yêu, bố mẹ luôn bên con!');

  // Form State - Game 5: Thể Dục Tư Thế
  const [poseQText, setPoseQText] = useState('');
  const [poseHint, setPoseHint] = useState('');
  const [poseCorrectId, setPoseCorrectId] = useState<'A' | 'B'>('A');
  const [poseAPose, setPoseAPose] = useState<AllowedPoseType>('arms_up');
  const [poseALabel, setPoseALabel] = useState('Vươn hai tay chữ V lên cao chào ngày mới');
  const [poseAEmoji, setPoseAEmoji] = useState('🙆');
  const [poseBPose, setPoseBPose] = useState<AllowedPoseType>('hands_chest');
  const [poseBLabel, setPoseBLabel] = useState('Chắp hai tay trước ngực tĩnh tâm');
  const [poseBEmoji, setPoseBEmoji] = useState('🧘');

  if (!gameQuestionEditorOpen) return null;

  // Xử lý thêm Game 1: Thẻ lật
  const handleSaveFlip = async () => {
    if (!flipQText.trim() || !flipTargetLabel.trim() || !flipWrong1Label.trim() || !flipWrong2Label.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ câu hỏi và 3 đáp án (1 đúng, 2 sai).');
      return;
    }
    const newQ: FlipQuestionItem = {
      id: `custom_flip_${Date.now()}`,
      question: flipQText.trim(),
      target: {
        label: flipTargetLabel.trim(),
        emoji: flipTargetEmoji.trim() || '⭐',
      },
      options: [
        {
          id: `opt_${Date.now()}_a`,
          label: flipTargetLabel.trim(),
          emoji: flipTargetEmoji.trim() || '⭐',
          isCorrect: true,
        },
        {
          id: `opt_${Date.now()}_b`,
          label: flipWrong1Label.trim(),
          emoji: flipWrong1Emoji.trim() || '❓',
          isCorrect: false,
        },
        {
          id: `opt_${Date.now()}_c`,
          label: flipWrong2Label.trim(),
          emoji: flipWrong2Emoji.trim() || '❓',
          isCorrect: false,
        },
      ],
      isCustom: true,
    };
    await addCustomGameQuestion('flip', newQ);
    setFlipQText('');
    setFlipTargetLabel('');
    setFlipWrong1Label('');
    setFlipWrong2Label('');
    Alert.alert('Thành công', 'Đã thêm câu hỏi vào trò chơi Thẻ Lật!');
  };

  // Xử lý thêm Game 2: Nối ý
  const handleSaveMatching = async () => {
    if (!matchingQText.trim() || !matchingCorrectLabel.trim() || !matchingWrong1Label.trim() || !matchingWrong2Label.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền câu hỏi và 3 lựa chọn nối ý.');
      return;
    }
    const newPair: MatchingPairData = {
      id: `custom_matching_${Date.now()}`,
      question: matchingQText.trim(),
      questionIcon: matchingQIcon.trim() || '💡',
      options: [
        {
          id: `m_${Date.now()}_c`,
          label: matchingCorrectLabel.trim(),
          icon: matchingCorrectIcon.trim() || '⭐',
          isCorrect: true,
        },
        {
          id: `m_${Date.now()}_w1`,
          label: matchingWrong1Label.trim(),
          icon: matchingWrong1Icon.trim() || '❓',
          isCorrect: false,
        },
        {
          id: `m_${Date.now()}_w2`,
          label: matchingWrong2Label.trim(),
          icon: matchingWrong2Icon.trim() || '❓',
          isCorrect: false,
        },
      ],
      isCustom: true,
    };
    await addCustomGameQuestion('matching', newPair);
    setMatchingQText('');
    setMatchingCorrectLabel('');
    setMatchingWrong1Label('');
    setMatchingWrong2Label('');
    Alert.alert('Thành công', 'Đã thêm câu hỏi vào trò chơi Nối Ý Logic!');
  };

  // Xử lý thêm Game 3: Nghiêng đầu
  const handleSaveTilt = async () => {
    if (!tiltQText.trim() || !tiltLeftLabel.trim() || !tiltRightLabel.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền câu hỏi và đáp án cho cả bên Trái và bên Phải.');
      return;
    }
    const newQ: HeadTiltQuestion = {
      id: `custom_tilt_${Date.now()}`,
      question: tiltQText.trim(),
      options: {
        left: {
          direction: 'left',
          label: tiltLeftLabel.trim(),
          emoji: tiltLeftEmoji.trim() || '🍎',
          isCorrect: tiltCorrectSide === 'left',
        },
        right: {
          direction: 'right',
          label: tiltRightLabel.trim(),
          emoji: tiltRightEmoji.trim() || '🍌',
          isCorrect: tiltCorrectSide === 'right',
        },
      },
      isCustom: true,
    };
    await addCustomGameQuestion('puzzle', newQ);
    setTiltQText('');
    setTiltLeftLabel('');
    setTiltRightLabel('');
    Alert.alert('Thành công', 'Đã thêm câu hỏi vào trò chơi Nghiêng Đầu!');
  };

  // Xử lý thêm Game 4: Trắc nghiệm cảm xúc
  const handleSaveQuiz = async () => {
    if (!quizQText.trim() || !quizOpt1Label.trim() || !quizOpt2Label.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền tình huống và 2 lựa chọn cảm xúc/phản xạ.');
      return;
    }
    const newQuiz: EmotionalQuizItem = {
      id: `custom_quiz_${Date.now()}`,
      question: quizQText.trim(),
      tip: quizTip.trim() || 'Lắng nghe và khích lệ cảm xúc tích cực của bé',
      options: [
        {
          label: quizOpt1Label.trim(),
          emoji: quizOpt1Emoji.trim() || '😊',
          praise: quizOpt1Praise.trim() || 'Bố mẹ luôn yêu thương và tự hào về con!',
        },
        {
          label: quizOpt2Label.trim(),
          emoji: quizOpt2Emoji.trim() || '💖',
          praise: quizOpt2Praise.trim() || 'Bố mẹ luôn bên cạnh sẻ chia cùng con!',
        },
      ],
      isCustom: true,
    };
    await addCustomGameQuestion('quiz', newQuiz);
    setQuizQText('');
    setQuizTip('');
    setQuizOpt1Label('');
    setQuizOpt2Label('');
    Alert.alert('Thành công', 'Đã thêm tình huống vào trò chơi Trắc Nghiệm Cảm Xúc!');
  };

  // Xử lý thêm Game 5: Thể dục tư thế
  const handleSavePose = async () => {
    if (!poseQText.trim() || !poseALabel.trim() || !poseBLabel.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền câu hỏi động tác và nhãn hiển thị cho 2 tư thế.');
      return;
    }
    const metaA = POSE_OPTIONS_META.find((m) => m.key === poseAPose)!;
    const metaB = POSE_OPTIONS_META.find((m) => m.key === poseBPose)!;

    const newPose: PoseExerciseQuestion = {
      id: `custom_pose_${Date.now()}`,
      question: poseQText.trim(),
      hint: poseHint.trim() || `${metaA.label} hoặc ${metaB.label}`,
      options: [
        {
          id: 'A',
          label: poseALabel.trim(),
          poseName: metaA.label,
          emoji: poseAEmoji.trim() || metaA.defaultEmoji,
          isCorrect: poseCorrectId === 'A',
          requiredPose: poseAPose,
          theme: 'blue',
        },
        {
          id: 'B',
          label: poseBLabel.trim(),
          poseName: metaB.label,
          emoji: poseBEmoji.trim() || metaB.defaultEmoji,
          isCorrect: poseCorrectId === 'B',
          requiredPose: poseBPose,
          theme: 'green',
        },
      ],
      isCustom: true,
    };
    await addCustomGameQuestion('movement', newPose);
    setPoseQText('');
    setPoseHint('');
    setPoseALabel('');
    setPoseBLabel('');
    Alert.alert('Thành công', 'Đã thêm bài tập vào trò chơi Thể Dục Tư Thế!');
  };

  const currentList = customGameQuestions[activeTab] || [];

  return (
    <Modal
      visible={gameQuestionEditorOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setGameQuestionEditorOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="create" size={20} color={UI_COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Thêm câu hỏi cho trò chơi</Text>
                <Text style={styles.subtitle}>Tùy biến nội dung phù hợp riêng với bé</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setGameQuestionEditorOpen(false)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Chọn 1 trong 5 trò chơi */}
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'flip' && styles.tabBtnActive]}
                onPress={() => setActiveTab('flip')}
              >
                <Text style={styles.tabBtnEmoji}>🎴</Text>
                <Text style={[styles.tabBtnText, activeTab === 'flip' && styles.tabBtnTextActive]}>1. Thẻ Lật</Text>
                {customGameQuestions.flip?.length > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{customGameQuestions.flip.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'matching' && styles.tabBtnActive]}
                onPress={() => setActiveTab('matching')}
              >
                <Text style={styles.tabBtnEmoji}>🧩</Text>
                <Text style={[styles.tabBtnText, activeTab === 'matching' && styles.tabBtnTextActive]}>2. Nối Ý</Text>
                {customGameQuestions.matching?.length > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{customGameQuestions.matching.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'puzzle' && styles.tabBtnActive]}
                onPress={() => setActiveTab('puzzle')}
              >
                <Text style={styles.tabBtnEmoji}>↔️</Text>
                <Text style={[styles.tabBtnText, activeTab === 'puzzle' && styles.tabBtnTextActive]}>3. Nghiêng Đầu</Text>
                {customGameQuestions.puzzle?.length > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{customGameQuestions.puzzle.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'quiz' && styles.tabBtnActive]}
                onPress={() => setActiveTab('quiz')}
              >
                <Text style={styles.tabBtnEmoji}>💖</Text>
                <Text style={[styles.tabBtnText, activeTab === 'quiz' && styles.tabBtnTextActive]}>4. Trắc Nghiệm</Text>
                {customGameQuestions.quiz?.length > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{customGameQuestions.quiz.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'movement' && styles.tabBtnActive]}
                onPress={() => setActiveTab('movement')}
              >
                <Text style={styles.tabBtnEmoji}>🤸</Text>
                <Text style={[styles.tabBtnText, activeTab === 'movement' && styles.tabBtnTextActive]}>5. Thể Dục</Text>
                {customGameQuestions.movement?.length > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{customGameQuestions.movement.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. FORM GAME 1: THẺ LẬT */}
            {activeTab === 'flip' && (
              <View style={styles.formSection}>
                <Text style={styles.sectionHeader}>THÊM CÂU HỎI TRÒ CHƠI THẺ LẬT</Text>
                <Text style={styles.inputHelp}>Bé lật mở các thẻ để tìm ra đúng đồ vật/con vật theo câu hỏi.</Text>

                <Text style={styles.fieldLabel}>Câu hỏi gợi ý:</Text>
                <TextInput
                  style={styles.textInput}
                  value={flipQText}
                  onChangeText={setFlipQText}
                  placeholder="VD: Đâu là quả dưa hấu thơm ngọt? / Con nào gáy ò ó o?"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.fieldLabel}>Đáp án ĐÚNG (Target):</Text>
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.textInput, { flex: 2 }]}
                    value={flipTargetLabel}
                    onChangeText={setFlipTargetLabel}
                    placeholder="Tên đồ vật (VD: Dưa hấu)"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                    value={flipTargetEmoji}
                    onChangeText={setFlipTargetEmoji}
                    placeholder="🍉"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <Text style={styles.fieldLabel}>Đáp án SAI thứ 1 (Nhiễu):</Text>
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.textInput, { flex: 2 }]}
                    value={flipWrong1Label}
                    onChangeText={setFlipWrong1Label}
                    placeholder="Tên đồ vật sai (VD: Quả cam)"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                    value={flipWrong1Emoji}
                    onChangeText={setFlipWrong1Emoji}
                    placeholder="🍊"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <Text style={styles.fieldLabel}>Đáp án SAI thứ 2 (Nhiễu):</Text>
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.textInput, { flex: 2 }]}
                    value={flipWrong2Label}
                    onChangeText={setFlipWrong2Label}
                    placeholder="Tên đồ vật sai (VD: Sữa tươi)"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                    value={flipWrong2Emoji}
                    onChangeText={setFlipWrong2Emoji}
                    placeholder="🥛"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveFlip} activeOpacity={0.8}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Lưu câu hỏi Thẻ Lật</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 2. FORM GAME 2: NỐI Ý */}
            {activeTab === 'matching' && (
              <View style={styles.formSection}>
                <Text style={styles.sectionHeader}>THÊM CÂU HỎI TRÒ CHƠI NỐI Ý LOGIC</Text>
                <Text style={styles.inputHelp}>Bé chọn 1 trong 3 đáp án phù hợp logic với câu hỏi (VD: Mưa dùng Ô, Đói thì ăn Cơm).</Text>

                <Text style={styles.fieldLabel}>Câu hỏi và Icon:</Text>
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.textInput, { flex: 3 }]}
                    value={matchingQText}
                    onChangeText={setMatchingQText}
                    placeholder="VD: Khi trời lạnh bé mặc gì? / Con thỏ thích ăn gì?"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                    value={matchingQIcon}
                    onChangeText={setMatchingQIcon}
                    placeholder="❄️"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <Text style={styles.fieldLabel}>Đáp án ĐÚNG:</Text>
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.textInput, { flex: 2 }]}
                    value={matchingCorrectLabel}
                    onChangeText={setMatchingCorrectLabel}
                    placeholder="Tên đáp án đúng (VD: Áo khoác ấm)"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                    value={matchingCorrectIcon}
                    onChangeText={setMatchingCorrectIcon}
                    placeholder="🧥"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <Text style={styles.fieldLabel}>Đáp án SAI 1:</Text>
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.textInput, { flex: 2 }]}
                    value={matchingWrong1Label}
                    onChangeText={setMatchingWrong1Label}
                    placeholder="VD: Quần đùi bơi"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                    value={matchingWrong1Icon}
                    onChangeText={setMatchingWrong1Icon}
                    placeholder="🩳"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <Text style={styles.fieldLabel}>Đáp án SAI 2:</Text>
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.textInput, { flex: 2 }]}
                    value={matchingWrong2Label}
                    onChangeText={setMatchingWrong2Label}
                    placeholder="VD: Cái quạt nan"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                    value={matchingWrong2Icon}
                    onChangeText={setMatchingWrong2Icon}
                    placeholder="🪭"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveMatching} activeOpacity={0.8}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Lưu câu hỏi Nối Ý</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. FORM GAME 3: NGHIÊNG ĐẦU */}
            {activeTab === 'puzzle' && (
              <View style={styles.formSection}>
                <Text style={styles.sectionHeader}>THÊM CÂU HỎI QUIZ NGHIÊNG ĐẦU CAMERA</Text>
                <Text style={styles.inputHelp}>Bé nghiêng đầu sang Trái hoặc Phải để chọn đáp án đúng trước camera.</Text>

                <Text style={styles.fieldLabel}>Câu hỏi nhận biết:</Text>
                <TextInput
                  style={styles.textInput}
                  value={tiltQText}
                  onChangeText={setTiltQText}
                  placeholder="VD: Đâu là chiếc mũ che nắng xinh xắn?"
                  placeholderTextColor="#94A3B8"
                />

                <View style={styles.boxGroup}>
                  <Text style={[styles.fieldLabel, { color: '#1D4ED8' }]}>⬅️ Lựa chọn BÊN TRÁI:</Text>
                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[styles.textInput, { flex: 2 }]}
                      value={tiltLeftLabel}
                      onChangeText={setTiltLeftLabel}
                      placeholder="Tên đồ vật (VD: Chiếc mũ lưỡi trai)"
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                      value={tiltLeftEmoji}
                      onChangeText={setTiltLeftEmoji}
                      placeholder="🧢"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <View style={styles.boxGroup}>
                  <Text style={[styles.fieldLabel, { color: '#BE185D' }]}>BÊN PHẢI ➡️:</Text>
                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[styles.textInput, { flex: 2 }]}
                      value={tiltRightLabel}
                      onChangeText={setTiltRightLabel}
                      placeholder="Tên đồ vật (VD: Đôi dép tông)"
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                      value={tiltRightEmoji}
                      onChangeText={setTiltRightEmoji}
                      placeholder="🩴"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Chỉ định bên nào là đáp án ĐÚNG:</Text>
                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[styles.radioBtn, tiltCorrectSide === 'left' && styles.radioBtnActive]}
                    onPress={() => setTiltCorrectSide('left')}
                  >
                    <Ionicons
                      name={tiltCorrectSide === 'left' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={tiltCorrectSide === 'left' ? UI_COLORS.primary : '#94A3B8'}
                    />
                    <Text style={styles.radioText}>Bên TRÁI là ĐÚNG ⬅️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioBtn, tiltCorrectSide === 'right' && styles.radioBtnActive]}
                    onPress={() => setTiltCorrectSide('right')}
                  >
                    <Ionicons
                      name={tiltCorrectSide === 'right' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={tiltCorrectSide === 'right' ? UI_COLORS.primary : '#94A3B8'}
                    />
                    <Text style={styles.radioText}>Bên PHẢI là ĐÚNG ➡️</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveTilt} activeOpacity={0.8}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Lưu câu hỏi Nghiêng Đầu</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. FORM GAME 4: TRẮC NGHIỆM CẢM XÚC */}
            {activeTab === 'quiz' && (
              <View style={styles.formSection}>
                <Text style={styles.sectionHeader}>THÊM TÌNH HUỐNG TRẮC NGHIỆM CẢM XÚC & GIAO TIẾP</Text>
                <Text style={styles.inputHelp}>Dạy trẻ cách phản xạ, bày tỏ nhu cầu và xử lý cảm xúc hàng ngày.</Text>

                <Text style={styles.fieldLabel}>Tình huống đặt ra cho bé:</Text>
                <TextInput
                  style={styles.textInput}
                  value={quizQText}
                  onChangeText={setQuizQText}
                  placeholder="VD: Khi làm đổ sữa ra sàn nhà, con có thể làm gì?"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.fieldLabel}>Lời khuyên / Mục tiêu can thiệp:</Text>
                <TextInput
                  style={styles.textInput}
                  value={quizTip}
                  onChangeText={setQuizTip}
                  placeholder="VD: Dạy trẻ bình tĩnh gọi người lớn hỗ trợ dọn dẹp"
                  placeholderTextColor="#94A3B8"
                />

                <View style={styles.boxGroup}>
                  <Text style={styles.fieldLabel}>Lựa chọn phản xạ 1:</Text>
                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[styles.textInput, { flex: 2 }]}
                      value={quizOpt1Label}
                      onChangeText={setQuizOpt1Label}
                      placeholder="Nội dung (VD: Bảo bố mẹ giúp con lau sàn)"
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                      value={quizOpt1Emoji}
                      onChangeText={setQuizOpt1Emoji}
                      placeholder="🗣️"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <TextInput
                    style={[styles.textInput, { marginTop: 6 }]}
                    value={quizOpt1Praise}
                    onChangeText={setQuizOpt1Praise}
                    placeholder="Lời khen khi bé chọn phản xạ này"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.boxGroup}>
                  <Text style={styles.fieldLabel}>Lựa chọn phản xạ 2:</Text>
                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[styles.textInput, { flex: 2 }]}
                      value={quizOpt2Label}
                      onChangeText={setQuizOpt2Label}
                      placeholder="Nội dung (VD: Sợ hãi và khóc to)"
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1, textAlign: 'center', fontSize: 20 }]}
                      value={quizOpt2Emoji}
                      onChangeText={setQuizOpt2Emoji}
                      placeholder="😢"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <TextInput
                    style={[styles.textInput, { marginTop: 6 }]}
                    value={quizOpt2Praise}
                    onChangeText={setQuizOpt2Praise}
                    placeholder="Lời động viên nhẹ nhàng từ cha mẹ"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveQuiz} activeOpacity={0.8}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Lưu tình huống Trắc Nghiệm</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 5. FORM GAME 5: THỂ DỤC NHẬN DIỆN TƯ THẾ CAMERA */}
            {activeTab === 'movement' && (
              <View style={styles.formSection}>
                <Text style={styles.sectionHeader}>THÊM BÀI TẬP THỂ DỤC TƯ THẾ CAMERA (AI POSE)</Text>
                <Text style={styles.inputHelp}>Bé đứng trước camera thực hiện tư thế đúng để rèn luyện vận động thô.</Text>

                <Text style={styles.fieldLabel}>Lời dẫn dắt / Câu đố động tác:</Text>
                <TextInput
                  style={styles.textInput}
                  value={poseQText}
                  onChangeText={setPoseQText}
                  placeholder="VD: Bé hóa thân thành chú đại bàng sải cánh bay lượn nào!"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.fieldLabel}>Gợi ý nhắc bé:</Text>
                <TextInput
                  style={styles.textInput}
                  value={poseHint}
                  onChangeText={setPoseHint}
                  placeholder="VD: Dang hai tay sang ngang hoặc Vươn hai tay lên cao"
                  placeholderTextColor="#94A3B8"
                />

                {/* Cấu hình tư thế A */}
                <View style={styles.boxGroup}>
                  <Text style={[styles.fieldLabel, { color: '#0369A1' }]}>TƯ THẾ A:</Text>
                  <Text style={styles.subLabel}>Chọn cử động AI nhận diện:</Text>
                  <View style={styles.poseSelectorGrid}>
                    {POSE_OPTIONS_META.map((meta) => {
                      const isSel = poseAPose === meta.key;
                      return (
                        <TouchableOpacity
                          key={meta.key}
                          style={[styles.poseTypeBtn, isSel && styles.poseTypeBtnActive]}
                          onPress={() => {
                            setPoseAPose(meta.key);
                            setPoseAEmoji(meta.defaultEmoji);
                            setPoseALabel(meta.label);
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>{meta.defaultEmoji}</Text>
                          <Text style={[styles.poseTypeBtnText, isSel && styles.poseTypeBtnTextActive]}>
                            {meta.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TextInput
                    style={[styles.textInput, { marginTop: 8 }]}
                    value={poseALabel}
                    onChangeText={setPoseALabel}
                    placeholder="Mô tả động tác A hiển thị cho bé"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Cấu hình tư thế B */}
                <View style={styles.boxGroup}>
                  <Text style={[styles.fieldLabel, { color: '#15803D' }]}>TƯ THẾ B:</Text>
                  <Text style={styles.subLabel}>Chọn cử động AI nhận diện:</Text>
                  <View style={styles.poseSelectorGrid}>
                    {POSE_OPTIONS_META.map((meta) => {
                      const isSel = poseBPose === meta.key;
                      return (
                        <TouchableOpacity
                          key={meta.key}
                          style={[styles.poseTypeBtn, isSel && styles.poseTypeBtnActive]}
                          onPress={() => {
                            setPoseBPose(meta.key);
                            setPoseBEmoji(meta.defaultEmoji);
                            setPoseBLabel(meta.label);
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>{meta.defaultEmoji}</Text>
                          <Text style={[styles.poseTypeBtnText, isSel && styles.poseTypeBtnTextActive]}>
                            {meta.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TextInput
                    style={[styles.textInput, { marginTop: 8 }]}
                    value={poseBLabel}
                    onChangeText={setPoseBLabel}
                    placeholder="Mô tả động tác B hiển thị cho bé"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <Text style={styles.fieldLabel}>Tư thế nào là ĐÚNG:</Text>
                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[styles.radioBtn, poseCorrectId === 'A' && styles.radioBtnActive]}
                    onPress={() => setPoseCorrectId('A')}
                  >
                    <Ionicons
                      name={poseCorrectId === 'A' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={poseCorrectId === 'A' ? UI_COLORS.primary : '#94A3B8'}
                    />
                    <Text style={styles.radioText}>Tư thế A là ĐÚNG</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioBtn, poseCorrectId === 'B' && styles.radioBtnActive]}
                    onPress={() => setPoseCorrectId('B')}
                  >
                    <Ionicons
                      name={poseCorrectId === 'B' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={poseCorrectId === 'B' ? UI_COLORS.primary : '#94A3B8'}
                    />
                    <Text style={styles.radioText}>Tư thế B là ĐÚNG</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSavePose} activeOpacity={0.8}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Lưu bài tập Thể Dục</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* DANH SÁCH CÁC CÂU HỎI ĐÃ THÊM BỞI BỐ MẸ */}
            <View style={styles.customListSection}>
              <View style={styles.customListHeader}>
                <Text style={styles.customListTitle}>
                  CÂU HỎI BỐ MẸ ĐÃ THÊM ({currentList.length})
                </Text>
              </View>

              {currentList.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>📝</Text>
                  <Text style={styles.emptyText}>Chưa có câu hỏi riêng nào trong mục này.</Text>
                  <Text style={styles.emptySubText}>
                    Điền biểu mẫu phía trên và bấm "Lưu" để thêm câu hỏi đầu tiên nhé!
                  </Text>
                </View>
              ) : (
                currentList.map((item: any, idx: number) => (
                  <View key={item.id || idx} style={styles.customCardItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customCardQuestion}>
                        {idx + 1}. {item.question}
                      </Text>
                      {item.target && (
                        <Text style={styles.customCardMeta}>
                          Đáp án: {item.target.emoji} {item.target.label}
                        </Text>
                      )}
                      {item.options && Array.isArray(item.options) && (
                        <Text style={styles.customCardMeta}>
                          {item.options.length} lựa chọn
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => {
                        Alert.alert('Xóa câu hỏi', 'Bạn có chắc muốn xóa câu hỏi này không?', [
                          { text: 'Hủy', style: 'cancel' },
                          {
                            text: 'Xóa',
                            style: 'destructive',
                            onPress: () => deleteCustomGameQuestion(activeTab, item.id),
                          },
                        ]);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setGameQuestionEditorOpen(false)}
            >
              <Text style={styles.doneBtnText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalBox: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: UI_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  tabBtnActive: {
    borderColor: UI_COLORS.primary,
    backgroundColor: '#E0F2FE',
  },
  tabBtnEmoji: {
    fontSize: 14,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: UI_COLORS.primary,
  },
  badgeCount: {
    backgroundColor: UI_COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  inputHelp: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: UI_COLORS.textPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  boxGroup: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  radioBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  radioBtnActive: {
    borderColor: UI_COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  radioText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  poseSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  poseTypeBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  poseTypeBtnActive: {
    borderColor: UI_COLORS.primary,
    backgroundColor: '#E0F2FE',
  },
  poseTypeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  poseTypeBtnTextActive: {
    color: UI_COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: UI_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 16,
    shadowColor: UI_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customListSection: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    paddingBottom: 20,
  },
  customListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customListTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  emptySubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  customCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  customCardQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.textPrimary,
  },
  customCardMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doneBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});

