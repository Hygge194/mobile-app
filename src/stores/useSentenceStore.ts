import { create } from 'zustand';
import { CardItemData, SentenceItem } from '../types';
import { audioService } from '../services/audioService';
import { databaseService } from '../services/database';
import { familySyncService } from '../services/familySyncService';
import { useAppStore } from './useAppStore';

interface SentenceState {
  items: SentenceItem[];
  isSpeaking: boolean;

  addCard: (card: CardItemData) => void;
  removeCard: (index: number) => void;
  clearSentence: () => void;
  speakSentence: () => Promise<void>;
}

export const useSentenceStore = create<SentenceState>((set, get) => ({
  items: [],
  isSpeaking: false,

  addCard: (card) => {
    const { isCooldownActive, triggerCooldown, settings } = useAppStore.getState();

    // Nếu đang trong thời gian Cooldown chống bấm lặp (Stimming) thì bỏ qua
    if (isCooldownActive) return;

    // Kích hoạt Cooldown
    triggerCooldown();

    // Phát âm thanh của từ vừa chạm nếu cài đặt cho phép
    if (settings.autoSpeakOnAdd) {
      audioService.playCardSound(card, settings.speechRate);
    }

    const newItem: SentenceItem = {
      id: `${card.id}_${Date.now()}_${Math.random()}`,
      card,
      addedAt: Date.now(),
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));

    // Tự động chuyển bước thông minh (Smart Guided Flow)
    if (settings.guidedFlowEnabled && card.suggestedCategoryId) {
      setTimeout(() => {
        useAppStore.getState().setActiveCategory(card.suggestedCategoryId!);
      }, 150);
    }
  },

  removeCard: (index) => {
    set((state) => {
      const updated = [...state.items];
      updated.splice(index, 1);
      return { items: updated };
    });
  },

  clearSentence: () => {
    audioService.stopAll();
    set({ items: [] });
    const { settings } = useAppStore.getState();
    if (settings.guidedFlowEnabled) {
      useAppStore.getState().setActiveCategory('cat_starters');
    }
  },

  speakSentence: async () => {
    const { items, isSpeaking } = get();
    if (items.length === 0 || isSpeaking) return;

    set({ isSpeaking: true });
    const cards = items.map((i) => i.card);
    const { settings } = useAppStore.getState();

    try {
      if (settings.speechInductionEnabled && cards.length > 1) {
        await audioService.speakSentenceWithInduction(
          cards,
          settings.speechRate,
          settings.expectantDelaySeconds,
          settings.phonemicCueEnabled,
          () => useAppStore.getState().setIsWaitingForVoice(true),
          () => useAppStore.getState().setIsWaitingForVoice(false)
        );
      } else {
        await audioService.speakSentence(cards, settings.speechRate);
      }

      // Ghi nhật ký vào SQLite để báo cáo trị liệu
      const sentenceText = cards.map((c) => c.label).join(' ');
      const cardIds = cards.map((c) => c.id);
      await databaseService.logSentence(sentenceText, cardIds);

      // Phát thông báo sang thiết bị của Mẹ (Dual-Device Family Notification)
      familySyncService.broadcastSentence(settings.childName, sentenceText, false);

      // Thưởng 1 Ngôi sao Token Economy và kích hoạt phản ứng Linh vật Dino/Gấu
      const hasFoodOrDrink = cards.some((c) => c.categoryId === 'cat_food' || c.categoryId === 'cat_drink');
      if (hasFoodOrDrink) {
        useAppStore.getState().setMascotMood('eating');
        setTimeout(() => {
          useAppStore.getState().setMascotMood('happy');
        }, 2500);
      }
      useAppStore.getState().addTokenStar();
    } catch (e) {
      console.error('Lỗi phát âm câu:', e);
    } finally {
      setTimeout(() => {
        set({ isSpeaking: false });
      }, 500);
    }
  },
}));
