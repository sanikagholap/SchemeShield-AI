/**
 * SchemeShield AI - Official Schemes Directory Service
 * Integrates directly with FastAPI /api/v1/schemes endpoints.
 */

import { GovernmentScheme } from '../types/scheme';
import { SchemeResponse, SchemeListResponse } from '../types/api';
import { apiClient } from './apiClient';

export function mapSchemeResponseToGovernmentScheme(item: SchemeResponse): GovernmentScheme {
  return {
    id: item.id,
    code: item.id.toUpperCase(),
    title: item.name,
    ministry: item.department,
    nodalDepartment: item.department,
    launchYear: 2022,
    category: (item.category || 'Social Welfare') as any,
    shortDescription: item.description,
    detailedObjective: item.description,
    officialPortalUrl: item.official_portal_url,
    officialHelpline: item.helpline_number || undefined,
    targetBeneficiaries: item.eligibility_criteria ? [item.eligibility_criteria] : [],
    keyBenefits: item.benefits ? [item.benefits] : [],
    eligibilityCriteria: item.eligibility_criteria ? [item.eligibility_criteria] : [],
    applicationFee: 'FREE',
    isDirectBenefitTransfer: true,
    verifiedStatus: 'VERIFIED_AUTHENTIC',
    statusLabel: 'Verified Government Scheme',
    riskScore: 0,
    confidenceScore: 99,
    lastReviewedDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active',
    sourceAuthority: item.department,
  };
}

export const schemeService = {
  /**
   * Get all official government schemes from live backend.
   */
  async getSchemes(page = 1, pageSize = 50): Promise<GovernmentScheme[]> {
    try {
      const res = await apiClient.get<SchemeListResponse>(`/schemes?page=${page}&page_size=${pageSize}`);
      return (res.items || []).map(mapSchemeResponseToGovernmentScheme);
    } catch {
      return [];
    }
  },

  /**
   * Search official government schemes with filters from live backend.
   */
  async searchSchemes(
    query?: string,
    category?: string,
    riskFilter?: string,
    sortBy: 'name-asc' | 'name-desc' | 'recent' | 'risk-low' | 'risk-high' = 'recent'
  ): Promise<GovernmentScheme[]> {
    const params = new URLSearchParams();
    if (query && query.trim()) params.append('search', query.trim());
    if (category && category !== 'All') params.append('category', category);
    params.append('page_size', '100');

    try {
      const res = await apiClient.get<SchemeListResponse>(`/schemes?${params.toString()}`);
      let schemes = (res.items || []).map(mapSchemeResponseToGovernmentScheme);

      // Apply client-side sorting/filtering on top of backend search
      if (riskFilter && riskFilter !== 'All') {
        if (riskFilter === 'Low Risk') {
          schemes = schemes.filter((s) => s.riskScore <= 25);
        } else if (riskFilter === 'Moderate Risk') {
          schemes = schemes.filter((s) => s.riskScore > 25 && s.riskScore <= 60);
        } else if (riskFilter === 'High Alert') {
          schemes = schemes.filter((s) => s.riskScore > 60);
        }
      }

      schemes.sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.title.localeCompare(b.title);
          case 'name-desc':
            return b.title.localeCompare(a.title);
          case 'risk-low':
            return a.riskScore - b.riskScore;
          case 'risk-high':
            return b.riskScore - a.riskScore;
          case 'recent':
          default:
            return b.launchYear - a.launchYear;
        }
      });

      return schemes;
    } catch {
      return [];
    }
  },

  /**
   * Get single official scheme details by ID from live backend.
   */
  async getSchemeById(id: string): Promise<GovernmentScheme | null> {
    try {
      const res = await apiClient.get<SchemeResponse>(`/schemes/${encodeURIComponent(id)}`);
      return mapSchemeResponseToGovernmentScheme(res);
    } catch {
      return null;
    }
  },

  /**
   * Get all active categories matching backend scheme categories.
   */
  async getCategories(): Promise<string[]> {
    try {
      const res = await apiClient.get<SchemeListResponse>('/schemes?page_size=100');
      const backendCats = Array.from(new Set((res.items || []).map((s) => s.category).filter(Boolean)));
      const baseCategories = [
        'Education',
        'Healthcare',
        'Agriculture',
        'Employment',
        'Women & Child Development',
        'Financial Assistance',
        'Social Welfare',
      ];
      const merged = Array.from(new Set(['All', ...backendCats, ...baseCategories]));
      return merged;
    } catch {
      return [
        'All',
        'Education',
        'Healthcare',
        'Agriculture',
        'Employment',
        'Women & Child Development',
        'Financial Assistance',
        'Social Welfare',
      ];
    }
  },
};
