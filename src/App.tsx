import React, { useState, useEffect } from 'react';
import {
  AppData,
  Module,
  Product,
  ProductVariant,
  CartItem,
  PromoBanner,
  ItemPrescription,
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
import { PWAInstallModal } from './components/PWAInstallModal';
import { WhatsAppSupportButton } from './components/WhatsAppSupportButton';
import { initialData } from './data/initialData';
import {
  getActiveModules,
  getActiveCategories,
  getVisibleProducts,
  getVisibleBanners,
  sanitizeModuleSelection,
} from './utils/visibility';

export default function App() {
  const [appData, setAppData] = useState<AppData>(initialData);
  const [loading, setLoading] = useState<boolean>(true);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);

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

  // Listen for PWA beforeinstallprompt event & trigger pop-up window if PWA system is enabled
  useEffect(() => {
    // If admin explicitly disabled PWA system, do not prompt
    if (appData.settings?.pwa_enabled === false) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (appData.settings?.pwa_enabled !== false) {
        setIsPwaModalOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if running as installed standalone app
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // If not running in standalone mode and PWA is enabled, open the PWA installation modal automatically on page open
    if (!isStandalone && appData.settings?.pwa_enabled !== false) {
      const timer = setTimeout(() => {
        setIsPwaModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [appData.settings?.pwa_enabled]);

  // Load customer phone and check admin parameter from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPhone = params.get('phone');
    const pathname = window.location.pathname.toLowerCase();
    const isAdmin =
      params.get('admin') === 'true' ||
      params.get('admin') === '1' ||
      params.get('admin') === '' ||
      params.get('page') === 'admin' ||
      params.get('page') === 'superadmin' ||
      params.get('superadmin') !== null ||
      params.get('superadmin.php') !== null ||
      pathname.includes('superadmin') ||
      pathname.includes('/admin') ||
      window.location.hash.includes('superadmin') ||
      window.location.hash.includes('admin');

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

  // Auto-sanitize module selection if a module gets disabled by admin
  useEffect(() => {
    if (activeModuleId !== 'all') {
      const sanitized = sanitizeModuleSelection(activeModuleId, appData.modules);
      if (sanitized !== activeModuleId) {
        setActiveModuleId(sanitized);
      }
    }
  }, [appData.modules, activeModuleId]);

  // Update App Data API with canonical server synchronization
  const handleUpdateAppData = async (newData: AppData): Promise<boolean> => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setAppData(json.data);
          return true;
        }
      }
      throw new Error(`Server responded with status ${res.status}`);
    } catch (err) {
      console.error('Failed to update app data on server:', err);
      // Re-fetch to ensure local state remains canonical
      fetchAppData();
      return false;
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
  const handleAddToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const variantName = variant ? variant.name : undefined;
    const price = variant ? variant.price : product.price;
    const cartId = `${product.id}_${variantName || 'default'}`;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.cartId === cartId);
      if (existing) {
        return prevCart.map((i) => (i.cartId === cartId ? { ...i, qty: i.qty + quantity } : i));
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
          qty: quantity,
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

  const handleAttachItemPrescription = (cartId: string, prescription?: ItemPrescription) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.cartId === cartId ? { ...item, prescription } : item))
    );
  };

  // Place Order API
  const handlePlaceOrder = async (
    notes: string,
    deliveryType: 'scheduled' | 'urgent' = 'scheduled',
    deliverySlotTime?: string,
    deliveryFee: number = 0,
    paymentMethod: 'cod' | 'upi_online' | 'wallet' = 'cod',
    paymentTransactionId: string = ''
  ): Promise<boolean> => {
    if (cart.length === 0) return false;

    const items = cart.map((i) => ({
      name: i.name + (i.variantName ? ` (${i.variantName})` : ''),
      qty: i.qty,
      price: i.price,
      category:
        appData.categories.find((c) => c.id === i.categoryId)?.name || 'General',
      prescription: i.prescription,
    }));

    const itemsSubtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const totalAmount = itemsSubtotal + deliveryFee;

    const newOrder = {
      order_id: 'ORD-' + Date.now().toString().slice(-6),
      customer_phone: customerPhone || '919876543210',
      items,
      total_amount: totalAmount,
      delivery_type: deliveryType,
      delivery_slot_time: deliverySlotTime,
      delivery_fee: deliveryFee,
      notes,
      order_time: new Date().toISOString(),
      status: 'Order Placed' as const,
      is_food_order: items.some((i) => i.category.toLowerCase().includes('food')),
      payment_method: paymentMethod,
      payment_status: (paymentMethod === 'cod'
        ? 'Paid (COD)'
        : paymentMethod === 'wallet'
        ? 'Paid (Wallet)'
        : paymentTransactionId
        ? 'Paid (UPI Verified)'
        : 'Pending') as any,
      payment_transaction_id: paymentTransactionId,
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

  // Filtered views using centralized visibility engine
  const activeModules = getActiveModules(appData.modules);
  const visibleBanners = getVisibleBanners(appData.banners, appData.modules);
  const filteredProducts = getVisibleProducts(
    appData.products,
    appData.categories,
    appData.modules,
    activeModuleId,
    searchQuery
  );

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
          onOpenPWA={() => setIsPwaModalOpen(true)}
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
            onTestPWAInstallPrompt={() => setIsPwaModalOpen(true)}
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
              modules={activeModules}
              activeModuleId={activeModuleId}
              onSelectModule={(id) => setActiveModuleId(id)}
            />

            {/* Modules Grid (Only show when on 'Home/all' or if no search query) */}
            {activeModuleId === 'all' && !searchQuery && (
              <ModuleGrid
                modules={activeModules}
                onSelectModule={(id) => setActiveModuleId(id)}
              />
            )}

            {/* Promotional Banners */}
            {!searchQuery && (
              <PromoBanners
                banners={visibleBanners}
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
          onAddToCartWithVariant={(p, v, q) => handleAddToCart(p, v, q)}
        />

        {/* Cart Drawer Modal */}
        <CartDrawer
          cart={cart}
          onUpdateQty={(cartId, change) => handleUpdateCartQty(cartId, change)}
          onClearCart={() => setCart([])}
          onAttachItemPrescription={handleAttachItemPrescription}
          customerPhone={customerPhone}
          settings={appData.settings}
          onPlaceOrder={handlePlaceOrder}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onOpenCart={() => setIsCartOpen(true)}
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

        {/* Floating WhatsApp Support Button */}
        <WhatsAppSupportButton settings={appData.settings} />

        {/* PWA Application Installation Pop-up Modal */}
        <PWAInstallModal
          settings={appData.settings}
          isOpen={isPwaModalOpen}
          onClose={() => setIsPwaModalOpen(false)}
          deferredPrompt={deferredPrompt}
        />
      </div>
    </div>
  );
}
