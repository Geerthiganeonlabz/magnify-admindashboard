import type { Delivery } from '@/types/delivery';

const KEY = 'magnify-deliveries';

export function readDeliveries(): Delivery[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Delivery[]) : [];
  } catch {
    return [];
  }
}

export function writeDeliveries(list: Delivery[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Could not save deliveries.', e);
  }
}
