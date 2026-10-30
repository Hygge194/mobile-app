import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { FITZGERALD_COLORS, UI_COLORS } from '../../constants/colors';
import { audioService } from '../../services/audioService';
import { databaseService } from '../../services/database';
import { CardItemData } from '../../types';

export const CardCreatorModal: React.FC = () => {
  const { cardCreatorOpen, setCardCreatorOpen, categories, loadCardsForCategory, activeCategoryId } = useAppStore();

  const [label, setLabel] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(activeCategoryId || 'cat_object');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [emojiIcon, setEmojiIcon] = useState('⭐');
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Bộ đếm thời gian khi đang thu âm
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const handleClose = async () => {
    if (isRecording) {
      await audioService.stopRecording();
      setIsRecording(false);
    }
    audioService.stopAll();
    setCardCreatorOpen(false);
  };

  const handlePickImage = async (useCamera = false) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền mở Camera.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền mở Thư viện ảnh.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Lỗi chọn ảnh:', e);
    }
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      const uri = await audioService.stopRecording();
      setIsRecording(false);
      if (uri) {
        setRecordedUri(uri);
        Alert.alert('Thu âm thành công! 🎉', 'Giọng nói của Mẹ/Cô đã được ghi nhận. Bạn có thể nhấn "Nghe lại" để kiểm tra.');
      } else {
        Alert.alert('Chưa có âm thanh', 'Bản ghi âm quá ngắn hoặc chưa ghi nhận được tiếng nói. Vui lòng thử lại.');
      }
    } else {
      audioService.stopAll();
      const ok = await audioService.startRecording();
      if (ok) {
        setIsRecording(true);
        setRecordingSeconds(0);
      } else {
        Alert.alert(
          'Không thể mở Micro',
          'Vui lòng cấp quyền truy cập Microphone cho trình duyệt hoặc thiết bị để thu âm giọng nói của mẹ.'
        );
      }
    }
  };

  const handleDeleteRecord = () => {
    audioService.stopAll();
    setRecordedUri(null);
    setRecordingSeconds(0);
  };

  const handlePlayPreview = async () => {
    audioService.stopAll();
    setIsPlayingPreview(true);
    try {
      if (recordedUri) {
        await audioService.playCardSound({
          id: 'temp_preview',
          categoryId: selectedCatId,
          label: label.trim() || 'Thẻ từ vựng',
          audioUri: recordedUri,
          audioType: 'recorded',
          isHidden: false,
          usageCount: 0,
          createdAt: 0,
        });
      } else if (label.trim()) {
        await audioService.playCardSound({
          id: 'temp_preview',
          categoryId: selectedCatId,
          label: label.trim(),
          audioType: 'tts',
          isHidden: false,
          usageCount: 0,
          createdAt: 0,
        });
      } else {
        Alert.alert('Chưa có nội dung', 'Vui lòng nhập tên từ vựng hoặc thu âm giọng nói trước khi nghe thử.');
      }
    } finally {
      setTimeout(() => {
        setIsPlayingPreview(false);
      }, 1500);
    }
  };

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên từ vựng cho thẻ.');
      return;
    }

    try {
      setIsSaving(true);
      const newCard: CardItemData = {
        id: `card_${Date.now()}`,
        categoryId: selectedCatId,
        label: label.trim(),
        emojiIcon: imageUri ? undefined : emojiIcon,
        imageUri: imageUri || null,
        audioUri: recordedUri || null,
        audioType: recordedUri ? 'recorded' : 'tts',
        isHidden: false,
        usageCount: 0,
        createdAt: Date.now(),
      };

      await databaseService.addCard(newCard);
      await loadCardsForCategory(selectedCatId);

      // Reset form
      setLabel('');
      setImageUri(null);
      setRecordedUri(null);
      setRecordingSeconds(0);
      setCardCreatorOpen(false);
      Alert.alert(
        'Thành công 🎉',
        `Đã tạo thẻ "${newCard.label}" với ${newCard.audioType === 'recorded' ? 'giọng nói thu âm của Mẹ/Cô' : 'giọng đọc AI'} thành công!`
      );
    } catch (e) {
      console.error('Lỗi khi lưu thẻ:', e);
      Alert.alert('Lỗi', 'Không thể lưu thẻ từ mới.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={cardCreatorOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Ionicons name="sparkles" size={20} color="#10B981" />
              <Text style={styles.title}>Tạo thẻ cá nhân hóa (Card Creator)</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Nhập nhãn thẻ */}
            <Text style={styles.sectionTitle}>1. Tên từ vựng (Nhãn chữ tiếng Việt)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="VD: Bình nước của con, Bánh quy..."
              value={label}
              onChangeText={setLabel}
              placeholderTextColor="#94A3B8"
            />

            {/* Chọn danh mục Fitzgerald */}
            <Text style={styles.sectionTitle}>2. Phân loại chuẩn Fitzgerald Key</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((c) => {
                const isSelected = c.id === selectedCatId;
                const fitz = FITZGERALD_COLORS[c.type];
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: fitz?.bg || '#F1F5F9',
                        borderColor: isSelected ? fitz?.border : '#E2E8F0',
                        borderWidth: isSelected ? 2.5 : 1,
                      },
                    ]}
                    onPress={() => setSelectedCatId(c.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        { color: fitz?.darkText || '#1E293B', fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Chọn hình ảnh */}
            <Text style={styles.sectionTitle}>3. Hình ảnh thẻ từ</Text>
            <View style={styles.imagePickerRow}>
              <TouchableOpacity
                style={styles.pickButton}
                onPress={() => handlePickImage(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={20} color={UI_COLORS.primary} />
                <Text style={styles.pickButtonText}>Chụp Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pickButton}
                onPress={() => handlePickImage(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="images" size={20} color={UI_COLORS.primary} />
                <Text style={styles.pickButtonText}>Thư viện ảnh</Text>
              </TouchableOpacity>
            </View>

            {/* Hiển thị xem trước ảnh */}
            <View style={styles.previewBox}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.emojiRow}>
                  <Text style={styles.previewEmoji}>{emojiIcon}</Text>
                  <Text style={styles.emojiHint}>Hoặc chọn biểu tượng mặc định:</Text>
                  <View style={styles.quickEmojis}>
                    {['🍼', '🧸', '🍪', '🍎', '🚗', '🧼', '👕'].map((em) => (
                      <TouchableOpacity key={em} onPress={() => setEmojiIcon(em)}>
                        <Text style={styles.emojiOption}>{em}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Thu âm giọng nói của mẹ */}
            <Text style={styles.sectionTitle}>4. Giọng đọc thẻ (Giọng Mẹ/Cô hoặc AI)</Text>

            {isRecording ? (
              <View style={styles.recordingCard}>
                <View style={styles.recordingHeader}>
                  <View style={styles.redPulseDot} />
                  <Text style={styles.recordingTimerText}>
                    Đang thu âm: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s
                  </Text>
                </View>
                <Text style={styles.recordingPromptText}>
                  "Mẹ hãy nói từ vựng rõ ràng, diễn cảm và chậm rãi nhé..."
                </Text>
                <TouchableOpacity
                  style={styles.stopRecordBtn}
                  onPress={handleToggleRecord}
                  activeOpacity={0.8}
                >
                  <Ionicons name="stop-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.stopRecordBtnText}>Dừng & Lưu bản thu âm</Text>
                </TouchableOpacity>
              </View>
            ) : recordedUri ? (
              <View style={styles.recordedSuccessCard}>
                <View style={styles.recordedSuccessHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.recordedSuccessTitle}>Đã lưu file giọng nói của Mẹ/Cô!</Text>
                </View>

                <View style={styles.recordedActionsRow}>
                  <TouchableOpacity
                    style={styles.playRecordedBtn}
                    onPress={handlePlayPreview}
                    disabled={isPlayingPreview}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isPlayingPreview ? 'volume-high' : 'play-circle'}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.playRecordedBtnText}>
                      {isPlayingPreview ? 'Đang phát...' : 'Nghe lại'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reRecordBtn}
                    onPress={handleToggleRecord}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="mic-outline" size={16} color="#D97706" />
                    <Text style={styles.reRecordBtnText}>Thu lại</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteRecordBtn}
                    onPress={handleDeleteRecord}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={styles.deleteRecordBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.audioSection}>
                  <TouchableOpacity
                    style={styles.recordButton}
                    onPress={handleToggleRecord}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="mic" size={20} color="#FFFFFF" />
                    <Text style={styles.recordButtonText}>Thu âm giọng Mẹ/Cô</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.previewAudioButton}
                    onPress={handlePlayPreview}
                    disabled={isPlayingPreview}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isPlayingPreview ? 'volume-high' : 'volume-medium'}
                      size={18}
                      color={UI_COLORS.primary}
                    />
                    <Text style={styles.previewAudioText}>
                      {isPlayingPreview ? 'Đang đọc...' : 'Nghe thử AI'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.audioNote}>
                  💡 Thu âm giọng nói của cha mẹ/cô giáo giúp trẻ tự kỷ cảm thấy an toàn, thân thuộc và bật âm nhanh hơn. Nếu không thu âm, ứng dụng sẽ dùng giọng AI tiếng Việt chuẩn.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Nút Lưu */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Lưu thẻ vào kho</Text>
              </>
            )}
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: UI_COLORS.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  catChipText: {
    fontSize: 12,
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: UI_COLORS.primary,
  },
  previewBox: {
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  emojiRow: {
    alignItems: 'center',
    gap: 4,
  },
  previewEmoji: {
    fontSize: 32,
  },
  emojiHint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  quickEmojis: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiOption: {
    fontSize: 20,
  },
  audioSection: {
    flexDirection: 'row',
    gap: 10,
  },
  recordButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
  },
  recordingActive: {
    backgroundColor: '#991B1B',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  previewAudioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
  },
  previewAudioText: {
    fontSize: 13,
    fontWeight: '600',
    color: UI_COLORS.primary,
  },
  audioNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  recordingCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingTimerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  recordingPromptText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#991B1B',
    textAlign: 'center',
  },
  stopRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 4,
  },
  stopRecordBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  recordedSuccessCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  recordedSuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordedSuccessTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  recordedActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  playRecordedBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 8,
  },
  playRecordedBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reRecordBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingVertical: 9,
    borderRadius: 8,
  },
  reRecordBtnText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
  },
  deleteRecordBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
