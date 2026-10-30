import { create } from 'zustand';
import { AppSettings, CardItemData, Category } from '../types';
import { CustomGameQuestionsState, GameTabType, INITIAL_CUSTOM_GAME_QUESTIONS } from '../types/gameQuestions';
import { databaseService } from '../services/database';
import { DEFAULT_CARDS } from '../constants/defaultData';

interface AppState {
  mode: 'child' | 'caregiver';
  activeCategoryId: string;
  categories: Category[];
  cards: CardItemData[];
  isLoading: boolean;
  
  settings: AppSettings;
  isCooldownActive: boolean;

  // Modals
  parentalGateOpen: boolean;
  cardCreatorOpen: boolean;
  settingsOpen: boolean;
  analyticsOpen: boolean;
  familySyncOpen: boolean;
  sensoryShieldOpen: boolean;

  // Actions
  setMode: (mode: 'child' | 'caregiver') => void;
  setActiveCategory: (catId: string) => void;
  loadInitialData: () => void;
  loadCardsForCategory: (catId: string) => void;
  triggerCooldown: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Trạng thái kích âm (Speech Induction State)
  isWaitingForVoice: boolean;
  vocalRewardAwarded: boolean;

  // Hệ thống Game hóa Trị liệu ABA (Gamification & Engagement)
  tokenStars: number; // 0, 1, 2, 3
  popItGameOpen: boolean;
  detectiveQuestOpen: boolean;
  currentQuestCard: CardItemData | null;
  questOptions: CardItemData[];
  mascotMood: 'idle' | 'happy' | 'eating' | 'cheering';
  gamesCenterOpen: boolean;
  activeGameTab: 'flip' | 'matching' | 'puzzle' | 'quiz' | 'movement';

  // Câu hỏi do cha mẹ tùy chỉnh thêm vào 5 trò chơi
  customGameQuestions: CustomGameQuestionsState;
  gameQuestionEditorOpen: boolean;
  gameQuestionEditorTab: GameTabType;
  setGameQuestionEditorOpen: (open: boolean, initialTab?: GameTabType) => void;
  loadCustomGameQuestions: () => Promise<void>;
  addCustomGameQuestion: (gameType: GameTabType, question: any) => Promise<void>;
  deleteCustomGameQuestion: (gameType: GameTabType, questionId: string | number) => Promise<void>;

  // Guided Onboarding Tour
  onboardingOpen: boolean;
  hasSeenOnboarding: boolean;
  setOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (childName?: string, gridColumns?: number) => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;

  setParentalGateOpen: (open: boolean) => void;
  setCardCreatorOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setAnalyticsOpen: (open: boolean) => void;
  setFamilySyncOpen: (open: boolean) => void;
  setSensoryShieldOpen: (open: boolean) => void;
  setIsWaitingForVoice: (waiting: boolean) => void;
  triggerVocalReward: () => void;

  addTokenStar: () => void;
  setPopItGameOpen: (open: boolean) => void;
  setDetectiveQuestOpen: (open: boolean) => void;
  setGamesCenterOpen: (open: boolean) => void;
  setActiveGameTab: (tab: 'flip' | 'matching' | 'puzzle' | 'quiz' | 'movement') => void;
  setMascotMood: (mood: 'idle' | 'happy' | 'eating' | 'cheering') => void;
  startDetectiveQuest: () => void;
  completeDetectiveQuest: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'child',
  activeCategoryId: 'cat_starters',
  categories: [],
  cards: [],
  isLoading: true,

  settings: {
    gridColumns: 3,
    gridRows: 2,
    cooldownSeconds: 1.2,
    voiceRegion: 'north',
    autoSpeakOnAdd: true,
    speechRate: 0.9,
    guidedFlowEnabled: true,
    familySyncRole: 'child_device',
    childName: 'Bé Bo',
    noiseShieldEnabled: true,
    noiseThresholdDb: 75,
    speechInductionEnabled: true,
    expectantDelaySeconds: 3,
    phonemicCueEnabled: false,
    vocalRewardEnabled: true,
  },
  isCooldownActive: false,

  parentalGateOpen: false,
  cardCreatorOpen: false,
  settingsOpen: false,
  analyticsOpen: false,
  familySyncOpen: false,
  sensoryShieldOpen: false,
  isWaitingForVoice: false,
  vocalRewardAwarded: false,

  onboardingOpen: false,
  hasSeenOnboarding: false,

  tokenStars: 1, // Khởi đầu tặng trước 1 sao tạo động lực (Endowed Progress Effect)
  popItGameOpen: false,
  detectiveQuestOpen: false,
  currentQuestCard: null,
  questOptions: [],
  mascotMood: 'idle',
  gamesCenterOpen: false,
  activeGameTab: 'flip',

  customGameQuestions: INITIAL_CUSTOM_GAME_QUESTIONS,
  gameQuestionEditorOpen: false,
  gameQuestionEditorTab: 'flip',

  setGameQuestionEditorOpen: (open, initialTab) => {
    set({
      gameQuestionEditorOpen: open,
      ...(initialTab ? { gameQuestionEditorTab: initialTab } : {}),
    });
  },

  loadCustomGameQuestions: async () => {
    try {
      const questions = await databaseService.getCustomGameQuestions();
      set({ customGameQuestions: questions });
    } catch (e) {
      console.warn('Lỗi loadCustomGameQuestions:', e);
    }
  },

  addCustomGameQuestion: async (gameType, question) => {
    try {
      const current = get().customGameQuestions;
      const updatedList = [question, ...(current[gameType] || [])];
      const updatedQuestions = {
        ...current,
        [gameType]: updatedList,
      };
      set({ customGameQuestions: updatedQuestions });
      await databaseService.saveCustomGameQuestions(updatedQuestions);
    } catch (e) {
      console.error('Lỗi addCustomGameQuestion:', e);
    }
  },

  deleteCustomGameQuestion: async (gameType, questionId) => {
    try {
      const current = get().customGameQuestions;
      const updatedList = (current[gameType] || []).filter((q: any) => q.id !== questionId);
      const updatedQuestions = {
        ...current,
        [gameType]: updatedList,
      };
      set({ customGameQuestions: updatedQuestions });
      await databaseService.saveCustomGameQuestions(updatedQuestions);
    } catch (e) {
      console.error('Lỗi deleteCustomGameQuestion:', e);
    }
  },

  setMode: (mode) => set({ mode }),
  
  setActiveCategory: (catId) => {
    set({ activeCategoryId: catId });
    get().loadCardsForCategory(catId);
  },

  setOnboardingOpen: (open) => set({ onboardingOpen: open }),

  completeOnboarding: async (childName?: string, gridColumns?: number) => {
    try {
      await databaseService.setSetting('has_seen_onboarding', 'true');
      const updates: any = {};
      if (childName && childName.trim()) {
        updates.childName = childName.trim();
      }
      if (gridColumns) {
        updates.gridColumns = gridColumns;
      }
      if (Object.keys(updates).length > 0) {
        get().updateSettings(updates);
      }
      set({ onboardingOpen: false, hasSeenOnboarding: true });
    } catch (e) {
      console.error('Lỗi khi lưu trạng thái hoàn thành onboarding:', e);
      set({ onboardingOpen: false, hasSeenOnboarding: true });
    }
  },

  checkOnboardingStatus: async () => {
    try {
      const val = await databaseService.getSetting('has_seen_onboarding');
      const hasSeen = val === 'true' || val === '1';
      set({
        hasSeenOnboarding: hasSeen,
        onboardingOpen: !hasSeen, // Lần đầu vào tự động mở Guided Tour!
      });
    } catch (e) {
      console.warn('Lỗi khi kiểm tra onboarding status:', e);
    }
  },

  loadInitialData: async () => {
    try {
      set({ isLoading: true });
      const cats = await databaseService.getCategories();
      const firstCatId = cats[0]?.id || 'cat_starters';
      const cards = await databaseService.getCardsByCategory(firstCatId);
      set({
        categories: cats,
        activeCategoryId: firstCatId,
        cards,
        isLoading: false,
      });
      // Tự động kiểm tra và mở Guided Onboarding Tour nếu người dùng vào lần đầu
      await get().checkOnboardingStatus();
      // Nạp danh sách câu hỏi trò chơi do cha mẹ tùy biến
      await get().loadCustomGameQuestions();
    } catch (e) {
      console.error('Lỗi khi nạp dữ liệu ban đầu:', e);
      set({ isLoading: false });
    }
  },

  loadCardsForCategory: async (catId) => {
    try {
      const cards = await databaseService.getCardsByCategory(catId);
      set({ cards });
    } catch (e) {
      console.error('Lỗi khi nạp thẻ theo danh mục:', e);
    }
  },

  triggerCooldown: () => {
    const { cooldownSeconds } = get().settings;
    set({ isCooldownActive: true });
    setTimeout(() => {
      set({ isCooldownActive: false });
    }, cooldownSeconds * 1000);
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  setParentalGateOpen: (open) => set({ parentalGateOpen: open }),
  setCardCreatorOpen: (open) => set({ cardCreatorOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setAnalyticsOpen: (open) => set({ analyticsOpen: open }),
  setFamilySyncOpen: (open) => set({ familySyncOpen: open }),
  setSensoryShieldOpen: (open) => set({ sensoryShieldOpen: open }),
  setIsWaitingForVoice: (waiting) => set({ isWaitingForVoice: waiting }),
  triggerVocalReward: () => {
    set({ vocalRewardAwarded: true });
    setTimeout(() => {
      set({ vocalRewardAwarded: false });
    }, 4000);
  },

  addTokenStar: () => {
    const current = get().tokenStars;
    if (current + 1 >= 3) {
      set({ tokenStars: 3, mascotMood: 'cheering' });
      // Thưởng mở mini-game giác quan Pop-it khi đủ 3 sao
      setTimeout(() => {
        set({ popItGameOpen: true, tokenStars: 0, mascotMood: 'happy' });
      }, 700);
    } else {
      set({ tokenStars: current + 1, mascotMood: 'happy' });
      setTimeout(() => set({ mascotMood: 'idle' }), 3000);
    }
  },
  setPopItGameOpen: (open) => set({ popItGameOpen: open }),
  setDetectiveQuestOpen: (open) => set({ detectiveQuestOpen: open }),
  setGamesCenterOpen: (open) => set({ gamesCenterOpen: open }),
  setActiveGameTab: (tab) => set({ activeGameTab: tab }),
  setMascotMood: (mood) => set({ mascotMood: mood }),
  startDetectiveQuest: async () => {
    let pool: CardItemData[] = [];
    try {
      pool = await databaseService.getAllCards();
    } catch {
      pool = get().cards.filter((c) => !c.isStarter);
    }

    if (pool.length < 3) {
      pool = DEFAULT_CARDS.filter((c) => !c.isStarter);
    }

    if (pool.length >= 3) {
      // 1. Chọn ngẫu nhiên 1 thẻ mục tiêu
      const targetIdx = Math.floor(Math.random() * pool.length);
      const target = pool[targetIdx];

      // 2. Chọn ngẫu nhiên 2 thẻ gây nhiễu (distractors) khác với thẻ mục tiêu
      const remaining = pool.filter((c) => c.id !== target.id);
      const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
      const distractors = shuffledRemaining.slice(0, 2);

      // 3. Trộn ngẫu nhiên 3 phương án để vị trí đáp án đúng không cố định
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);

      set({
        detectiveQuestOpen: true,
        currentQuestCard: target,
        questOptions: options,
        mascotMood: 'cheering',
      });
    }
  },
  completeDetectiveQuest: () => {
    set({
      detectiveQuestOpen: false,
      currentQuestCard: null,
      mascotMood: 'happy',
    });
    get().addTokenStar();
  },
}));
