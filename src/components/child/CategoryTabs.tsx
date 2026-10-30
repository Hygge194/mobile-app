import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { FITZGERALD_COLORS } from '../../constants/colors';

export const CategoryTabs: React.FC = () => {
  const { categories, activeCategoryId, setActiveCategory } = useAppStore();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const fitzColor = FITZGERALD_COLORS[cat.type] || FITZGERALD_COLORS.action;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tabItem,
                {
                  backgroundColor: isActive ? fitzColor.bg : '#F8FAFC',
                  borderColor: isActive ? fitzColor.border : '#E2E8F0',
                  borderWidth: isActive ? 2.5 : 1,
                },
              ]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={(cat.icon as any) || 'folder'}
                size={18}
                color={isActive ? fitzColor.darkText : '#64748B'}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? fitzColor.darkText : '#64748B',
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {cat.name}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 13,
  },
});
