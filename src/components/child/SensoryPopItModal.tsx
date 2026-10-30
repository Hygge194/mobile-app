import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Vibration, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { audioService } from '../../services/audioService';

const BUBBLE_COLORS = [
  '#FCA5A5', // Pastel Red
  '#FDBA74', // Pastel Orange
  '#FDE047', // Pastel Yellow
  '#86EFAC', // Pastel Green
  '#93C5FD', // Pastel Blue
  '#D8B4FE', // Pastel Purple
];

export const SensoryPopItModal: React.FC = () => {
  const { popItGameOpen, setPopItGameOpen } = useAppStore();
  const [poppedState, setPoppedState] = useState<boolean[]>(Array(16).fill(false));
  const [poppedCount, setPoppedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (popItGameOpen) {
      setPoppedState(Array(16).fill(false));
      setPoppedCount(0);
      setTimeLeft(30);
      audioService.playPraise();

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [popItGameOpen]);

  const handlePop = (index: number) => {
    // 1. Phát âm thanh nổ nhỏ "Pop" êm tai với biến thiên cao độ vui nhộn
    const pitchOffset = 0.88 + (index % 4) * 0.1;
    audioService.playPopSound(pitchOffset);

    // 2. Rung phản hồi xúc giác nhẹ nhàng
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(28);
      }
    } catch {}

    const updated = [...poppedState];
    const isNowPopped = !updated[index];
    updated[index] = isNowPopped;
    setPoppedState(updated);

    if (isNowPopped) {
      setPoppedCount((c) => c + 1);
    }
  };

  const handleFlip = () => {
    // Chuỗi âm thanh nổ lách tách khi lật mặt Pop-It
    audioService.playPopSound(1.25);
    setTimeout(() => audioService.playPopSound(1.05), 50);
    setTimeout(() => audioService.playPopSound(0.9), 100);
    setPoppedState(Array(16).fill(false));
  };

  if (!popItGameOpen) return null;

  return (
    <Modal
      visible={popItGameOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setPopItGameOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.gameCard}>
          {/* Header chúc mừng */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ PHẦN THƯỞNG GIÁC QUAN ⭐</Text>
            </View>
            <TouchableOpacity onPress={() => setPopItGameOpen(false)}>
              <Ionicons name="close-circle" size={28} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Bong Bóng Pop-It Êm Dịu 🫧</Text>
          <Text style={styles.subtitle}>
            Chạm vào từng quả bóng để nghe tiếng nổ "Pop" tí tách vui tai và giải tỏa giác quan nhé!
          </Text>

          {/* Chỉ số thời gian và số bong bóng đã nổ */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Bong bóng nổ:</Text>
              <Text style={styles.statVal}>{poppedCount} 💥</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Thời gian:</Text>
              <Text style={[styles.statVal, timeLeft <= 5 && { color: '#EF4444' }]}>
                {timeLeft}s ⏳
              </Text>
            </View>
          </View>

          {/* Lưới Pop-it 4x4 */}
          <View style={styles.boardWrap}>
            <View style={styles.popItBoard}>
              {poppedState.map((isPopped, idx) => {
                const color = BUBBLE_COLORS[idx % BUBBLE_COLORS.length];
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.bubble,
                      { backgroundColor: color },
                      isPopped && styles.bubblePopped,
                    ]}
                    onPress={() => handlePop(idx)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.bubbleInner, isPopped && styles.bubbleInnerPopped]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nút lật bảng và đóng */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.flipBtn} onPress={handleFlip}>
              <Ionicons name="refresh" size={18} color="#0284C7" />
              <Text style={styles.flipBtnText}>Lật mặt Pop-It 🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPopItGameOpen(false)}
            >
              <Text style={styles.closeBtnText}>Học nói tiếp nào 🚀</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 14,
  },
  statBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  boardWrap: {
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  popItBoard: {
    width: 250,
    height: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  bubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  bubblePopped: {
    transform: [{ scale: 0.88 }],
    shadowOpacity: 0.05,
    elevation: 1,
    opacity: 0.75,
  },
  bubbleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  bubbleInnerPopped: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  flipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    paddingVertical: 12,
  },
  flipBtnText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 13,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
