import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { UI_COLORS } from '../../constants/colors';

export const Header: React.FC = () => {
  const {
    mode,
    setMode,
    setParentalGateOpen,
    setCardCreatorOpen,
    setSettingsOpen,
    setAnalyticsOpen,
    setFamilySyncOpen,
    setSensoryShieldOpen,
    setPopItGameOpen,
    startDetectiveQuest,
    setGamesCenterOpen,
    setOnboardingOpen,
  } = useAppStore();

  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 680;
  const isSmallMobile = windowWidth < 440;

  const isCaregiver = mode === 'caregiver';

  return (
    <View style={[styles.container, isMobile && { paddingHorizontal: 10, paddingVertical: 6 }]}>
      <View style={[styles.brandContainer, isMobile && { gap: 6 }]}>
        <View style={[styles.logoBadge, isMobile && { paddingHorizontal: 6, paddingVertical: 3 }]}>
          <Text style={[styles.logoText, isMobile && { fontSize: 12 }]}>AAC</Text>
        </View>
        <View>
          <Text style={[styles.title, isMobile && { fontSize: 14 }]}>Smart PECS</Text>
          {!isSmallMobile && (
            <Text style={styles.subtitle}>
              {isCaregiver ? 'Chế độ Phụ huynh / Giáo viên' : 'Chế độ của Trẻ'}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.actionContainer, isMobile && { gap: 6 }]}
        style={{ flexGrow: 0, maxWidth: isMobile ? (windowWidth - (isSmallMobile ? 120 : 160)) : undefined }}
      >
        {/* Nút Tour Hướng Dẫn Sử Dụng */}
        <TouchableOpacity
          style={[styles.iconButton, styles.tourButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
          onPress={() => setOnboardingOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="sparkles" size={isMobile ? 15 : 17} color="#D97706" />
          <Text style={styles.tourButtonText}>{isSmallMobile ? 'Tour' : 'Hướng dẫn'}</Text>
        </TouchableOpacity>

        {/* Nút Khiên Giảm tải Giác quan (Sensory Shield) */}
        <TouchableOpacity
          style={[styles.iconButton, styles.sensoryButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
          onPress={() => setSensoryShieldOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="headset" size={isMobile ? 16 : 18} color="#0284C7" />
          <Text style={styles.sensoryText}>{isSmallMobile ? 'Khiên' : 'Khiên ồn'}</Text>
        </TouchableOpacity>

        {isCaregiver ? (
          <>
            {/* Nút Kết nối Hai Thiết bị Mẹ & Bé */}
            <TouchableOpacity
              style={[styles.iconButton, styles.familySyncButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
              onPress={() => setFamilySyncOpen(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="cellphone-wireless" size={isMobile ? 16 : 18} color="#4F46E5" />
              <Text style={styles.familySyncText}>Mẹ & Bé</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, styles.addCardButton, isMobile && { paddingHorizontal: 8, paddingVertical: 4 }]}
              onPress={() => setCardCreatorOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={isMobile ? 16 : 18} color="#FFFFFF" />
              <Text style={styles.addCardText}>Tạo thẻ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, isMobile && { padding: 6 }]}
              onPress={() => setAnalyticsOpen(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chart-bar" size={isMobile ? 18 : 20} color={UI_COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, isMobile && { padding: 6 }]}
              onPress={() => setSettingsOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={isMobile ? 17 : 19} color={UI_COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Nút 5 Trò chơi cùng bé */}
            <TouchableOpacity
              style={[styles.iconButton, styles.gamesCenterButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
              onPress={() => setGamesCenterOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: isMobile ? 12 : 13 }}>🎮</Text>
              <Text style={styles.gamesCenterText}>Trò chơi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeToggle, styles.exitCaregiver, isMobile && { paddingHorizontal: 8, paddingVertical: 4 }]}
              onPress={() => setMode('child')}
              activeOpacity={0.7}
            >
              <Ionicons name="exit-outline" size={isMobile ? 16 : 18} color="#FFFFFF" />
              <Text style={styles.exitText}>Về bé</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Nút 5 Trò chơi tương tác Bố Mẹ & Bé */}
            <TouchableOpacity
              style={[styles.iconButton, styles.gamesCenterButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
              onPress={() => setGamesCenterOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: isMobile ? 12 : 14 }}>🎮</Text>
              <Text style={styles.gamesCenterText}>Vui học</Text>
            </TouchableOpacity>

            {/* Nút Đố vui Thám tử PECS */}
            <TouchableOpacity
              style={[styles.iconButton, styles.questButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
              onPress={startDetectiveQuest}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: isMobile ? 12 : 14 }}>🔍</Text>
              <Text style={styles.questText}>Thám tử</Text>
            </TouchableOpacity>

            {/* Nút Mini-game Pop-it Giác quan */}
            <TouchableOpacity
              style={[styles.iconButton, styles.popItButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
              onPress={() => setPopItGameOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: isMobile ? 12 : 14 }}>🫧</Text>
              <Text style={styles.popItText}>Pop-It</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.lockButton, isMobile && { paddingHorizontal: 6, paddingVertical: 4 }]}
              onPress={() => setParentalGateOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="lock-closed" size={isMobile ? 14 : 16} color={UI_COLORS.textSecondary} />
              <Text style={styles.lockText}>{isSmallMobile ? 'Khóa' : 'Phụ huynh'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: UI_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.divider,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    backgroundColor: UI_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: UI_COLORS.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    gap: 4,
  },
  addCardText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  tourButton: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  tourButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  sensoryButton: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  sensoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  familySyncButton: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  familySyncText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exitCaregiver: {
    backgroundColor: '#64748B',
  },
  exitText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lockText: {
    fontSize: 12,
    fontWeight: '500',
    color: UI_COLORS.textSecondary,
  },
  questButton: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  questText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  popItButton: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  popItText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  gamesCenterButton: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  gamesCenterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DB2777',
  },
});
