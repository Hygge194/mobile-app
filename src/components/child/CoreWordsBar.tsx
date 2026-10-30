import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CardItemData } from '../../types';
import { FITZGERALD_COLORS } from '../../constants/colors';
import { useSentenceStore } from '../../stores/useSentenceStore';
import { useAppStore } from '../../stores/useAppStore';

// Các từ vựng cốt lõi thường trực tích hợp luồng gợi ý thông minh
const CORE_WORDS: CardItemData[] = [
  { id: 'core_con_muon', categoryId: 'cat_starters', label: 'Con muốn...', emojiIcon: '👉', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 1, isStarter: true, suggestedCategoryId: 'cat_action' },
  { id: 'core_con_thich', categoryId: 'cat_starters', label: 'Con thích...', emojiIcon: '❤️', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 2, isStarter: true, suggestedCategoryId: 'cat_action' },
  { id: 'core_an', categoryId: 'cat_action', label: 'Ăn', emojiIcon: '🍽️', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 3, suggestedCategoryId: 'cat_food' },
  { id: 'core_uong', categoryId: 'cat_action', label: 'Uống', emojiIcon: '🥤', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 4, suggestedCategoryId: 'cat_drink' },
  { id: 'core_di', categoryId: 'cat_action', label: 'Đi', emojiIcon: '🚶', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 5, suggestedCategoryId: 'cat_places' },
  { id: 'core_choi', categoryId: 'cat_action', label: 'Chơi', emojiIcon: '🎲', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 6, suggestedCategoryId: 'cat_toys' },
  { id: 'core_giup', categoryId: 'cat_action', label: 'Giúp con', emojiIcon: '🤝', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 7, suggestedCategoryId: 'cat_action' },
  { id: 'core_khong', categoryId: 'cat_social', label: 'Không', emojiIcon: '❌', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 8, suggestedCategoryId: 'cat_social' },
  { id: 'core_camon', categoryId: 'cat_social', label: 'Cảm ơn', emojiIcon: '🙏', audioType: 'tts', isHidden: false, usageCount: 0, createdAt: 9, suggestedCategoryId: 'cat_social' },
];

export const CoreWordsBar: React.FC = () => {
  const { addCard } = useSentenceStore();
  const { categories, isCooldownActive } = useAppStore();

  const getCardColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return { bg: '#FFFFFF', border: '#E2E8F0', darkText: '#1E293B' };
    const colorKey = cat.type;
    return {
      bg: FITZGERALD_COLORS[colorKey]?.bg || '#FFFFFF',
      border: FITZGERALD_COLORS[colorKey]?.border || '#E2E8F0',
      darkText: FITZGERALD_COLORS[colorKey]?.darkText || '#1E293B',
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>⚡ TỪ CỐT LÕI (CORE WORDS)</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {CORE_WORDS.map((card) => {
          const colors = getCardColor(card.categoryId);
          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.coreCard,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                },
                isCooldownActive && styles.cooldownDim,
              ]}
              onPressIn={() => addCard(card)}
              activeOpacity={0.75}
              pressRetentionOffset={{ top: 15, left: 15, right: 15, bottom: 15 }}
            >
              <Text style={styles.emoji}>{card.emojiIcon}</Text>
              <Text
                style={[styles.label, { color: colors.darkText }]}
                numberOfLines={1}
              >
                {card.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  scrollList: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  coreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  cooldownDim: {
    opacity: 0.85,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
