export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: 'active' | 'claimed' | 'pending';
  type: 'lost' | 'found';
  image?: string;
  contactName: string;
  contactInfo: string;
  createdAt: string;
}

export type FilterOptions = {
  search: string;
  category: string;
  location: string;
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};
