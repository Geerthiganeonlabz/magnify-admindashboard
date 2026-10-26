'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductFormData } from '@/types/product';
import AddProductModal from '@/components/dashboard/products/AddProductModal';
import { apiV1Url } from '@/lib/backendUrl';
import { useToastStore } from '@/store/toastStore';

const getProductStatus = (stock: number) => {
  if (stock > 10) return 'In Stock';
  if (stock > 0) return 'Low Stock';
  return 'Out of Stock';
};
const ID_PREFIX = 'MG-';
const ID_PAD_LENGTH = 3;

const extractApiProducts = (data: unknown): Array<{ productId?: string }> => {
  if (!data || typeof data !== 'object') return [];
  const payload = data as { data?: unknown; products?: unknown };
  const list = payload.data ?? payload.products ?? data;
  return Array.isArray(list) ? (list as Array<{ productId?: string }>) : [];
};

const computeNextProductId = (products: Array<{ productId?: string }>): string => {
  const pattern = new RegExp(`^${ID_PREFIX}(\\d+)$`, 'i');

  const numbers = products
    .map((p) => p.productId?.match(pattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => parseInt(match[1], 10));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${ID_PREFIX}${String(nextNumber).padStart(ID_PAD_LENGTH, '0')}`;
};

export default function CreateProductPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [autoProductId, setAutoProductId] = useState('');
  const [isIdReady, setIsIdReady] = useState(false);
  const router = useRouter();
  const { addToast } = useToastStore();

  useEffect(() => {
    const loadNextId = async () => {
      try {
        const response = await fetch(apiV1Url('/products'), { cache: 'no-store' });
        const data = await response.json();
        const products = extractApiProducts(data);
        setAutoProductId(computeNextProductId(products));
      } catch (error) {
        console.error('Failed to compute next Product ID:', error);
        // Fall back to MG-001 rather than blocking product creation entirely.
        setAutoProductId(`${ID_PREFIX}${'1'.padStart(ID_PAD_LENGTH, '0')}`);
      } finally {
        setIsIdReady(true);
      }
    };

    loadNextId();
  }, []);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      const data = new FormData();

      data.append("productName", formData.name);
      data.append("productId", formData.productId);
      data.append("stock", String(formData.stock));
      data.append("description", formData.description);
      data.append("status", getProductStatus(formData.stock));
      data.append("price", String(formData.price));
      data.append("imagecount", String(formData.imagecount));

      if (formData.primaryImage) {
        data.append("primaryImage", formData.primaryImage);
      }
      formData.galleryImages.forEach((file) => {
        data.append("galleryImages", file);
      });

      const response = await fetch(
        apiV1Url('/products'),
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const errorMessage = body?.message || 'Failed to create product. Please try again.';
        addToast(errorMessage, 'error');
        return false;
      }

      setIsModalOpen(false);
      router.push('/dashboard/products');

    } catch (error) {
      console.error('Error creating product:', error);
      addToast('Failed to create product. Please try again.', 'error');
      return false;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/dashboard/products');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {isIdReady && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          autoProductId={autoProductId}
        />
      )}
    </div>
  );
}
