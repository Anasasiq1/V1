import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { X, Star, Clock, ShoppingBag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCartWithVariant: (product: Product, selectedVariant?: ProductVariant) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCartWithVariant,
}) => {
  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  const activePrice =
    hasVariants && product.variants![selectedVariantIndex]
      ? product.variants![selectedVariantIndex].price
      : product.price;

  const handleAdd = () => {
    const selectedVariant = hasVariants ? product.variants![selectedVariantIndex] : undefined;
    onAddToCartWithVariant(product, selectedVariant);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 relative shadow-2xl">
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="w-full h-64 bg-slate-100 relative">
          <img
            src={product.image || 'https://via.placeholder.com/500?text=Product+Image'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Content */}
        <div className="p-5">
          <h2 className="text-xl font-black text-slate-900 mb-1">{product.name}</h2>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-3">
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-emerald-600" />
              {product.rating || 4.8}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {product.deliveryTime || '20-30 min'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <span className="text-2xl font-black text-slate-900">₹{activePrice}</span>
            {product.oldPrice && (
              <span className="text-sm font-bold text-slate-400 line-through">₹{product.oldPrice}</span>
            )}
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
            {product.description ||
              'വളരെ രുചികരമായ ഉൽപ്പന്നം. ശുദ്ധമായ ചേരുവകൾ ഉപയോഗിച്ച് തയ്യാറാക്കിയത്. ഹൈജീനിക് ആയി പായ്ക്ക് ചെയ്ത് നൽകുന്നതാണ്. ഓർഡർ ചെയ്ത് ആസ്വദിക്കൂ!'}
          </p>

          {/* Variants Selection */}
          {hasVariants && (
            <div className="mb-6">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                Select Option / വലിപ്പം തിരഞ്ഞെടുക്കുക:
              </h4>
              <div className="space-y-2">
                {product.variants!.map((variant, idx) => {
                  const isSelected = selectedVariantIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">{variant.name}</span>
                      <span className="text-xs font-black text-emerald-700">₹{variant.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add To Cart Button */}
          <button
            onClick={handleAdd}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart - ₹{activePrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
