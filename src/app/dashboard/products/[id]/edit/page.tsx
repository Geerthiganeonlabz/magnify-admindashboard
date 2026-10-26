'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { Product, ProductFormData } from '@/types/product';

import AddProductModal from '@/components/dashboard/products/AddProductModal';

import { apiV1Url } from '@/lib/backendUrl';
import { useToastStore } from '@/store/toastStore';

type ApiImage = {
  secure_url?: string;
};

type ApiProduct = {
  _id?: string;
  id?: string;
  productId?: string;
  productName?: string;
  category?: string;
  price?: number;
  stock?: number;
  status?: string;
  primaryImage?: ApiImage | null;
  galleryImages?: ApiImage[];
  description?: string;
  updatedAt?: string;
};

const getProductStatus = (stock: number) => {
  if (stock > 10) return 'In Stock';
  if (stock > 0) return 'Low Stock';
  return 'Out of Stock';
};

const getErrorMessage = (responseText: string) => {
  try {
    const parsed = JSON.parse(responseText);
    return parsed.message || parsed.error || responseText;
  } catch {
    return responseText || 'Something went wrong';
  }
};

const toStockStatus = (
  status?: string,
  stock = 0,
): Product['stockStatus'] => {
  if (status === 'Out of Stock' || stock <= 0) {
    return 'out-of-stock';
  }

  if (status === 'Low Stock' || stock <= 10) {
    return 'low-stock';
  }

  return 'in-stock';
};

const getApiProduct = (data: unknown): ApiProduct | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as {
    data?: ApiProduct;
    product?: ApiProduct;
  };

  return payload.data || payload.product || (data as ApiProduct);
};

const mapProduct = (product: ApiProduct): Product => {
  const stockCount = Number(product.stock ?? 0);

  const galleryImageUrls =
    product.galleryImages
      ?.map((image) => image.secure_url || '')
      .filter(Boolean) || [];

  const imageCount =
    (product.primaryImage?.secure_url ? 1 : 0) +
    galleryImageUrls.length;

  return {
    id: product._id || product.id || product.productId || '',
    sku: product.productId || '',
    name: product.productName || 'Untitled product',
    series: product.category || 'Wooden Frames',
    price: Number(product.price ?? 0),
    stockCount,
    stockStatus: toStockStatus(product.status, stockCount),

    // Total number of product images
    imagecount: imageCount,

    gradient: 'from-slate-100 to-slate-300',

    primaryImageUrl: product.primaryImage?.secure_url,

    galleryImageUrls,

    description: product.description,

    lastUpdatedDate: product.updatedAt,
  };
};

export default function EditProductPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const params = useParams();

  const { addToast } = useToastStore();

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          apiV1Url(`/products/${productId}`),
          {
            cache: 'no-store',
          },
        );

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(getErrorMessage(responseText));
        }

        const apiProduct = getApiProduct(
          JSON.parse(responseText),
        );

        if (!apiProduct) {
          throw new Error('Product data not found');
        }

        setProduct(mapProduct(apiProduct));
      } catch (error) {
        addToast(
          error instanceof Error
            ? error.message
            : 'Failed to load product',
          'error',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [addToast, productId]);

  const handleSubmit = async (
    formData: ProductFormData,
  ) => {
    try {
      const data = new FormData();

      data.append('productName', formData.name);
      data.append('productId', formData.productId);
      data.append('stock', String(formData.stock));
      data.append('price', String(formData.price));
      data.append('description', formData.description);
      data.append('imagecount', String(formData.imagecount));
      data.append(
        'status',
        getProductStatus(formData.stock),
      );

      if (formData.primaryImage) {
        data.append(
          'primaryImage',
          formData.primaryImage,
        );
      }

      const response = await fetch(
        apiV1Url(`/products/${productId}`),
        {
          method: 'PUT',
          body: data,
        },
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(getErrorMessage(result));
      }

      setIsModalOpen(false);

      router.push('/dashboard/products');

      return true;
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : 'Failed to update product',
        'error',
      );

      return false;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/dashboard/products');
  };

  if (isLoading) {
    return (
      <div className="p-8">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingProduct={product}
      />
    </div>
  );
}
