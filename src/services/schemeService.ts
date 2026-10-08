import { GovernmentScheme } from '../types/scheme';
import { MOCK_OFFICIAL_SCHEMES } from '../data/mockSchemes';
import { simulateLatency } from './apiClient';

export const schemeService = {
  /**
   * Get all official government schemes
   */
  async getSchemes(): Promise<GovernmentScheme[]> {
    return simulateLatency([...MOCK_OFFICIAL_SCHEMES], 200);
  },

  /**
   * Search official government schemes with filters
   */
  async searchSchemes(
    query?: string,
    category?: string,
    riskFilter?: string,
    sortBy: 'name-asc' | 'name-desc' | 'recent' | 'risk-low' | 'risk-high' = 'recent'
  ): Promise<GovernmentScheme[]> {
    let results = [...MOCK_OFFICIAL_SCHEMES];

    if (category && category !== 'All') {
      results = results.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (riskFilter && riskFilter !== 'All') {
      if (riskFilter === 'Low Risk') {
        results = results.filter((s) => s.riskScore <= 25);
      } else if (riskFilter === 'Moderate Risk') {
        results = results.filter((s) => s.riskScore > 25 && s.riskScore <= 60);
      } else if (riskFilter === 'High Alert') {
        results = results.filter((s) => s.riskScore > 60);
      }
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase();
      results = results.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.targetBeneficiaries.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Sorting
    results.sort((a, b) => {
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

    return simulateLatency(results, 250);
  },

  /**
   * Get single official scheme details by ID or code
   */
  async getSchemeById(id: string): Promise<GovernmentScheme | null> {
    const found =
      MOCK_OFFICIAL_SCHEMES.find(
        (s) => s.id === id || s.code.toLowerCase() === id.toLowerCase()
      ) || null;
    return simulateLatency(found, 150);
  },

  /**
   * Get all active categories matching Section 1 requirements
   */
  async getCategories(): Promise<string[]> {
    return simulateLatency([
      'All',
      'Education',
      'Healthcare',
      'Agriculture',
      'Employment',
      'Women & Child Development',
      'Financial Assistance',
      'Social Welfare'
    ], 100);
  }
};
