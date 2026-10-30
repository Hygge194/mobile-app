import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSentenceStore } from '../../stores/useSentenceStore';
import { FITZGERALD_COLORS, UI_COLORS } from '../../constants/colors';
import { useAppStore } from '../../stores/useAppStore';

const QUICK_GAMES: Array<{
  id: 'flip' | 'matching' | 'puzzle' | 'quiz' | 'movement';
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}> = [
  { id: 'flip', label: '1. Thẻ Lật', icon: '🎴', color: '#BE123C', bg: '#FFE4E6', border: '#FDA4AF' },
  { id: 'matching', label: '2. Nối Ý', icon: '🧩', color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  { id: 'puzzle', label: '3. Nghiêng Đầu', icon: '↔️', color: '#B45309', bg: '#FEF3C7', border: '#FCD34D' },
  { id: 'quiz', label: '4. Trắc Nghiệm', icon: '💖', color: '#BE185D', bg: '#FCE7F3', border: '#F472B6' },
  { id: 'movement', label: '5. Thể Dục', icon: '🤸', color: '#047857', bg: '#D1FAE5', border: '#6EE7B7' },
];

export const SentenceStrip: React.FC = () => {
  const { items, removeCard, clearSentence, speakSentence, isSpeaking } = useSentenceStore();
  const {
    categories,
    isWaitingForVoice,
    vocalRewardAwarded,
    triggerVocalReward,
    tokenStars,
    setPopItGameOpen,
    mascotMood,
    startDetectiveQuest,
    settings,
    setGamesCenterOpen,
    setActiveGameTab,
  } = useAppStore();

  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 680;
  const isSmallMobile = windowWidth < 440;

  const handleOpenGame = (gameId: 'flip' | 'matching' | 'puzzle' | 'quiz' | 'movement') => {
    setActiveGameTab(gameId);
    setGamesCenterOpen(true);
  };

  const childCallName = settings.childName?.trim()
    ? settings.childName.trim().startsWith('Bé ') || settings.childName.trim().startsWith('Bạn ')
      ? settings.childName.trim()
      : `Bé ${settings.childName.trim()}`
    : 'Bé';

  const getCardColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return { bg: '#FFFFFF', border: '#E2E8F0' };
    const colorKey = cat.type;
    return {
      bg: FITZGERALD_COLORS[colorKey]?.bg || '#FFFFFF',
      border: FITZGERALD_COLORS[colorKey]?.border || '#E2E8F0',
    };
  };

  return (
    <View style={[styles.container, isMobile && { paddingHorizontal: 8, paddingTop: 5, paddingBottom: 6 }]}>
      {/* Banner khuyến khích bật âm khi đang trong khoảng lặng */}
      {isWaitingForVoice && (
        <View style={styles.inductionBanner}>
          <Ionicons name="mic" size={20} color="#D97706" />
          <View style={{ flex: 1, paddingHorizontal: 6 }}>
            <Text style={styles.inductionTitle}>🎤 Đến lượt con nói nào!</Text>
            <Text style={styles.inductionSubtitle}>Bé tự nói từ cuối nhé (khoảng lặng kích âm)...</Text>
          </View>
          <TouchableOpacity
            style={styles.rewardBtn}
            onPress={() => {
              triggerVocalReward();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.rewardBtnText}>⭐ Bé vừa nói!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Banner chúc mừng khi bé phát âm thành công */}
      {vocalRewardAwarded && (
        <View style={styles.rewardBanner}>
          <Text style={styles.rewardTitle}>🎉 BÉ TỰ NÓI GIỎI QUÁ! ⭐⭐⭐</Text>
        </View>
      )}

      {/* Header thanh ghép câu tích hợp Linh vật Dino, 5 Trò chơi & Khay Token Economy */}
      <View style={[styles.stripHeader, isMobile && { marginBottom: 4, gap: 5 }]}>
        {/* Linh vật Dino tương tác */}
        <TouchableOpacity
          style={[styles.mascotTag, isMobile && { paddingHorizontal: 6, paddingVertical: 3, gap: 4 }]}
          onPress={startDetectiveQuest}
          activeOpacity={0.7}
        >
          <Text style={[styles.mascotEmoji, isMobile && { fontSize: 20 }]}>
            {mascotMood === 'eating'
              ? '😋'
              : mascotMood === 'happy'
              ? '🦖'
              : mascotMood === 'cheering'
              ? '🥳'
              : '🦖'}
          </Text>
          <View>
            <Text style={[styles.mascotName, isMobile && { fontSize: 11 }]}>Dino</Text>
            {!isSmallMobile && (
              <Text style={styles.mascotSpeechMini}>
                {mascotMood === 'eating'
                  ? 'Ngoàm! Ngon!'
                  : mascotMood === 'cheering'
                  ? `Hoan hô!`
                  : 'Đố vui 🔍'}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* 5 Trò chơi can thiệp sớm tương tác cùng hàng */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickGamesScroll}
          contentContainerStyle={[styles.quickGamesRow, isMobile && { gap: 4 }]}
        >
          {QUICK_GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.quickGameBtn,
                { backgroundColor: game.bg, borderColor: game.border },
                isMobile && { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
              ]}
              onPress={() => handleOpenGame(game.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.quickGameEmoji, isMobile && { fontSize: 12 }]}>{game.icon}</Text>
              <Text style={[styles.quickGameText, { color: game.color }, isMobile && { fontSize: 10 }]}>
                {game.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.stripHeaderRight, isMobile && { gap: 4 }]}>
          {/* Khay Token Economy 3 sao đổi thưởng Pop-it */}
          <TouchableOpacity
            style={[styles.tokenBar, isMobile && { paddingHorizontal: 5, paddingVertical: 2, gap: 2 }]}
            onPress={() => setPopItGameOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.starsRow}>
              {[0, 1, 2].map((i) => (
                <Text key={i} style={[styles.starIcon, isMobile && { fontSize: 10 }]}>
                  {i < tokenStars ? '⭐' : '⚪'}
                </Text>
              ))}
            </View>
            {!isSmallMobile && (
              <Text style={[styles.tokenHint, isMobile && { fontSize: 9 }]}>
                {tokenStars >= 3 ? 'Pop-It!' : `${tokenStars}/3`}
              </Text>
            )}
          </TouchableOpacity>

          {items.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, isMobile && { paddingHorizontal: 5, paddingVertical: 2 }]}
              onPress={clearSentence}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={isMobile ? 13 : 16} color={UI_COLORS.danger} />
              <Text style={[styles.clearText, isMobile && { fontSize: 10 }]}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.stripBody, isMobile && { minHeight: 68, gap: 6 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.cardList, isMobile && { gap: 6 }]}
        >
          {items.length === 0 ? (
            <View style={styles.emptyPrompt}>
              <Ionicons name="hand-left-outline" size={isMobile ? 16 : 20} color="#94A3B8" />
              <Text style={[styles.emptyText, isMobile && { fontSize: 11 }]}>
                {isSmallMobile ? 'Chạm thẻ bên dưới để ghép câu...' : 'Chạm vào các thẻ bên dưới để ghép câu...'}
              </Text>
            </View>
          ) : (
            items.map((item, index) => {
              const colors = getCardColor(item.card.categoryId);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sentenceCard,
                    { backgroundColor: colors.bg, borderColor: colors.border },
                    isMobile && { width: isSmallMobile ? 54 : 60, height: isSmallMobile ? 64 : 70, padding: 2 },
                  ]}
                  onPress={() => removeCard(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardImageContainer}>
                    {item.card.imageUri ? (
                      <Image source={{ uri: item.card.imageUri }} style={styles.cardImage} />
                    ) : (
                      <Text style={[styles.cardEmoji, isMobile && { fontSize: 24 }]}>{item.card.emojiIcon || '🏷️'}</Text>
                    )}
                  </View>
                  <Text style={[styles.cardLabel, isMobile && { fontSize: 10 }]} numberOfLines={1}>
                    {item.card.label}
                  </Text>
                  <View style={styles.removeBadge}>
                    <Ionicons name="close" size={isMobile ? 8 : 10} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Nút PHÁT ÂM TO */}
        <TouchableOpacity
          style={[
            styles.speakButton,
            items.length >= 2 && styles.speakButtonReady,
            items.length === 0 && styles.speakButtonDisabled,
            isSpeaking && styles.speakButtonActive,
            isMobile && { paddingHorizontal: isSmallMobile ? 10 : 14, minWidth: isSmallMobile ? 68 : 82 },
          ]}
          onPress={speakSentence}
          disabled={items.length === 0 || isSpeaking}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSpeaking ? 'volume-high' : 'volume-medium'}
            size={isMobile ? 20 : 24}
            color="#FFFFFF"
          />
          <Text style={[styles.speakButtonText, isMobile && { fontSize: isSmallMobile ? 11 : 12 }]}>
            {isSpeaking ? 'Đang đọc...' : items.length >= 2 ? 'NÓI CÂU' : 'NÓI'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  quickGamesScroll: {
    flex: 1,
    marginHorizontal: 4,
  },
  quickGamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 1,
  },
  quickGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  quickGameEmoji: {
    fontSize: 14,
  },
  quickGameText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stripHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FEE2E2',
  },
  clearText: {
    fontSize: 11,
    color: UI_COLORS.danger,
    fontWeight: '600',
  },
  stripBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 80,
  },
  cardList: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  emptyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  sentenceCard: {
    width: 68,
    height: 76,
    borderRadius: 8,
    borderWidth: 2,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  cardImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: 44,
    height: 44,
    borderRadius: 4,
    resizeMode: 'cover',
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  removeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    height: 72,
    borderRadius: 10,
    minWidth: 90,
  },
  speakButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  speakButtonActive: {
    backgroundColor: '#0D9488',
  },
  speakButtonReady: {
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#6EE7B7',
  },
  speakButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  inductionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  inductionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  inductionSubtitle: {
    fontSize: 10,
    color: '#B45309',
    fontStyle: 'italic',
  },
  rewardBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  rewardBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  rewardBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardTitle: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mascotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mascotEmoji: {
    fontSize: 22,
  },
  mascotName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  mascotSpeechMini: {
    fontSize: 9,
    color: '#047857',
    fontStyle: 'italic',
  },
  tokenBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  starIcon: {
    fontSize: 14,
  },
  tokenHint: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
});
