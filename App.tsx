import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from './src/stores/useAppStore';
import { Header } from './src/components/common/Header';
import { SentenceStrip } from './src/components/child/SentenceStrip';
import { QuickEmergencyBar } from './src/components/child/QuickEmergencyBar';
import { CoreWordsBar } from './src/components/child/CoreWordsBar';
import { CategoryTabs } from './src/components/child/CategoryTabs';
import { GridBoard } from './src/components/child/GridBoard';

import { ParentalGateModal } from './src/components/common/ParentalGateModal';
import { SensoryShieldModal } from './src/components/common/SensoryShieldModal';
import { GuidedTourModal } from './src/components/common/GuidedTourModal';
import { SensoryPopItModal } from './src/components/child/SensoryPopItModal';
import { DetectiveQuestModal } from './src/components/child/DetectiveQuestModal';
import { ParentChildGamesModal } from './src/components/child/ParentChildGamesModal';
import { CardCreatorModal } from './src/components/caregiver/CardCreatorModal';
import { SettingsModal } from './src/components/caregiver/SettingsModal';
import { AnalyticsModal } from './src/components/caregiver/AnalyticsModal';
import { FamilySyncModal } from './src/components/caregiver/FamilySyncModal';
import { GameQuestionEditorModal } from './src/components/caregiver/GameQuestionEditorModal';
import { UI_COLORS } from './src/constants/colors';

export default function App() {
  const { loadInitialData, familySyncOpen, setFamilySyncOpen } = useAppStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        
        <View style={styles.container}>
          {/* Thanh tiêu đề & chuyển chế độ */}
          <Header />

          {/* Thanh tạo câu (Sentence Strip) cố định */}
          <SentenceStrip />

          {/* Khay nhu cầu khẩn cấp 1 chạm */}
          <QuickEmergencyBar />

          {/* Thanh từ vựng cốt lõi thường trực (Core Words Bar) */}
          <CoreWordsBar />

          {/* Thanh phân loại chuẩn màu Fitzgerald Key */}
          <CategoryTabs />

          {/* Lưới thẻ từ tương tác (Grid Board) */}
          <GridBoard />

          {/* Khiên bảo vệ giác quan (Sensory Overload Sound Shield) */}
          <SensoryShieldModal />

          {/* Mini-Game Thưởng Giác quan Pop-It (Token Economy Reward) */}
          <SensoryPopItModal />

          {/* Trò chơi Thám tử PECS tìm đồ vật cùng Mascot Dino */}
          <DetectiveQuestModal />

          {/* 5 Trò chơi tương tác Bố Mẹ & Bé */}
          <ParentChildGamesModal />

          {/* Cửa sổ Guided Onboarding Tour khi lần đầu vào hoặc khi bấm xem lại */}
          <GuidedTourModal />

          {/* Các cửa sổ chức năng dành cho Phụ huynh / Giáo viên */}
          <ParentalGateModal />
          <CardCreatorModal />
          <SettingsModal />
          <AnalyticsModal />
          <GameQuestionEditorModal />
          <FamilySyncModal
            visible={familySyncOpen}
            onClose={() => setFamilySyncOpen(false)}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
});
