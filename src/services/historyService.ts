import { HistoryItem } from '../types/history';
import { MOCK_HISTORY_ITEMS } from '../data/mockSchemes';
import { simulateLatency } from './apiClient';

let localHistory: HistoryItem[] = [...MOCK_HISTORY_ITEMS];

export const historyService = {
  /**
   * Get past verifications list
   */
  async getHistory(): Promise<HistoryItem[]> {
    return simulateLatency([...localHistory], 250);
  },

  /**
   * Get single history item by ID
   */
  async getHistoryItemById(id: string): Promise<HistoryItem | null> {
    const item = localHistory.find((h) => h.id === id) || null;
    return simulateLatency(item, 150);
  },

  /**
   * Delete an item from history
   */
  async deleteHistoryItem(id: string): Promise<boolean> {
    localHistory = localHistory.filter((i) => i.id !== id);
    return simulateLatency(true, 200);
  },

  /**
   * Clear all past verification records
   */
  async clearHistory(): Promise<boolean> {
    localHistory = [];
    return simulateLatency(true, 250);
  }
};
