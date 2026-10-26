/**
 * SchemeShield AI - Notifications Service
 * Real client notification handling with persistent local storage.
 */

import { Notification } from '../types/dashboard';

const NOTIFICATIONS_STORAGE_KEY = 'schemeshield_user_notifications';

function getInitialNotifications(): Notification[] {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }

  return [
    {
      id: 'notif-1',
      title: 'Security Advisory',
      message: 'PIB Fact Check notice: Official welfare schemes never solicit advance registration fees via personal UPI.',
      timestamp: 'Today',
      type: 'alert',
      read: false,
      link: '/verify',
    },
    {
      id: 'notif-2',
      title: 'Directory Updated',
      message: 'Central welfare schemes catalog synchronized with official government portals.',
      timestamp: 'Recently',
      type: 'info',
      read: true,
      link: '/schemes',
    },
  ];
}

let localNotificationsState: Notification[] = getInitialNotifications();

function saveNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

export const notificationService = {
  /**
   * Get all citizen security notifications.
   */
  async getNotifications(): Promise<Notification[]> {
    return [...localNotificationsState];
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<Notification[]> {
    localNotificationsState = localNotificationsState.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(localNotificationsState);
    return [...localNotificationsState];
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<Notification[]> {
    localNotificationsState = localNotificationsState.map((n) => ({ ...n, read: true }));
    saveNotifications(localNotificationsState);
    return [...localNotificationsState];
  },
};
