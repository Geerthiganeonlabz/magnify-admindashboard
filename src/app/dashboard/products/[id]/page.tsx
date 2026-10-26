'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { Product } from '@/types/product';

import ViewProductModal from '@/components/dashboard/products/ViewProductModal';

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

const getErrorMessage = (responseText: string) => {
  try {
    const parsed = JSON.parse(responseText);

    return (
      parsed.message ||
      parsed.error ||
      responseText
    );
  } catch {
    return responseText || 'Something went wrong';
  }
};

const toStockStatus = (
  status?: string,
  stock = 0,
): Product['stockStatus'] => {
  if (status === 'Out of Stock' || stock <= 4) {
    return 'out-of-stock';
  }

  if (status === 'Low Stock' || stock <= 10) {
    return 'low-stock';
  }

  return 'in-stock';
};

const getApiProduct = (
  data: unknown,
): ApiProduct | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as {
    data?: ApiProduct;
    product?: ApiProduct;
  };

  return (
    payload.data ||
    payload.product ||
    (data as ApiProduct)
  );
};

const mapProduct = (
  product: ApiProduct,
): Product => {
  const stockCount = Number(product.stock ?? 0);

  const galleryImageUrls =
    product.galleryImages
      ?.map((image) => image.secure_url || '')
      .filter(Boolean) || [];

  // Count primary image + gallery images
  const imageCount =
    (product.primaryImage?.secure_url ? 1 : 0) +
    galleryImageUrls.length;

  return {
    id:
      product._id ||
      product.id ||
      product.productId ||
      '',

    sku: product.productId || '',

    name:
      product.productName ||
      'Untitled product',

    series:
      product.category ||
      'Wooden Frames',

    price: Number(product.price ?? 0),

    stockCount,

    stockStatus: toStockStatus(
      product.status,
      stockCount,
    ),

    // Required Product field
    imagecount: imageCount,

    gradient:
      'from-slate-100 to-slate-300',

    primaryImageUrl:
      product.primaryImage?.secure_url,

    galleryImageUrls,

    description:
      product.description,

    lastUpdatedDate:
      product.updatedAt,
  };
};

export default function ProductDetailPage() {
  const [isModalOpen, setIsModalOpen] =
    useState(true);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const params = useParams();
  const router = useRouter();

  const { addToast } =
    useToastStore();

  const productId =
    params.id as string;

  useEffect(() => {
    let isCancelled = false;

    const fetchProduct = async () => {
      setIsLoading(true);

      try {
        // BUG-013 fix:
        // Fetch the real product from the backend
        // by ID instead of using static mock data.
        const response = await fetch(
          apiV1Url(
            `/products/${productId}`,
          ),
          {
            cache: 'no-store',
          },
        );

        const responseText =
          await response.text();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              responseText,
            ),
          );
        }

        const apiProduct =
          getApiProduct(
            JSON.parse(responseText),
          );

        if (!apiProduct) {
          throw new Error(
            'Product data not found',
          );
        }

        if (!isCancelled) {
          setProduct(
            mapProduct(apiProduct),
          );
        }
      } catch (error) {
        if (!isCancelled) {
          addToast(
            error instanceof Error
              ? error.message
              : 'Failed to load product',
            'error',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (productId) {
      fetchProduct();
    }

    // BUG-013 fix:
    // Prevents an old request from updating
    // the page after navigating to another product.
    return () => {
      isCancelled = true;
    };
  }, [addToast, productId]);

  const handleCloseModal = () => {
    setIsModalOpen(false);

    router.push(
      '/dashboard/products',
    );
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
      <ViewProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={product}
      />
    </div>
  );
}
