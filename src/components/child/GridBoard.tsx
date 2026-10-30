import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, LayoutChangeEvent, Text, ActivityIndicator } from 'react-native';
import { useAppStore } from '../../stores/useAppStore';
import { CardItem } from './CardItem';
import { UI_COLORS } from '../../constants/colors';

export const GridBoard: React.FC = () => {
  const { cards, settings, isLoading } = useAppStore();
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setBoardDimensions({ width, height });
    }
  };

  const isMobileBoard = boardDimensions.width > 0 && boardDimensions.width < 500;
  const gap = isMobileBoard ? 8 : 12;
  const padding = isMobileBoard ? 8 : 12;

  // Tự động tối ưu số cột trên màn hình điện thoại hẹp (< 420px) nếu cấu hình đang để quá nhiều cột
  const responsiveColumns = isMobileBoard && boardDimensions.width < 420 && settings.gridColumns > 3 ? 3 : settings.gridColumns;
  const columns = Math.max(1, Math.min(responsiveColumns, 4));
  const rows = Math.max(1, Math.min(settings.gridRows, 4));

  // Tính kích thước ô thẻ dựa trên chiều rộng và chiều cao đo được
  const availableWidth = boardDimensions.width - padding * 2 - gap * (columns - 1);
  const cardWidth = boardDimensions.width > 0 ? Math.floor(availableWidth / columns) : 100;

  const availableHeight = boardDimensions.height - padding * 2 - gap * (rows - 1);
  const minCardHeight = isMobileBoard ? 78 : 90;
  const cardHeight = boardDimensions.height > 0 ? Math.max(minCardHeight, Math.floor(availableHeight / rows)) : 110;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UI_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải danh mục từ vựng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <ScrollView
        contentContainerStyle={[
          styles.gridContent,
          {
            padding,
            gap,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.rowWrap, { gap }]}>
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  gridContent: {
    flexGrow: 1,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
});
