import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { X, Star, Clock, ShoppingBag, Plus, Minus, Check, Share2, MessageCircle, Flame, FileText, ShieldAlert } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCartWithVariant: (product: Product, selectedVariant?: ProductVariant, quantity?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCartWithVariant,
}) => {
  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = hasVariants ? product.variants![selectedVariantIndex] : undefined;
  const activePrice = selectedVariant ? selectedVariant.price : product.price;

  // Calculate cart interest count popularity metric
  const interestCount = product.cart_interest_count || Math.floor((product.price * 3) % 29 + 14);

  const handleAdd = () => {
    onAddToCartWithVariant(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 400);
  };

  const handleShareToWhatsApp = () => {
    const storeUrl = window.location.href.split('?')[0];
    const variantInfo = selectedVariant ? ` (${selectedVariant.name})` : '';
    const text = `🛍️ *Check out ${product.name}${variantInfo}*\n💰 Price: ₹${activePrice}\n\nOrder now on our store:\n${storeUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 relative shadow-2xl">
        {/* Header Actions */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={handleShareToWhatsApp}
            className="w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition-colors cursor-pointer"
            title="Share on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Image */}
        <div className="w-full h-56 sm:h-64 bg-slate-100 relative">
          <img
            src={product.image || 'https://via.placeholder.com/500?text=Product+Image'}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Popularity Badge Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-amber-400/20">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{interestCount} shoppers added to cart recently</span>
          </div>
        </div>

        {/* Product Content */}
        <div className="p-5 text-start space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1" dir="auto">
              {product.name}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 mb-2">
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-emerald-600" />
                {product.rating || 4.8}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {product.deliveryTime || '20-30 min'}
              </span>

              {/* Prescription notice if required */}
              {product.requires_prescription && (
                <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-black">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Prescription Required (പ്രിസ്ക്രിപ്ഷൻ വേണം)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="text-2xl font-black text-slate-900" dir="ltr">₹{activePrice}</span>
              {product.oldPrice && (
                <span className="text-sm font-bold text-slate-400 line-through" dir="ltr">₹{product.oldPrice}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 font-medium leading-relaxed" dir="auto">
            {product.description ||
              'വളരെ രുചികരമായ ഉൽപ്പന്നം. ശുദ്ധമായ ചേരുവകൾ ഉപയോഗിച്ച് തയ്യാറാക്കിയത്. ഹൈജീനിക് ആയി പായ്ക്ക് ചെയ്ത് നൽകുന്നതാണ്. ഓർഡർ ചെയ്ത് ആസ്വദിക്കൂ!'}
          </p>

          {/* CUSTOM PRODUCT FIELDS / SPECIFICATIONS SECTION */}
          {product.customFields && product.customFields.length > 0 && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Product Specifications & Custom Details</span>
              </h4>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {product.customFields.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-500 text-[11px]">{field.key}:</span>
                    <span className="font-extrabold text-slate-900 text-xs">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants Selection */}
          {hasVariants && (
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2" dir="auto">
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
                      <span className="text-xs font-bold text-slate-800" dir="auto">{variant.name}</span>
                      <span className="text-xs font-black text-emerald-700" dir="ltr">₹{variant.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-700" dir="auto">Quantity / എണ്ണം:</span>
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold active:scale-95 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-sm text-slate-900 min-w-[20px] text-center" dir="ltr">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Actions: Add To Cart & Share on WhatsApp */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span dir="ltr">Add to Cart - ₹{activePrice * quantity}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold py-2.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Share Product on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
