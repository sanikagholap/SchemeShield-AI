import { OfficialScheme } from '../types/scheme';
import { MOCK_OFFICIAL_SCHEMES } from '../data/mockSchemes';
import { simulateLatency } from './apiClient';

export const schemeService = {
  /**
   * Search official government schemes with filters
   */
  async searchSchemes(query?: string, category?: string): Promise<OfficialScheme[]> {
    let results = [...MOCK_OFFICIAL_SCHEMES];

    if (category && category !== 'All') {
      results = results.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase();
      results = results.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q)
      );
    }

    return simulateLatency(results, 300);
  },

  /**
   * Get single official scheme details by ID or code
   */
  async getSchemeById(id: string): Promise<OfficialScheme | null> {
    const found = MOCK_OFFICIAL_SCHEMES.find(s => s.id === id || s.code.toLowerCase() === id.toLowerCase()) || null;
    return simulateLatency(found, 200);
  },

  /**
   * Get all active categories
   */
  async getCategories(): Promise<string[]> {
    return simulateLatency([
      'All',
      'Agriculture & Farmers',
      'Healthcare & Wellness',
      'Financial Inclusion & Credit',
      'Women & Child Development',
      'Housing & Urban Development',
      'Education & Skill'
    ], 100);
  }
};
