import React from 'react';
import { Home, Tag, Package, ShoppingBag } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'offers' | 'orders' | 'cart';
  onChangeTab: (tab: 'home' | 'offers' | 'orders' | 'cart') => void;
  cartCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, cartCount = 0 }) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100/80 px-6 py-2.5 z-30 flex items-center justify-between shadow-lg">
      <button
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
          activeTab === 'home' ? 'text-emerald-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onChangeTab('offers')}
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
          activeTab === 'offers' ? 'text-emerald-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Tag className="w-5 h-5" />
        <span>Offers</span>
      </button>

      <button
        onClick={() => onChangeTab('cart')}
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all active:scale-95 cursor-pointer relative ${
          activeTab === 'cart' ? 'text-emerald-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>

      <button
        onClick={() => onChangeTab('orders')}
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
          activeTab === 'orders' ? 'text-emerald-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Package className="w-5 h-5" />
        <span>Orders</span>
      </button>
    </nav>
  );
};
