/**
 * API Service for Lost and Found App
 * Handles all backend communication
 */

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000/api';

export interface ApiItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: 'active' | 'claimed' | 'pending';
  type: 'lost' | 'found';
  image?: string;
  imageHash?: string | null;
  contactName: string;
  contactInfo: string;
  createdAt: string;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  location?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardData {
  stats: {
    totalItems: number;
    lostItems: number;
    foundItems: number;
    activeItems: number;
    claimedItems: number;
    pendingItems: number;
    claimRate: number;
  };
  topCategories: Array<{ name: string; count: number }>;
  topLocations: Array<{ name: string; count: number }>;
  mostLostItems: Array<{ name: string; count: number }>;
  itemsByDate: Record<number, number>;
}

export interface SimilarItem {
  id: string;
  title: string;
  image: string;
  status: string;
  type: string;
  similarity: number;
}

export interface BadgeData {
  reported_count: number;
  claimed_count: number;
  match_count: number;
  badges: string[];
}

class ApiService {
  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getItems(filters?: Partial<SearchFilters>): Promise<ApiItem[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    if (filters?.location && filters.location !== 'All') {
      params.append('location', filters.location);
    }
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    const query = params.toString();
    const url = `${API_BASE_URL}/items${query ? `?${query}` : ''}`;
    return this.fetchJson<ApiItem[]>(url);
  }

  async addItem(item: Omit<ApiItem, 'id' | 'createdAt' | 'imageHash'>): Promise<{
    item: ApiItem;
    similarItems: SimilarItem[];
    hasMatch: boolean;
  }> {
    return this.fetchJson<{ item: ApiItem; similarItems: SimilarItem[]; hasMatch: boolean }>(
      `${API_BASE_URL}/items`,
      {
        method: 'POST',
        body: JSON.stringify(item),
      }
    );
  }

  async updateItem(itemId: string, updates: Partial<ApiItem>): Promise<ApiItem> {
    return this.fetchJson<ApiItem>(`${API_BASE_URL}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.fetchJson(`${API_BASE_URL}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async searchItems(filters: SearchFilters): Promise<ApiItem[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    return this.fetchJson<ApiItem[]>(`${API_BASE_URL}/search?${params.toString()}`);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) {
      return [];
    }
    const params = new URLSearchParams({ q: query });
    return this.fetchJson<string[]>(`${API_BASE_URL}/search/suggestions?${params.toString()}`);
  }

  async getDashboardData(): Promise<DashboardData> {
    return this.fetchJson<DashboardData>(`${API_BASE_URL}/dashboard`);
  }

  async getSimilarItems(itemId: string): Promise<SimilarItem[]> {
    return this.fetchJson<SimilarItem[]>(`${API_BASE_URL}/items/${itemId}/similar`);
  }

  async getUserBadges(email: string): Promise<BadgeData> {
    return this.fetchJson<BadgeData>(`${API_BASE_URL}/badges/${encodeURIComponent(email)}`);
  }

  async getItemQR(itemId: string): Promise<{ itemId: string; url: string; title: string }> {
    return this.fetchJson<{ itemId: string; url: string; title: string }>(
      `${API_BASE_URL}/items/${itemId}/qr`
    );
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.fetchJson<{ status: string; message: string }>(`${API_BASE_URL}/health`);
  }
}

export const apiService = new ApiService();

