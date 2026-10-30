import * as SQLite from 'expo-sqlite';
import { CardItemData, Category, AppSettings, CommunicationLog } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_CARDS } from '../constants/defaultData';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('smartaac.db');
      await this.initTables();
    }
    return this.db;
  }

  private async initTables() {
    if (!this.db) return;

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        colorHex TEXT NOT NULL,
        borderColor TEXT NOT NULL,
        icon TEXT NOT NULL,
        sortOrder INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY NOT NULL,
        categoryId TEXT NOT NULL,
        label TEXT NOT NULL,
        emojiIcon TEXT,
        imageUri TEXT,
        audioUri TEXT,
        audioType TEXT NOT NULL,
        isHidden INTEGER NOT NULL DEFAULT 0,
        usageCount INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        isStarter INTEGER NOT NULL DEFAULT 0,
        suggestedCategoryId TEXT,
        FOREIGN KEY (categoryId) REFERENCES categories (id)
      );

      CREATE TABLE IF NOT EXISTS sentence_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sentenceText TEXT NOT NULL,
        cardIdsJson TEXT NOT NULL,
        cardCount INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);

    // Hỗ trợ migration nếu bảng đã tồn tại từ trước
    try {
      await this.db.execAsync('ALTER TABLE cards ADD COLUMN isStarter INTEGER NOT NULL DEFAULT 0;');
    } catch {}
    try {
      await this.db.execAsync('ALTER TABLE cards ADD COLUMN suggestedCategoryId TEXT;');
    } catch {}

    // Kiểm tra nếu chưa có danh mục nào thì nạp dữ liệu ban đầu
    const existingCats = await this.db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
    if (existingCats.length === 0 || existingCats[0].count === 0) {
      await this.seedInitialData();
    }
  }

  async seedInitialData() {
    if (!this.db) return;

    for (const cat of DEFAULT_CATEGORIES) {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO categories (id, name, type, colorHex, borderColor, icon, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.type, cat.colorHex, cat.borderColor, cat.icon, cat.sortOrder]
      );
    }

    for (const card of DEFAULT_CARDS) {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO cards (id, categoryId, label, emojiIcon, imageUri, audioUri, audioType, isHidden, usageCount, createdAt, isStarter, suggestedCategoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          card.id,
          card.categoryId,
          card.label,
          card.emojiIcon ?? '',
          card.imageUri ?? null,
          card.audioUri ?? null,
          card.audioType,
          card.isHidden ? 1 : 0,
          card.usageCount,
          card.createdAt,
          card.isStarter ? 1 : 0,
          card.suggestedCategoryId ?? null,
        ]
      );
    }
  }

  async getCategories(): Promise<Category[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM categories ORDER BY sortOrder ASC');
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      colorHex: r.colorHex,
      borderColor: r.borderColor,
      icon: r.icon,
      sortOrder: r.sortOrder,
    }));
  }

  async getCardsByCategory(categoryId: string): Promise<CardItemData[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM cards WHERE categoryId = ? AND isHidden = 0 ORDER BY usageCount DESC, createdAt ASC',
      [categoryId]
    );
    return rows.map((r) => ({
      id: r.id,
      categoryId: r.categoryId,
      label: r.label,
      emojiIcon: r.emojiIcon || undefined,
      imageUri: r.imageUri || null,
      audioUri: r.audioUri || null,
      audioType: r.audioType,
      isHidden: r.isHidden === 1,
      usageCount: r.usageCount,
      createdAt: r.createdAt,
      isStarter: r.isStarter === 1,
      suggestedCategoryId: r.suggestedCategoryId || undefined,
    }));
  }

  async getAllCards(): Promise<CardItemData[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM cards WHERE isHidden = 0 AND isStarter = 0 ORDER BY usageCount DESC, createdAt ASC'
    );
    return rows.map((r) => ({
      id: r.id,
      categoryId: r.categoryId,
      label: r.label,
      emojiIcon: r.emojiIcon || undefined,
      imageUri: r.imageUri || null,
      audioUri: r.audioUri || null,
      audioType: r.audioType,
      isHidden: r.isHidden === 1,
      usageCount: r.usageCount,
      createdAt: r.createdAt,
      isStarter: r.isStarter === 1,
      suggestedCategoryId: r.suggestedCategoryId || undefined,
    }));
  }

  async addCard(card: CardItemData): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'INSERT INTO cards (id, categoryId, label, emojiIcon, imageUri, audioUri, audioType, isHidden, usageCount, createdAt, isStarter, suggestedCategoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        card.id,
        card.categoryId,
        card.label,
        card.emojiIcon ?? '',
        card.imageUri ?? null,
        card.audioUri ?? null,
        card.audioType,
        card.isHidden ? 1 : 0,
        card.usageCount,
        card.createdAt,
        card.isStarter ? 1 : 0,
        card.suggestedCategoryId ?? null,
      ]
    );
  }

  async incrementCardUsage(cardId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('UPDATE cards SET usageCount = usageCount + 1 WHERE id = ?', [cardId]);
  }

  async logSentence(sentenceText: string, cardIds: string[]): Promise<void> {
    const db = await this.getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO sentence_logs (sentenceText, cardIdsJson, cardCount, timestamp) VALUES (?, ?, ?, ?)',
      [sentenceText, JSON.stringify(cardIds), cardIds.length, now]
    );

    // Tăng lượt sử dụng cho các thẻ trong câu
    for (const cId of cardIds) {
      await this.incrementCardUsage(cId);
    }
  }

  async getRecentLogs(limit = 50): Promise<CommunicationLog[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM sentence_logs ORDER BY id DESC LIMIT ?',
      [limit]
    );
    return rows.map((r) => ({
      id: r.id,
      sentenceText: r.sentenceText,
      cardIdsJson: r.cardIdsJson,
      cardCount: r.cardCount,
      timestamp: r.timestamp,
    }));
  }

  async getLogStats(): Promise<{ totalSentences: number; totalCardsUsed: number }> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ totalSentences: number; totalCardsUsed: number }>(
      'SELECT COUNT(*) as totalSentences, COALESCE(SUM(cardCount), 0) as totalCardsUsed FROM sentence_logs'
    );
    return {
      totalSentences: row?.totalSentences || 0,
      totalCardsUsed: row?.totalCardsUsed || 0,
    };
  }

  async getTopCards(limit = 5): Promise<{ id: string; label: string; emojiIcon?: string; usageCount: number }[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<any>(
      'SELECT id, label, emojiIcon, usageCount FROM cards WHERE usageCount > 0 ORDER BY usageCount DESC LIMIT ?',
      [limit]
    );
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      emojiIcon: r.emojiIcon || undefined,
      usageCount: r.usageCount,
    }));
  }

  async getSetting(key: string): Promise<string | null> {
    try {
      const db = await this.getDb();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM settings WHERE key = ?',
        [key]
      );
      if (row) return row.value;
    } catch (e) {
      console.warn('Lỗi getSetting từ SQLite:', e);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(`smartaac_setting_${key}`);
      } catch {}
    }
    return null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    } catch (e) {
      console.warn('Lỗi setSetting vào SQLite:', e);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`smartaac_setting_${key}`, value);
      } catch {}
    }
  }

  async getCustomGameQuestions(): Promise<import('../types/gameQuestions').CustomGameQuestionsState> {
    try {
      const raw = await this.getSetting('custom_game_questions_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          flip: Array.isArray(parsed.flip) ? parsed.flip : [],
          matching: Array.isArray(parsed.matching) ? parsed.matching : [],
          puzzle: Array.isArray(parsed.puzzle) ? parsed.puzzle : [],
          quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
          movement: Array.isArray(parsed.movement) ? parsed.movement : [],
        };
      }
    } catch (e) {
      console.warn('Lỗi getCustomGameQuestions:', e);
    }
    return {
      flip: [],
      matching: [],
      puzzle: [],
      quiz: [],
      movement: [],
    };
  }

  async saveCustomGameQuestions(questions: import('../types/gameQuestions').CustomGameQuestionsState): Promise<void> {
    try {
      await this.setSetting('custom_game_questions_v1', JSON.stringify(questions));
    } catch (e) {
      console.error('Lỗi saveCustomGameQuestions:', e);
    }
  }
}

export const databaseService = new DatabaseService();
