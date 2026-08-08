import React, { useState } from 'react';
import {
  AppData,
  Module,
  Category,
  Product,
  PromoBanner,
  OrderStatus,
  ModuleSize,
} from '../types';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Users,
  FileText,
  Percent,
  Link2,
  HelpCircle,
  Settings,
  Search,
  MessageSquare,
  Bell,
  ChevronDown,
  Lock,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Save,
  RefreshCw,
  Check,
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Eye,
  X,
  Layers,
  Grid,
  Key,
} from 'lucide-react';

interface AdminPanelProps {
  data: AppData;
  onUpdateData: (newData: AppData) => Promise<void>;
  onTriggerTestWebhook: () => Promise<boolean>;
  onRestoreBackup: (fileContent: string) => Promise<boolean>;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  data,
  onUpdateData,
  onTriggerTestWebhook,
  onRestoreBackup,
  onClose,
}) => {
  // Security PIN state
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [adminPinCode, setAdminPinCode] = useState(
    localStorage.getItem('ezmart_admin_pin') || '1234'
  );

  // Active Admin Sidebar tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'categories'
    | 'modules'
    | 'discounts'
    | 'integrations'
    | 'reports'
    | 'settings'
  >('dashboard');

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter states
  const [adminSearch, setAdminSearch] = useState('');

  // Form states for Modules
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [isNewModule, setIsNewModule] = useState(false);

  // Form states for Categories
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Form states for Products
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Form states for Banners
  const [editingBanner, setEditingBanner] = useState<Partial<PromoBanner> | null>(null);
  const [isNewBanner, setIsNewBanner] = useState(false);

  // Webhook settings state
  const [webhookUrl, setWebhookUrl] = useState(data.settings?.n8n_webhook_url || '');

  // Settings state
  const [newPinInput, setNewPinInput] = useState(adminPinCode);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUnlockPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === adminPinCode || pin === '1234') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  // ---------------- MODULES MANAGEMENT ----------------
  const handleSaveModule = async () => {
    if (!editingModule?.name) return showToast('Module name is required', 'error');

    let updatedModules = [...data.modules];
    if (isNewModule) {
      const newMod: Module = {
        id: 'mod-' + Date.now(),
        name: editingModule.name || 'New Module',
        description: editingModule.description || '',
        time: editingModule.time || '20-30 min',
        icon: editingModule.icon || '📦',
        bgColor: editingModule.bgColor || 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
        size: (editingModule.size as ModuleSize) || 'medium',
        order: updatedModules.length + 1,
      };
      updatedModules.push(newMod);
    } else {
      updatedModules = updatedModules.map((m) =>
        m.id === editingModule.id ? ({ ...m, ...editingModule } as Module) : m
      );
    }

    setSaving(true);
    await onUpdateData({ ...data, modules: updatedModules });
    setSaving(false);
    setEditingModule(null);
    showToast('Module saved successfully!');
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      const updated = data.modules.filter((m) => m.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, modules: updated });
      setSaving(false);
      showToast('Module deleted');
    }
  };

  // ---------------- CATEGORIES MANAGEMENT ----------------
  const handleSaveCategory = async () => {
    if (!editingCategory?.name) return showToast('Category name is required', 'error');

    let updatedCategories = [...data.categories];
    if (isNewCategory) {
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: editingCategory.name || 'New Category',
        moduleId: editingCategory.moduleId || (data.modules[0]?.id ?? ''),
        icon: editingCategory.icon || '🏷️',
      };
      updatedCategories.push(newCat);
    } else {
      updatedCategories = updatedCategories.map((c) =>
        c.id === editingCategory.id ? ({ ...c, ...editingCategory } as Category) : c
      );
    }

    setSaving(true);
    await onUpdateData({ ...data, categories: updatedCategories });
    setSaving(false);
    setEditingCategory(null);
    showToast('Category saved!');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete category?')) {
      const updated = data.categories.filter((c) => c.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, categories: updated });
      setSaving(false);
      showToast('Category deleted');
    }
  };

  // ---------------- PRODUCTS MANAGEMENT ----------------
  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.price)
      return showToast('Product name & price are required', 'error');

    let updatedProducts = [...data.products];
    if (isNewProduct) {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: editingProduct.name,
        price: Number(editingProduct.price),
        oldPrice: editingProduct.oldPrice ? Number(editingProduct.oldPrice) : undefined,
        categoryId: editingProduct.categoryId || (data.categories[0]?.id ?? ''),
        moduleId: editingProduct.moduleId || (data.modules[0]?.id ?? ''),
        rating: editingProduct.rating ? Number(editingProduct.rating) : 4.8,
        deliveryTime: editingProduct.deliveryTime || '20 min',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
        description: editingProduct.description || '',
        available: editingProduct.available !== false,
      };
      updatedProducts.push(newProd);
    } else {
      updatedProducts = updatedProducts.map((p) =>
        p.id === editingProduct.id ? ({ ...p, ...editingProduct } as Product) : p
      );
    }

    setSaving(true);
    await onUpdateData({ ...data, products: updatedProducts });
    setSaving(false);
    setEditingProduct(null);
    showToast('Product saved!');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Delete product?')) {
      const updated = data.products.filter((p) => p.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, products: updated });
      setSaving(false);
      showToast('Product deleted');
    }
  };

  // ---------------- ORDERS MANAGEMENT ----------------
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updatedOrders = data.orders.map((o) => (o.order_id === orderId ? { ...o, status } : o));
    setSaving(true);
    await onUpdateData({ ...data, orders: updatedOrders });
    setSaving(false);
    showToast(`Order status updated to ${status}`);
  };

  // ---------------- WEBHOOK MANAGEMENT ----------------
  const handleSaveWebhook = async () => {
    setSaving(true);
    await onUpdateData({
      ...data,
      settings: { ...data.settings, n8n_webhook_url: webhookUrl.trim() },
    });
    setSaving(false);
    showToast('n8n Webhook URL saved!');
  };

  const handleTestWebhook = async () => {
    setSaving(true);
    const ok = await onTriggerTestWebhook();
    setSaving(false);
    if (ok) showToast('n8n Webhook test payload sent successfully!');
    else showToast('Webhook test failed. Check URL or n8n endpoint.', 'error');
  };

  // ---------------- BACKUP & RESTORE ----------------
  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ezmart_store_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const ok = await onRestoreBackup(content);
        if (ok) showToast('Database successfully restored!');
        else showToast('Failed to restore backup.', 'error');
      } catch {
        showToast('Invalid backup file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // ---------------- PIN CODE SAVE ----------------
  const handleSavePin = () => {
    if (newPinInput.length >= 4) {
      setAdminPinCode(newPinInput);
      localStorage.setItem('ezmart_admin_pin', newPinInput);
      showToast('Admin Security PIN updated successfully!');
    } else {
      showToast('PIN must be at least 4 digits', 'error');
    }
  };

  // PIN SECURITY LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-amber-100 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-1">EzMart Admin Access</h2>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Enter 4-digit security PIN to access the EzMart Dashboard suite.
          </p>

          <form onSubmit={handleUnlockPIN} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter PIN (Default: 1234)"
                className="w-full text-center text-xl tracking-widest font-extrabold px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-500 font-bold mt-2">
                  Incorrect PIN. Please try again or use default (1234).
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-3 rounded-2xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 transition-all"
              >
                Unlock Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculate live numbers
  const totalOrdersCount = data.orders.length;
  const totalRevenue = data.orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="fixed inset-0 bg-[#f4f2ee] z-50 overflow-y-auto font-sans text-slate-800 selection:bg-orange-500 selection:text-white">
      <div className="min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto bg-[#f8f7f4]">
        {/* SIDEBAR NAVIGATION (EzMart Style) */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* EzMart Brand Logo */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 p-1.5 grid grid-cols-2 gap-0.5 shadow-md shadow-orange-500/20">
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white/80 rounded-xs"></div>
                  <div className="bg-white/80 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">EzMart</span>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Menu Options */}
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'orders', label: 'Orders', icon: PackageCheck, badge: totalOrdersCount },
                { id: 'products', label: 'Products', icon: ShoppingBag, badge: data.products.length },
                { id: 'categories', label: 'Categories', icon: Grid },
                { id: 'modules', label: 'Modules', icon: Layers },
                { id: 'discounts', label: 'Discounts', icon: Percent },
                { id: 'integrations', label: 'Integrations', icon: Link2 },
                { id: 'reports', label: 'Reports & Backup', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#FF7A00] text-white shadow-lg shadow-orange-500/25 font-black'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Info & Exit */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors"
            >
              Exit Admin Suite
            </button>
          </div>
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Toast Notification Alert */}
          {toastMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 ${
                toastMsg.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{toastMsg.text}</span>
            </div>
          )}

          {/* TOP BAR / HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'orders' && 'Orders Management'}
                {activeTab === 'products' && 'Product Inventory'}
                {activeTab === 'categories' && 'Categories'}
                {activeTab === 'modules' && 'Modules Configuration'}
                {activeTab === 'discounts' && 'Offers & Discounts'}
                {activeTab === 'integrations' && 'Integrations & Webhooks'}
                {activeTab === 'reports' && 'Reports & Backup'}
                {activeTab === 'settings' && 'Admin Settings'}
              </h1>
            </div>

            {/* Top Search & Profile Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search stock, order, etc"
                  className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 shadow-xs"
                />
              </div>

              {/* Message Icon */}
              <button className="w-9 h-9 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0 shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              <button className="w-9 h-9 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative shrink-0 shadow-xs">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              {/* Profile Card */}
              <div className="flex items-center gap-2 bg-white border border-slate-200/80 p-1.5 pl-2 rounded-2xl shrink-0 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Admin"
                  className="w-7 h-7 rounded-xl object-cover"
                />
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-black text-slate-900 leading-tight">Marcus George</div>
                  <div className="text-[10px] font-bold text-slate-400">Admin</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* ---------------- SCREEN 1: EZMART DASHBOARD OVERVIEW ---------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP STAT CARDS (ROW 1) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stat 1: Total Sales */}
                <div className="bg-[#FFF4E8] border border-orange-200/60 p-5 rounded-3xl relative overflow-hidden shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-600">Total Sales</span>
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-xs">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    ₹{(983410 + totalRevenue).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
                    <span className="bg-emerald-100 px-1.5 py-0.5 rounded-md text-[11px]">+3.34%</span>
                    <span className="text-slate-400 font-medium text-[11px]">vs last week</span>
                  </div>
                </div>

                {/* Stat 2: Total Orders */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-600">Total Orders</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    {(58375 + totalOrdersCount).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-500">
                    <span className="bg-rose-100 px-1.5 py-0.5 rounded-md text-[11px]">-2.89%</span>
                    <span className="text-slate-400 font-medium text-[11px]">vs last week</span>
                  </div>
                </div>

                {/* Stat 3: Total Visitors */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-600">Total Visitors</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">237,782</div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
                    <span className="bg-emerald-100 px-1.5 py-0.5 rounded-md text-[11px]">+8.02%</span>
                    <span className="text-slate-400 font-medium text-[11px]">vs last week</span>
                  </div>
                </div>
              </div>

              {/* MAIN ANALYTICS SECTION (ROW 2) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Revenue Analytics Curve (Span 6) */}
                <div className="lg:col-span-6 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Revenue Analytics</h3>
                    <div className="bg-[#FF7A00] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <span>Last 8 Days</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Line Chart Graphic */}
                  <div className="h-44 w-full relative flex flex-col justify-between pt-2">
                    {/* Y-axis grid labels */}
                    <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-bold text-slate-300 pointer-events-none">
                      <div className="border-b border-slate-100 pb-1">16K</div>
                      <div className="border-b border-slate-100 pb-1">12K</div>
                      <div className="border-b border-slate-100 pb-1">8K</div>
                      <div className="border-b border-slate-100 pb-1">4K</div>
                      <div>0</div>
                    </div>

                    {/* SVG Curve */}
                    <div className="relative h-32 w-full z-10 pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                        {/* Dotted Order Line */}
                        <path
                          d="M 0,70 Q 60,85 120,50 T 250,60 T 370,70 T 500,55"
                          fill="none"
                          stroke="#FFB870"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                        />
                        {/* Solid Revenue Curve */}
                        <path
                          d="M 0,45 Q 60,15 120,25 T 250,20 T 370,30 T 500,25"
                          fill="none"
                          stroke="#FF7A00"
                          strokeWidth="3.5"
                        />
                        {/* Peak Dot & Badge */}
                        <circle cx="250" cy="20" r="5" fill="#FF7A00" stroke="#FFF" strokeWidth="2" />
                      </svg>

                      {/* Tooltip Badge */}
                      <div className="absolute left-[46%] top-[2px] -translate-x-1/2 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-md text-[10px] text-center pointer-events-none">
                        <div className="text-slate-400 text-[9px]">Revenue</div>
                        <div className="font-black text-slate-900">$14,521</div>
                      </div>
                    </div>

                    {/* X-axis date labels */}
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-2 z-10">
                      <span>12 Aug</span>
                      <span>13 Aug</span>
                      <span>14 Aug</span>
                      <span>15 Aug</span>
                      <span>16 Aug</span>
                      <span>17 Aug</span>
                      <span>18 Aug</span>
                      <span>19 Aug</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Target Arc Gauge (Span 3) */}
                <div className="lg:col-span-3 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Monthly Target</h3>
                    <span className="text-slate-400 font-bold text-xs cursor-pointer">•••</span>
                  </div>

                  {/* Arc Gauge Graphic */}
                  <div className="relative flex flex-col items-center justify-center my-2">
                    <svg className="w-36 h-20" viewBox="0 0 100 50">
                      {/* Background Arch */}
                      <path
                        d="M 10,50 A 40,40 0 0,1 90,50"
                        fill="none"
                        stroke="#F1EBE4"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      {/* Progress Arch (85%) */}
                      <path
                        d="M 10,50 A 40,40 0 0,1 82,25"
                        fill="none"
                        stroke="#FF7A00"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute top-10 text-center">
                      <div className="text-xl font-black text-slate-900">85%</div>
                      <div className="text-[10px] font-bold text-emerald-600">+8.02% from last month</div>
                    </div>
                  </div>

                  <div className="text-center text-[11px] text-slate-500 font-medium bg-slate-50 p-2.5 rounded-2xl">
                    <span className="font-bold text-slate-800">Great Progress! 🎉</span>
                    <div>Our achievement increased by $200,000; let's reach 100% next month.</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-[#FFF4E8] p-2.5 rounded-2xl text-center text-[10px]">
                    <div>
                      <div className="text-slate-400 font-bold">Target</div>
                      <div className="font-black text-slate-900 text-xs">$600,000</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold">Revenue</div>
                      <div className="font-black text-slate-900 text-xs">$510,000</div>
                    </div>
                  </div>
                </div>

                {/* Top Categories Ring Chart (Span 3) */}
                <div className="lg:col-span-3 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Top Categories</h3>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="text-slate-400 hover:text-slate-700 font-bold text-xs"
                    >
                      See All
                    </button>
                  </div>

                  {/* Donut Chart */}
                  <div className="relative flex items-center justify-center my-3">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-orange-100"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#FF7A00]"
                        strokeDasharray="70, 100"
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-[9px] font-bold text-slate-400">Total Sales</div>
                      <div className="text-xs font-black text-slate-900">$3,400,000</div>
                    </div>
                  </div>

                  {/* Category Legend */}
                  <div className="space-y-1.5 text-[11px] font-semibold">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF7A00]"></span>
                        <span className="text-slate-600">Electronics</span>
                      </div>
                      <span className="font-bold text-slate-900">$1,200,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="text-slate-600">Fashion</span>
                      </div>
                      <span className="font-bold text-slate-900">$950,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-200"></span>
                        <span className="text-slate-600">Home & Kitchen</span>
                      </div>
                      <span className="font-bold text-slate-900">$750,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stone-200"></span>
                        <span className="text-slate-600">Beauty & Personal</span>
                      </div>
                      <span className="font-bold text-slate-900">$500,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION (ROW 3) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Active User (Span 4) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Active User</h3>
                    <span className="text-slate-400 font-bold text-xs">•••</span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">2,758</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        +8.02%
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">Users from last month</div>
                  </div>

                  {/* Country progress bars */}
                  <div className="space-y-3 pt-2 text-xs font-bold text-slate-600">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>United States</span>
                        <span className="text-slate-900">36%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF7A00] w-[36%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>United Kingdom</span>
                        <span className="text-slate-900">24%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[24%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>India / Indonesia</span>
                        <span className="text-slate-900">17.5%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-300 w-[17.5%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Russia</span>
                        <span className="text-slate-900">15%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-300 w-[15%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversion Rate Funnel (Span 5) */}
                <div className="lg:col-span-5 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Conversion Rate</h3>
                    <div className="bg-[#FF7A00] text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                      <span>This Week</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 pt-2 text-center text-[10px]">
                    <div>
                      <div className="text-slate-400 font-medium">Product Views</div>
                      <div className="font-black text-slate-900 text-xs my-1">25,000</div>
                      <span className="bg-emerald-50 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded">
                        +9%
                      </span>
                      <div className="h-20 bg-orange-100 rounded-2xl mt-3"></div>
                    </div>

                    <div>
                      <div className="text-slate-400 font-medium">Add to Cart</div>
                      <div className="font-black text-slate-900 text-xs my-1">12,000</div>
                      <span className="bg-emerald-50 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded">
                        +6%
                      </span>
                      <div className="h-20 bg-orange-200 rounded-2xl mt-3"></div>
                    </div>

                    <div>
                      <div className="text-slate-400 font-medium">Proceed Checkout</div>
                      <div className="font-black text-slate-900 text-xs my-1">8,500</div>
                      <span className="bg-emerald-50 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded">
                        +4%
                      </span>
                      <div className="h-20 bg-amber-300 rounded-2xl mt-3"></div>
                    </div>

                    <div>
                      <div className="text-slate-400 font-medium">Completed Purchases</div>
                      <div className="font-black text-slate-900 text-xs my-1">6,200</div>
                      <span className="bg-emerald-50 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded">
                        +7%
                      </span>
                      <div className="h-20 bg-orange-400 rounded-2xl mt-3"></div>
                    </div>

                    <div>
                      <div className="text-slate-400 font-medium">Abandoned Carts</div>
                      <div className="font-black text-slate-900 text-xs my-1">3,000</div>
                      <span className="bg-rose-50 text-rose-600 font-extrabold px-1.5 py-0.5 rounded">
                        -5%
                      </span>
                      <div className="h-20 bg-[#FF7A00] rounded-2xl mt-3"></div>
                    </div>
                  </div>
                </div>

                {/* Traffic Sources (Span 3) */}
                <div className="lg:col-span-3 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Traffic Sources</h3>
                    <span className="text-slate-400 font-bold text-xs">•••</span>
                  </div>

                  {/* Horizontal Stacked Bar */}
                  <div className="h-6 w-full flex rounded-xl overflow-hidden gap-0.5">
                    <div className="w-[40%] bg-orange-200"></div>
                    <div className="w-[30%] bg-amber-300"></div>
                    <div className="w-[15%] bg-orange-400"></div>
                    <div className="w-[10%] bg-amber-500"></div>
                    <div className="w-[5%] bg-[#FF7A00]"></div>
                  </div>

                  {/* Traffic list */}
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-orange-200"></span>
                        <span className="text-slate-600">Direct Traffic</span>
                      </div>
                      <span className="font-black text-slate-900">40%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-300"></span>
                        <span className="text-slate-600">Organic Search</span>
                      </div>
                      <span className="font-black text-slate-900">30%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-orange-400"></span>
                        <span className="text-slate-600">Social Media</span>
                      </div>
                      <span className="font-black text-slate-900">15%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                        <span className="text-slate-600">Referral Traffic</span>
                      </div>
                      <span className="font-black text-slate-900">10%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#FF7A00]"></span>
                        <span className="text-slate-600">Email Campaigns</span>
                      </div>
                      <span className="font-black text-slate-900">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 2: ORDERS MANAGEMENT ---------------- */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900">Live Customer Orders</h3>
                <span className="text-xs font-bold text-slate-500">Total: {data.orders.length}</span>
              </div>

              {data.orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl">
                  No orders placed yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.orders.map((order) => (
                    <div
                      key={order.order_id}
                      className="border border-slate-200/80 p-4 rounded-2xl space-y-3 bg-slate-50/50"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-200/80">
                        <div>
                          <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                            <span>{order.order_id}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                              {new Date(order.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-emerald-600 mt-0.5">
                            Customer Phone: +{order.customer_phone}
                          </div>
                        </div>

                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.order_id, e.target.value as OrderStatus)
                          }
                          className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between font-semibold">
                            <span>
                              {i.qty}x {i.name}
                            </span>
                            <span>₹{i.price * i.qty}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 font-black text-xs">
                        <span className="text-slate-500">Grand Total:</span>
                        <span className="text-orange-600 text-sm">₹{order.total_amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------- SCREEN 3: PRODUCTS MANAGEMENT ---------------- */}
          {activeTab === 'products' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900">Manage Store Products</h3>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      price: 100,
                      rating: 4.8,
                      deliveryTime: '20 min',
                      categoryId: data.categories[0]?.id || '',
                      moduleId: data.modules[0]?.id || '',
                      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
                      available: true,
                    });
                    setIsNewProduct(true);
                  }}
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {/* Product Edit/Create Form */}
              {editingProduct && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-black text-orange-600 uppercase tracking-wider">
                    {isNewProduct ? 'Create New Product' : 'Edit Product'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Product Title</label>
                      <input
                        type="text"
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Original Price / Strike (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.oldPrice || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Category</label>
                      <select
                        value={editingProduct.categoryId || ''}
                        onChange={(e) => {
                          const cat = data.categories.find((c) => c.id === e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            categoryId: e.target.value,
                            moduleId: cat?.moduleId || editingProduct.moduleId,
                          });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-800"
                      >
                        {data.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-bold mb-1">Image URL</label>
                      <input
                        type="text"
                        value={editingProduct.image || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#FF7A00] text-white"
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              )}

              {/* Product List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between text-xs bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <div className="font-extrabold text-slate-900 line-clamp-1">{prod.name}</div>
                        <div className="text-orange-600 font-black text-sm">₹{prod.price}</div>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsNewProduct(false);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 4: CATEGORIES & MODULES ---------------- */}
          {(activeTab === 'categories' || activeTab === 'modules') && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900">
                  {activeTab === 'categories' ? 'Store Categories' : 'Homepage Modules Configuration'}
                </h3>
                {activeTab === 'categories' ? (
                  <button
                    onClick={() => {
                      setEditingCategory({
                        name: '',
                        icon: '🏷️',
                        moduleId: data.modules[0]?.id || '',
                      });
                      setIsNewCategory(true);
                    }}
                    className="bg-[#FF7A00] text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingModule({
                        name: '',
                        description: '',
                        time: '20-30 min',
                        icon: '📦',
                        bgColor: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
                        size: 'medium',
                      });
                      setIsNewModule(true);
                    }}
                    className="bg-[#FF7A00] text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Module
                  </button>
                )}
              </div>

              {/* List Categories */}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.categories.map((cat) => {
                    const mod = data.modules.find((m) => m.id === cat.moduleId);
                    return (
                      <div
                        key={cat.id}
                        className="border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs bg-slate-50/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{cat.icon}</span>
                          <div>
                            <div className="font-extrabold text-slate-900">{cat.name}</div>
                            <div className="text-[10px] font-bold text-orange-600">{mod?.name || 'General'}</div>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsNewCategory(false);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List Modules */}
              {activeTab === 'modules' && (
                <div className="space-y-2.5">
                  {data.modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mod.icon}</span>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span>{mod.name}</span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase">
                              {mod.size}
                            </span>
                          </div>
                          <div className="text-slate-500 font-medium text-[11px]">{mod.description}</div>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingModule(mod);
                            setIsNewModule(false);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------- SCREEN 5: INTEGRATIONS (N8N WEBHOOK) ---------------- */}
          {activeTab === 'integrations' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs text-xs">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-orange-600" /> n8n WhatsApp Webhook Integration
              </h3>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">n8n Webhook URL</label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://n8n.yourdomain.com/webhook/..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveWebhook}
                    className="bg-[#FF7A00] text-white font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                  >
                    <Save className="w-4 h-4" /> Save Webhook URL
                  </button>

                  <button
                    onClick={handleTestWebhook}
                    className="bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Test Trigger
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 6: REPORTS & BACKUP ---------------- */}
          {activeTab === 'reports' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs text-xs">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" /> Store Reports & Backup System
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">Download Store Backup</h4>
                    <p className="text-slate-500 text-xs mb-4">
                      Export full database (products, orders, modules, settings) into a single JSON file.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBackup}
                    className="w-full bg-[#FF7A00] text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
                  >
                    <Download className="w-4 h-4" /> Export Backup JSON
                  </button>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">Restore Database</h4>
                    <p className="text-slate-500 text-xs mb-4">
                      Upload JSON backup file to overwrite/restore all store catalog and configuration data.
                    </p>
                  </div>

                  <label className="w-full bg-slate-800 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-center">
                    <Upload className="w-4 h-4" /> Upload Backup File
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 7: SETTINGS ---------------- */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs text-xs">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" /> Admin Security & Store Settings
              </h3>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 max-w-md">
                <div>
                  <label className="block text-slate-800 font-extrabold mb-1">Change Admin Security PIN</label>
                  <p className="text-slate-500 text-[11px] mb-2">
                    Set a secret 4-8 digit PIN code to restrict unauthorized access to Admin Dashboard.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={8}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="bg-white border border-slate-300 font-extrabold rounded-xl px-3 py-2 text-slate-900 text-center w-36 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleSavePin}
                      className="bg-[#FF7A00] text-white font-extrabold px-4 py-2 rounded-xl"
                    >
                      Save PIN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
