'use client';

import { Trash2 } from 'lucide-react';
import type { Product } from '@/types/product';

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onCancel: () => void;
  onConfirm: () => void;
  error?: string | null;
  isDeleting?: boolean;
}

export default function DeleteProductModal({
  isOpen,
  product,
  onCancel,
  onConfirm,
  error,
  isDeleting = false,
}: DeleteProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div
        className="relative flex flex-col items-center overflow-hidden"
        style={{
          width: 520,
          background: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0px 20px 50px rgba(0, 0, 0, 0.2)',
          borderRadius: 16,
        }}
      >
        <div className="flex flex-col items-center w-full pt-10 pb-6 px-8">
          <div
            className="flex items-center justify-center rounded-full mb-6"
            style={{ width: 80, height: 80, background: 'rgba(255, 218, 214, 0.5)' }}
          >
            <Trash2 size={25} color="#BA1A1A" />
          </div>
          <h2
            className="font-extrabold text-3xl text-center"
            style={{
              fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
              color: '#1A1C1F',
              letterSpacing: '-0.75px',
            }}
          >
            Confirm Deletion
          </h2>
        </div>

        <div className="flex flex-col items-center w-full px-12 pb-8 gap-6">
          <p
            className="text-lg text-center leading-[29px]"
            style={{ color: '#434652', maxWidth: 389 }}
          >
            Are you sure you want to delete this product? This action is permanent and will remove all
            associated gallery metadata from the catalog.
          </p>

          <div
            className="flex items-center gap-5 w-full"
            style={{
              background: '#F3F3F8',
              border: '1px solid rgba(195, 198, 212, 0.2)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              className="flex-shrink-0 overflow-hidden rounded-lg"
              style={{ width: 64, height: 64, border: '1px solid #E2E8F0', background: '#F1F5F9' }}
            >
            <img
              src={product.image || product.primaryImageUrl || product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />   
           </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold leading-6" style={{ color: '#1A1C1F' }}>
                {product.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium" style={{ color: 'rgba(67,70,82,0.8)' }}>ID:</span>
                <span className="font-mono text-xs" style={{ color: 'rgba(67,70,82,0.8)' }}>
                  {product.sku}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <p
              className="w-full rounded-lg px-4 py-3 text-center text-sm font-semibold"
              style={{ background: '#FFF1F1', color: '#BA1A1A', border: '1px solid rgba(186, 26, 26, 0.18)' }}
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 w-full px-12 pb-10">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex items-center justify-center font-bold text-base transition hover:opacity-80"
            style={{ flex: 1, height: 56, background: '#E8E8ED', borderRadius: 12, color: '#434652' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center justify-center font-extrabold text-base text-white transition hover:opacity-90"
            style={{
              flex: 1.15,
              height: 56,
              background: '#BC0000',
              borderRadius: 12,
              boxShadow: '0px 10px 15px -3px rgba(188, 0, 0, 0.3), 0px 4px 6px -4px rgba(188, 0, 0, 0.3)',
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>

        <div
          className="w-full flex-shrink-0"
          style={{ height: 6, background: 'rgba(186, 26, 26, 0.1)' }}
        />
      </div>
    </div>
  );
}
