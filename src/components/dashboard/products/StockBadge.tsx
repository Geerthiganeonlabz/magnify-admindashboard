import type { StockStatus } from '@/types/product';

export default function StockBadge({ status, count }: { status: StockStatus; count: number }) {
  if (status === 'in-stock') return (
    <div className="flex items-center gap-2">
      <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 10, background: '#10B981' }} />
      <span className="inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold" style={{ background: '#ECFDF5', color: '#047857' }}>In Stock ({count})</span>
    </div>
  );
  if (status === 'low-stock') return (
    <div className="flex items-center gap-2">
      <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 10, background: '#BC0000' }} />
      <span className="inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold" style={{ background: '#FEF2F2', color: '#BC0000' }}>Low Stock ({count})</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 10, background: '#CBD5E1' }} />
      <span className="inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold" style={{ background: '#F1F5F9', color: '#64748B' }}>Out of Stock</span>
    </div>
  );
}
