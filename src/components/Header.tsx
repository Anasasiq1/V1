import React, { useState } from 'react';
import { MapPin, Bell, ShoppingBag, Shield, MessageCircle } from 'lucide-react';

interface HeaderProps {
  phone: string;
  onSetPhone: (phone: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  deliveryAddress: string;
  onUpdateAddress: (addr: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  phone,
  onSetPhone,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenOrders,
  deliveryAddress,
  onUpdateAddress,
}) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);
  const [editingAddr, setEditingAddr] = useState(false);
  const [addrText, setAddrText] = useState(deliveryAddress);

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPhone.trim()) {
      onSetPhone(tempPhone.trim());
      setShowPhoneModal(false);
    }
  };

  const handleSaveAddr = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrText.trim()) {
      onUpdateAddress(addrText.trim());
      setEditingAddr(false);
    }
  };

  return (
    <header className="bg-white px-4 pt-3 pb-2 sticky top-0 z-40 border-b border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        {/* Location Section */}
        <div className="flex-1 mr-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span>Deliver To</span>
            {/* Secret subtle trigger for Admin access */}
            <span
              onClick={onOpenAdmin}
              className="opacity-0 hover:opacity-100 text-[9px] text-slate-300 cursor-pointer transition-opacity"
              title="Admin Portal"
            >
              •
            </span>
          </div>
          {editingAddr ? (
            <form onSubmit={handleSaveAddr} className="flex items-center gap-1 mt-0.5">
              <input
                type="text"
                value={addrText}
                onChange={(e) => setAddrText(e.target.value)}
                className="text-xs font-bold border border-emerald-300 rounded px-2 py-0.5 focus:outline-none w-full"
                autoFocus
              />
              <button type="submit" className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                Save
              </button>
            </form>
          ) : (
            <div
              onClick={() => setEditingAddr(true)}
              className="flex items-center gap-1 font-extrabold text-sm text-slate-800 cursor-pointer hover:text-emerald-600 transition-colors"
              title="Click to edit delivery address"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[200px]">{deliveryAddress}</span>
              <span className="text-emerald-600 text-xs">▾</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* WhatsApp Registration Badge */}
          <button
            onClick={() => {
              setTempPhone(phone);
              setShowPhoneModal(true);
            }}
            className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
            title="WhatsApp Registered Number"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp:</span>
            <span>{phone ? phone : 'Connect'}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenOrders}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors relative"
            title="My Orders & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>

          {/* Cart Header Icon */}
          <button
            onClick={onOpenCart}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors relative"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Login/Registration Info bar */}
      <div className="bg-emerald-50/80 border border-emerald-100 rounded-lg px-2.5 py-1 text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
        <span className="truncate">
          ✨ {phone ? `നിങ്ങളുടെ ഈ നമ്പറിൽ (${phone}) രജിസ്റ്റർ ചെയ്തിരിക്കുന്നു` : 'WhatsApp വഴി കണക്റ്റ് ചെയ്തിരിക്കുന്നു'}
        </span>
        <button
          onClick={() => {
            setTempPhone(phone);
            setShowPhoneModal(true);
          }}
          className="underline text-emerald-700 hover:text-emerald-900 font-bold ml-2 shrink-0"
        >
          {phone ? 'Change' : 'Set Phone'}
        </button>
      </div>

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-800 text-lg mb-1 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" /> WhatsApp Login / Register
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Our website links directly with WhatsApp. When you order, confirmation is sent automatically to your WhatsApp number.
            </p>

            <form onSubmit={handleSavePhone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Mobile Number</label>
                <input
                  type="text"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Save & Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
