import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService } from '../../services/audioService';
import { noiseMonitorService } from '../../services/noiseMonitorService';
import { familySyncService } from '../../services/familySyncService';
import { useAppStore } from '../../stores/useAppStore';

export const SensoryShieldModal: React.FC = () => {
  const { settings, sensoryShieldOpen, setSensoryShieldOpen } = useAppStore();
  const [currentDb, setCurrentDb] = useState(noiseMonitorService.getCurrentDb());
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (settings.noiseShieldEnabled) {
      noiseMonitorService.startMonitoring(settings.noiseThresholdDb);

      const unsubscribe = noiseMonitorService.subscribe((db) => {
        setCurrentDb(db);
        setSensoryShieldOpen(true);
      });

      return () => {
        unsubscribe();
        noiseMonitorService.stopMonitoring();
      };
    }
  }, [settings.noiseShieldEnabled, settings.noiseThresholdDb]);

  useEffect(() => {
    if (sensoryShieldOpen) {
      setCurrentDb(noiseMonitorService.getCurrentDb());

      // Cập nhật mức dB thời gian thực liên tục khi modal đang mở
      const realTimeInterval = setInterval(() => {
        setCurrentDb(noiseMonitorService.getCurrentDb());
      }, 300);

      // Hoạt ảnh thở nhịp nhàng (Breathing Animation) giúp trẻ bình tâm
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => clearInterval(realTimeInterval);
    }
  }, [sensoryShieldOpen]);

  const handleAction = async (text: string) => {
    await audioService.speakSentence([
      {
        id: 'calm',
        categoryId: 'cat_pain',
        label: text,
        audioType: 'tts',
        isHidden: false,
        usageCount: 0,
        createdAt: 0,
      },
    ]);
    // Đồng thời thông báo khẩn cấp sang máy mẹ
    familySyncService.broadcastSentence(settings.childName, text, true);
    setSensoryShieldOpen(false);
  };

  if (!sensoryShieldOpen) return null;

  return (
    <Modal
      visible={sensoryShieldOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setSensoryShieldOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Vòng tròn nhịp thở êm dịu */}
          <Animated.View style={[styles.breathCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="headset" size={42} color="#0284C7" />
          </Animated.View>

          <Text style={styles.title}>Môi trường đang khá ồn ({currentDb} dB)</Text>
          <Text style={styles.subtitle}>
            Bé hít vào thật sâu... rồi thở ra nhẹ nhàng nhé.
          </Text>

          {/* Các nút nhu cầu cấp thiết khi bị quá tải giác quan */}
          <View style={styles.buttonList}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleAction('Mẹ ơi cho con đeo tai nghe chống ồn!')}
              activeOpacity={0.7}
            >
              <Text style={styles.btnEmoji}>🎧</Text>
              <Text style={styles.btnText}>Con muốn đeo tai nghe chống ồn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleAction('Con muốn đi ra chỗ yên tĩnh hơn!')}
              activeOpacity={0.7}
            >
              <Text style={styles.btnEmoji}>🌳</Text>
              <Text style={styles.btnText}>Con muốn ra chỗ yên tĩnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleAction('Mẹ ơi ôm con thật chặt!')}
              activeOpacity={0.7}
            >
              <Text style={styles.btnEmoji}>🫂</Text>
              <Text style={styles.btnText}>Con muốn ôm mẹ thật chặt</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setSensoryShieldOpen(false)}>
            <Text style={styles.closeBtnText}>Con cảm thấy ổn rồi 💙</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#F0FDF4',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#86EFAC',
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  breathCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E0F2FE',
    borderWidth: 3,
    borderColor: '#7DD3FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  buttonList: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  btnEmoji: {
    fontSize: 22,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
