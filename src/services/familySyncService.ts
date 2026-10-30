import { Vibration, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { FamilyNotification } from '../types';

type NotificationListener = (notification: FamilyNotification) => void;

class FamilySyncService {
  private listeners: NotificationListener[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private notificationsHistory: FamilyNotification[] = [];

  constructor() {
    this.initBroadcastChannel();
  }

  private initBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('smart_aac_family_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'CHILD_SPOKE') {
            this.handleIncomingNotification(event.data.notification);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel không khả dụng trên môi trường này:', e);
    }
  }

  // Đăng ký nhận thông báo
  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Xử lý khi thiết bị của Mẹ nhận được tin báo từ Bé
  private handleIncomingNotification(notification: FamilyNotification) {
    this.notificationsHistory.unshift(notification);
    if (this.notificationsHistory.length > 30) {
      this.notificationsHistory.pop();
    }

    // 1. Rung máy để gây chú ý cho mẹ
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 500, 200, 500]);
      }
    } catch {}

    // 2. Giọng đọc thông báo to rõ cho mẹ trong bếp nghe thấy
    const announcement = `Bé ${notification.childName} vừa nói: ${notification.sentenceText}`;
    try {
      Speech.speak(announcement, {
        language: 'vi-VN',
        rate: 1.0,
        pitch: 1.1,
      });
    } catch (e) {
      console.warn('Lỗi đọc thông báo cho mẹ:', e);
    }

    // 3. Thông báo tới các component UI
    this.listeners.forEach((listener) => listener(notification));
  }

  // Thiết bị của Bé phát thông báo khi bé bấm câu
  broadcastSentence(childName: string, sentenceText: string, isEmergency = false) {
    const notification: FamilyNotification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      childName: childName || 'Bé Bo',
      sentenceText,
      timestamp: new Date().toISOString(),
      isEmergency,
    };

    // Gửi qua BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'CHILD_SPOKE',
          notification,
        });
      } catch (e) {
        console.warn('Lỗi gửi broadcast:', e);
      }
    }

    // Đồng thời kích hoạt trên local nếu thiết bị đang test cùng máy
    this.listeners.forEach((listener) => listener(notification));
  }

  getHistory(): FamilyNotification[] {
    return this.notificationsHistory;
  }
}

export const familySyncService = new FamilySyncService();
