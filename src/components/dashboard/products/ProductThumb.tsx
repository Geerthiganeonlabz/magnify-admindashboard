import PopularBadge from './PopularBadge';

interface ProductThumbProps {
  gradient: string;
  imageUrl?: string;
  isPopular?: boolean;
}

export default function ProductThumb({ gradient, imageUrl, isPopular }: ProductThumbProps) {
  return (
    <div className="relative flex-shrink-0 overflow-hidden rounded-lg w-16 h-16 sm:w-20 sm:h-20" style={{ border: '1px solid #E2E8F0', background: '#F1F5F9' }}>
      {imageUrl ? (
        <img src={imageUrl} alt="Product thumbnail" className="h-full w-full object-cover" />
      ) : (
        <>
          <div className={`absolute inset-1 rounded-md bg-gradient-to-br ${gradient}`} />
          <div className="absolute inset-[14px] rounded-sm border border-white/30 bg-white/10" />
        </>
      )}
      {isPopular && <PopularBadge />}
    </div>
  );
}
