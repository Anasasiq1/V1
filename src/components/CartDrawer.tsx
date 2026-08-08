import React, { useState } from 'react';
import { CartItem } from '../types';
import { ShoppingBag, X, Plus, Minus, CheckCircle, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQty: (cartId: string, change: number) => void;
  onClearCart: () => void;
  customerPhone: string;
  onPlaceOrder: (notes: string) => Promise<boolean>;
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onUpdateQty,
  customerPhone,
  onPlaceOrder,
  isOpen,
  onClose,
}) => {
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsPlacing(true);
    const success = await onPlaceOrder(notes);
    setIsPlacing(false);
    if (success) {
      setOrderSuccess(true);
    }
  };

  const handleResetSuccess = () => {
    setOrderSuccess(false);
    setNotes('');
    onClose();
  };

  if (!isOpen) {
    if (totalItems === 0) return null;
    return (
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between z-40 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center font-extrabold text-xs">
            {totalItems}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-300">Total Price</div>
            <div className="text-sm font-black text-emerald-400">₹{totalAmount}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-900 text-base">Your Cart</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {orderSuccess ? (
          <div className="p-8 text-center my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              Your order details have been received and sent to WhatsApp (+{customerPhone || '919876543210'}). n8n webhook triggered automatically!
            </p>
            <button
              onClick={handleResetSuccess}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs"
            >
              Back to Store
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="p-4 divide-y divide-slate-100 max-h-[40vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-xs">Your cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.name} {item.variantName ? `(${item.variantName})` : ''}
                      </h4>
                      <div className="text-xs font-black text-emerald-600">₹{item.price * item.qty}</div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => onUpdateQty(item.cartId, -1)}
                        className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black px-1">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.cartId, 1)}
                        className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Special Instructions Note */}
            <div className="p-4 bg-slate-50 border-t border-b border-slate-100">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                📝 SPECIAL INSTRUCTIONS (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g: Less spicy, deliver before 8 PM, etc..."
                rows={2}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Footer Summary & Checkout */}
            <div className="p-4 bg-white sticky bottom-0 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3 text-slate-900">
                <span className="text-xs font-extrabold text-slate-500">Total Amount</span>
                <span className="text-xl font-black text-emerald-600">₹{totalAmount}</span>
              </div>

              <button
                disabled={cart.length === 0 || isPlacing}
                onClick={handleCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-sm transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>{isPlacing ? 'PLACING ORDER...' : 'Confirm Order & Send to WhatsApp'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
