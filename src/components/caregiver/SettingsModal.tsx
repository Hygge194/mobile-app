import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { UI_COLORS } from '../../constants/colors';
import { databaseService } from '../../services/database';
import { noiseMonitorService } from '../../services/noiseMonitorService';

export const SettingsModal: React.FC = () => {
  const {
    settingsOpen,
    setSettingsOpen,
    settings,
    updateSettings,
    loadInitialData,
    setSensoryShieldOpen,
    setOnboardingOpen,
    setGameQuestionEditorOpen,
  } = useAppStore();
  const [liveDb, setLiveDb] = useState(noiseMonitorService.getCurrentDb());

  useEffect(() => {
    if (settingsOpen && settings.noiseShieldEnabled) {
      const interval = setInterval(() => {
        setLiveDb(noiseMonitorService.getCurrentDb());
      }, 350);
      return () => clearInterval(interval);
    }
  }, [settingsOpen, settings.noiseShieldEnabled]);

  const handleResetData = () => {
    Alert.alert(
      'Khôi phục kho thẻ mẫu',
      'Bạn có chắc chắn muốn nạp lại bộ từ vựng 60+ từ gốc tiếng Việt chuẩn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            await databaseService.seedInitialData();
            await loadInitialData();
            Alert.alert('Thành công', 'Đã nạp lại dữ liệu thẻ mẫu.');
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={settingsOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setSettingsOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Ionicons name="settings" size={20} color={UI_COLORS.primary} />
              <Text style={styles.title}>Cài đặt hệ thống (Caregiver Settings)</Text>
            </View>
            <TouchableOpacity onPress={() => setSettingsOpen(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Hồ sơ tên gọi của bé */}
            <Text style={styles.sectionHeader}>TÊN GỌI CỦA BÉ (CHILD PROFILE)</Text>
            <Text style={styles.sectionDesc}>
              Tên gọi của con giúp linh vật Dino và thông báo gia đình xưng hô thân mật:
            </Text>
            <View style={styles.childNameCard}>
              <View style={styles.childNameIconWrap}>
                <Ionicons name="person" size={20} color={UI_COLORS.primary} />
              </View>
              <TextInput
                style={styles.childNameInput}
                value={settings.childName}
                onChangeText={(text) => updateSettings({ childName: text })}
                placeholder="Nhập tên bé (VD: Bé Bắp, Bé Na, Bé Bon, Bé An...)"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Cấu hình lưới hiển thị */}
            <Text style={styles.sectionHeader}>BỐ CỤC LƯỚI THẺ (GRID SIZING)</Text>
            <Text style={styles.sectionDesc}>
              Tùy biến theo năng lực nhận thức và vận động tinh của bé:
            </Text>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Số cột hiển thị:</Text>
              <View style={styles.stepperRow}>
                {[1, 2, 3, 4].map((col) => (
                  <TouchableOpacity
                    key={col}
                    style={[
                      styles.stepperBtn,
                      settings.gridColumns === col && styles.stepperBtnActive,
                    ]}
                    onPress={() => updateSettings({ gridColumns: col })}
                  >
                    <Text
                      style={[
                        styles.stepperText,
                        settings.gridColumns === col && styles.stepperTextActive,
                      ]}
                    >
                      {col}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Số hàng hiển thị:</Text>
              <View style={styles.stepperRow}>
                {[1, 2, 3, 4].map((row) => (
                  <TouchableOpacity
                    key={row}
                    style={[
                      styles.stepperBtn,
                      settings.gridRows === row && styles.stepperBtnActive,
                    ]}
                    onPress={() => updateSettings({ gridRows: row })}
                  >
                    <Text
                      style={[
                        styles.stepperText,
                        settings.gridRows === row && styles.stepperTextActive,
                      ]}
                    >
                      {row}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chống bấm lặp Anti-Stimming */}
            <Text style={styles.sectionHeader}>CƠ CHẾ CHỐNG BẤM LẶP (ANTI-STIMMING)</Text>
            <Text style={styles.sectionDesc}>
              Thời gian tạm khóa nút sau khi chạm để tránh trẻ tự kích thích thính giác:
            </Text>

            <View style={styles.stepperRow}>
              {[0.5, 1.0, 1.5, 2.0].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[
                    styles.stepperBtnWide,
                    settings.cooldownSeconds === sec && styles.stepperBtnActive,
                  ]}
                  onPress={() => updateSettings({ cooldownSeconds: sec })}
                >
                  <Text
                    style={[
                      styles.stepperText,
                      settings.cooldownSeconds === sec && styles.stepperTextActive,
                    ]}
                  >
                    {sec}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Luồng thông minh Smart Guided Flow */}
            <Text style={styles.sectionHeader}>LUỒNG ĐIỀU HƯỚNG THÔNG MINH (SMART AUTO-FLOW)</Text>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.label}>Tự động gợi ý từ tiếp theo có nghĩa:</Text>
                <Text style={styles.sublabel}>
                  Tự động chuyển danh mục logic (bấm "Con muốn" tự sang Hành động, bấm "Ăn" tự sang Đồ ăn) giúp bé không phải tự chuyển tab.
                </Text>
              </View>
              <Switch
                value={settings.guidedFlowEnabled}
                onValueChange={(val) => updateSettings({ guidedFlowEnabled: val })}
                trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                thumbColor={settings.guidedFlowEnabled ? '#10B981' : '#F1F5F9'}
              />
            </View>

            {/* Âm thanh & Giọng đọc */}
            <Text style={styles.sectionHeader}>ÂM THANH VÀ GIỌNG ĐỌC AI</Text>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>Tự phát âm khi chạm thẻ:</Text>
                <Text style={styles.sublabel}>Phát âm ngay khi đưa thẻ lên thanh câu</Text>
              </View>
              <Switch
                value={settings.autoSpeakOnAdd}
                onValueChange={(val) => updateSettings({ autoSpeakOnAdd: val })}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={settings.autoSpeakOnAdd ? UI_COLORS.primary : '#F1F5F9'}
              />
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Tốc độ đọc giọng nói:</Text>
              <View style={styles.stepperRow}>
                {[
                  { label: '0.8x (Chậm)', val: 0.8 },
                  { label: '1.0x (Chuẩn)', val: 1.0 },
                  { label: '1.2x (Nhanh)', val: 1.2 },
                ].map((sp) => (
                  <TouchableOpacity
                    key={sp.val}
                    style={[
                      styles.stepperBtnWide,
                      settings.speechRate === sp.val && styles.stepperBtnActive,
                    ]}
                    onPress={() => updateSettings({ speechRate: sp.val })}
                  >
                    <Text
                      style={[
                        styles.stepperText,
                        settings.speechRate === sp.val && styles.stepperTextActive,
                      ]}
                    >
                      {sp.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cảnh báo Quá tải Giác quan (Sensory Overload Sound Shield) */}
            <Text style={styles.sectionHeader}>KHIÊN BẢO VỆ GIÁC QUAN (SENSORY OVERLOAD SOUND SHIELD)</Text>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.label}>Tự động đo độ ồn môi trường:</Text>
                <Text style={styles.sublabel}>
                  Nếu tiếng ồn vượt ngưỡng, app tự động hiện giao diện êm dịu, nhắc trẻ hít thở và hỗ trợ yêu cầu đeo tai nghe hoặc rời chỗ ồn.
                </Text>
              </View>
              <Switch
                value={settings.noiseShieldEnabled}
                onValueChange={(val) => updateSettings({ noiseShieldEnabled: val })}
                trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
                thumbColor={settings.noiseShieldEnabled ? '#0284C7' : '#F1F5F9'}
              />
            </View>

            {settings.noiseShieldEnabled && (
              <>
                <View style={styles.noiseLiveRow}>
                  <Text style={styles.label}>Cường độ âm thanh đo được:</Text>
                  <View style={[styles.liveDbBadge, liveDb >= settings.noiseThresholdDb && styles.liveDbBadgeAlert]}>
                    <Text style={[styles.liveDbText, liveDb >= settings.noiseThresholdDb && styles.liveDbTextAlert]}>
                      {liveDb} dB
                    </Text>
                  </View>
                </View>

                <Text style={styles.sublabel}>
                  {noiseMonitorService.getIsUsingRealMic()
                    ? '🎙️ Đang đo từ Micro phần cứng theo chu kỳ RMS thời gian thực.'
                    : 'ℹ️ Đang ở chế độ ước lượng (Cấp quyền Micro để đo nhạy hơn).'}
                </Text>

                <View style={styles.rowItem}>
                  <Text style={styles.label}>Ngưỡng kích hoạt cảnh báo (dB):</Text>
                  <View style={styles.stepperRow}>
                    {[
                      { label: '70 dB (Nhạy)', val: 70 },
                      { label: '75 dB (Chuẩn)', val: 75 },
                      { label: '80 dB (Ồn lớn)', val: 80 },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.val}
                        style={[
                          styles.stepperBtnWide,
                          settings.noiseThresholdDb === item.val && styles.stepperBtnActive,
                        ]}
                        onPress={() => updateSettings({ noiseThresholdDb: item.val })}
                      >
                        <Text
                          style={[
                            styles.stepperText,
                            settings.noiseThresholdDb === item.val && styles.stepperTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.simulateNoiseBtn}
                  onPress={() => {
                    noiseMonitorService.triggerSimulatedLoudNoise(82);
                    setSensoryShieldOpen(true);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="volume-high" size={16} color="#0284C7" />
                  <Text style={styles.simulateNoiseText}>Kiểm thử kích hoạt Khiên ồn (82 dB)</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Kích thích Bật âm Tự nhiên (Speech Induction & Expectant Pause) */}
            <Text style={styles.sectionHeader}>KÍCH THÍCH BẬT ÂM TỰ NHIÊN (SPEECH INDUCTION)</Text>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.label}>Khoảng lặng chờ đợi (Expectant Delay):</Text>
                <Text style={styles.sublabel}>
                  Khi bé ghép câu, app đọc mồi phần mở đầu (VD: "Con muốn...") rồi tạm dừng để khuyến khích bé tự bật âm từ then chốt cuối cùng.
                </Text>
              </View>
              <Switch
                value={settings.speechInductionEnabled}
                onValueChange={(val) => updateSettings({ speechInductionEnabled: val })}
                trackColor={{ false: '#CBD5E1', true: '#FDE68A' }}
                thumbColor={settings.speechInductionEnabled ? '#D97706' : '#F1F5F9'}
              />
            </View>

            {settings.speechInductionEnabled && (
              <>
                <View style={styles.rowItem}>
                  <Text style={styles.label}>Thời gian chờ bé nói:</Text>
                  <View style={styles.stepperRow}>
                    {[
                      { label: '2 giây', val: 2 },
                      { label: '3 giây (Chuẩn)', val: 3 },
                      { label: '5 giây', val: 5 },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.val}
                        style={[
                          styles.stepperBtnWide,
                          settings.expectantDelaySeconds === item.val && styles.stepperBtnActive,
                        ]}
                        onPress={() => updateSettings({ expectantDelaySeconds: item.val })}
                      >
                        <Text
                          style={[
                            styles.stepperText,
                            settings.expectantDelaySeconds === item.val && styles.stepperTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.label}>Mớm âm tiết đầu (Phonemic Cue):</Text>
                    <Text style={styles.sublabel}>
                      Phát âm mồi âm tiết đầu (VD: "/b/... /b/... bánh") giúp cơ quan phát âm của trẻ dễ bắt chước khẩu hình hơn.
                    </Text>
                  </View>
                  <Switch
                    value={settings.phonemicCueEnabled}
                    onValueChange={(val) => updateSettings({ phonemicCueEnabled: val })}
                    trackColor={{ false: '#CBD5E1', true: '#FDE68A' }}
                    thumbColor={settings.phonemicCueEnabled ? '#D97706' : '#F1F5F9'}
                  />
                </View>

                <View style={styles.coachingCard}>
                  <Text style={styles.coachingTitle}>💡 Lời khuyên vàng từ Chuyên gia Âm ngữ (SLP):</Text>
                  <Text style={styles.coachingText}>
                    Khi bé ấn thẻ đòi món đồ, cha mẹ hãy giơ món đồ ngang tầm mắt của mình, nhắc lại từ then chốt và chờ đợi 3 giây trước khi trao cho con. Tuyệt đối không đưa đồ ngay lập tức để trẻ có cơ hội giao tiếp mắt và bắt chước phát âm!
                  </Text>
                </View>
              </>
            )}

            {/* Hướng dẫn & Đào tạo */}
            <Text style={styles.sectionHeader}>HƯỚNG DẪN & ĐÀO TẠO (GUIDED TOUR)</Text>
            <Text style={styles.sectionDesc}>
              Xem lại toàn bộ quy trình sử dụng Smart PECS, kích âm và tính năng thông minh:
            </Text>
            <TouchableOpacity
              style={styles.tourTriggerBtn}
              onPress={() => {
                setSettingsOpen(false);
                setOnboardingOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <Text style={styles.tourTriggerText}>Mở Tour Hướng dẫn sử dụng toàn diện</Text>
            </TouchableOpacity>

            {/* Quản lý câu hỏi 5 trò chơi */}
            <Text style={styles.sectionHeader}>NỘI DUNG 5 TRÒ CHƠI BỐ MẸ & BÉ</Text>
            <Text style={styles.sectionDesc}>
              Bố mẹ có thể thêm các câu hỏi riêng cho 5 trò chơi (Thẻ lật, Nối ý, Nghiêng đầu, Trắc nghiệm, Thể dục):
            </Text>
            <TouchableOpacity
              style={styles.gameQuestionsBtn}
              onPress={() => {
                setSettingsOpen(false);
                setGameQuestionEditorOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="game-controller" size={18} color="#0284C7" />
              <Text style={styles.gameQuestionsBtnText}>Quản lý & Thêm câu hỏi 5 trò chơi</Text>
            </TouchableOpacity>

            {/* Quản lý dữ liệu */}
            <Text style={styles.sectionHeader}>QUẢN LÝ DỮ LIỆU</Text>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
              <Ionicons name="refresh" size={18} color={UI_COLORS.danger} />
              <Text style={styles.resetButtonText}>Khôi phục kho từ vựng mẫu ban đầu</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setSettingsOpen(false)}
          >
            <Text style={styles.doneButtonText}>Hoàn tất</Text>
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
    maxHeight: '85%',
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
    marginTop: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: UI_COLORS.textPrimary,
  },
  sublabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  stepperBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnWide: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  stepperText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  stepperTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    marginTop: 6,
  },
  resetButtonText: {
    color: UI_COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: UI_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  coachingCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  coachingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  coachingText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  childNameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  childNameIconWrap: {
    marginRight: 10,
  },
  childNameInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: UI_COLORS.textPrimary,
    paddingVertical: 10,
  },
  noiseLiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  liveDbBadge: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDbBadgeAlert: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  liveDbText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369A1',
  },
  liveDbTextAlert: {
    color: '#DC2626',
  },
  simulateNoiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  simulateNoiseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  tourTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 6,
  },
  tourTriggerText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '700',
  },
  gameQuestionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 6,
  },
  gameQuestionsBtnText: {
    color: '#0369A1',
    fontSize: 13,
    fontWeight: '700',
  },
});
