import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Vibration, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { audioService } from '../../services/audioService';
import { FITZGERALD_COLORS } from '../../constants/colors';
import { CardItemData } from '../../types';

export const DetectiveQuestModal: React.FC = () => {
  const {
    detectiveQuestOpen,
    setDetectiveQuestOpen,
    currentQuestCard,
    questOptions,
    startDetectiveQuest,
    completeDetectiveQuest,
    categories,
    tokenStars,
    mascotMood,
    setMascotMood,
    addTokenStar,
    settings,
  } = useAppStore();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);

  // Tên xưng hô thân mật của bé (lấy từ cài đặt phụ huynh, VD: "Bé An", "Bé Na", "Bé Bắp"...)
  const childCallName = settings.childName?.trim()
    ? settings.childName.trim().startsWith('Bé ') || settings.childName.trim().startsWith('Bạn ')
      ? settings.childName.trim()
      : `Bé ${settings.childName.trim()}`
    : 'Bé';

  // Tự động phát âm câu đố khi mở modal hoặc đổi câu đố
  useEffect(() => {
    if (detectiveQuestOpen && currentQuestCard) {
      setSelectedCardId(null);
      setIsSuccess(false);
      setWrongCardIds([]);

      // Dino đọc to câu đố bằng tiếng Việt theo đúng tên của con
      const promptText = `${childCallName} ơi! Đâu là thẻ ${currentQuestCard.label} nào?`;
      audioService.playPrompt(promptText);
    }
  }, [detectiveQuestOpen, currentQuestCard?.id, childCallName]);

  if (!detectiveQuestOpen || !currentQuestCard) return null;

  // Xử lý khi bé chạm vào 1 trong 3 thẻ
  const handleSelectCard = (card: CardItemData) => {
    if (isSuccess) return; // Đã đúng thì không nhận bấm nữa
    if (wrongCardIds.includes(card.id)) return; // Thẻ đã bấm sai trước đó

    const isCorrect = card.id === currentQuestCard.id;

    if (isCorrect) {
      // 1. Trẻ chọn ĐÚNG:
      setSelectedCardId(card.id);
      setIsSuccess(true);
      setMascotMood('cheering');

      // Rung xúc giác ăn mừng
      try {
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 100, 50, 100]);
        }
      } catch {}

      // Phát âm thanh thẻ rồi khen ngợi
      audioService.playCardSound(card);
      setTimeout(() => {
        audioService.playPraise(`Chính xác! Bé tìm đúng thẻ ${card.label} rồi!`);
      }, 500);

      // Thưởng 1 sao Token
      addTokenStar();
    } else {
      // 2. Trẻ chọn CHƯA ĐÚNG:
      setWrongCardIds((prev) => [...prev, card.id]);

      // Rung nhẹ
      try {
        if (Platform.OS !== 'web') {
          Vibration.vibrate(40);
        }
      } catch {}

      // Đọc tên thẻ vừa chạm để trẻ học từ mới, sau đó nhắc nhẹ
      audioService.playCardSound(card);
      setTimeout(() => {
        audioService.playGentleRetry();
      }, 600);
    }
  };

  const handleReplayPrompt = () => {
    if (currentQuestCard) {
      audioService.playPrompt(`${childCallName} ơi! Đâu là thẻ ${currentQuestCard.label} nào?`);
    }
  };

  const handleNextQuest = () => {
    startDetectiveQuest();
  };

  const handleFinish = () => {
    setDetectiveQuestOpen(false);
    setMascotMood('happy');
  };

  // Lấy màu Fitzgerald Key cho từng thẻ
  const getCardColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return { bg: '#FFFFFF', border: '#CBD5E1', darkText: '#1E293B' };
    const colorKey = cat.type;
    return {
      bg: FITZGERALD_COLORS[colorKey]?.bg || '#FFFFFF',
      border: FITZGERALD_COLORS[colorKey]?.border || '#CBD5E1',
      darkText: FITZGERALD_COLORS[colorKey]?.darkText || '#1E293B',
    };
  };

  // Đảm bảo luôn có 3 lựa chọn (fallback nếu questOptions chưa có)
  const optionsToRender =
    questOptions && questOptions.length >= 3
      ? questOptions
      : [currentQuestCard];

  return (
    <Modal
      visible={detectiveQuestOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setDetectiveQuestOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.questBadge}>
              <Text style={styles.questBadgeText}>🔍 THÁM TỬ PECS: ĐỐ VUI 3 THẺ</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.starBadge}>
                <Text style={styles.starText}>⭐ {tokenStars}/3 sao</Text>
              </View>
              <TouchableOpacity onPress={() => setDetectiveQuestOpen(false)}>
                <Ionicons name="close-circle" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Linh vật Dino đưa ra câu đố */}
          <View style={styles.mascotSpeech}>
            <Text style={styles.dinoAvatar}>
              {mascotMood === 'cheering' ? '🥳' : isSuccess ? '🦖' : '🦖'}
            </Text>
            <TouchableOpacity
              style={styles.speechBubble}
              onPress={handleReplayPrompt}
              activeOpacity={0.8}
            >
              <View style={styles.speechTextRow}>
                <Text style={styles.speechText}>
                  "{childCallName} ơi! Đâu là thẻ{' '}
                  <Text style={styles.targetHighlight}>[{currentQuestCard.label}]</Text> nào?"
                </Text>
                <View style={styles.soundMiniBtn}>
                  <Ionicons name="volume-medium" size={18} color="#059669" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* KHU VỰC 3 LỰA CHỌN THẺ CHO BÉ CHỌN (PICTURE DISCRIMINATION) */}
          <Text style={styles.hintSubtitle}>
            {isSuccess
              ? '🎉 Tuyệt vời! Bé đã chọn đáp án chính xác!'
              : '👇 Bé hãy chạm vào 1 trong 3 thẻ bên dưới nhé:'}
          </Text>

          <View style={styles.optionsContainer}>
            {optionsToRender.map((option, index) => {
              const isTarget = option.id === currentQuestCard.id;
              const isWrong = wrongCardIds.includes(option.id);
              const isChosenCorrect = isSuccess && isTarget;
              const colors = getCardColor(option.categoryId);

              return (
                <TouchableOpacity
                  key={option.id || index}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isChosenCorrect
                        ? '#ECFDF5'
                        : isWrong
                        ? '#F8FAFC'
                        : colors.bg,
                      borderColor: isChosenCorrect
                        ? '#10B981'
                        : isWrong
                        ? '#E2E8F0'
                        : colors.border,
                      borderWidth: isChosenCorrect ? 3 : 2,
                      opacity: isWrong ? 0.45 : 1,
                    },
                    isChosenCorrect && styles.correctCardGlow,
                  ]}
                  onPress={() => handleSelectCard(option)}
                  activeOpacity={0.75}
                  disabled={isSuccess || isWrong}
                >
                  {/* Huy hiệu kết quả */}
                  {isChosenCorrect && (
                    <View style={styles.resultBadgeCorrect}>
                      <Text style={styles.resultBadgeText}>⭐ ĐÚNG RỒI!</Text>
                    </View>
                  )}
                  {isWrong && (
                    <View style={styles.resultBadgeWrong}>
                      <Text style={styles.resultBadgeWrongText}>❌ Thử lại</Text>
                    </View>
                  )}

                  {/* Chỉ hiển thị hình ảnh hoặc Emoji (PECS Picture Discrimination - thuần túy thị giác, không hiện chữ) */}
                  <View style={styles.optionImageBox}>
                    {option.imageUri ? (
                      <Image source={{ uri: option.imageUri }} style={styles.optionImage} />
                    ) : (
                      <Text style={styles.optionEmoji}>{option.emojiIcon || '🏷️'}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Banner thông báo phần thưởng khi trả lời đúng */}
          {isSuccess ? (
            <View style={styles.congratsBanner}>
              <Text style={styles.congratsTitle}>🎉 CHÍNH XÁC! (+1 ⭐)</Text>
              <Text style={styles.congratsDesc}>
                Bé đã tìm đúng thẻ "{currentQuestCard.label}"!
              </Text>
            </View>
          ) : (
            wrongCardIds.length > 0 && (
              <View style={styles.tryAgainBanner}>
                <Text style={styles.tryAgainText}>
                  💡 Chưa đúng, bé hãy thử chạm thẻ khác nhé!
                </Text>
              </View>
            )
          )}

          {/* Các nút điều hướng */}
          <View style={styles.actions}>
            {isSuccess ? (
              <View style={styles.successActionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.nextBtn]}
                  onPress={handleNextQuest}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.nextBtnText}>Câu tiếp theo ➡️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.finishBtn]}
                  onPress={handleFinish}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-done" size={20} color="#065F46" />
                  <Text style={styles.finishBtnText}>Về bảng</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.normalActionsRow}>
                <TouchableOpacity
                  style={styles.changeQuestBtn}
                  onPress={handleNextQuest}
                  activeOpacity={0.75}
                >
                  <Ionicons name="shuffle" size={18} color="#0284C7" />
                  <Text style={styles.changeQuestText}>Đổi câu khác 🔄</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.speakPromptBtn}
                  onPress={handleReplayPrompt}
                  activeOpacity={0.75}
                >
                  <Ionicons name="volume-high" size={18} color="#059669" />
                  <Text style={styles.speakPromptText}>Nghe lại câu đố 🔊</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  questBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  questBadgeText: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FACC15',
  },
  starText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
  },
  mascotSpeech: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    width: '100%',
  },
  dinoAvatar: {
    fontSize: 46,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    borderRadius: 16,
    padding: 10,
  },
  speechTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  speechText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 18,
  },
  soundMiniBtn: {
    backgroundColor: '#D1FAE5',
    padding: 5,
    borderRadius: 8,
  },
  targetHighlight: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 15,
  },
  hintSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 14,
  },
  optionCard: {
    flex: 1,
    maxWidth: 116,
    height: 125,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  correctCardGlow: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  resultBadgeCorrect: {
    position: 'absolute',
    top: 6,
    zIndex: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  resultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  resultBadgeWrong: {
    position: 'absolute',
    top: 6,
    zIndex: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  resultBadgeWrongText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  optionImageBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionImage: {
    width: 68,
    height: 68,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  optionEmoji: {
    fontSize: 52,
  },
  congratsBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  congratsTitle: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 2,
  },
  congratsDesc: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '500',
  },
  tryAgainBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  tryAgainText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
  },
  successActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextBtn: {
    backgroundColor: '#10B981',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  finishBtn: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  finishBtnText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  normalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  changeQuestBtn: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  changeQuestText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 12,
  },
  speakPromptBtn: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  speakPromptText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 12,
  },
});

