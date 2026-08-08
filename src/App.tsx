import React, { useState, useEffect } from 'react';
import {
  AppData,
  Module,
  Product,
  ProductVariant,
  CartItem,
  PromoBanner,
} from './types';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { ModuleGrid } from './components/ModuleGrid';
import { PromoBanners } from './components/PromoBanners';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrdersView } from './components/OrdersView';
import { AdminPanel } from './components/AdminPanel';
import { BottomNav } from './components/BottomNav';
import { initialData } from './data/initialData';

export default function App() {
  const [appData, setAppData] = useState<AppData>(initialData);
  const [loading, setLoading] = useState<boolean>(true);

  // URL & User state
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isWhatsappLoggedIn, setIsWhatsappLoggedIn] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('WVRW+J7M, Tirur, Kerala');

  // Active filters
  const [activeModuleId, setActiveModuleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Selected product for detail popup
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Bottom Navigation tab
  const [navTab, setNavTab] = useState<'home' | 'offers' | 'orders' | 'cart' | 'admin'>('home');

  // Load customer phone and check admin parameter from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPhone = params.get('phone');
    const isAdmin = params.get('admin') || params.get('page') === 'admin';

    if (isAdmin) {
      setNavTab('admin');
    }

    if (urlPhone) {
      const cleanPhone = urlPhone.replace(/[^0-9]/g, '');
      setCustomerPhone(cleanPhone);
      setIsWhatsappLoggedIn(true);
      localStorage.setItem('hyperlocal_customer_phone', cleanPhone);
      localStorage.setItem('hyperlocal_is_wa_login', 'true');
    } else {
      const isWaLogin = localStorage.getItem('hyperlocal_is_wa_login') === 'true';
      const savedPhone = localStorage.getItem('hyperlocal_customer_phone');
      if (isWaLogin && savedPhone) {
        setCustomerPhone(savedPhone);
        setIsWhatsappLoggedIn(true);
      } else {
        setCustomerPhone('');
        setIsWhatsappLoggedIn(false);
      }
    }
  }, []);

  // Load App Data from API
  const fetchAppData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        setAppData(json);
        if (json.settings?.delivery_address) {
          setDeliveryAddress(json.settings.delivery_address);
        }
      }
    } catch (err) {
      console.error('Failed to fetch store data, using local state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  // Update App Data API
  const handleUpdateAppData = async (newData: AppData) => {
    setAppData(newData);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (err) {
      console.error('Failed to update app data:', err);
    }
  };

  // Trigger n8n Webhook Test
  const handleTriggerTestWebhook = async () => {
    try {
      const res = await fetch('/api/test-webhook', { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Restore Backup
  const handleRestoreBackup = async (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        const json = await res.json();
        setAppData(json.data);
        return true;
      }
    } catch (err) {
      console.error('Restore error:', err);
    }
    return false;
  };

  // Address update
  const handleUpdateAddress = async (newAddr: string) => {
    setDeliveryAddress(newAddr);
    const updated = {
      ...appData,
      settings: { ...appData.settings, delivery_address: newAddr },
    };
    handleUpdateAppData(updated);
  };

  // Cart operations
  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    const variantName = variant ? variant.name : undefined;
    const price = variant ? variant.price : product.price;
    const cartId = `${product.id}_${variantName || 'default'}`;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.cartId === cartId);
      if (existing) {
        return prevCart.map((i) => (i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prevCart,
        {
          cartId,
          productId: product.id,
          name: product.name,
          variantName,
          price,
          image: product.image,
          qty: 1,
          categoryId: product.categoryId,
        },
      ];
    });
  };

  const handleUpdateCartQty = (productIdOrCartId: string, change: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.cartId === productIdOrCartId || item.productId === productIdOrCartId) {
            return { ...item, qty: item.qty + change };
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  };

  // Place Order API
  const handlePlaceOrder = async (notes: string): Promise<boolean> => {
    if (cart.length === 0) return false;

    const items = cart.map((i) => ({
      name: i.name + (i.variantName ? ` (${i.variantName})` : ''),
      qty: i.qty,
      price: i.price,
      category:
        appData.categories.find((c) => c.id === i.categoryId)?.name || 'General',
    }));

    const totalAmount = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const newOrder = {
      order_id: 'ORD-' + Date.now().toString().slice(-6),
      customer_phone: customerPhone || '919876543210',
      items,
      total_amount: totalAmount,
      notes,
      order_time: new Date().toISOString(),
      status: 'Order Placed' as const,
      is_food_order: items.some((i) => i.category.toLowerCase().includes('food')),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        const json = await res.json();
        // Update local state orders list
        setAppData((prev) => ({
          ...prev,
          orders: [json.order, ...prev.orders],
        }));
        setCart([]);
        return true;
      }
    } catch (err) {
      console.error('Order error:', err);
    }
    return false;
  };

  // Filter products by selected module and search query
  const filteredProducts = appData.products.filter((product) => {
    // Availability check
    if (!product.available) return false;

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    // Module check
    if (activeModuleId !== 'all') {
      // Find categories linked to this module
      const moduleCategoryIds = appData.categories
        .filter((c) => c.moduleId === activeModuleId)
        .map((c) => c.id);

      return (
        product.moduleId === activeModuleId ||
        moduleCategoryIds.includes(product.categoryId)
      );
    }

    return true;
  });

  const activeModule = appData.modules.find((m) => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 antialiased selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden">
        {/* Header */}
        <Header
          phone={customerPhone}
          isWhatsappLoggedIn={isWhatsappLoggedIn}
          onSetPhone={(p) => {
            setCustomerPhone(p);
            setIsWhatsappLoggedIn(true);
            localStorage.setItem('hyperlocal_customer_phone', p);
            localStorage.setItem('hyperlocal_is_wa_login', 'true');
          }}
          cartCount={cart.reduce((s, i) => s + i.qty, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAdmin={() => setNavTab('admin')}
          onOpenOrders={() => setNavTab('orders')}
          deliveryAddress={deliveryAddress}
          onUpdateAddress={handleUpdateAddress}
        />

        {/* Content based on Active Navigation Tab */}
        {navTab === 'admin' ? (
          <AdminPanel
            data={appData}
            onUpdateData={handleUpdateAppData}
            onTriggerTestWebhook={handleTriggerTestWebhook}
            onRestoreBackup={handleRestoreBackup}
            onClose={() => setNavTab('home')}
          />
        ) : navTab === 'orders' ? (
          <OrdersView orders={appData.orders} phone={customerPhone} />
        ) : (
          <main className="space-y-2">
            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeModuleName={activeModule?.name}
            />

            {/* Category Tab Selector */}
            <CategoryTabs
              modules={appData.modules}
              activeModuleId={activeModuleId}
              onSelectModule={(id) => setActiveModuleId(id)}
            />

            {/* Modules Grid (Only show when on 'Home/all' or if no search query) */}
            {activeModuleId === 'all' && !searchQuery && (
              <ModuleGrid
                modules={appData.modules}
                onSelectModule={(id) => setActiveModuleId(id)}
              />
            )}

            {/* Promotional Banners */}
            {!searchQuery && (
              <PromoBanners
                banners={appData.banners}
                onSelectBanner={(b) => {
                  if (b.linkModuleId) setActiveModuleId(b.linkModuleId);
                }}
              />
            )}

            {/* Section Heading */}
            <div className="px-4 pt-4 pb-1 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">
                {activeModule ? `${activeModule.name} Items` : 'All Products'}
              </h2>
              {activeModuleId !== 'all' && (
                <button
                  onClick={() => setActiveModuleId('all')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Show All
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="px-4 pb-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100 p-6">
                  <h3 className="font-extrabold text-slate-800 text-sm mb-1">No products found</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Try selecting a different category or clear search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map((product) => {
                    const category = appData.categories.find((c) => c.id === product.categoryId);
                    const cartItem = cart.find((i) => i.productId === product.id);

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categoryName={category?.name}
                        cartItem={cartItem}
                        onAddToCart={(p) => handleAddToCart(p)}
                        onUpdateQty={(pId, change) => handleUpdateCartQty(pId, change)}
                        onOpenDetail={(p) => setDetailProduct(p)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        )}

        {/* Product Variant / Detail Popup Modal */}
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCartWithVariant={(p, v) => handleAddToCart(p, v)}
        />

        {/* Cart Drawer Modal */}
        <CartDrawer
          cart={cart}
          onUpdateQty={(cartId, change) => handleUpdateCartQty(cartId, change)}
          onClearCart={() => setCart([])}
          customerPhone={customerPhone}
          onPlaceOrder={handlePlaceOrder}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={navTab === 'admin' ? 'home' : navTab}
          onChangeTab={(tab) => {
            if (tab === 'cart') {
              setIsCartOpen(true);
            } else {
              setNavTab(tab);
            }
          }}
          cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        />
      </div>
    </div>
  );
}
