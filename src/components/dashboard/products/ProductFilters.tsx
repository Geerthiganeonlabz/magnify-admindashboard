import { Check, ChevronDown, Filter, SlidersHorizontal } from 'lucide-react';
import type { StockStatus } from '@/types/product';

type FilterStatus = 'all' | StockStatus;
type SortBy = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all',           label: 'All Products'  },
  { value: 'in-stock',      label: 'In Stock'       },
  { value: 'low-stock',     label: 'Low Stock'      },
  { value: 'out-of-stock',  label: 'Out of Stock'   },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'default',    label: 'Default'        },
  { value: 'name-asc',   label: 'Name (A → Z)'   },
  { value: 'name-desc',  label: 'Name (Z → A)'   },
  { value: 'price-asc',  label: 'Price (Low → High)' },
  { value: 'price-desc', label: 'Price (High → Low)' },
  { value: 'stock-asc',  label: 'Stock (Low → High)' },
  { value: 'stock-desc', label: 'Stock (High → Low)' },
];

interface ProductFiltersProps {
  filterStatus: FilterStatus;
  sortBy: SortBy;
  filterOpen: boolean;
  sortOpen: boolean;
  onFilterToggle: () => void;
  onSortToggle: () => void;
  onFilterSelect: (filter: FilterStatus) => void;
  onSortSelect: (sort: SortBy) => void;
  startItem: number;
  endItem: number;
  totalItems: number;
}

export default function ProductFilters({
  filterStatus,
  sortBy,
  filterOpen,
  sortOpen,
  onFilterToggle,
  onSortToggle,
  onFilterSelect,
  onSortSelect,
  startItem,
  endItem,
  totalItems,
}: ProductFiltersProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-8" style={{ height: 61, borderBottom: '1px solid #F1F5F9', background: 'rgba(248,250,252,0.5)', position: 'relative', zIndex: 20 }}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={onFilterToggle}
            className="flex items-center gap-2 text-sm font-bold transition hover:opacity-80 px-3 py-1.5 rounded-lg"
            style={{ color: filterStatus !== 'all' ? '#002B73' : '#475569', background: filterStatus !== 'all' ? '#EFF6FF' : 'transparent', border: filterStatus !== 'all' ? '1px solid #BFDBFE' : '1px solid transparent' }}
          >
            <Filter size={14} />
            {filterStatus === 'all' ? 'Filter' : FILTER_OPTIONS.find(o => o.value === filterStatus)?.label}
            <ChevronDown size={13} style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {filterOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 overflow-hidden z-30" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0px 8px 16px rgba(0,0,0,0.1)' }}>
              {FILTER_OPTIONS.map(o => (
                <button key={o.value} onClick={() => onFilterSelect(o.value)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-left transition hover:bg-slate-50"
                  style={{ color: filterStatus === o.value ? '#002B73' : '#475569' }}
                >
                  {o.label}
                  {filterStatus === o.value && <Check size={14} color="#002B73" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={onSortToggle}
            className="flex items-center gap-2 text-sm font-bold transition hover:opacity-80 px-3 py-1.5 rounded-lg"
            style={{ color: sortBy !== 'default' ? '#002B73' : '#475569', background: sortBy !== 'default' ? '#EFF6FF' : 'transparent', border: sortBy !== 'default' ? '1px solid #BFDBFE' : '1px solid transparent' }}
          >
            <SlidersHorizontal size={14} />
            {sortBy === 'default' ? 'Sort' : SORT_OPTIONS.find(o => o.value === sortBy)?.label}
            <ChevronDown size={13} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {sortOpen && (
            <div className="absolute left-0 top-full mt-1 w-52 overflow-hidden z-30" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0px 8px 16px rgba(0,0,0,0.1)' }}>
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => onSortSelect(o.value)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-left transition hover:bg-slate-50"
                  style={{ color: sortBy === o.value ? '#002B73' : '#475569' }}
                >
                  {o.label}
                  {sortBy === o.value && <Check size={14} color="#002B73" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Showing {startItem}–{endItem} of {totalItems} products</p>
    </div>
  );
}

export type { FilterStatus, SortBy };
