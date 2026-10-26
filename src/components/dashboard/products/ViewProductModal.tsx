'use client';

import { useEffect, useState } from 'react';
import { X, History, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types/product';
import { apiV1Url } from '@/lib/backendUrl';

interface ViewProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onUpdate?: (
    product: Product,
    newStock: string,
  ) => Promise<boolean>;
}

type StockLogEntry = {
  previousStock: number;
  newStock: number;
  changedBy: string;
  changedAt: string;
};

// If the backend returns pagination metadata we trust it (server-side
// pagination). If it just returns a flat array (legacy API), we fall
// back to slicing that array on the client so the UI still only ever
// shows PAGE_SIZE rows at a time.
type StockLogResponse = {
  data: StockLogEntry[];
  total?: number;
  page?: number;
  totalPages?: number;
  pagination?: {
    total?: number;
    page?: number;
    totalPages?: number;
  };
};

const PAGE_SIZE = 5;

export default function ViewProductModal({
  isOpen,
  product,
  onClose,
  onEdit,
  onUpdate,
}: ViewProductModalProps) {
  const [showLog, setShowLog] = useState(false);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] =
    useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isServerPaginated, setIsServerPaginated] = useState(true);
  // Holds either the current page's rows (server-paginated) or the
  // full record set (client-side fallback for legacy API responses).
  const [logRecords, setLogRecords] = useState<StockLogEntry[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setShowLog(false);
    setLogRecords([]);
    setLogError(null);
    setActiveGalleryImage(null);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalRecords(0);
    setIsServerPaginated(true);
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const currentStock = Number(product.stockCount ?? 0);
  const galleryImages = product.galleryImageUrls ?? [];

  const getStatus = (stock: number) => {
    if (stock > 10) return 'In Stock';
    if (stock > 4) return 'Low Stock';
    return 'Out of Stock';
  };

  const currentStatus = getStatus(currentStock);
  const unitProfit = Number(product.price ?? 0) - Number(product.manufactureCost ?? 0);

  const fetchStockLog = async (page: number) => {
    if (!product) return;

    setIsLoadingLog(true);
    setLogError(null);

    try {
      const res = await fetch(
        apiV1Url(
          `/products/${product.id}/stock-log?page=${page}&limit=${PAGE_SIZE}`,
        ),
      );

      if (!res.ok) {
        throw new Error('Failed to fetch stock log');
      }

      const json: StockLogResponse = await res.json();
      const records = json.data ?? [];

      const serverTotal = json.pagination?.total ?? json.total;
      const serverTotalPages =
        json.pagination?.totalPages ?? json.totalPages;

      if (typeof serverTotal === 'number') {
        // Backend supports pagination - trust its metadata and the
        // (already page-sized) records it returned.
        setIsServerPaginated(true);
        setLogRecords(records);
        setTotalRecords(serverTotal);
        setTotalPages(
          serverTotalPages ??
            Math.max(1, Math.ceil(serverTotal / PAGE_SIZE)),
        );
      } else {
        // Legacy API - it returned everything at once. Paginate on
        // the client so we still only render PAGE_SIZE rows.
        setIsServerPaginated(false);
        setLogRecords(records);
        setTotalRecords(records.length);
        setTotalPages(Math.max(1, Math.ceil(records.length / PAGE_SIZE)));
      }
    } catch (err) {
      setLogError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch stock log',
      );
    } finally {
      setIsLoadingLog(false);
    }
  };

  const handleViewLog = async () => {
    const next = !showLog;
    setShowLog(next);

    if (!next) return;

    setCurrentPage(1);
    await fetchStockLog(1);
  };

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);

    if (isServerPaginated) {
      await fetchStockLog(page);
    }
    // For client-side pagination, the full list is already loaded in
    // logRecords - `displayedLog` below handles the slicing.
  };

  const displayedLog = isServerPaginated
    ? logRecords
    : logRecords.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="relative z-[1000] flex max-h-[94vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-bold text-[#002B73] sm:text-xl">
              View Product
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Product details and stock information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <div className="flex h-[200px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[#F8F8FB]">
                  {(activeGalleryImage || product.primaryImageUrl) ? (
                    <img src={activeGalleryImage || product.primaryImageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-[70%] w-[70%] border-[8px] border-[#A67C52] bg-white" />
                  )}
                </div>
                {galleryImages.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {[product.primaryImageUrl, ...galleryImages].filter(Boolean).map((url, idx) => (
                      <button
                        key={`${url}-${idx}`}
                        type="button"
                        onClick={() => setActiveGalleryImage(url as string)}
                        className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 hover:opacity-80"
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img src={url as string} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <span className="inline-flex rounded-md bg-[#EFF6FF] px-2 py-1 text-xs font-bold text-[#2563EB]">{product.sku || product.id}</span>
                <h3 className="mt-2 break-words text-base font-bold text-[#0F172A]">{product.name}</h3>
                {product.series && <p className="mt-0.5 text-xs font-semibold text-slate-500">{product.series}</p>}
                <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Description</p>
                <p className="text-xs leading-5 text-slate-600">{product.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <ProductInfo label="Manufacture Cost" value={`LKR ${Number(product.manufactureCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
              <ProductInfo label="Selling Price" value={`LKR ${Number(product.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
              <ProductInfo
                label="Unit Profit"
                value={`${unitProfit >= 0 ? '+' : '-'}LKR ${Math.abs(unitProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                tone={unitProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}
              />
              <ProductInfo label="Stock" value={`${currentStock} units`} />
              <ProductInfo label="Stock Status" value={currentStatus} tone={currentStatus === 'In Stock' ? 'text-emerald-600' : currentStatus === 'Low Stock' ? 'text-amber-500' : 'text-rose-600'} />
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-[#F5F6FB] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#002B73] sm:text-base">
                  Last Updated
                </h4>

                <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                  Updated by{' '}
                  <span className="font-bold text-[#1A1C1F]">
                    {product.lastUpdatedBy || 'Admin'}
                  </span>{' '}
                  on{' '}
                  {product.lastUpdatedDate
                    ? new Date(
                        product.lastUpdatedDate,
                      ).toLocaleDateString()
                    : 'Today'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleViewLog}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-bold text-[#002B73] shadow-sm transition hover:bg-slate-50 sm:w-auto sm:text-sm"
              >
                <span>
                  {showLog ? 'Hide Log' : 'View Log'}
                </span>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F5FF]">
                  <History size={15} />
                </span>
              </button>
            </div>

            {showLog && (
              <div>
                <h3 className="mb-3 text-base font-bold text-[#002B73] sm:text-lg">
                  Stock Modification History
                </h3>

                {isLoadingLog ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                    <p className="text-sm text-slate-500">
                      Loading...
                    </p>
                  </div>
                ) : logError ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                    <p className="text-sm text-red-600">
                      {logError}
                    </p>
                  </div>
                ) : totalRecords === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                    <p className="text-sm text-slate-500">
                      No stock changes recorded yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="divide-y divide-slate-100 sm:hidden">
                        {displayedLog.map((entry, idx) => {
                          const change =
                            entry.newStock -
                            entry.previousStock;

                          return (
                            <div
                              key={idx}
                              className="space-y-3 p-4"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500">
                                  {new Date(
                                    entry.changedAt,
                                  ).toLocaleDateString()}
                                </span>

                                <span
                                  className={[
                                    'text-sm font-bold',
                                    change >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600',
                                  ].join(' ')}
                                >
                                  {change >= 0
                                    ? `+${change}`
                                    : change}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <HistoryValue
                                  label="Previous"
                                  value={String(
                                    entry.previousStock,
                                  )}
                                />

                                <HistoryValue
                                  label="New Stock"
                                  value={String(
                                    entry.newStock,
                                  )}
                                />

                                <HistoryValue
                                  label="Changed By"
                                  value={entry.changedBy}
                                />

                                <HistoryValue
                                  label="Time"
                                  value={new Date(
                                    entry.changedAt,
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="hidden overflow-x-auto sm:block">
                        <table className="w-full min-w-[600px] text-sm">
                          <thead className="bg-[#F5F6FB]">
                            <tr>
                              {[
                                'Date',
                                'Previous',
                                'Change',
                                'New Stock',
                                'Changed By',
                              ].map((heading) => (
                                <th
                                  key={heading}
                                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold text-[#002B73]"
                                >
                                  {heading}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {displayedLog.map((entry, idx) => {
                              const change =
                                entry.newStock -
                                entry.previousStock;

                              return (
                                <tr
                                  key={idx}
                                  className="border-t border-slate-100"
                                >
                                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                                    {new Date(
                                      entry.changedAt,
                                    ).toLocaleString()}
                                  </td>

                                  <td className="px-4 py-3 font-medium text-slate-800">
                                    {entry.previousStock}
                                  </td>

                                  <td
                                    className={[
                                      'px-4 py-3 font-bold',
                                      change >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600',
                                    ].join(' ')}
                                  >
                                    {change >= 0
                                      ? `+${change}`
                                      : change}
                                  </td>

                                  <td className="px-4 py-3 font-medium text-slate-800">
                                    {entry.newStock}
                                  </td>

                                  <td className="px-4 py-3 text-slate-500">
                                    {entry.changedBy}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-3 flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-xs font-medium text-slate-500">
                          Showing{' '}
                          <span className="font-bold text-slate-700">
                            {(currentPage - 1) * PAGE_SIZE + 1}
                            {'-'}
                            {Math.min(
                              currentPage * PAGE_SIZE,
                              totalRecords,
                            )}
                          </span>{' '}
                          of{' '}
                          <span className="font-bold text-slate-700">
                            {totalRecords}
                          </span>
                        </p>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              goToPage(currentPage - 1)
                            }
                            disabled={currentPage === 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous page"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => goToPage(pageNum)}
                              className={[
                                'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition',
                                pageNum === currentPage
                                  ? 'bg-[#002B73] text-white'
                                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                              ].join(' ')}
                              aria-label={`Go to page ${pageNum}`}
                              aria-current={
                                pageNum === currentPage
                                  ? 'page'
                                  : undefined
                              }
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              goToPage(currentPage + 1)
                            }
                            disabled={currentPage === totalPages}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next page"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-[#FAFAFA] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:min-w-[110px] sm:flex-none"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#2563EB] px-6 text-xs font-bold text-white hover:bg-[#1D4ED8] sm:min-w-[130px] sm:flex-none"
            >
              Edit Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductInfoProps {
  label: string;
  value: string;
  tone?: string;
}

function ProductInfo({ label, value, tone = 'text-[#0F172A]' }: ProductInfoProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-xs font-bold ${tone}`}>{value}</p>
    </div>
  );
}

interface HistoryValueProps {
  label: string;
  value: string;
}

function HistoryValue({
  label,
  value,
}: HistoryValueProps) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}
