import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { EMERGENCY_CARDS } from '../../constants/defaultData';
import { audioService } from '../../services/audioService';
import { databaseService } from '../../services/database';
import { familySyncService } from '../../services/familySyncService';
import { useAppStore } from '../../stores/useAppStore';

export const QuickEmergencyBar: React.FC = () => {
  const { isCooldownActive, triggerCooldown, settings } = useAppStore();
  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(null);

  const handleEmergencyPress = async (card: typeof EMERGENCY_CARDS[0]) => {
    if (isCooldownActive) return;
    triggerCooldown();
    setActiveEmergencyId(card.id);

    const phrase = card.emergencyPhrase || card.label;
    
    // Đọc to khẩn cấp ngay lập tức
    await audioService.speakSentence([{ ...card, label: phrase }], 1.0);

    // Ghi nhận nhật ký
    try {
      await databaseService.logSentence(phrase, [card.id]);
    } catch (e) {
      // ignore
    }

    // Bắn thông báo khẩn cấp ngay lập tức sang máy Mẹ trong bếp
    familySyncService.broadcastSentence(settings.childName, phrase, true);

    setTimeout(() => {
      setActiveEmergencyId(null);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.badgeText}>🚨 NHU CẦU KHẨN CẤP (1 CHẠM)</Text>
        <Text style={styles.hintText}>Chạm là nói ngay</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {EMERGENCY_CARDS.map((item) => {
          const isActive = activeEmergencyId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.emergencyButton,
                isActive && styles.emergencyActive,
              ]}
              onPressIn={() => handleEmergencyPress(item)}
              activeOpacity={0.7}
              pressRetentionOffset={{ top: 15, left: 15, right: 15, bottom: 15 }}
            >
              <Text style={styles.emoji}>{item.emojiIcon}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
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
    backgroundColor: '#FFF1F2',
    paddingVertical: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#FECDD3',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  hintText: {
    fontSize: 10,
    color: '#9F1239',
    fontStyle: 'italic',
  },
  scrollList: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FDA4AF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyActive: {
    backgroundColor: '#E11D48',
    borderColor: '#BE123C',
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9F1239',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
