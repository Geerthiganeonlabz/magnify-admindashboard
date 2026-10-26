import { DEMO_SESSION_KEY, readDemoTeams, type DemoSession } from '@/lib/demoAuth';

export const LEADS_KEY = 'magnify-crm-leads';
export const TARGETS_KEY = 'magnify-crm-targets';
const CHANNEL = 'magnify-crm';

export const SOURCES = ['Google Maps', 'Referral', 'Facebook', 'Instagram', 'Walk-in', 'Other'] as const;
export const CALL_STATUSES = ['Not Contacted', 'Answered', 'No Answer'] as const;
export const RESULTS = ['Callback', 'Order Discussion', 'No Response', 'Interested', 'Converted'] as const;
export const LEAD_STATUSES = ['New', 'Connected', 'Follow Up', 'Converted', 'Lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface FollowUp {
  n: number; // 0 = system entry (reassign etc.)
  at: string; // ISO
  by: string; // username or 'admin'
  callStatus: string;
  result: string;
  product: string;
  notes: string;
  nextFollowUp: string;
  system?: boolean;
  edits?: { at: string; by: string; before: string }[]; // audit trail for edited records
}

export interface OrderInfo {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  address: string;
  phone: string;
  convertedAt: string;
}

export interface Lead {
  id: string; // ML001
  dateAdded: string; // ISO
  business: string;
  phone: string;
  source: string;
  callStatus: string;
  result: string;
  product: string;
  status: LeadStatus;
  nextFollowUp: string; // ISO or ''
  owner: string; // username or ''
  email: string;
  address: string;
  notes: string;
  history: FollowUp[];
  customerId?: string;
  order?: OrderInfo;
}

export interface Target {
  monthlyOrders: number;
  salesAmount: number;
  dailyCalls: number;
  dailyLeads: number;
}
export const DEFAULT_TARGET: Target = { monthlyOrders: 0, salesAmount: 0, dailyCalls: 0, dailyLeads: 0 };

const mk = (id: string, ago: number, business: string, phone: string, source: string, result = '', status: LeadStatus = 'New'): Lead => ({
  id,
  dateAdded: new Date(Date.now() - ago * 86400000).toISOString(),
  business,
  phone,
  source,
  callStatus: 'Not Contacted',
  result,
  product: '',
  status,
  nextFollowUp: '',
  owner: '',
  email: '',
  address: '',
  notes: '',
  history: [],
});

export const SEED_LEADS: Lead[] = [
  mk('ML001', 3, 'ABC Restaurant', '+94 77 512 4360', 'Google Maps'),
  mk('ML002', 3, 'City Cafe', '+94 71 220 4488', 'Google Maps'),
  mk('ML003', 2, 'Kumar Stores', '+94 76 545 6789', 'Referral'),
  mk('ML004', 2, 'Fresh Mart', '+94 70 118 3345', 'Google Maps'),
  mk('ML005', 1, 'Green Hotel', '+94 75 902 1170', 'Referral'),
  mk('ML006', 0, 'Royal Bakery', '+94 77 764 2201', 'Facebook'),
];

/* ---------- storage ---------- */
function bc(): BroadcastChannel | null {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}

export function readLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (!raw) return SEED_LEADS;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return (parsed as Lead[]).map((l) => ({ email: '', address: '', notes: '', ...l }));
  } catch (e) {
    console.error('Could not read leads.', e);
  }
  return SEED_LEADS;
}

export function writeLeads(leads: Lead[]): void {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  const ch = bc();
  ch?.postMessage('leads');
  ch?.close();
}

export function readTargets(): Record<string, Target> {
  try {
    const raw = localStorage.getItem(TARGETS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Target>) : {};
  } catch {
    return {};
  }
}

export function writeTargets(t: Record<string, Target>): void {
  localStorage.setItem(TARGETS_KEY, JSON.stringify(t));
  const ch = bc();
  ch?.postMessage('targets');
  ch?.close();
}

/** Re-fetch triggers: other tabs, tab focus/visibility, reconnect, and a 30s fallback poll. */
export function subscribeCrm(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === LEADS_KEY || e.key === TARGETS_KEY) cb();
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') cb();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('online', cb);
  window.addEventListener('focus', cb);
  document.addEventListener('visibilitychange', onVisible);
  const ch = bc();
  if (ch) ch.onmessage = cb;
  const timer = window.setInterval(cb, 30000);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('online', cb);
    window.removeEventListener('focus', cb);
    document.removeEventListener('visibilitychange', onVisible);
    ch?.close();
    window.clearInterval(timer);
  };
}

/* ---------- helpers ---------- */
export function readSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export interface CrmUser {
  username: string;
  name: string;
  active: boolean;
}
export function readCrmUsers(): CrmUser[] {
  try {
    return readDemoTeams()
      .flatMap((t) => t.members)
      .map((m) => ({ username: m.username, name: m.name, active: m.status === 'Active' }));
  } catch {
    return [];
  }
}

export const nextLeadId = (leads: Lead[]) => {
  const max = leads.reduce((m, l) => Math.max(m, Number(l.id.replace(/\D/g, '')) || 0), 0);
  return `ML${String(max + 1).padStart(3, '0')}`;
};
export const nextCustomerId = (leads: Lead[]) => {
  const max = leads.reduce((m, l) => Math.max(m, Number(l.customerId?.replace(/\D/g, '')) || 0), 0);
  return `CL-${String(max + 1).padStart(3, '0')}`;
};

export const sameDay = (iso: string, d = new Date()) => {
  const x = new Date(iso);
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
};
export const sameMonth = (iso: string, d = new Date()) => {
  const x = new Date(iso);
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth();
};

export interface UserMetrics {
  leads: number;
  pendingFollowUps: number;
  callsToday: number;
  answeredToday: number;
  leadsToday: number;
  convertedMonth: number;
  salesMonth: number;
  dueToday: number;
}
export function metricsFor(leads: Lead[], username: string): UserMetrics {
  const mine = leads.filter((l) => l.owner === username);
  const calls = leads.flatMap((l) => l.history).filter((h) => !h.system && h.by === username && sameDay(h.at));
  const eod = new Date();
  eod.setHours(23, 59, 59, 999);
  const converted = mine.filter((l) => l.status === 'Converted' && l.order && sameMonth(l.order.convertedAt));
  return {
    leads: mine.length,
    pendingFollowUps: mine.filter((l) => l.status === 'Follow Up' || l.status === 'Connected').length,
    callsToday: calls.length,
    answeredToday: calls.filter((h) => h.callStatus === 'Answered').length,
    leadsToday: mine.filter((l) => sameDay(l.dateAdded)).length,
    convertedMonth: converted.length,
    salesMonth: converted.reduce((s, l) => s + (l.order?.total ?? 0), 0),
    dueToday: mine.filter((l) => l.status !== 'Converted' && l.status !== 'Lost' && l.nextFollowUp && new Date(l.nextFollowUp) <= eod).length,
  };
}
