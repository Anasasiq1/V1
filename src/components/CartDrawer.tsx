import React, { useState } from 'react';
import { CartItem, StoreSettings, DeliverySlot } from '../types';
import { ShoppingBag, X, Plus, Minus, CheckCircle, ArrowRight, Clock, Zap, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQty: (cartId: string, change: number) => void;
  onClearCart: () => void;
  customerPhone: string;
  settings?: StoreSettings;
  onPlaceOrder: (
    notes: string,
    deliveryType: 'scheduled' | 'urgent',
    selectedSlotTime?: string,
    deliveryFee?: number
  ) => Promise<boolean>;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onUpdateQty,
  customerPhone,
  settings,
  onPlaceOrder,
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'scheduled' | 'urgent'>('scheduled');

  const activeSlots = settings?.delivery_slots?.filter((s) => s.isActive !== false) || [
    { id: 'slot-1', time: '11:00 AM', label: 'Morning Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-2', time: '12:00 PM', label: 'Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)', fee: 0, isFree: true, isActive: true },
    { id: 'slot-3', time: '01:00 PM', label: 'Post Lunch Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-4', time: '03:00 PM', label: 'Afternoon Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-5', time: '05:00 PM', label: 'Evening Batch', fee: 0, isFree: true, isActive: true },
  ];

  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    activeSlots.find((s) => s.time.includes('12:00'))?.id || activeSlots[0]?.id || 'slot-2'
  );

  const expressFee = settings?.express_delivery_fee ?? 40;

  const selectedSlot = activeSlots.find((s) => s.id === selectedSlotId) || activeSlots[0];
  const currentDeliveryFee = deliveryType === 'urgent' ? expressFee : (selectedSlot?.fee || 0);

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = subtotal + currentDeliveryFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsPlacing(true);
    const slotTimeStr = deliveryType === 'scheduled'
      ? `${selectedSlot?.time || ''} (${selectedSlot?.label || 'Batch Delivery'})`
      : 'Urgent Express Delivery';

    const success = await onPlaceOrder(notes, deliveryType, slotTimeStr, currentDeliveryFee);
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

  // Floating sticky bottom bar when cart drawer is closed but cart is not empty
  if (!isOpen) {
    if (totalItems === 0) return null;
    return (
      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl flex items-center justify-between z-40 shadow-xl border border-slate-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs">
            {totalItems}
          </div>
          <div className="text-start">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</div>
            <div className="text-sm font-black text-emerald-400" dir="ltr">₹{subtotal}</div>
          </div>
        </div>

        <button
          onClick={onOpenCart || onClose}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-900 text-base">Your Cart & Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
            <p className="text-xs text-slate-500 font-semibold mb-6" dir="auto">
              Your order details with delivery time preferences have been processed and sent to WhatsApp (+{customerPhone || '919876543210'}). n8n webhook triggered automatically!
            </p>
            <button
              onClick={handleResetSuccess}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs cursor-pointer shadow-md"
            >
              Back to Store
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="p-4 divide-y divide-slate-100 max-h-[28vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-xs">Your cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="py-3 flex items-center justify-between gap-3 text-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm" dir="auto">
                        {item.name} {item.variantName ? `(${item.variantName})` : ''}
                      </h4>
                      <div className="text-xs font-black text-emerald-600" dir="ltr">₹{item.price * item.qty}</div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => onUpdateQty(item.cartId, -1)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black px-1.5">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.cartId, 1)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DELIVERY TIME SLOT SELECTION SECTION */}
            <div className="p-4 bg-emerald-50/50 border-t border-b border-emerald-100/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span dir="auto">ഡെലിവറി സമയം (Select Delivery Option)</span>
                </label>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Customizable
                </span>
              </div>

              {/* Delivery Mode Choice Cards */}
              <div className="grid grid-cols-2 gap-2">
                {/* Option 1: Scheduled Batch Delivery */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('scheduled')}
                  className={`p-3 rounded-2xl border text-start transition-all relative cursor-pointer ${
                    deliveryType === 'scheduled'
                      ? 'border-emerald-600 bg-white shadow-md shadow-emerald-600/10'
                      : 'border-slate-200 bg-slate-50 opacity-80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Batch Delivery</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold" dir="auto">
                    {selectedSlot?.fee === 0 ? 'Free / ഫ്രീ ഡെലിവറി' : `₹${selectedSlot?.fee || 0}`}
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium truncate mt-0.5" dir="auto">
                    {selectedSlot?.time} Slot
                  </div>
                </button>

                {/* Option 2: Urgent Express Delivery */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('urgent')}
                  className={`p-3 rounded-2xl border text-start transition-all relative cursor-pointer ${
                    deliveryType === 'urgent'
                      ? 'border-orange-500 bg-white shadow-md shadow-orange-500/10'
                      : 'border-slate-200 bg-slate-50 opacity-80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                    <span dir="auto">അർജന്റ് ഡെലിവറി</span>
                  </div>
                  <div className="text-[10px] text-orange-600 font-bold" dir="ltr">
                    +₹{expressFee} Fee
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                    Quick Priority Dispatch
                  </div>
                </button>
              </div>

              {/* Scheduled Time Slots Dropdown/Selector when 'scheduled' */}
              {deliveryType === 'scheduled' && (
                <div className="pt-2 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1" dir="auto">
                    ലഭ്യമായ ഡെലിവറി സമയ ബാച്ച് (Select Time Slot):
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {activeSlots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span dir="ltr">{slot.time}</span>
                            <span className="text-[10px] opacity-80 font-normal" dir="auto">({slot.label})</span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`} dir="ltr">
                            {slot.fee === 0 ? 'FREE' : `₹${slot.fee}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Special Instructions Note */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                📝 SPECIAL INSTRUCTIONS (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g: Less spicy, leave at door, etc..."
                rows={1}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                dir="auto"
              />
            </div>

            {/* Footer Summary & Checkout */}
            <div className="p-4 bg-white sticky bottom-0 border-t border-slate-100">
              <div className="space-y-1 mb-3 text-slate-900 text-xs font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Items Subtotal</span>
                  <span dir="ltr">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charge</span>
                  <span className={currentDeliveryFee === 0 ? 'text-emerald-600 font-extrabold' : 'text-slate-800 font-bold'} dir="ltr">
                    {currentDeliveryFee === 0 ? 'FREE' : `₹${currentDeliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="text-emerald-600" dir="ltr">₹{grandTotal}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0 || isPlacing}
                onClick={handleCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isPlacing ? 'PLACING ORDER...' : `Confirm Order (₹${grandTotal}) & Send to WhatsApp`}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
