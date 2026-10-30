import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { UI_COLORS } from '../../constants/colors';
import { familySyncService } from '../../services/familySyncService';
import { FamilyNotification } from '../../types';

interface FamilySyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FamilySyncModal: React.FC<FamilySyncModalProps> = ({ visible, onClose }) => {
  const { settings, updateSettings } = useAppStore();
  const [childName, setChildName] = useState(settings.childName || 'Bé Bo');
  const [history, setHistory] = useState<FamilyNotification[]>([]);

  useEffect(() => {
    if (visible) {
      setHistory(familySyncService.getHistory());
      const unsubscribe = familySyncService.subscribe((notification) => {
        setHistory((prev) => [notification, ...prev]);
      });
      return () => unsubscribe();
    }
  }, [visible]);

  const handleSaveName = () => {
    updateSettings({ childName: childName.trim() || 'Bé Bo' });
    Alert.alert('Đã lưu', `Đã cập nhật tên hiển thị: "${childName.trim() || 'Bé Bo'}"`);
  };

  const handleTestAlert = (phrase: string) => {
    familySyncService.broadcastSentence(settings.childName || 'Bé Bo', phrase, true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <MaterialCommunityIcons name="cellphone-wireless" size={24} color={UI_COLORS.primary} />
              <Text style={styles.title}>Kết nối Hai Thiết bị (Dual-Device)</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Lựa chọn vai trò của máy */}
            <Text style={styles.sectionHeader}>VAI TRÒ CỦA THIẾT BỊ NÀY</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  settings.familySyncRole === 'child_device' && styles.roleCardActive,
                ]}
                onPress={() => updateSettings({ familySyncRole: 'child_device' })}
              >
                <Text style={styles.roleEmoji}>👶</Text>
                <Text style={styles.roleTitle}>Máy của Bé</Text>
                <Text style={styles.roleDesc}>Tự động bắn thông báo sang máy mẹ khi bé ghép câu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  settings.familySyncRole === 'parent_receiver' && styles.roleCardActive,
                ]}
                onPress={() => updateSettings({ familySyncRole: 'parent_receiver' })}
              >
                <Text style={styles.roleEmoji}>👩‍🍳</Text>
                <Text style={styles.roleTitle}>Máy của Mẹ</Text>
                <Text style={styles.roleDesc}>Đặt ở bếp, tự động rung & đọc to câu nói của con</Text>
              </TouchableOpacity>
            </View>

            {/* Cấu hình tên bé */}
            <Text style={styles.sectionHeader}>TÊN HIỂN THỊ CỦA BÉ</Text>
            <View style={styles.nameRow}>
              <TextInput
                style={styles.nameInput}
                value={childName}
                onChangeText={setChildName}
                placeholder="Nhập tên gọi của con..."
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
                <Text style={styles.saveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>

            {/* Khu vực thử nghiệm phát chuông thông báo */}
            <Text style={styles.sectionHeader}>THỬ NGHIỆM TÍNH NĂNG THÔNG BÁO</Text>
            <Text style={styles.testHint}>
              Bấm để thử nghiệm máy mẹ rung và đọc to thông báo:
            </Text>
            <View style={styles.quickTests}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => handleTestAlert('Con muốn đi vệ sinh ngay!')}
              >
                <Text style={styles.testBtnText}>🚽 Thử báo: Đòi đi vệ sinh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => handleTestAlert('Con khát nước, cho con uống sữa!')}
              >
                <Text style={styles.testBtnText}>🥛 Thử báo: Đòi uống sữa</Text>
              </TouchableOpacity>
            </View>

            {/* Nhật ký thông báo nhận được */}
            <Text style={styles.sectionHeader}>CÁC THÔNG BÁO MỚI NHẤT TỪ BÉ</Text>
            {history.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Ionicons name="notifications-outline" size={28} color="#CBD5E1" />
                <Text style={styles.emptyFeedText}>Chưa có thông báo nào.</Text>
                <Text style={styles.emptyFeedSub}>Khi bé bấm câu, thông báo sẽ lập tức hiện tại đây.</Text>
              </View>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.notifCard}>
                  <View style={styles.notifHeader}>
                    <Text style={styles.notifChildName}>🔔 {item.childName}</Text>
                    <Text style={styles.notifTime}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.notifText}>"{item.sentenceText}"</Text>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Hoàn tất</Text>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  body: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  roleCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
  },
  saveBtn: {
    backgroundColor: UI_COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  testHint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  quickTests: {
    gap: 8,
    marginBottom: 14,
  },
  testButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
  },
  emptyFeed: {
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  emptyFeedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyFeedSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  notifCard: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifChildName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notifText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  doneBtn: {
    backgroundColor: UI_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
