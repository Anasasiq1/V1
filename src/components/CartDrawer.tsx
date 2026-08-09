import React, { useState } from 'react';
import { CartItem, StoreSettings, DeliverySlot, ItemPrescription } from '../types';
import { ShoppingBag, X, Plus, Minus, CheckCircle, ArrowRight, Clock, Zap, ShieldCheck, MessageCircle, Smartphone, ExternalLink, CreditCard, QrCode, Copy, Check, Banknote, Share2, UploadCloud, FileText, Trash2, Wallet } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQty: (cartId: string, change: number) => void;
  onClearCart: () => void;
  onAttachItemPrescription?: (cartId: string, prescription?: ItemPrescription) => void;
  customerPhone: string;
  settings?: StoreSettings;
  onPlaceOrder: (
    notes: string,
    deliveryType: 'scheduled' | 'urgent',
    selectedSlotTime?: string,
    deliveryFee?: number,
    paymentMethod?: 'cod' | 'upi_online' | 'wallet',
    paymentTransactionId?: string
  ) => Promise<boolean>;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onUpdateQty,
  onAttachItemPrescription,
  customerPhone,
  settings,
  onPlaceOrder,
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'scheduled' | 'urgent'>('scheduled');
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_online' | 'wallet'>(
    settings?.upi_enabled !== false ? 'upi_online' : 'cod'
  );
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrderSummary, setCopiedOrderSummary] = useState(false);

  const handlePrescriptionFileUpload = (cartId: string, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    if (!validExts.includes(ext || '')) {
      alert('Please upload a valid prescription file in PDF, JPG, PNG, DOC, or DOCX format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onAttachItemPrescription?.(cartId, {
        fileName: file.name,
        fileData: base64,
        fileType: file.type || ext,
      });
    };
    reader.readAsDataURL(file);
  };

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
  const [placedSnapshot, setPlacedSnapshot] = useState<{
    itemsText: string;
    subtotal: number;
    deliveryFee: number;
    grandTotal: number;
    slotTimeStr: string;
    notes: string;
    customerPhoneStr: string;
    paymentMethodStr: string;
    transactionIdStr: string;
  } | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = subtotal + currentDeliveryFee;

  const handleCopy = (text: string, type: 'upi' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const getFormattedOrderSummary = () => {
    if (!placedSnapshot) return '';
    const storeName = settings?.store_name || 'Hyperlocal Store';
    return (
      `🛍️ *ORDER SUMMARY - ${storeName}*\n` +
      `----------------------------------\n` +
      `👤 *Customer Phone:* +${placedSnapshot.customerPhoneStr}\n` +
      `📅 *Delivery Slot:* ${placedSnapshot.slotTimeStr}\n` +
      `💳 *Payment Method:* ${placedSnapshot.paymentMethodStr}\n` +
      (placedSnapshot.transactionIdStr ? `🔢 *UTR / Ref No:* ${placedSnapshot.transactionIdStr}\n` : '') +
      `----------------------------------\n` +
      `📦 *Items Ordered:*\n${placedSnapshot.itemsText}\n` +
      `----------------------------------\n` +
      `🚚 *Delivery Fee:* ${placedSnapshot.deliveryFee === 0 ? 'FREE' : '₹' + placedSnapshot.deliveryFee}\n` +
      `💵 *Grand Total:* ₹${placedSnapshot.grandTotal}\n` +
      (placedSnapshot.notes ? `📝 *Notes:* ${placedSnapshot.notes}\n` : '') +
      `----------------------------------\n` +
      `Thank you for shopping with us!`
    );
  };

  const handleShareOrderSummary = async () => {
    const summaryText = getFormattedOrderSummary();
    if (!summaryText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order Summary - ${settings?.store_name || 'Store'}`,
          text: summaryText,
        });
        return;
      } catch (err) {
        // Fallback to WhatsApp link if share dialog closed or unsupported
      }
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyOrderSummary = () => {
    const summaryText = getFormattedOrderSummary();
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopiedOrderSummary(true);
    setTimeout(() => setCopiedOrderSummary(false), 2000);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsPlacing(true);
    const slotTimeStr = deliveryType === 'scheduled'
      ? `${selectedSlot?.time || ''} (${selectedSlot?.label || 'Batch Delivery'})`
      : 'Urgent Express Delivery';

    const cleanCustPhone = (customerPhone || '919876543210').replace(/\D/g, '');
    const storeName = settings?.store_name || 'WhatsApp Hyperlocal Store';
    const storeWaPhone = (settings?.store_whatsapp_phone || settings?.store_phone || '919876543210').replace(/\D/g, '');

    const itemsText = cart
      .map((i) => {
        let line = `• ${i.name}${i.variantName ? ` (${i.variantName})` : ''} x ${i.qty} = ₹${i.price * i.qty}`;
        if (i.prescription) {
          line += `\n   📄 [Prescription Attached: ${i.prescription.fileName}]`;
        }
        return line;
      })
      .join('\n');

    const paymentMethodStr = paymentMethod === 'upi_online'
      ? `Online Payment (UPI/GPay/PhonePe)`
      : paymentMethod === 'wallet'
      ? `Store Wallet Payment`
      : `Cash on Delivery (COD)`;

    const snapshot = {
      itemsText,
      subtotal,
      deliveryFee: currentDeliveryFee,
      grandTotal,
      slotTimeStr,
      notes,
      customerPhoneStr: cleanCustPhone,
      paymentMethodStr,
      transactionIdStr: paymentTransactionId,
    };

    setPlacedSnapshot(snapshot);

    const success = await onPlaceOrder(notes, deliveryType, slotTimeStr, currentDeliveryFee, paymentMethod, paymentTransactionId);
    setIsPlacing(false);
    if (success) {
      setOrderSuccess(true);

      // WhatsApp Message Formatting
      const waText = `🛍️ *ORDER CONFIRMATION - ${storeName}*\n\n` +
        `👤 *Customer Phone:* +${cleanCustPhone}\n` +
        `📅 *Delivery Slot:* ${slotTimeStr}\n` +
        `💳 *Payment Method:* ${paymentMethodStr}\n` +
        (paymentTransactionId ? `🔢 *UTR / Ref No:* ${paymentTransactionId}\n` : '') +
        `\n📦 *Order Items:*\n${itemsText}\n\n` +
        `🚚 *Delivery Fee:* ${currentDeliveryFee === 0 ? 'FREE' : '₹' + currentDeliveryFee}\n` +
        `💵 *Grand Total:* ₹${grandTotal}\n` +
        (notes ? `📝 *Notes:* ${notes}\n\n` : '\n') +
        `Thank you for ordering with us!`;

      const encodedWaText = encodeURIComponent(waText);
      const customerWaUrl = `https://wa.me/${cleanCustPhone}?text=${encodedWaText}`;
      const storeWaUrl = `https://wa.me/${storeWaPhone}?text=${encodedWaText}`;

      // Auto-launch WhatsApp if enabled in settings
      if (settings?.customer_wa_auto_open !== false) {
        const targetUrl = settings?.whatsapp_mode === 'store_only' ? storeWaUrl : customerWaUrl;
        window.open(targetUrl, '_blank');
      }
    }
  };

  const handleResetSuccess = () => {
    setOrderSuccess(false);
    setNotes('');
    setPlacedSnapshot(null);
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
          <div className="p-6 text-center my-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 font-semibold" dir="auto">
                ഓർഡർ വിവരങ്ങൾ വിജയകരമായി സബ്മിറ്റ് ചെയ്തു!
              </p>
            </div>

            {/* Share & Copy Order Summary Section */}
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5 text-start">
              <div className="font-extrabold text-xs text-emerald-950 flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <div className="flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Share Order Summary (ഓർഡർ വിവരങ്ങൾ ഷെയർ ചെയ്യാം)</span>
                </div>
                <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Quick Share
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Share Button (WhatsApp / System Native Share) */}
                <button
                  type="button"
                  onClick={handleShareOrderSummary}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Share Summary</span>
                </button>

                {/* Copy to Clipboard Button */}
                <button
                  type="button"
                  onClick={handleCopyOrderSummary}
                  className="w-full bg-white hover:bg-slate-100 active:scale-98 text-slate-800 font-extrabold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-all shadow-xs cursor-pointer"
                >
                  {copiedOrderSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive WhatsApp Action Buttons */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-start">
              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Send Order Copy via WhatsApp (വാട്സാപ്പ് വഴി അയക്കുക):</span>
              </div>

              {/* Button 1: Send to Customer WhatsApp */}
              {(settings?.send_to_customer_whatsapp !== false && settings?.whatsapp_mode !== 'store_only') && (
                <a
                  href={`https://wa.me/${(customerPhone || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(
                    `🛍️ *ORDER CONFIRMATION - ${settings?.store_name || 'WhatsApp Store'}*\n\n` +
                    `👤 *Customer Phone:* +${(customerPhone || '919876543210').replace(/\D/g, '')}\n` +
                    `📅 *Delivery Option:* ${placedSnapshot?.slotTimeStr || ''}\n\n` +
                    `📦 *Items:* \n${placedSnapshot?.itemsText || ''}\n\n` +
                    `🚚 *Delivery Fee:* ${placedSnapshot?.deliveryFee === 0 ? 'FREE' : '₹' + (placedSnapshot?.deliveryFee || 0)}\n` +
                    `💵 *Grand Total:* ₹${placedSnapshot?.grandTotal || 0}\n\n` +
                    `Thank you for shopping with us!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all shadow-md shadow-emerald-600/20 cursor-pointer block"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-200" />
                    <span>കസ്റ്റമർ വാട്സാപ്പിലേക്ക് (To My WhatsApp)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                </a>
              )}

              {/* Button 2: Send to Store Owner WhatsApp */}
              {(settings?.whatsapp_mode !== 'customer_only') && (
                <a
                  href={`https://wa.me/${(settings?.store_whatsapp_phone || settings?.store_phone || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(
                    `🛍️ *NEW STORE ORDER - ${settings?.store_name || 'WhatsApp Store'}*\n\n` +
                    `👤 *Customer Phone:* +${(customerPhone || '919876543210').replace(/\D/g, '')}\n` +
                    `📅 *Delivery Option:* ${placedSnapshot?.slotTimeStr || ''}\n\n` +
                    `📦 *Items:* \n${placedSnapshot?.itemsText || ''}\n\n` +
                    `🚚 *Delivery Fee:* ${placedSnapshot?.deliveryFee === 0 ? 'FREE' : '₹' + (placedSnapshot?.deliveryFee || 0)}\n` +
                    `💵 *Grand Total:* ₹${placedSnapshot?.grandTotal || 0}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all shadow-md cursor-pointer block"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>കടയുടമയുടെ വാട്സാപ്പിലേക്ക് (To Store WhatsApp)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>

            <button
              onClick={handleResetSuccess}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-2xl text-xs cursor-pointer transition-colors shadow-xs"
            >
              Back to Store
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="p-4 divide-y divide-slate-100 max-h-[35vh] overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-xs">Your cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="pt-3 first:pt-0 space-y-2 text-start">
                    <div className="flex items-center justify-between gap-3">
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

                    {/* ITEM-WISE PRESCRIPTION UPLOAD */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      {item.prescription ? (
                        <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-bold">
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{item.prescription.fileName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAttachItemPrescription?.(item.cartId, undefined)}
                            className="text-rose-600 hover:bg-rose-100 p-1 rounded-md transition-colors cursor-pointer shrink-0 ml-1"
                            title="Remove prescription"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-extrabold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                          <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Attach Prescription (PDF, JPG, PNG, DOC, DOCX)</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePrescriptionFileUpload(item.cartId, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
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

            {/* PAYMENT METHOD SELECTION SECTION */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span dir="auto">പേയ്മെന്റ് രീതി (Payment Option)</span>
                </label>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  Zero Extra Fees
                </span>
              </div>

              {/* Payment Mode Selector Cards */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* Option 1: Cash on Delivery */}
                {(settings?.cod_enabled !== false) && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-white shadow-md shadow-emerald-600/10'
                        : 'border-slate-200 bg-white/60 opacity-80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-extrabold text-[11px] text-slate-900 mb-0.5">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>COD</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold">
                      ക്യാഷ് ഡെലിവറി
                    </div>
                  </button>
                )}

                {/* Option 2: Online Payment (UPI) */}
                {(settings?.upi_enabled !== false) && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_online')}
                    className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer ${
                      paymentMethod === 'upi_online'
                        ? 'border-emerald-600 bg-white shadow-md shadow-emerald-600/10'
                        : 'border-slate-200 bg-white/60 opacity-80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-extrabold text-[11px] text-slate-900 mb-0.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>UPI Online</span>
                    </div>
                    <div className="text-[9px] text-emerald-700 font-bold">
                      GPay, QR
                    </div>
                  </button>
                )}

                {/* Option 3: Store Wallet Payment */}
                {(settings?.wallet_enabled !== false) && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'border-purple-600 bg-white shadow-md shadow-purple-600/10'
                        : 'border-slate-200 bg-white/60 opacity-80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-extrabold text-[11px] text-purple-900 mb-0.5">
                      <Wallet className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Wallet</span>
                    </div>
                    <div className="text-[9px] text-purple-700 font-extrabold">
                      ₹{settings?.wallet_demo_balance || 500} Bal
                    </div>
                  </button>
                )}
              </div>

              {/* Wallet Info Display */}
              {paymentMethod === 'wallet' && (
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-xs font-bold text-purple-900 flex items-center gap-2 animate-in fade-in">
                  <Wallet className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <div>Store Wallet Payment Active</div>
                    <div className="text-[10px] text-purple-700 font-medium">
                      ₹{grandTotal} will be debited from your Store Wallet (Balance: ₹{settings?.wallet_demo_balance || 500}).
                    </div>
                  </div>
                </div>
              )}

              {/* Online Payment Detailed Guide & QR Scanner */}
              {paymentMethod === 'upi_online' && (
                <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Online UPI Direct Payment</span>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      No Gateway Charges
                    </span>
                  </div>

                  {/* UPI Intent Launcher Button for Mobile */}
                  {settings?.upi_id && (
                    <a
                      href={`upi://pay?pa=${encodeURIComponent(settings.upi_id)}&pn=${encodeURIComponent(settings.upi_payee_name || settings.store_name || 'Store')}&am=${grandTotal}&cu=INR`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-200" />
                      <span>Pay ₹{grandTotal} via GPay / PhonePe / Paytm</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                    </a>
                  )}

                  {/* QR Code Display if image provided */}
                  {settings?.upi_qr_image && (
                    <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-center space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Personal QR Scanner (സ്കാൻ ചെയ്ത് പേ ചെയ്യാം)
                      </div>
                      <img
                        src={settings.upi_qr_image}
                        alt="Store UPI QR Code"
                        className="w-40 h-40 object-contain mx-auto rounded-xl border border-slate-100 shadow-xs"
                      />
                      <div className="text-[10px] text-slate-600 font-extrabold">
                        {settings.upi_payee_name || settings.store_name}
                      </div>
                    </div>
                  )}

                  {/* Copy UPI ID and Phone Number */}
                  <div className="space-y-1.5 text-xs">
                    {settings?.upi_id && (
                      <div className="bg-white p-2 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-[9px] text-slate-400 font-bold block">UPI ID:</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">{settings.upi_id}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.upi_id!, 'upi')}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}

                    {settings?.upi_phone && (
                      <div className="bg-white p-2 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-[9px] text-slate-400 font-bold block">GPay / PhonePe Number:</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">+91 {settings.upi_phone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.upi_phone!, 'phone')}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID / UTR Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1">
                      UTR / Transaction Ref Number (ഓപ്ഷണൽ - പേയ്മെന്റ് കഴിഞ്ഞ ശേഷം കൊടുക്കാം):
                    </label>
                    <input
                      type="text"
                      value={paymentTransactionId}
                      onChange={(e) => setPaymentTransactionId(e.target.value)}
                      placeholder="e.g. 423819028120"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
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
