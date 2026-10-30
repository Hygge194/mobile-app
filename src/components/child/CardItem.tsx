import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Vibration, Platform } from 'react-native';
import { CardItemData } from '../../types';
import { FITZGERALD_COLORS } from '../../constants/colors';
import { useSentenceStore } from '../../stores/useSentenceStore';
import { useAppStore } from '../../stores/useAppStore';

interface CardItemProps {
  card: CardItemData;
  cardWidth: number;
  cardHeight: number;
}

export const CardItem: React.FC<CardItemProps> = ({ card, cardWidth, cardHeight }) => {
  const { addCard } = useSentenceStore();
  const {
    categories,
    isCooldownActive,
    detectiveQuestOpen,
    currentQuestCard,
    completeDetectiveQuest,
  } = useAppStore();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const category = categories.find((c) => c.id === card.categoryId);
  const fitzColor = category ? FITZGERALD_COLORS[category.type] : FITZGERALD_COLORS.action;
  const isQuestTarget = detectiveQuestOpen && currentQuestCard?.id === card.id;

  const handlePressIn = () => {
    // 1. Phản hồi xúc giác Haptic
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(25);
      }
    } catch {}

    // 2. Hiệu ứng lò xo đàn hồi (Spring Animation)
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.0,
        friction: 3,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Nếu đang trong Quest Thám tử và bé chọn đúng thẻ
    if (isQuestTarget) {
      completeDetectiveQuest();
    }

    addCard(card);
  };

  const isSmallCard = cardWidth < 80;
  const isMediumCard = cardWidth < 100;
  const emojiFontSize = isSmallCard ? 28 : isMediumCard ? 36 : 46;
  const labelFontSize = isSmallCard ? 11 : isMediumCard ? 12 : 14;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.cardContainer,
          {
            width: cardWidth,
            height: cardHeight,
            backgroundColor: fitzColor?.bg || '#FFFFFF',
            borderColor: isQuestTarget ? '#F59E0B' : fitzColor?.border || '#CBD5E1',
            padding: isSmallCard ? 4 : 6,
            borderRadius: isSmallCard ? 9 : 12,
            borderWidth: isSmallCard ? 2 : 3,
          },
          isQuestTarget && styles.questTargetGlow,
          isCooldownActive && styles.cooldownDim,
        ]}
        onPressIn={handlePressIn}
        activeOpacity={0.8}
        pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
      >
        {isQuestTarget && (
          <View style={[styles.questBadge, isSmallCard && { top: 3, left: 3, paddingHorizontal: 4, paddingVertical: 1 }]}>
            <Text style={[styles.questBadgeText, isSmallCard && { fontSize: 8 }]}>⭐ ĐÂY NÈ!</Text>
          </View>
        )}

        {card.isStarter && !isQuestTarget && (
          <View style={[styles.starterBadge, isSmallCard && { top: 3, left: 3, paddingHorizontal: 4, paddingVertical: 1 }]}>
            <Text style={[styles.starterBadgeText, isSmallCard && { fontSize: 8 }]}>MỞ ĐẦU</Text>
          </View>
        )}

        {card.audioType === 'recorded' && !isQuestTarget && (
          <View style={[styles.momVoiceBadge, isSmallCard && { top: 3, right: 3, paddingHorizontal: 3, paddingVertical: 1 }]}>
            <Text style={[styles.momVoiceBadgeText, isSmallCard && { fontSize: 8 }]}>🎙️ MẸ</Text>
          </View>
        )}
        <View style={styles.imageSection}>
          {card.imageUri ? (
            <Image source={{ uri: card.imageUri }} style={styles.image} />
          ) : (
            <Text style={[styles.emojiText, { fontSize: emojiFontSize }]}>{card.emojiIcon || '🏷️'}</Text>
          )}
        </View>

        <View
          style={[
            styles.labelSection,
            { backgroundColor: '#FFFFFF', borderColor: fitzColor?.border || '#E2E8F0' },
            isSmallCard && { paddingVertical: 2, paddingHorizontal: 2, borderRadius: 4 },
          ]}
        >
          <Text
            style={[styles.labelText, { color: fitzColor?.darkText || '#1E293B', fontSize: labelFontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {card.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    borderWidth: 3,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cooldownDim: {
    opacity: 0.9,
  },
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
    resizeMode: 'contain',
  },
  emojiText: {
    fontSize: 48,
  },
  labelSection: {
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  starterBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#D97706',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 1,
  },
  starterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  momVoiceBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EC4899',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 1,
  },
  momVoiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questTargetGlow: {
    borderColor: '#F59E0B',
    borderWidth: 4,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  questBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  questBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
