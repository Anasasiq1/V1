import React from 'react';
import { Product, CartItem } from '../types';
import { Star, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  cartItem?: CartItem;
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, change: number) => void;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  cartItem,
  onAddToCart,
  onUpdateQty,
  onOpenDetail,
}) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const currentQty = cartItem ? cartItem.qty : 0;

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Product Image Wrap */}
        <div className="relative w-full h-32 sm:h-36 bg-slate-50 overflow-hidden">
          <img
            src={product.image || 'https://via.placeholder.com/300?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Discount Badge */}
          {discountPercent !== null && (
            <div className="absolute top-2 left-2 bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-xs">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3">
          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1 mb-1">
            {product.name}
          </h4>

          {/* Meta Info */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-2">
            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              {product.rating || 4.5}
            </span>
            <span className="truncate max-w-[100px]">{categoryName || product.categoryId}</span>
          </div>

          {/* Price Row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-black text-slate-900 text-sm sm:text-base">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-xs font-bold text-slate-400 line-through">₹{product.oldPrice}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button / Quantity Controls */}
      <div className="p-3 pt-0" onClick={(e) => e.stopPropagation()}>
        {hasVariants ? (
          <button
            onClick={() => onOpenDetail(product)}
            className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-extrabold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <span>Customize</span>
          </button>
        ) : currentQty > 0 ? (
          <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl overflow-hidden font-extrabold text-xs p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQty(cartItem?.cartId || product.id, -1)}
              className="w-8 h-7 flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-black">{currentQty}</span>
            <button
              type="button"
              onClick={() => onUpdateQty(cartItem?.cartId || product.id, 1)}
              className="w-8 h-7 flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
