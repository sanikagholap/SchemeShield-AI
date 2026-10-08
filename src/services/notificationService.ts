import { Notification } from '../types/dashboard';
import { MOCK_NOTIFICATIONS_LIST } from '../data/mockNotifications';
import { simulateLatency } from './apiClient';

let localNotificationsState: Notification[] = [...MOCK_NOTIFICATIONS_LIST];

export const notificationService = {
  /**
   * Get all notifications
   */
  async getNotifications(): Promise<Notification[]> {
    return simulateLatency([...localNotificationsState], 150);
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<Notification[]> {
    localNotificationsState = localNotificationsState.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    return simulateLatency([...localNotificationsState], 100);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<Notification[]> {
    localNotificationsState = localNotificationsState.map((n) => ({ ...n, read: true }));
    return simulateLatency([...localNotificationsState], 150);
  }
};
