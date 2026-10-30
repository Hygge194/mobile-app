import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { audioService } from '../../services/audioService';
import { UI_COLORS, FITZGERALD_COLORS } from '../../constants/colors';

interface StepData {
  stage: 'child' | 'parent';
  stageTitle: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  description: string;
}

export const GuidedTourModal: React.FC = () => {
  const {
    onboardingOpen,
    completeOnboarding,
    settings,
    addTokenStar,
  } = useAppStore();

  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 680;
  const isSmallMobile = windowWidth < 400;

  const [currentStep, setCurrentStep] = useState(0);
  const [childName, setChildName] = useState(settings?.childName || 'Bé Bo');
  const [gridColumns, setGridColumns] = useState(settings?.gridColumns || 3);

  // Trạng thái thực hành tương tác của Bé (Interactive Playground)
  const [interactiveCards, setInteractiveCards] = useState<
    Array<{ id: string; label: string; emoji: string; colorHex: string; borderHex: string }>
  >([]);
  const [isSpeakingSentence, setIsSpeakingSentence] = useState(false);
  const [hasSpokenSentence, setHasSpokenSentence] = useState(false);
  const [starAwardedInTour, setStarAwardedInTour] = useState(false);

  // Trạng thái đếm nhịp 3 giây quy tắc vàng của Bố Mẹ
  const [delayTimer, setDelayTimer] = useState<number | null>(null);

  // Hiệu ứng nhịp đập & chỉ tay
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (onboardingOpen) {
      setCurrentStep(0);
      setInteractiveCards([]);
      setIsSpeakingSentence(false);
      setHasSpokenSentence(false);
      setStarAwardedInTour(false);
      setDelayTimer(null);
      if (settings?.childName) setChildName(settings.childName);
      if (settings?.gridColumns) setGridColumns(settings.gridColumns);
    }
  }, [onboardingOpen, settings?.childName, settings?.gridColumns]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const childDisplayName = childName?.trim() ? childName.trim() : 'Bé';

  const steps: StepData[] = [
    // GIAI ĐOẠN 1: DÀNH CHO BÉ (THỰC HÀNH TƯƠNG TÁC 4 BƯỚC)
    {
      stage: 'child',
      stageTitle: 'BÉ TẬP DÙNG PECS',
      stepNumber: 1,
      title: 'Chạm vào thẻ mở đầu câu',
      subtitle: 'Bước 1: Chọn thẻ chủ ngữ "Con muốn"',
      icon: 'hand-left',
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
      description: `Bé ${childDisplayName} hãy thử chạm vào thẻ màu vàng "Con muốn 🙋" ngay bên dưới để bắt đầu ghép câu nhé!`,
    },
    {
      stage: 'child',
      stageTitle: 'BÉ TẬP DÙNG PECS',
      stepNumber: 2,
      title: 'Chọn món đồ con muốn',
      subtitle: 'Bước 2: Ghép thêm đồ vật hoặc hành động',
      icon: 'grid',
      iconColor: '#0284C7',
      iconBg: '#E0F2FE',
      description: `Bé muốn gì nào? Hãy chạm vào 1 trong các thẻ đồ vật bên dưới (ví dụ: "Uống nước 🥛") để thêm vào thanh câu!`,
    },
    {
      stage: 'child',
      stageTitle: 'BÉ TẬP DÙNG PECS',
      stepNumber: 3,
      title: 'Bấm nút Loa để máy đọc to',
      subtitle: 'Bước 3: Nghe âm thanh câu hoàn chỉnh',
      icon: 'volume-high',
      iconColor: '#059669',
      iconBg: '#D1FAE5',
      description: `Câu của bé đã sẵn sàng! Bé hãy bấm vào nút Loa màu xanh 📢 để máy đọc to câu nói cho bố mẹ nghe nhé!`,
    },
    {
      stage: 'child',
      stageTitle: 'BÉ TẬP DÙNG PECS',
      stepNumber: 4,
      title: 'Dino tặng sao khen thưởng',
      subtitle: 'Bước 4: Nhận thưởng sao tạo động lực',
      icon: 'star',
      iconColor: '#EAB308',
      iconBg: '#FEF9C3',
      description: `Tuyệt vời! Bé ${childDisplayName} đã hoàn thành câu nói đầu tiên. Linh vật Dino tặng bé 1 ngôi sao thưởng ⭐!`,
    },

    // GIAI ĐOẠN 2: DÀNH CHO PHỤ HUYNH (HƯỚNG DẪN ĐỒNG HÀNH 4 BƯỚC)
    {
      stage: 'parent',
      stageTitle: 'HƯỚNG DẪN BỐ MẸ',
      stepNumber: 5,
      title: 'Quy tắc 3 giây vàng (Expectant Delay)',
      subtitle: 'Kỹ thuật mấu chốt giúp con nhìn mắt & bật âm',
      icon: 'hourglass',
      iconColor: '#7C3AED',
      iconBg: '#EDE9FE',
      description:
        'Khi con bấm thẻ đòi món đồ, cha mẹ hãy giơ món đồ ngang tầm mắt mình, nhìn vào mắt con, nhắc lại từ then chốt và chờ đợi 3 giây trước khi trao đồ cho con. Tuyệt đối không đưa ngay lập tức!',
    },
    {
      stage: 'parent',
      stageTitle: 'HƯỚNG DẪN BỐ MẸ',
      stepNumber: 6,
      title: 'Khay nhu cầu khẩn cấp 1 chạm',
      subtitle: 'Giải cứu tức thời khi con khó chịu hoặc đau',
      icon: 'alert-circle',
      iconColor: '#EF4444',
      iconBg: '#FEE2E2',
      description:
        'Trẻ chậm nói hay bộc phát giận dữ khi bị đau bụng, đói hoặc quá tải giác quan. Khay 1 chạm luôn cố định ở đầu màn hình giúp trẻ ấn 1 phát là thông báo ngay cho phụ huynh.',
    },
    {
      stage: 'parent',
      stageTitle: 'HƯỚNG DẪN BỐ MẸ',
      stepNumber: 7,
      title: '5 Trò chơi tương tác & Thêm câu hỏi',
      subtitle: 'Học thông qua niềm vui cùng linh vật Dino',
      icon: 'game-controller',
      iconColor: '#0284C7',
      iconBg: '#E0F2FE',
      description:
        'Ứng dụng có sẵn 5 trò chơi (Thẻ lật, Nối ý, Nghiêng đầu camera AI, Trắc nghiệm cảm xúc, Thể dục). Đặc biệt: Bố mẹ có thể tự thêm câu hỏi, đồ vật riêng của gia đình vào cả 5 trò chơi!',
    },
    {
      stage: 'parent',
      stageTitle: 'HƯỚNG DẪN BỐ MẸ',
      stepNumber: 8,
      title: 'Cá nhân hóa bố cục & Bắt đầu',
      subtitle: 'Khóa an toàn Parental Gate bảo vệ cài đặt',
      icon: 'checkmark-circle',
      iconColor: '#059669',
      iconBg: '#D1FAE5',
      description:
        'Phụ huynh có thể tùy biến số cột thẻ hiển thị phù hợp với độ tuổi và năng lực của con, đồng thời tự chụp ảnh đồ dùng ở nhà để tạo thẻ mới bất cứ lúc nào.',
    },
  ];

  if (!onboardingOpen) return null;

  const activeStep = steps[currentStep];

  // Hành động Bé bấm thẻ "Con muốn" ở bước 1
  const handleSelectStarter = () => {
    audioService.playPopSound(1.2);
    audioService.speakText('Con muốn');
    const starterCard = {
      id: 'starter_want',
      label: 'Con muốn',
      emoji: '🙋',
      colorHex: FITZGERALD_COLORS.people.bg,
      borderHex: FITZGERALD_COLORS.people.border,
    };
    if (!interactiveCards.some((c) => c.id === 'starter_want')) {
      setInteractiveCards([starterCard]);
    }
  };

  // Hành động Bé chọn đồ vật ở bước 2
  const handleSelectObject = (item: { id: string; label: string; emoji: string }) => {
    audioService.playPopSound(1.2);
    audioService.speakText(item.label);
    const objCard = {
      id: item.id,
      label: item.label,
      emoji: item.emoji,
      colorHex: FITZGERALD_COLORS.object.bg,
      borderHex: FITZGERALD_COLORS.object.border,
    };
    const hasStarter = interactiveCards.some((c) => c.id === 'starter_want');
    const starterCard = hasStarter
      ? interactiveCards[0]
      : {
          id: 'starter_want',
          label: 'Con muốn',
          emoji: '🙋',
          colorHex: FITZGERALD_COLORS.people.bg,
          borderHex: FITZGERALD_COLORS.people.border,
        };
    setInteractiveCards([starterCard, objCard]);
  };

  // Hành động bấm Loa đọc to câu nói ở bước 3
  const handleSpeakInteractiveSentence = () => {
    const sentence = interactiveCards.length > 0
      ? interactiveCards.map((c) => c.label).join(' ')
      : 'Con muốn uống nước';
    setIsSpeakingSentence(true);
    setHasSpokenSentence(true);
    audioService.playPraise(sentence);
    setTimeout(() => {
      setIsSpeakingSentence(false);
    }, 1500);
  };

  // Nhận sao thưởng ở bước 4
  const handleClaimStar = () => {
    if (!starAwardedInTour) {
      setStarAwardedInTour(true);
      addTokenStar();
      audioService.playPopSound(1.3);
      audioService.playPraise(`Bé ${childDisplayName} giỏi lắm! Con nhận được 1 sao vàng!`);
    }
  };

  // Mô phỏng đếm nhịp 3 giây ở bước 5
  const handleStart3sDelay = () => {
    audioService.playPopSound(1.1);
    setDelayTimer(3);
    const timer = setInterval(() => {
      setDelayTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          audioService.playPraise(`Hết 3 giây! Bây giờ cha mẹ khen và trao đồ cho bé nhé!`);
          return 0;
        }
        audioService.playPopSound(1.0);
        return prev - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    audioService.stopAll();
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    audioService.stopAll();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    audioService.stopAll();
    await completeOnboarding(childName, gridColumns);
  };

  return (
    <Modal
      visible={onboardingOpen}
      transparent
      animationType="fade"
      onRequestClose={handleFinish}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, isMobile && { width: '96%', maxHeight: '94%', borderRadius: 20 }]}>
          {/* HEADER CHUYỂN GIAI ĐOẠN (BÉ / BỐ MẸ) */}
          <View style={styles.headerBar}>
            <View style={styles.stageTabs}>
              <TouchableOpacity
                style={[styles.stageTabBtn, activeStep.stage === 'child' && styles.stageTabBtnActiveChild]}
                onPress={() => setCurrentStep(0)}
                activeOpacity={0.8}
              >
                <Text style={styles.stageTabEmoji}>👶</Text>
                <Text style={[styles.stageTabTitle, activeStep.stage === 'child' && styles.stageTabTitleActiveChild]}>
                  CHẶNG 1: DÀNH CHO BÉ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.stageTabBtn, activeStep.stage === 'parent' && styles.stageTabBtnActiveParent]}
                onPress={() => setCurrentStep(4)}
                activeOpacity={0.8}
              >
                <Text style={styles.stageTabEmoji}>👨‍👩‍👧</Text>
                <Text style={[styles.stageTabTitle, activeStep.stage === 'parent' && styles.stageTabTitleActiveParent]}>
                  CHẶNG 2: DÀNH CHO BỐ MẸ
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleFinish}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.skipBtnText}>Bỏ qua</Text>
              <Ionicons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* NỘI DUNG CUỘN CHÍNH */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollInner, isMobile && { paddingHorizontal: 16, paddingTop: 16 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* TIÊU ĐỀ & ICON BƯỚC */}
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconWrap, { backgroundColor: activeStep.iconBg }]}>
                <Ionicons name={activeStep.icon} size={isMobile ? 32 : 38} color={activeStep.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.stageBadge, { backgroundColor: activeStep.stage === 'child' ? '#FEF3C7' : '#EDE9FE' }]}>
                    <Text style={[styles.stageBadgeText, { color: activeStep.stage === 'child' ? '#B45309' : '#6D28D9' }]}>
                      {activeStep.stageTitle} • BƯỚC {activeStep.stepNumber}/4
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.listenBtn}
                    onPress={() => audioService.speakText(`${activeStep.title}. ${activeStep.description}`)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="volume-high" size={14} color="#0284C7" />
                    <Text style={styles.listenBtnText}>Đọc</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.stepTitle, isMobile && { fontSize: 17 }]}>{activeStep.title}</Text>
                <Text style={styles.stepSubtitle}>{activeStep.subtitle}</Text>
              </View>
            </View>

            <Text style={[styles.stepDescription, isMobile && { fontSize: 13, lineHeight: 19 }]}>
              {activeStep.description}
            </Text>

            {/* ============================================================ */}
            {/* KHU VỰC THỰC HÀNH TƯƠNG TÁC THEO TỪNG BƯỚC */}
            {/* ============================================================ */}

            {/* BƯỚC 1: BÉ CHẠM THẺ MỞ ĐẦU ("Con muốn") */}
            {currentStep === 0 && (
              <View style={styles.interactiveBox}>
                <Text style={styles.interactiveBoxTitle}>👇 Bé chạm thử vào thẻ dưới đây:</Text>

                <View style={styles.interactiveCardCenter}>
                  <Animated.View style={{ transform: [{ scale: interactiveCards.length === 0 ? pulseAnim : 1 }] }}>
                    <TouchableOpacity
                      style={[
                        styles.demoCardItem,
                        {
                          backgroundColor: FITZGERALD_COLORS.people.bg,
                          borderColor: FITZGERALD_COLORS.people.border,
                        },
                        interactiveCards.some((c) => c.id === 'starter_want') && styles.demoCardSelected,
                      ]}
                      onPress={handleSelectStarter}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.demoCardEmoji}>🙋</Text>
                      <Text style={[styles.demoCardLabel, { color: FITZGERALD_COLORS.people.darkText }]}>Con muốn</Text>
                      {interactiveCards.length === 0 && (
                        <View style={styles.pointerBadge}>
                          <Text style={{ fontSize: 16 }}>👆</Text>
                          <Text style={styles.pointerText}>Chạm vào đây</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {interactiveCards.length > 0 && (
                  <View style={styles.successPill}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={styles.successPillText}>Đã thêm "Con muốn"! Bấm "Tiếp theo" để chọn đồ vật nhé ➡️</Text>
                  </View>
                )}
              </View>
            )}

            {/* BƯỚC 2: BÉ CHỌN ĐỒ VẬT ("Uống nước", "Ăn bánh", "Chơi xe") */}
            {currentStep === 1 && (
              <View style={styles.interactiveBox}>
                {/* Thanh câu mô phỏng hiện tại */}
                <View style={styles.miniStripPreview}>
                  <Text style={styles.miniStripLabel}>Thanh câu của bé:</Text>
                  <View style={styles.miniStripRow}>
                    <View style={[styles.miniStripCard, { backgroundColor: FITZGERALD_COLORS.people.bg, borderColor: FITZGERALD_COLORS.people.border }]}>
                      <Text style={{ fontSize: 16 }}>🙋</Text>
                      <Text style={[styles.miniStripCardText, { color: FITZGERALD_COLORS.people.darkText }]}>Con muốn</Text>
                    </View>
                    <Ionicons name="add" size={16} color="#94A3B8" />
                    {interactiveCards.length > 1 ? (
                      <View style={[styles.miniStripCard, { backgroundColor: FITZGERALD_COLORS.object.bg, borderColor: FITZGERALD_COLORS.object.border }]}>
                        <Text style={{ fontSize: 16 }}>{interactiveCards[1].emoji}</Text>
                        <Text style={[styles.miniStripCardText, { color: FITZGERALD_COLORS.object.darkText }]}>{interactiveCards[1].label}</Text>
                      </View>
                    ) : (
                      <View style={styles.miniStripPlaceholder}>
                        <Text style={styles.miniStripPlaceholderText}>[Chờ chọn món...]</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.interactiveBoxTitle}>👇 Bé thích món nào? Chạm vào thẻ món đó:</Text>
                <View style={styles.demoCardGrid}>
                  {[
                    { id: 'water', label: 'Uống nước', emoji: '🥛' },
                    { id: 'cookie', label: 'Ăn bánh', emoji: '🍪' },
                    { id: 'car', label: 'Chơi ô tô', emoji: '🚗' },
                  ].map((item) => {
                    const isSelected = interactiveCards.some((c) => c.id === item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.demoCardItemSmall,
                          {
                            backgroundColor: FITZGERALD_COLORS.object.bg,
                            borderColor: FITZGERALD_COLORS.object.border,
                          },
                          isSelected && styles.demoCardSelected,
                        ]}
                        onPress={() => handleSelectObject(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={{ fontSize: 26, marginBottom: 2 }}>{item.emoji}</Text>
                        <Text style={[styles.demoCardLabel, { color: FITZGERALD_COLORS.object.darkText }]}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {interactiveCards.length > 1 && (
                  <View style={styles.successPill}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={styles.successPillText}>Ghép câu thành công! Bấm "Tiếp theo" để đọc to nhé ➡️</Text>
                  </View>
                )}
              </View>
            )}

            {/* BƯỚC 3: BẤM NÚT LOA ĐỌC TO CÂU NÓI */}
            {currentStep === 2 && (
              <View style={styles.interactiveBox}>
                <View style={styles.fullSentenceStripBox}>
                  <View style={styles.fullSentenceLeft}>
                    <View style={[styles.miniStripCard, { backgroundColor: FITZGERALD_COLORS.people.bg, borderColor: FITZGERALD_COLORS.people.border }]}>
                      <Text style={{ fontSize: 18 }}>🙋</Text>
                      <Text style={[styles.miniStripCardText, { color: FITZGERALD_COLORS.people.darkText }]}>Con muốn</Text>
                    </View>
                    <View style={[styles.miniStripCard, { backgroundColor: FITZGERALD_COLORS.object.bg, borderColor: FITZGERALD_COLORS.object.border }]}>
                      <Text style={{ fontSize: 18 }}>{interactiveCards[1]?.emoji || '🥛'}</Text>
                      <Text style={[styles.miniStripCardText, { color: FITZGERALD_COLORS.object.darkText }]}>{interactiveCards[1]?.label || 'Uống nước'}</Text>
                    </View>
                  </View>

                  <Animated.View style={{ transform: [{ scale: !hasSpokenSentence ? pulseAnim : 1 }] }}>
                    <TouchableOpacity
                      style={[styles.bigSpeakBtn, isSpeakingSentence && { backgroundColor: '#10B981' }]}
                      onPress={handleSpeakInteractiveSentence}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={isSpeakingSentence ? 'volume-high' : 'volume-medium'} size={24} color="#FFFFFF" />
                      <Text style={styles.bigSpeakBtnText}>{isSpeakingSentence ? 'Đang đọc...' : 'Đọc câu'}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {hasSpokenSentence ? (
                  <View style={styles.successPill}>
                    <Ionicons name="sparkles" size={18} color="#16A34A" />
                    <Text style={styles.successPillText}>Bé vừa tự nói câu hoàn chỉnh bằng âm thanh tiếng Việt! 🎉</Text>
                  </View>
                ) : (
                  <Text style={styles.hintText}>👆 Nhấn vào nút "Đọc câu" màu xanh phía trên</Text>
                )}
              </View>
            )}

            {/* BƯỚC 4: DINO TẶNG SAO THƯỞNG VÀ KHEN NGỢI */}
            {currentStep === 3 && (
              <View style={[styles.interactiveBox, { alignItems: 'center', backgroundColor: '#FEFCE8' }]}>
                <Text style={{ fontSize: 48, marginVertical: 6 }}>🦖</Text>
                <Text style={styles.dinoCheerTitle}>Hoan hô bé {childDisplayName}!</Text>
                <Text style={styles.dinoCheerDesc}>
                  Bé đã tự mình ghép câu và nói to mong muốn của mình. Linh vật Dino tặng bé 1 ngôi sao thưởng tạo động lực:
                </Text>

                <TouchableOpacity
                  style={[styles.claimStarBtn, starAwardedInTour && styles.claimStarBtnClaimed]}
                  onPress={handleClaimStar}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 24 }}>⭐</Text>
                  <Text style={styles.claimStarBtnText}>
                    {starAwardedInTour ? 'Đã nhận thưởng 1 Sao! ⭐' : 'Chạm để nhận 1 Sao thưởng ⭐'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* BƯỚC 5: BỐ MẸ - NGUYÊN TẮC 3 GIÂY VÀNG (EXPECTANT DELAY) */}
            {currentStep === 4 && (
              <View style={styles.interactiveBox}>
                <View style={styles.abaGuidelineCard}>
                  <View style={styles.abaStepRow}>
                    <Text style={styles.abaStepNumber}>1</Text>
                    <Text style={styles.abaStepText}>Bé ấn thẻ đòi món đồ (ví dụ: bình nước).</Text>
                  </View>
                  <View style={styles.abaStepRow}>
                    <Text style={styles.abaStepNumber}>2</Text>
                    <Text style={styles.abaStepText}>Mẹ cầm đồ vật giơ ngang tầm mắt mình, tạo cơ hội bé nhìn mắt mẹ.</Text>
                  </View>
                  <View style={styles.abaStepRow}>
                    <Text style={styles.abaStepNumber}>3</Text>
                    <Text style={styles.abaStepText}>Nhắc lại từ khóa "Nước" và đếm lùi 3 giây chờ bé bật âm.</Text>
                  </View>
                  <View style={styles.abaStepRow}>
                    <Text style={styles.abaStepNumber}>4</Text>
                    <Text style={styles.abaStepText}>Khen ngợi và trao đồ cho bé (kể cả khi bé chỉ bập bẹ hoặc nhìn mắt).</Text>
                  </View>
                </View>

                {/* Nút thực hành đếm nhịp 3 giây */}
                <TouchableOpacity
                  style={[styles.timerPracticeBtn, delayTimer !== null && delayTimer > 0 && { backgroundColor: '#7C3AED' }]}
                  onPress={handleStart3sDelay}
                  activeOpacity={0.8}
                >
                  <Ionicons name="time" size={20} color="#FFFFFF" />
                  <Text style={styles.timerPracticeBtnText}>
                    {delayTimer === null
                      ? '⏱️ Bố mẹ bấm thử để trải nghiệm 3 giây chờ'
                      : delayTimer > 0
                      ? `⏳ Đang chờ bé phản xạ: ${delayTimer}s...`
                      : '✅ Đủ 3 giây! Khen và trao đồ cho con 🎉'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* BƯỚC 6: BỐ MẸ - KHAY KHẨN CẤP 1 CHẠM */}
            {currentStep === 5 && (
              <View style={styles.interactiveBox}>
                <Text style={styles.interactiveBoxTitle}>Vị trí khay khẩn cấp cố định trên màn hình chính:</Text>
                <View style={styles.emergencyRowDemo}>
                  <View style={[styles.emergencyBadgeDemo, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                    <Text style={{ fontSize: 18 }}>🍚</Text>
                    <Text style={styles.emergencyBadgeText}>Con đói</Text>
                  </View>
                  <View style={[styles.emergencyBadgeDemo, { backgroundColor: '#E0F2FE', borderColor: '#0284C7' }]}>
                    <Text style={{ fontSize: 18 }}>🥤</Text>
                    <Text style={styles.emergencyBadgeText}>Khát nước</Text>
                  </View>
                  <View style={[styles.emergencyBadgeDemo, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                    <Text style={{ fontSize: 18 }}>🚽</Text>
                    <Text style={styles.emergencyBadgeText}>Vệ sinh</Text>
                  </View>
                  <View style={[styles.emergencyBadgeDemo, { backgroundColor: '#FCE7F3', borderColor: '#EC4899' }]}>
                    <Text style={{ fontSize: 18 }}>🤕</Text>
                    <Text style={styles.emergencyBadgeText}>Con đau</Text>
                  </View>
                </View>
                <Text style={styles.hintText}>
                  💡 Khi trẻ bấm 1 chạm, chuông báo sẽ reo và thiết bị đọc to giúp bố mẹ phát hiện ngay lập tức.
                </Text>
              </View>
            )}

            {/* BƯỚC 7: BỐ MẸ - 5 TRÒ CHƠI & TỰ THÊM CÂU HỎI */}
            {currentStep === 6 && (
              <View style={styles.interactiveBox}>
                <View style={styles.gamesPreviewList}>
                  <View style={styles.gamePreviewItem}>
                    <Text style={styles.gamePreviewEmoji}>🎴</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gamePreviewTitle}>1. Thẻ Lật</Text>
                      <Text style={styles.gamePreviewDesc}>Nhận diện đồ vật, hoa quả, con vật theo chủ đề</Text>
                    </View>
                  </View>

                  <View style={styles.gamePreviewItem}>
                    <Text style={styles.gamePreviewEmoji}>🧩</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gamePreviewTitle}>2. Nối Ý Logic</Text>
                      <Text style={styles.gamePreviewDesc}>Ghép đồ vật và công dụng (Mưa dùng Ô, Đói ăn Cơm)</Text>
                    </View>
                  </View>

                  <View style={styles.gamePreviewItem}>
                    <Text style={styles.gamePreviewEmoji}>↔️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gamePreviewTitle}>3. Nghiêng Đầu Camera AI</Text>
                      <Text style={styles.gamePreviewDesc}>Bé nghiêng đầu Trái / Phải để chọn đáp án</Text>
                    </View>
                  </View>

                  <View style={styles.gamePreviewItem}>
                    <Text style={styles.gamePreviewEmoji}>💖</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gamePreviewTitle}>4. Trắc Nghiệm Cảm Xúc</Text>
                      <Text style={styles.gamePreviewDesc}>Dạy bé bộc lộ cảm xúc và phản xạ giao tiếp đúng</Text>
                    </View>
                  </View>

                  <View style={styles.gamePreviewItem}>
                    <Text style={styles.gamePreviewEmoji}>🤸</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gamePreviewTitle}>5. Thể Dục Tư Thế AI</Text>
                      <Text style={styles.gamePreviewDesc}>Nhận diện tư thế vươn tay, tai thỏ, chắp tay, dang ngang</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.successPill, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                  <Ionicons name="sparkles" size={16} color="#0284C7" />
                  <Text style={[styles.successPillText, { color: '#0369A1' }]}>
                    Phụ huynh có thể bấm nút "➕ Thêm câu hỏi" để nhập câu hỏi riêng của gia đình bất cứ lúc nào!
                  </Text>
                </View>
              </View>
            )}

            {/* BƯỚC 8: BỐ MẸ - THIẾT LẬP CÁ NHÂN HÓA BAN ĐẦU */}
            {currentStep === 7 && (
              <View style={styles.interactiveBox}>
                <Text style={styles.fieldLabel}>Tên thân mật của bé ở nhà:</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="heart" size={18} color="#EC4899" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.textInput}
                    value={childName}
                    onChangeText={setChildName}
                    placeholder="VD: Bé Bắp, Bé Na, Bé Bon..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Số cột hiển thị trên bảng thẻ:</Text>
                <View style={styles.columnSelectorRow}>
                  {[1, 2, 3, 4].map((col) => {
                    const isSelected = gridColumns === col;
                    return (
                      <TouchableOpacity
                        key={col}
                        style={[styles.colBtn, isSelected && styles.colBtnActive]}
                        onPress={() => setGridColumns(col)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.colBtnText, isSelected && styles.colBtnTextActive]}>{col} Cột</Text>
                        <Text style={styles.colBtnSub}>{col === 1 ? 'Tập trung' : col === 2 ? 'Khởi đầu' : col === 3 ? 'Khuyên dùng' : 'Nâng cao'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* DOTS PROGRESS INDICATOR */}
          <View style={styles.dotsBar}>
            {steps.map((s, idx) => {
              const isActive = idx === currentStep;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    audioService.stopAll();
                    setCurrentStep(idx);
                  }}
                  style={[
                    styles.dot,
                    isActive && (s.stage === 'child' ? styles.dotActiveChild : styles.dotActiveParent),
                  ]}
                />
              );
            })}
          </View>

          {/* THANH ĐIỀU HƯỚNG CHÂN TRANG */}
          <View style={[styles.footerBar, isMobile && { paddingHorizontal: 14, paddingVertical: 10 }]}>
            {currentStep > 0 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={16} color="#475569" />
                <Text style={styles.backBtnText}>Quay lại</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 80 }} />
            )}

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.nextBtnText}>
                {currentStep === steps.length - 1 ? '🎉 Bắt đầu sử dụng ngay' : 'Tiếp theo'}
              </Text>
              <Ionicons
                name={currentStep === steps.length - 1 ? 'checkmark-circle' : 'arrow-forward'}
                size={18}
                color="#FFFFFF"
              />
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
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  container: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stageTabs: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  stageTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  stageTabBtnActiveChild: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  stageTabBtnActiveParent: {
    borderColor: '#7C3AED',
    backgroundColor: '#EDE9FE',
  },
  stageTabEmoji: {
    fontSize: 13,
  },
  stageTabTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stageTabTitleActiveChild: {
    color: '#B45309',
  },
  stageTabTitleActiveParent: {
    color: '#6D28D9',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
  },
  skipBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stageBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  listenBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: UI_COLORS.textPrimary,
  },
  stepSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.primary,
    marginTop: 2,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 14,
  },
  interactiveBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  interactiveBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    textAlign: 'center',
  },
  interactiveCardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  demoCardItem: {
    width: 130,
    height: 120,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  demoCardSelected: {
    borderColor: '#10B981',
    borderWidth: 3,
  },
  demoCardEmoji: {
    fontSize: 42,
    marginBottom: 4,
  },
  demoCardLabel: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  pointerBadge: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pointerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  successPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    flex: 1,
  },
  miniStripPreview: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  miniStripLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  miniStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniStripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniStripCardText: {
    fontSize: 12,
    fontWeight: '700',
  },
  miniStripPlaceholder: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  miniStripPlaceholderText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  demoCardGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 4,
  },
  demoCardItemSmall: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fullSentenceStripBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0284C7',
    borderRadius: 16,
    padding: 10,
    gap: 8,
  },
  fullSentenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  bigSpeakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: UI_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  bigSpeakBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hintText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  dinoCheerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#854D0E',
    marginBottom: 4,
  },
  dinoCheerDesc: {
    fontSize: 13,
    color: '#713F12',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 12,
  },
  claimStarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAB308',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  claimStarBtnClaimed: {
    backgroundColor: '#16A34A',
  },
  claimStarBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  abaGuidelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  abaStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  abaStepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    color: '#6D28D9',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  abaStepText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
    flex: 1,
    fontWeight: '600',
  },
  timerPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  timerPracticeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emergencyRowDemo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginVertical: 4,
  },
  emergencyBadgeDemo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  emergencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  gamesPreviewList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 6,
    marginBottom: 8,
  },
  gamePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  gamePreviewEmoji: {
    fontSize: 20,
  },
  gamePreviewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  gamePreviewDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: UI_COLORS.textPrimary,
  },
  columnSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  colBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  colBtnActive: {
    borderColor: UI_COLORS.primary,
    backgroundColor: '#E0F2FE',
  },
  colBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  colBtnTextActive: {
    color: UI_COLORS.primary,
  },
  colBtnSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  dotsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActiveChild: {
    width: 22,
    backgroundColor: '#F59E0B',
  },
  dotActiveParent: {
    width: 22,
    backgroundColor: '#7C3AED',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: UI_COLORS.primary,
    shadowColor: UI_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
