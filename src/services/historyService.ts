import { HistoryItem } from '../types/history';
import { MOCK_HISTORY_ITEMS } from '../data/mockSchemes';
import { simulateLatency } from './apiClient';

export const historyService = {
  /**
   * Get past verifications list
   */
  async getHistory(): Promise<HistoryItem[]> {
    return simulateLatency(MOCK_HISTORY_ITEMS, 300);
  },

  /**
   * Delete an item from history
   */
  async deleteHistoryItem(id: string): Promise<boolean> {
    return simulateLatency(true, 250);
  },

  /**
   * Clear all past verification records
   */
  async clearHistory(): Promise<boolean> {
    return simulateLatency(true, 250);
  }
};
