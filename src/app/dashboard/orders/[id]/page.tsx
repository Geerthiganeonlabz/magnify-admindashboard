'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderStatus from '@/components/dashboard/orders/OrderStatus';
import { fetchOrder } from '@/lib/orders';
import type { Order } from '@/types/order';

export default function OrderStatusPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        setOrder(await fetchOrder(params.id));
      } catch (err) {
        setOrder(null);
        setError(err instanceof Error ? err.message : 'Order not found');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-sm font-medium text-slate-600">Loading order...</div>;
  }

 if (error || !order) {
  return (
    <div className="p-8 text-sm font-medium text-red-700">
      {error || "Order not found"}
    </div>
  );
}

return <OrderStatus order={order} isOpen onClose={() => router.push('/dashboard/orders')} />;
}
