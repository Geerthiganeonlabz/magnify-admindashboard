import type { InventoryItem } from '@/types/inventory';

const KEY = 'magnify-inventory';

export function readInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as InventoryItem[]) : [];
  } catch {
    return [];
  }
}

export function writeInventory(list: InventoryItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Could not save inventory.', e);
  }
}
