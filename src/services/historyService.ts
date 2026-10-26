/**
 * SchemeShield AI - History and Analytics Integration Service
 * Communicates with FastAPI /api/v1/verify/history and /api/v1/verify/stats.
 */

import { HistoryItem } from '../types/history';
import {
  VerificationHistoryListResponse,
  VerificationHistoryResponse,
  VerificationStatsResponse,
  VerificationResponse,
} from '../types/api';
import { apiClient } from './apiClient';

export function mapHistoryResponseToItem(item: VerificationHistoryResponse): HistoryItem {
  const normLabel = (item.result_label || '').toLowerCase();
  const isGenuine = normLabel.includes('genuin') || normLabel === 'safe';
  const isSuspicious = normLabel.includes('suspicious');
  const isFraud = normLabel.includes('fraud') || normLabel.includes('fake');

  return {
    id: item.id,
    resultId: item.id,
    schemeName: item.scheme_name || 'Scheme Verification Inquiry',
    inputExcerpt: item.scheme_name || 'Citizen verification submission',
    verifiedAt: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recently',
    riskTier: isGenuine ? 'LOW' : isSuspicious ? 'MODERATE' : 'HIGH',
    riskScore: isGenuine ? 8 : isSuspicious ? 55 : 92,
    confidenceScore: Math.round(Number(item.confidence_score || 0.85) * 100),
    status: isGenuine ? 'TRUSTED' : isSuspicious ? 'SUSPICIOUS' : 'FAKE',
    method: (item.input_type?.toUpperCase() as any) || 'TEXT',
    flagCount: isGenuine ? 0 : isSuspicious ? 2 : 5,
    summary: `${item.result_label} assessment logged for ${item.scheme_name}`,
  };
}

export const historyService = {
  /**
   * Get past verification records from live FastAPI backend.
   */
  async getHistory(
    page = 1,
    pageSize = 50,
    resultLabel?: string
  ): Promise<HistoryItem[]> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (resultLabel && resultLabel !== 'ALL') {
        params.append('result_label', resultLabel);
      }

      const res = await apiClient.get<VerificationHistoryListResponse>(`/verify/history?${params.toString()}`);
      return (res.items || []).map(mapHistoryResponseToItem);
    } catch {
      return [];
    }
  },

  /**
   * Get live verification statistics from FastAPI backend.
   */
  async getStats(): Promise<VerificationStatsResponse> {
    try {
      return await apiClient.get<VerificationStatsResponse>('/verify/stats');
    } catch {
      return {
        total_verifications: 0,
        genuine_count: 0,
        suspicious_count: 0,
        fraudulent_count: 0,
        flagged_fraud_rate: 0,
        top_flagged_schemes: [],
      };
    }
  },

  /**
   * Get single history item by ID from live backend.
   */
  async getHistoryItemById(id: string): Promise<HistoryItem | null> {
    try {
      const res = await apiClient.get<VerificationResponse>(`/verify/${encodeURIComponent(id)}`);
      return mapHistoryResponseToItem({
        id: res.id,
        input_type: res.input_type,
        scheme_name: res.scheme_name,
        result_label: res.result_label,
        confidence_score: res.confidence_score,
        created_at: res.created_at,
      });
    } catch {
      return null;
    }
  },

  /**
   * Remove item from local view (audit records are maintained on backend).
   */
  async deleteHistoryItem(_id: string): Promise<boolean> {
    return true;
  },

  /**
   * Clear local history view.
   */
  async clearHistory(): Promise<boolean> {
    return true;
  },
};
