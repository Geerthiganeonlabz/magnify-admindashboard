import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function PageBtn({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-[10px] text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        width: 42,
        height: 42,
        background: active ? '#002B73' : 'transparent',
        color: active ? '#fff' : '#475569',
      }}
    >
      {children}
    </button>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  totalItems: number;
  label: string;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
 startItem,
  endItem,
  totalItems,
  label = 'items',
  onPageChange,
}: PaginationProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-8"
      style={{
        height: 70,
        borderTop: '1px solid #E2E8F0',
        background: '#FFFFFF',
      }}
    >
      <p
        className="text-[15px] font-medium"
        style={{ color: '#434652' }}
      >
Showing {startItem}–{endItem} of {totalItems} {label}    
  </p>

      <div className="flex items-center gap-2">
        
        <PageBtn
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(Math.max(1, currentPage - 1))
          }
        >
          <ChevronLeft size={16} />
        </PageBtn>

        {Array.from(
          { length: totalPages },
          (_, i) => i + 1
        ).map((n) => (
          <PageBtn
            key={n}
            active={n === currentPage}
            onClick={() => onPageChange(n)}
          >
            {n}
          </PageBtn>
        ))}

        <PageBtn
          disabled={currentPage === totalPages}
          onClick={() =>
            onPageChange(
              Math.min(totalPages, currentPage + 1)
            )
          }
        >
          <ChevronRight size={16} />
        </PageBtn>
      </div>
    </div>
  );
}