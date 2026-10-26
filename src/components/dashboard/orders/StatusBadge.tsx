import type { OrderStatus } from '@/types/order';

const STATUS_MAP: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  shipped:    { label: 'SHIPPED',    bg: '#DCFCE7', color: '#166534' },
  pending:    { label: 'PENDING',    bg: '#FEF9C3', color: '#854D0E' },
  processing: { label: 'PROCESSING', bg: '#DBEAFE', color: '#1E40AF' },
  delivered:  { label: 'DELIVERED',  bg: '#DCFCE7', color: '#166534' },
  canceled:   { label: 'CANCELED',   bg: '#F1F5F9', color: '#1E293B' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, bg, color } = STATUS_MAP[status];
  return (
    <span
      className="inline-flex items-center font-semibold text-xs uppercase "
      style={{ background: bg, color, borderRadius: 9999, padding: '3.5px 12px', letterSpacing: '0.04em' }}
    >
      {label}
    </span>
  );
}
