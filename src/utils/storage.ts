import { Item } from '../types';
import { mockItems } from './mockData';

const STORAGE_KEY = 'lost_found_items';

export const getItems = (): Item[] => {
  if (typeof window === 'undefined') return mockItems;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
    return mockItems;
  }
  return JSON.parse(stored);
};

export const saveItems = (items: Item[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const addItem = (item: Omit<Item, 'id' | 'createdAt'>): Item => {
  const items = getItems();
  const newItem: Item = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  saveItems(items);
  return newItem;
};

export const updateItem = (id: string, updates: Partial<Item>): void => {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveItems(items);
  }
};

export const deleteItem = (id: string): void => {
  const items = getItems();
  const filtered = items.filter(item => item.id !== id);
  saveItems(filtered);
};
