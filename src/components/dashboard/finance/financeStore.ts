import { INITIAL_TRANSACTIONS } from '@/data/finance';
import type { Transaction } from '@/types/finance';
import { readSession } from '@/lib/crm';

const KEY = 'magnify-finance-transactions';

export function readTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return INITIAL_TRANSACTIONS;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Transaction[];
  } catch (e) {
    console.error('Could not read finance records.', e);
  }
  return INITIAL_TRANSACTIONS;
}

export function writeTransactions(list: Transaction[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** Admin sees every record (including the main/seed data). Everyone else sees only the records they added. */
export function visibleTransactions(all: Transaction[]): Transaction[] {
  const s = readSession();
  if (!s || s.role === 'admin') return all;
  return all.filter((t) => t.createdBy === s.username);
}

export function currentUsername(): string {
  return readSession()?.username ?? 'admin';
}
