import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { UI_COLORS } from '../../constants/colors';
import { databaseService } from '../../services/database';
import { CommunicationLog } from '../../types';

interface TopCardItem {
  id: string;
  label: string;
  emojiIcon?: string;
  usageCount: number;
}

export const AnalyticsModal: React.FC = () => {
  const { analyticsOpen, setAnalyticsOpen } = useAppStore();
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [stats, setStats] = useState({ totalSentences: 0, totalCardsUsed: 0 });
  const [topCards, setTopCards] = useState<TopCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (analyticsOpen) {
      loadData();
    }
  }, [analyticsOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recentLogs, currentStats, topUsed] = await Promise.all([
        databaseService.getRecentLogs(30),
        databaseService.getLogStats(),
        databaseService.getTopCards(5),
      ]);
      setLogs(recentLogs);
      setStats(currentStats);
      setTopCards(topUsed);
    } catch (e) {
      console.warn('Lỗi tải nhật ký:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return isoString;
    }
  };

  const hasMultiWordSentences = logs.some((l) => l.cardCount >= 2);
  const maxUsage = topCards.length > 0 ? Math.max(...topCards.map((t) => t.usageCount), 1) : 1;

  return (
    <Modal
      visible={analyticsOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setAnalyticsOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <MaterialCommunityIcons name="chart-box" size={22} color={UI_COLORS.primary} />
              <Text style={styles.title}>Theo dõi Tiến độ Trị liệu (Analytics)</Text>
            </View>
            <TouchableOpacity onPress={() => setAnalyticsOpen(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={UI_COLORS.primary} />
              <Text style={styles.loadingText}>Đang tổng hợp số liệu giao tiếp của con...</Text>
            </View>
          ) : (
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* CỘT MỐC PHÁT TRIỂN (MILESTONE THEO MÔ HÌNH AVAZ AAC) */}
              <View style={[styles.milestoneCard, hasMultiWordSentences ? styles.milestoneSuccess : styles.milestoneIntro]}>
                <Text style={styles.milestoneIcon}>
                  {hasMultiWordSentences ? '🏆' : '🌱'}
                </Text>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTitle}>
                    {hasMultiWordSentences
                      ? 'Cột mốc phát triển mới!'
                      : 'Giai đoạn làm quen hình ảnh'}
                  </Text>
                  <Text style={styles.milestoneDesc}>
                    {hasMultiWordSentences
                      ? 'Chúc mừng bố mẹ! Bé đã bắt đầu biết ghép cấu trúc câu từ 2 thẻ trở lên (Giai đoạn 4 PECS).'
                      : 'Bé đang tích cực tương tác bằng từ đơn để bộc lộ nhu cầu cơ bản.'}
                  </Text>
                </View>
              </View>

              {/* Thẻ thống kê số lượng */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalSentences}</Text>
                  <Text style={styles.statLabel}>Lượt giao tiếp chủ động</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalCardsUsed}</Text>
                  <Text style={styles.statLabel}>Tổng số thẻ từ đã dùng</Text>
                </View>
              </View>

              {/* TOP 5 TỪ VỰNG DÙNG NHIỀU NHẤT */}
              {topCards.length > 0 && (
                <View style={styles.topSection}>
                  <Text style={styles.sectionHeader}>TOP 5 TỪ BÉ DÙNG NHIỀU NHẤT</Text>
                  <View style={styles.topList}>
                    {topCards.map((item, idx) => (
                      <View key={item.id} style={styles.topItem}>
                        <View style={styles.topItemLeft}>
                          <Text style={styles.topRank}>#{idx + 1}</Text>
                          <Text style={styles.topEmoji}>{item.emojiIcon || '🏷️'}</Text>
                          <Text style={styles.topLabel}>{item.label}</Text>
                        </View>
                        <View style={styles.topItemRight}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${Math.round((item.usageCount / maxUsage) * 100)}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.topCount}>{item.usageCount} lần</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* NHẬT KÝ CÁC CÂU GẦN ĐÂY */}
              <Text style={styles.sectionHeader}>NHẬT KÝ CÁC CÂU BÉ ĐÃ PHÁT ÂM</Text>

              {logs.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#CBD5E1" />
                  <Text style={styles.emptyText}>Chưa có câu nào được phát âm.</Text>
                  <Text style={styles.emptySubText}>
                    Khi bé ghép thẻ và nhấn nút "NÓI", câu thoại sẽ tự động được ghi nhận tại đây.
                  </Text>
                </View>
              ) : (
                logs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logLeft}>
                      <Text style={styles.logSentence}>"{log.sentenceText}"</Text>
                      <View style={styles.logMeta}>
                        <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
                        <Text style={styles.logWordCount}>• {log.cardCount} từ ghép</Text>
                      </View>
                    </View>
                    <View style={styles.logBadge}>
                      <Ionicons name="checkmark-done" size={14} color="#10B981" />
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setAnalyticsOpen(false)}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.textPrimary,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  body: {
    marginBottom: 16,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  milestoneSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  milestoneIntro: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  milestoneIcon: {
    fontSize: 28,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  milestoneDesc: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: UI_COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  topSection: {
    marginBottom: 16,
  },
  topList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topRank: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    width: 20,
  },
  topEmoji: {
    fontSize: 16,
  },
  topLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  topItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    width: 70,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 3,
  },
  topCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    minWidth: 35,
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  emptySubText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  logLeft: {
    flex: 1,
  },
  logSentence: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  logMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 3,
  },
  logTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  logWordCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  logBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 4,
  },
  closeButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  closeButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
