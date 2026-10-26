'use client';

import StatCard from '@/components/dashboard/shared/StatCard';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, PhoneCall, Pencil, Plus, Search, Trash2, Users, CalendarClock, ListChecks } from 'lucide-react';
import type { DemoSession } from '@/lib/demoAuth';
import { useToastStore } from '@/store/toastStore';
import { ConfirmModal, TableFooter, btnPrimary, inputCls } from '@/components/dashboard/shared/UiKit';
import { Skeleton } from '@/components/dashboard/shared/Skeleton';
import {
  DEFAULT_TARGET,
  SOURCES,
  metricsFor,
  nextCustomerId,
  nextLeadId,
  readCrmUsers,
  readLeads,
  readSession,
  readTargets,
  subscribeCrm,
  writeLeads,
  writeTargets,
  type CrmUser,
  LEAD_STATUSES,
  type Lead,
  type Target,
} from '@/lib/crm';
import LeadProfileModal, { type ProfileSave } from './LeadProfileModal';
import TeamPanel from './TeamPanel';

const PAGE_SIZE = 8;
const STATUS_TONE: Record<string, string> = {
  New: 'bg-blue-50 text-blue-600',
  Connected: 'bg-violet-50 text-violet-600',
  Lost: 'bg-slate-100 text-slate-500',
  'Follow Up': 'bg-amber-50 text-amber-600',
  Converted: 'bg-emerald-50 text-emerald-600',
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function LeadsView() {
  const { addToast } = useToastStore();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [targets, setTargets] = useState<Record<string, Target>>({});
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [ready, setReady] = useState(false);

  const [tab, setTab] = useState<'leads' | 'team'>('leads');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [owner, setOwner] = useState('all');
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(1);

  const [profile, setProfile] = useState<{ lead: Lead; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);

  const isAdmin = session?.role === 'admin';
  const me = session?.username ?? '';

  const reload = useCallback(() => {
    setSession(readSession());
    setLeads(readLeads());
    setTargets(readTargets());
    setUsers(readCrmUsers());
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
    return subscribeCrm(reload);
  }, [reload]);

  /* Each user only ever sees their own leads; admin sees all. */
  const visible = useMemo(() => (isAdmin ? leads : leads.filter((l) => l.owner === me)), [leads, isAdmin, me]);
  const nameOf = (u: string) => (u === 'admin' ? 'Admin' : users.find((x) => x.username === u)?.name ?? u);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visible.filter(
      (l) =>
        (status === 'all' || l.status === status) &&
        (source === 'all' || l.source === source) &&
        (owner === 'all' || (owner === '' ? !l.owner : l.owner === owner)) &&
        (!q || [l.id, l.business, l.phone].some((v) => v.toLowerCase().includes(q)))
    );
  }, [visible, search, status, source, owner]);

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const eod = new Date();
  eod.setHours(23, 59, 59, 999);
  const stats = [
    { label: 'Visible Leads', value: visible.length, icon: Users, tone: 'bg-blue-50 text-[#2563EB]' },
    { label: 'Follow Ups', value: visible.filter((l) => l.status === 'Follow Up' || l.status === 'Connected').length, icon: ListChecks, tone: 'bg-amber-50 text-amber-500' },
    { label: 'Due Today', value: visible.filter((l) => l.status !== 'Converted' && l.status !== 'Lost' && l.nextFollowUp && new Date(l.nextFollowUp) <= eod).length, icon: CalendarClock, tone: 'bg-rose-50 text-rose-500' },
    { label: 'Converted', value: visible.filter((l) => l.status === 'Converted').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
  ];

  /* ---------- mutations (always re-read first so other users' edits are not overwritten) ---------- */
  const mutate = (fn: (all: Lead[]) => Lead[], msg?: string) => {
    const next = fn(readLeads());
    try {
      writeLeads(next);
      setLeads(next);
      if (msg) addToast(msg, 'success');
    } catch {
      addToast('Could not save changes.', 'error');
    }
  };

  const openNew = () => {
    const base = readLeads();
    setProfile({
      isNew: true,
      lead: {
        id: nextLeadId(base),
        dateAdded: new Date().toISOString(),
        business: '',
        phone: '',
        source: SOURCES[0],
        callStatus: 'Not Contacted',
        result: '',
        product: '',
        status: 'New',
        nextFollowUp: '',
        owner: isAdmin ? '' : me,
        email: '',
        address: '',
        notes: '',
        history: [],
      },
    });
  };

  const saveProfile = ({ lead: v, converting }: ProfileSave) => {
    const isNew = profile?.isNew;
    const now = new Date().toISOString();
    mutate((all) => {
      if (isNew) {
        const id = all.some((l) => l.id === v.id) ? nextLeadId(all) : v.id;
        let lead: Lead = { ...v, id, owner: isAdmin ? v.owner : me };
        if (converting) lead = applySale(lead, all);
        return [lead, ...all];
      }
      return all.map((l) => {
        if (l.id !== v.id) return l;
        let next: Lead = { ...v, owner: isAdmin ? v.owner : l.owner };
        if (isAdmin && v.owner !== l.owner) {
          next = {
            ...next,
            history: [...next.history, { n: 0, at: now, by: 'admin', callStatus: '', result: '', product: '', nextFollowUp: '', system: true, notes: `Reassigned from ${l.owner ? nameOf(l.owner) : 'Unassigned'} to ${v.owner ? nameOf(v.owner) : 'Unassigned'}.` }],
          };
        }
        if (converting) next = applySale(next, all);
        return next;
      });
    }, isNew ? 'Lead added.' : 'Lead saved.');
    if (isNew) setPage(1);
    setProfile(null);
  };

  const applySale = (l: Lead, all: Lead[]): Lead => {
    const n = l.history.filter((h) => !h.system).length + 1;
    const now = new Date().toISOString();
    return {
      ...l,
      status: 'Converted',
      result: 'Converted',
      callStatus: 'Answered',
      nextFollowUp: '',
      customerId: l.customerId ?? nextCustomerId(all),
      history: [...l.history, { n, at: now, by: me || 'admin', callStatus: 'Answered', result: 'Converted', product: l.product, notes: 'Lead converted to a client.', nextFollowUp: '' }],
    };
  };

  const reassign = (from: string, to: string) => {
    let moved = 0;
    mutate((all) =>
      all.map((l) => {
        if (l.owner !== from || l.status === 'Converted') return l;
        moved += 1;
        return { ...l, owner: to, history: [...l.history, { n: 0, at: new Date().toISOString(), by: 'admin', callStatus: '', result: '', product: '', nextFollowUp: '', system: true, notes: `Reassigned from ${nameOf(from)} to ${nameOf(to)}.` }] };
      })
    );
    addToast(`${moved} lead(s) reassigned.`, 'success');
  };

  const setTarget = (u: string, t: Target) => {
    const next = { ...readTargets(), [u]: t };
    writeTargets(next);
    setTargets(next);
    addToast('Targets saved.', 'success');
  };

  const myMetrics = metricsFor(leads, me);
  const myTarget = targets[me] ?? DEFAULT_TARGET;

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="compact-ui relative mx-auto flex w-full max-w-7xl flex-col px-3 pb-6 pt-2 sm:px-6 sm:pt-3 lg:px-8 lg:pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#0F172A]">Leads & Followups</h1>
        <p className="text-xs text-[#64748B]">
          {isAdmin ? 'Add and assign leads, set targets and monitor the whole team.' : 'Add your own leads or work the ones assigned to you: call, update the result, schedule follow-ups and convert to sales.'}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon, tone }) => (
          <StatCard key={label} label={label} value={value} icon={icon} tone={tone} />
        ))}
      </div>

      {!isAdmin && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ['Calls today', myMetrics.callsToday, myTarget.dailyCalls],
            ['New leads today', myMetrics.leadsToday, myTarget.dailyLeads],
            ['Orders this month', myMetrics.convertedMonth, myTarget.monthlyOrders],
            ['Sales this month (LKR)', myMetrics.salesMonth, myTarget.salesAmount],
          ] as const).map(([l, v, t]) => {
            const p = t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0;
            return (
              <div key={l}>
                <div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-[#64748B]">{l}</span><span className="font-bold text-[#0F172A]">{v.toLocaleString('en-US')} / {t > 0 ? t.toLocaleString('en-US') : 'target not set'}</span></div>
                <div className="h-2 rounded-full bg-[#F1F5F9]"><div className={`h-2 rounded-full ${p >= 100 ? 'bg-emerald-500' : 'bg-[#2563EB]'}`} style={{ width: `${p}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <div className="mb-3 inline-flex w-fit rounded-xl border border-[#E2E8F0] bg-white p-1">
          {([['leads', 'All Leads'], ['team', 'Team & Targets']] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`h-9 rounded-lg px-4 text-xs font-bold ${tab === k ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-slate-50'}`}>{l}</button>
          ))}
        </div>
      )}

      {isAdmin && tab === 'team' ? (
        <TeamPanel users={users} leads={leads} targets={targets} onSetTarget={setTarget} onReassign={reassign} />
      ) : (
        <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#E2E8F0] p-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by lead ID, name or phone..." className={`${inputCls} pl-9`} />
            </div>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${inputCls} lg:w-36`}>
              <option value="all">All Status</option>
              {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className={`${inputCls} lg:w-36`}>
              <option value="all">All Sources</option>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {isAdmin && (
              <select value={owner} onChange={(e) => { setOwner(e.target.value); setPage(1); }} className={`${inputCls} lg:w-40`}>
                <option value="all">All Users</option>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.username} value={u.username}>{u.name}</option>)}
              </select>
            )}
            {(
              <button type="button" onClick={openNew} className={btnPrimary}><Plus size={14} /> Add Lead</button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  {['Lead ID', 'Customer', 'Source', 'Status', 'Call / Result', 'Next follow-up', ...(isAdmin ? ['Owner'] : []), 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="py-14 text-center text-xs text-[#94A3B8]">{isAdmin ? 'No leads match. Click "Add Lead" to create one.' : 'No leads yet. Click "Add Lead" to create one.'}</td></tr>
                ) : (
                  rows.map((l) => {
                    const overdue = l.status !== 'Converted' && l.nextFollowUp && new Date(l.nextFollowUp) < new Date();
                    return (
                      <tr key={l.id} className="hover:bg-[#F8FAFC]/80">
                        <td className="px-4 py-3"><span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-xs font-bold text-[#2563EB]">{l.id}</span></td>
                        <td className="px-4 py-3"><p className="text-xs font-bold text-[#0F172A]">{l.business}</p><p className="text-xs text-[#94A3B8]">{l.phone}</p></td>
                        <td className="px-4 py-3 text-xs text-[#475569]">{l.source}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_TONE[l.status]}`}>{l.status}</span></td>
                        <td className="px-4 py-3"><p className="text-xs font-semibold text-[#0F172A]">{l.callStatus}</p><p className="text-xs text-[#94A3B8]">{l.result || '-'}</p></td>
                        <td className={`whitespace-nowrap px-4 py-3 text-xs ${overdue ? 'font-bold text-rose-600' : 'text-[#475569]'}`}>{l.nextFollowUp ? fmt(l.nextFollowUp) : '-'}</td>
                        {isAdmin && <td className="px-4 py-3 text-xs font-semibold text-[#0F172A]">{l.owner ? nameOf(l.owner) : <span className="text-[#94A3B8]">Unassigned</span>}</td>}
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button type="button" title={l.status === 'Converted' ? 'View' : 'Call & follow-up'} aria-label="Open lead" onClick={() => setProfile({ lead: l, isNew: false })} className="flex size-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-blue-50 hover:text-[#2563EB]">
                              {l.status === 'Converted' ? <Eye size={15} /> : <PhoneCall size={15} />}
                            </button>
                            <button type="button" title="Edit" aria-label="Edit lead" onClick={() => setProfile({ lead: l, isNew: false })} className="flex size-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-blue-50 hover:text-[#2563EB]"><Pencil size={15} /></button>
                            {isAdmin && <button type="button" title="Delete" aria-label="Delete lead" onClick={() => setDeleting(l)} className="flex size-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <TableFooter page={safePage} pageSize={PAGE_SIZE} total={filtered.length} noun="leads" onPage={setPage} />
        </section>
      )}

      <LeadProfileModal
        open={!!profile}
        lead={profile?.lead ?? null}
        isNew={!!profile?.isNew}
        isAdmin={!!isAdmin}
        me={me}
        users={users}
        onClose={() => setProfile(null)}
        onSave={saveProfile}
        onDelete={(l) => { setProfile(null); setDeleting(l); }}
      />
      <ConfirmModal
        open={!!deleting}
        title="Delete lead?"
        message={<>Lead <b>{deleting?.id}</b> ({deleting?.business}) and its follow-up history will be removed.</>}
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={() => { if (deleting) mutate((all) => all.filter((l) => l.id !== deleting.id), 'Lead deleted.'); setDeleting(null); }}
      />
    </div>
  );
}
