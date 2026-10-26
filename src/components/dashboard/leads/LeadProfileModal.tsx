'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import { ModalShell, btnGhost, btnPrimary, inputCls, labelCls, textareaCls } from '@/components/dashboard/shared/UiKit';
import { apiV1Url } from '@/lib/backendUrl';
import { CALL_STATUSES, LEAD_STATUSES, RESULTS, SOURCES, type CrmUser, type FollowUp, type Lead } from '@/lib/crm';

const CUSTOM = '__custom__';
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-CA');
const fmtDT = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const toLocalInput = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export interface ProfileSave {
  lead: Lead;
  converting: boolean; // status was changed to Converted in this save
}

export default function LeadProfileModal({
  open,
  lead,
  isNew,
  isAdmin,
  me,
  users,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  lead: Lead | null;
  isNew: boolean;
  isAdmin: boolean;
  me: string;
  users: CrmUser[];
  onClose: () => void;
  onSave: (r: ProfileSave) => void;
  onDelete: (l: Lead) => void;
}) {
  const [d, setD] = useState<Lead | null>(null);
  const [products, setProducts] = useState<string[]>([]);
  const [customProduct, setCustomProduct] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [err, setErr] = useState('');

  // new / edit history record form
  const [rec, setRec] = useState<{ index: number | null; callStatus: string; result: string; notes: string; next: string } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(apiV1Url('/products?page=1&limit=1000'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((j: unknown) => {
        const list = Array.isArray(j) ? j : ((j as { data?: unknown[] })?.data ?? (j as { products?: unknown[] })?.products ?? []);
        const names = (list as { productName?: string }[]).map((p) => p.productName).filter((n): n is string => !!n);
        if (alive) setProducts(names);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open || !lead) return;
    setD(JSON.parse(JSON.stringify(lead)) as Lead);
    setCustomProduct(false);
    setConfirmDel(null);
    setErr('');
    setRec(null);
  }, [open, lead]);

  if (!d || !lead) return null;

  const wasConverted = lead.status === 'Converted';
  const becomingConverted = d.status === 'Converted' && !wasConverted;
  const ownerLocked = !isAdmin;
  const productIsCustom = customProduct || (!!d.product && products.length > 0 && !products.includes(d.product));
  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => {
    setErr('');
    setD((p) => (p ? { ...p, [k]: v } : p));
  };

  const saveRecord = () => {
    if (!rec) return;
    const now = new Date().toISOString();
    const nextIso = rec.next ? new Date(rec.next).toISOString() : '';
    if (rec.index === null) {
      const n = d.history.filter((h) => !h.system).length + 1;
      const entry: FollowUp = { n, at: now, by: me || 'admin', callStatus: rec.callStatus, result: rec.result, product: d.product, notes: rec.notes.trim(), nextFollowUp: nextIso };
      setD({
        ...d,
        callStatus: rec.callStatus,
        result: rec.result,
        nextFollowUp: nextIso || d.nextFollowUp,
        status: d.status === 'New' ? 'Connected' : d.status,
        history: [...d.history, entry],
      });
    } else {
      setD({
        ...d,
        history: d.history.map((h, i) =>
          i === rec.index
            ? {
                ...h,
                callStatus: rec.callStatus,
                result: rec.result,
                notes: rec.notes.trim(),
                nextFollowUp: nextIso,
                edits: [...(h.edits ?? []), { at: now, by: me || 'admin', before: JSON.stringify({ callStatus: h.callStatus, result: h.result, notes: h.notes, nextFollowUp: h.nextFollowUp }) }],
              }
            : h
        ),
      });
    }
    setRec(null);
  };

  const deleteRecord = (index: number) => {
    const h = d.history[index];
    const rest = d.history.filter((_, i) => i !== index);
    setD({
      ...d,
      history: [
        ...rest,
        { n: 0, at: new Date().toISOString(), by: me || 'admin', callStatus: '', result: '', product: '', nextFollowUp: '', system: true, notes: `Record #${h.n} (${h.callStatus}${h.result ? `, ${h.result}` : ''}) was deleted by ${me || 'admin'}.` },
      ],
    });
    setConfirmDel(null);
  };

  const submit = () => {
    if (!d.business.trim()) return setErr('Business / customer name is required.');
    if (!/^[+\d][\d\s-]{6,}$/.test(d.phone.trim())) return setErr('Enter a valid phone number.');
    if (d.email.trim() && !/^\S+@\S+\.\S+$/.test(d.email.trim())) return setErr('Enter a valid email address.');
    if (rec) return setErr('Save or cancel the call record you are editing first.');
    onSave({ lead: { ...d, business: d.business.trim(), phone: d.phone.trim(), email: d.email.trim(), address: d.address.trim(), notes: d.notes.trim() }, converting: becomingConverted });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      icon={<UserRound size={18} />}
      title="Lead profile & follow-ups"
      subtitle={isNew ? 'Create a new lead.' : `${lead.id} - ${lead.business}`}
      maxWidth="max-w-3xl"
      footer={
        <>
          <button type="button" onClick={submit} className={btnPrimary}>Save</button>
          {isAdmin && !isNew && (
            <button type="button" onClick={() => onDelete(lead)} className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-4 text-xs font-semibold text-rose-600 hover:bg-rose-50">
              Delete lead
            </button>
          )}
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
        </>
      }
    >
      <div className="space-y-4 pt-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Lead ID</label>
            <input className={inputCls} value={d.id} disabled />
          </div>
          <div>
            <label className={labelCls}>Client ID {d.status !== 'Converted' && '(after conversion)'}</label>
            <input className={inputCls} value={d.customerId ?? (becomingConverted ? 'Generated on save' : '')} disabled placeholder="-" />
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input className={inputCls} value={fmtDate(d.dateAdded)} disabled />
          </div>
          <div>
            <label className={labelCls}>Business / Customer name</label>
            <input className={inputCls} value={d.business} placeholder="e.g. ABC Restaurant" onChange={(e) => set('business', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={d.phone} placeholder="+94 77 000 0000" onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Source</label>
            <select className={inputCls} value={d.source} onChange={(e) => set('source', e.target.value)}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Interested product</label>
            <select
              className={inputCls}
              value={productIsCustom ? CUSTOM : d.product}
              onChange={(e) => {
                if (e.target.value === CUSTOM) {
                  setCustomProduct(true);
                  set('product', '');
                } else {
                  setCustomProduct(false);
                  set('product', e.target.value);
                }
              }}
            >
              <option value="">Select product</option>
              {products.map((p) => <option key={p}>{p}</option>)}
              <option value={CUSTOM}>Custom product...</option>
            </select>
            {productIsCustom && <input className={`${inputCls} mt-2`} value={d.product} placeholder="Custom product name" onChange={(e) => set('product', e.target.value)} />}
          </div>
          <div>
            <label className={labelCls}>Lead status</label>
            <select className={inputCls} value={d.status} disabled={wasConverted} onChange={(e) => set('status', e.target.value as Lead['status'])}>
              {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Next follow-up date</label>
            <input type="datetime-local" className={inputCls} value={toLocalInput(d.nextFollowUp)} onChange={(e) => set('nextFollowUp', e.target.value ? new Date(e.target.value).toISOString() : '')} />
          </div>
          <div>
            <label className={labelCls}>Sales executive</label>
            <select className={inputCls} value={d.owner} disabled={ownerLocked} onChange={(e) => set('owner', e.target.value)}>
              <option value="">Unassigned</option>
              {users.filter((u) => u.active || u.username === d.owner).map((u) => (
                <option key={u.username} value={u.username}>{u.name} ({u.username})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" className={inputCls} value={d.email} placeholder="contact@example.com" onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input className={inputCls} value={d.address} placeholder="Street, city" onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Notes</label>
            <textarea rows={3} className={textareaCls} value={d.notes} placeholder="Requirements, preferences..." onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>

        {wasConverted && lead.order && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-[#334155]">
            <p className="mb-1 font-bold text-emerald-700">Sale: {lead.order.quantity} x {lead.order.product} = LKR {lead.order.total.toLocaleString('en-US')}</p>
            <p className="text-[#64748B]">Delivery: {lead.order.address}</p>
          </div>
        )}

        <div className="border-t border-[#E2E8F0] pt-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#64748B]">
            Call & follow-up history ({d.history.filter((h) => !h.system).length} recorded)
          </p>

          <div className="space-y-2">
            {[...d.history].map((h, i) => ({ h, i })).reverse().map(({ h, i }) => {
              if (rec?.index === i) {
                return <RecordForm key={i} rec={rec} setRec={setRec} onSave={saveRecord} title={`Edit record #${h.n}`} />;
              }
              return (
                <div key={i} className={`rounded-lg border p-3 text-xs ${h.system ? 'border-dashed border-[#CBD5E1] bg-slate-50 text-[#64748B]' : 'border-[#E2E8F0] bg-white'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-[#0F172A]">
                      {h.system ? 'System' : `${fmtDate(h.at)} • ${h.callStatus}${h.result ? ` • ${h.result}` : ''}`}
                    </span>
                    <span className="text-[#94A3B8]">{fmtDT(h.at)} · {h.by}</span>
                  </div>
                  {h.notes && <p className="mt-1 text-[#475569]">{h.notes}</p>}
                  {h.nextFollowUp && !h.system && <p className="mt-1 text-amber-600">Next follow-up: {fmtDT(h.nextFollowUp)}</p>}
                  {!h.system && (
                    <div className="mt-1.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRec({ index: i, callStatus: h.callStatus, result: h.result, notes: h.notes, next: toLocalInput(h.nextFollowUp) })}
                        className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
                      >
                        <Pencil size={11} /> Edit record #{h.n}
                      </button>
                      {confirmDel === i ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="font-semibold text-rose-600">Delete this record?</span>
                          <button type="button" onClick={() => deleteRecord(i)} className="font-bold text-rose-600 hover:underline">Yes, delete</button>
                          <button type="button" onClick={() => setConfirmDel(null)} className="font-semibold text-[#64748B] hover:underline">No</button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => setConfirmDel(i)} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline">
                          <Trash2 size={11} /> Delete record #{h.n}
                        </button>
                      )}
                      {h.edits && h.edits.length > 0 && <span className="text-[#94A3B8]">edited {h.edits.length}x (last by {h.edits[h.edits.length - 1].by})</span>}
                    </div>
                  )}
                </div>
              );
            })}
            {d.history.length === 0 && <p className="rounded-lg border border-dashed border-[#CBD5E1] p-4 text-center text-xs text-[#94A3B8]">No calls recorded yet.</p>}
          </div>

          {rec?.index === null ? (
            <div className="mt-2"><RecordForm rec={rec} setRec={setRec} onSave={saveRecord} title="New call / follow-up" /></div>
          ) : (
            !wasConverted && (
              <button
                type="button"
                onClick={() => setRec({ index: null, callStatus: 'Answered', result: 'Callback', notes: '', next: '' })}
                className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-[#2563EB] px-4 text-xs font-semibold text-[#2563EB] hover:bg-blue-50"
              >
                <Plus size={14} /> Record new call / follow-up
              </button>
            )
          )}
        </div>

        {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
      </div>
    </ModalShell>
  );
}

function RecordForm({
  rec,
  setRec,
  onSave,
  title,
}: {
  rec: { index: number | null; callStatus: string; result: string; notes: string; next: string };
  setRec: (r: { index: number | null; callStatus: string; result: string; notes: string; next: string } | null) => void;
  onSave: () => void;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-[#BFDBFE] bg-[#F8FBFF] p-3">
      <p className="mb-2 text-xs font-bold text-[#1D4ED8]">{title}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Call status</label>
          <select className={inputCls} value={rec.callStatus} onChange={(e) => setRec({ ...rec, callStatus: e.target.value })}>
            {CALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Result</label>
          <select className={inputCls} value={rec.result} onChange={(e) => setRec({ ...rec, result: e.target.value })}>
            <option value="">-</option>
            {RESULTS.filter((r) => r !== 'Converted').map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Next follow-up</label>
          <input type="datetime-local" className={inputCls} value={rec.next} onChange={(e) => setRec({ ...rec, next: e.target.value })} />
        </div>
        <div className="sm:col-span-3">
          <label className={labelCls}>Notes</label>
          <textarea rows={2} className={textareaCls} value={rec.notes} placeholder="What did the customer say?" onChange={(e) => setRec({ ...rec, notes: e.target.value })} />
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => setRec(null)} className={btnGhost}>Cancel</button>
        <button type="button" onClick={onSave} className={btnPrimary}>Add to history</button>
      </div>
    </div>
  );
}
