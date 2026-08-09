import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types';

interface WhatsAppSupportButtonProps {
  settings?: StoreSettings;
}

export const WhatsAppSupportButton: React.FC<WhatsAppSupportButtonProps> = ({ settings }) => {
  const storePhone = settings?.store_whatsapp_phone || '919876543210';
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');
  const storeName = settings?.store_name || 'Hyperlocal Store';

  const defaultMessage = `Hello ${storeName}, I need support regarding your store / products.`;

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleOpenWhatsApp}
      aria-label="WhatsApp Support"
      title="Chat with support on WhatsApp"
      className="fixed bottom-20 right-4 z-40 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-extrabold px-3.5 py-2.5 rounded-full shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer border border-white/20"
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className="w-5 h-5 fill-current text-white shrink-0" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-200 rounded-full" />
      </div>
      <span className="text-xs font-black tracking-wide hidden xs:inline sm:inline">
        WhatsApp Support
      </span>
    </button>
  );
};
