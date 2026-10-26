import { Package, TriangleAlert, Eye } from 'lucide-react';
import type { Product } from '@/types/product';

interface ProductStatsProps {
  products: Product[];
}

export default function ProductStats({ products }: ProductStatsProps) {
  const stats = [
    {
      label: 'Total Products',
      value: products.length.toLocaleString(),
      icon: Package,
      iconBg: '#EFF6FF',
      iconColor: '#002B73',
    },
    {
      label: 'Low Stock',
      value: `${products.filter((product) => product.stockStatus === 'low-stock').length} Items`,
      icon: TriangleAlert,
      iconBg: '#FEF2F2',
      iconColor: '#BC0000',
    },
    {
      label: 'Active Listings',
      value: products.filter((product) => product.stockStatus !== 'out-of-stock').length.toLocaleString(),
      icon: Eye,
      iconBg: '#F8FAFC',
      iconColor: '#334155',
    },
  ];

  return (
    <section className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-5">
      {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
        <article key={label} className="flex items-center gap-5 bg-white flex-1"
          style={{ padding: '20px 24px', border: '1px solid #C3C6D4', borderRadius: 12, boxShadow: '0px 1px 2px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-center flex-shrink-0 rounded-lg" style={{ width: 48, height: 48, background: iconBg }}>
            <Icon size={22} color={iconColor} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: '#434652', letterSpacing: '0.7px' }}>{label}</p>
            <p className="text-[30px] font-bold leading-9 mt-1" style={{ color: '#002B73' }}>{value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
