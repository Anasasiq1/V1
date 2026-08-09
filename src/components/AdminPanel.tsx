import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  AppData,
  Module,
  Category,
  Product,
  PromoBanner,
  OrderStatus,
  ModuleSize,
  DeliverySlot,
} from '../types';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Users,
  FileText,
  Percent,
  Link2,
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
  Save,
  RefreshCw,
  Check,
  DollarSign,
  ShoppingCart,
  X,
  Layers,
  Grid,
  Image as ImageIcon,
  UploadCloud,
  FileArchive,
  Store,
  Sparkles,
  Tag,
  Eye,
  Clock,
  Zap,
  Truck,
  AlertTriangle,
  Package,
  MessageCircle,
  Send,
  ExternalLink,
  Share2,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Copy,
} from 'lucide-react';

interface AdminPanelProps {
  data: AppData;
  onUpdateData: (newData: AppData) => Promise<void>;
  onTriggerTestWebhook: () => Promise<boolean>;
  onRestoreBackup: (fileContent: string) => Promise<boolean>;
  onClose: () => void;
  onTestPWAInstallPrompt?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  data,
  onUpdateData,
  onTriggerTestWebhook,
  onRestoreBackup,
  onClose,
  onTestPWAInstallPrompt,
}) => {
  // Security PIN state
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [adminPinCode, setAdminPinCode] = useState(
    data.settings?.admin_pin || localStorage.getItem('ezmart_admin_pin') || '1234'
  );

  // Active Admin Sidebar tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'categories'
    | 'modules'
    | 'delivery'
    | 'integrations'
    | 'reports'
    | 'settings'
    | 'pwa'
    | 'whatsapp'
    | 'payments'
  >('dashboard');

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter states
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock'>('all');

  // Form states for Modules
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [isNewModule, setIsNewModule] = useState(false);

  // Form states for Categories
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Form states for Products
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Delivery Slots state
  const defaultSlots: DeliverySlot[] = [
    { id: 'slot-1', time: '11:00 AM', label: 'Morning Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-2', time: '12:00 PM', label: 'Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)', fee: 0, isFree: true, isActive: true },
    { id: 'slot-3', time: '01:00 PM', label: 'Post Lunch Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-4', time: '03:00 PM', label: 'Afternoon Slot', fee: 0, isFree: true, isActive: true },
    { id: 'slot-5', time: '05:00 PM', label: 'Evening Batch', fee: 0, isFree: true, isActive: true },
  ];

  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>(
    data.settings?.delivery_slots && data.settings.delivery_slots.length > 0
      ? data.settings.delivery_slots
      : defaultSlots
  );

  const [expressFeeInput, setExpressFeeInput] = useState<number>(
    data.settings?.express_delivery_fee ?? 40
  );

  const [editingSlot, setEditingSlot] = useState<Partial<DeliverySlot> | null>(null);
  const [isNewSlot, setIsNewSlot] = useState(false);

  // Settings & Branding state
  const [webhookUrl, setWebhookUrl] = useState(data.settings?.n8n_webhook_url || '');
  const [storeName, setStoreName] = useState(data.settings?.store_name || 'WhatsApp Hyperlocal Store');
  const [adminLogo, setAdminLogo] = useState(data.settings?.admin_logo || '');
  const [newPinInput, setNewPinInput] = useState(adminPinCode);

  // PWA Settings State
  const [pwaEnabled, setPwaEnabled] = useState<boolean>(data.settings?.pwa_enabled !== false);
  const [pwaName, setPwaName] = useState(data.settings?.pwa_name || data.settings?.store_name || 'Hyperlocal WhatsApp Store');
  const [pwaShortName, setPwaShortName] = useState(data.settings?.pwa_short_name || 'HyperlocalApp');
  const [pwaDescription, setPwaDescription] = useState(data.settings?.pwa_description || 'Fastest 15-minute hyperlocal delivery store directly integrated with WhatsApp. Order groceries, food, meat & essentials with 1-click.');
  const [pwaIcon, setPwaIcon] = useState(data.settings?.pwa_icon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80');
  const [pwaThemeColor, setPwaThemeColor] = useState(data.settings?.pwa_theme_color || '#059669');
  const [pwaBgColor, setPwaBgColor] = useState(data.settings?.pwa_bg_color || '#f8fafc');

  // WhatsApp Routing Settings State
  const [sendToCustomerWhatsapp, setSendToCustomerWhatsapp] = useState<boolean>(data.settings?.send_to_customer_whatsapp !== false);
  const [whatsappMode, setWhatsappMode] = useState<'both' | 'customer_only' | 'store_only'>(data.settings?.whatsapp_mode || 'both');
  const [customerWaAutoOpen, setCustomerWaAutoOpen] = useState<boolean>(data.settings?.customer_wa_auto_open !== false);
  const [storeWhatsappPhone, setStoreWhatsappPhone] = useState(data.settings?.store_whatsapp_phone || data.settings?.store_phone || '919876543210');

  const handleSaveWhatsappSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      send_to_customer_whatsapp: sendToCustomerWhatsapp,
      whatsapp_mode: whatsappMode,
      customer_wa_auto_open: customerWaAutoOpen,
      store_whatsapp_phone: storeWhatsappPhone,
    };
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('WhatsApp Order Routing & Customer settings saved!');
  };

  // Payment Options & UPI Settings State
  const [codEnabled, setCodEnabled] = useState<boolean>(data.settings?.cod_enabled !== false);
  const [upiEnabled, setUpiEnabled] = useState<boolean>(data.settings?.upi_enabled !== false);
  const [walletEnabled, setWalletEnabled] = useState<boolean>(data.settings?.wallet_enabled !== false);
  const [walletDemoBalance, setWalletDemoBalance] = useState<number>(data.settings?.wallet_demo_balance ?? 500);
  const [upiId, setUpiId] = useState(data.settings?.upi_id || '9876543210@paytm');
  const [upiPhone, setUpiPhone] = useState(data.settings?.upi_phone || '9876543210');
  const [upiPayeeName, setUpiPayeeName] = useState(data.settings?.upi_payee_name || data.settings?.store_name || 'Hyperlocal Store');
  const [upiQrImage, setUpiQrImage] = useState(data.settings?.upi_qr_image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80');

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      cod_enabled: codEnabled,
      upi_enabled: upiEnabled,
      wallet_enabled: walletEnabled,
      wallet_demo_balance: walletDemoBalance,
      upi_id: upiId,
      upi_phone: upiPhone,
      upi_payee_name: upiPayeeName,
      upi_qr_image: upiQrImage,
    };
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('Payment Options, Wallet Gateway & Personal UPI configuration saved successfully!');
  };

  // WhatsApp Notification State
  const [whatsappModalOrder, setWhatsappModalOrder] = useState<{
    order: AppData['orders'][0];
    status: OrderStatus;
  } | null>(null);
  const [customWhatsappNote, setCustomWhatsappNote] = useState<string>('');
  const [autoOpenWhatsapp, setAutoOpenWhatsapp] = useState<boolean>(true);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUnlockPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === adminPinCode || pin === '1234' || pin === data.settings?.admin_pin) {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  // Helper for reading uploaded image files to base64 Data URL
  const handleImageFileRead = (
    file: File,
    onSuccess: (base64Url: string) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size should be less than 10MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string);
        showToast('Image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // ---------------- MODULES MANAGEMENT ----------------
  const handleSaveModule = async () => {
    if (!editingModule?.name?.trim()) return showToast('Module name is required', 'error');

    let updatedModules = [...data.modules];
    if (isNewModule) {
      const newMod: Module = {
        id: 'mod-' + Date.now(),
        name: editingModule.name.trim(),
        description: editingModule.description || '',
        time: editingModule.time || '20-30 min',
        icon: editingModule.icon || '📦',
        image: editingModule.image || '',
        bgColor: editingModule.bgColor || 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
        size: (editingModule.size as ModuleSize) || 'medium',
        order: updatedModules.length + 1,
        badge: editingModule.badge || '',
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
    if (confirm('Are you sure you want to delete this module? Categories associated with this module may lose their parent link.')) {
      const updated = data.modules.filter((m) => m.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, modules: updated });
      setSaving(false);
      showToast('Module deleted');
    }
  };

  // ---------------- CATEGORIES MANAGEMENT ----------------
  const handleSaveCategory = async () => {
    if (!editingCategory?.name?.trim()) return showToast('Category name is required', 'error');
    if (!editingCategory?.moduleId) return showToast('Please select a module for this category', 'error');

    let updatedCategories = [...data.categories];
    if (isNewCategory) {
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: editingCategory.name.trim(),
        moduleId: editingCategory.moduleId,
        icon: editingCategory.icon || '🏷️',
        image: editingCategory.image || '',
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
    showToast('Category saved successfully!');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updated = data.categories.filter((c) => c.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, categories: updated });
      setSaving(false);
      showToast('Category deleted');
    }
  };

  // ---------------- PRODUCTS MANAGEMENT ----------------
  const handleSaveProduct = async () => {
    if (!editingProduct?.name?.trim()) return showToast('Product name is required', 'error');
    if (!editingProduct?.price || Number(editingProduct.price) <= 0)
      return showToast('Valid price is required', 'error');

    let updatedProducts = [...data.products];
    if (isNewProduct) {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: editingProduct.name.trim(),
        price: Number(editingProduct.price),
        oldPrice: editingProduct.oldPrice ? Number(editingProduct.oldPrice) : undefined,
        categoryId: editingProduct.categoryId || (data.categories[0]?.id ?? ''),
        moduleId: editingProduct.moduleId || (data.modules[0]?.id ?? ''),
        rating: editingProduct.rating ? Number(editingProduct.rating) : 4.8,
        deliveryTime: editingProduct.deliveryTime || '20 min',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
        description: editingProduct.description || '',
        variants: editingProduct.variants || [],
        available: editingProduct.available !== false,
        stock: editingProduct.stock !== undefined ? Number(editingProduct.stock) : 10,
        stock_alert_threshold:
          editingProduct.stock_alert_threshold !== undefined
            ? Number(editingProduct.stock_alert_threshold)
            : 5,
      };
      updatedProducts.push(newProd);
    } else {
      updatedProducts = updatedProducts.map((p) =>
        p.id === editingProduct.id
          ? ({
              ...p,
              ...editingProduct,
              stock:
                editingProduct.stock !== undefined
                  ? Number(editingProduct.stock)
                  : (p.stock ?? 10),
              stock_alert_threshold:
                editingProduct.stock_alert_threshold !== undefined
                  ? Number(editingProduct.stock_alert_threshold)
                  : (p.stock_alert_threshold ?? 5),
            } as Product)
          : p
      );
    }

    setSaving(true);
    await onUpdateData({ ...data, products: updatedProducts });
    setSaving(false);
    setEditingProduct(null);
    showToast('Product saved successfully!');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = data.products.filter((p) => p.id !== id);
      setSaving(true);
      await onUpdateData({ ...data, products: updated });
      setSaving(false);
      showToast('Product deleted');
    }
  };

  // ---------------- DELIVERY SLOTS & EXPRESS FEES ----------------
  const handleSaveSlot = async () => {
    if (!editingSlot?.time?.trim()) return showToast('Time is required for delivery slot', 'error');

    let updatedSlots = [...deliverySlots];
    if (isNewSlot) {
      const newSlot: DeliverySlot = {
        id: 'slot-' + Date.now(),
        time: editingSlot.time.trim(),
        label: editingSlot.label?.trim() || 'Scheduled Slot',
        fee: Number(editingSlot.fee || 0),
        isFree: Number(editingSlot.fee || 0) === 0,
        isActive: editingSlot.isActive !== false,
      };
      updatedSlots.push(newSlot);
    } else {
      updatedSlots = updatedSlots.map((s) =>
        s.id === editingSlot.id
          ? ({
              ...s,
              ...editingSlot,
              fee: Number(editingSlot.fee || 0),
              isFree: Number(editingSlot.fee || 0) === 0,
            } as DeliverySlot)
          : s
      );
    }

    setDeliverySlots(updatedSlots);
    const updatedSettings = {
      ...data.settings,
      delivery_slots: updatedSlots,
      express_delivery_fee: expressFeeInput,
    };
    setSaving(true);
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    setEditingSlot(null);
    showToast('Delivery slot saved successfully!');
  };

  const handleDeleteSlot = async (id: string) => {
    if (confirm('Are you sure you want to delete this delivery slot?')) {
      const updated = deliverySlots.filter((s) => s.id !== id);
      setDeliverySlots(updated);
      const updatedSettings = {
        ...data.settings,
        delivery_slots: updated,
        express_delivery_fee: expressFeeInput,
      };
      setSaving(true);
      await onUpdateData({ ...data, settings: updatedSettings });
      setSaving(false);
      showToast('Delivery slot deleted');
    }
  };

  const handleToggleSlotActive = async (id: string) => {
    const updated = deliverySlots.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setDeliverySlots(updated);
    const updatedSettings = {
      ...data.settings,
      delivery_slots: updated,
      express_delivery_fee: expressFeeInput,
    };
    setSaving(true);
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('Slot status updated!');
  };

  const handleSaveExpressFee = async () => {
    const updatedSettings = {
      ...data.settings,
      delivery_slots: deliverySlots,
      express_delivery_fee: Number(expressFeeInput),
    };
    setSaving(true);
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('Express Delivery Fee updated!');
  };

  // ---------------- PWA APP SETTINGS HANDLER ----------------
  const handleSavePwaSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      pwa_enabled: pwaEnabled,
      pwa_name: pwaName,
      pwa_short_name: pwaShortName,
      pwa_description: pwaDescription,
      pwa_icon: pwaIcon,
      pwa_theme_color: pwaThemeColor,
      pwa_bg_color: pwaBgColor,
    };
    await onUpdateData({ ...data, settings: updatedSettings });
    setSaving(false);
    showToast('PWA Mobile App settings saved successfully!');
  };

  // ---------------- ORDERS & AUTOMATED WHATSAPP NOTIFICATIONS ----------------
  const buildWhatsAppMessage = (
    order: AppData['orders'][0],
    status: OrderStatus,
    sName: string,
    customNote?: string
  ) => {
    let cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone; // Add India country code if 10 digits
    }

    const statusEmojis: Record<OrderStatus, string> = {
      'Order Placed': '📦',
      'Preparing': '🍳',
      'Packing': '📦',
      'Out for Delivery': '🛵',
      'Delivered': '🎉',
      'Cancelled': '❌',
    };

    const statusTexts: Record<OrderStatus, string> = {
      'Order Placed': 'Your order has been confirmed and received.',
      'Preparing': 'Your order is currently being prepared with care.',
      'Packing': 'Your order is being packed and made ready for dispatch.',
      'Out for Delivery': 'Your order is out for delivery and on its way to your address!',
      'Delivered': 'Your order has been successfully delivered. Thank you for shopping with us!',
      'Cancelled': 'Your order has been cancelled. Please contact customer support if you have questions.',
    };

    const emoji = statusEmojis[status] || '📋';
    const statusDesc = statusTexts[status] || `Status updated to ${status}`;

    let message = `*${sName} - Order Status Update* ${emoji}\n\n` +
      `Hello! Your order *#${order.order_id}* status is now: *${status}*\n\n` +
      `ℹ️ *Details:* ${statusDesc}\n` +
      `💰 *Total Amount:* ₹${order.total_amount}\n`;

    if (order.delivery_slot_time) {
      message += `⏰ *Delivery Slot:* ${order.delivery_slot_time}\n`;
    }

    if (order.items && order.items.length > 0) {
      message += `\n📦 *Order Items:*\n` + order.items.map((i) => `• ${i.qty}x ${i.name}`).join('\n') + `\n`;
    }

    if (customNote && customNote.trim()) {
      message += `\n💬 *Note from Store:* ${customNote.trim()}\n`;
    }

    message += `\nThank you for choosing *${sName}*! 🙏`;

    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : '';
    return { message, whatsappUrl, cleanPhone };
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const targetOrder = data.orders.find((o) => o.order_id === orderId);
    const updatedOrders = data.orders.map((o) => (o.order_id === orderId ? { ...o, status } : o));
    setSaving(true);
    await onUpdateData({ ...data, orders: updatedOrders });
    setSaving(false);

    if (targetOrder) {
      const updatedOrder = { ...targetOrder, status };
      showToast(`Order #${orderId} status updated to "${status}"!`);

      // Construct pre-filled WhatsApp link
      const { whatsappUrl } = buildWhatsAppMessage(
        updatedOrder,
        status,
        data.settings?.store_name || storeName || 'Hyperlocal Store'
      );

      // Trigger automatic WhatsApp open if feature enabled
      if (autoOpenWhatsapp && whatsappUrl) {
        window.open(whatsappUrl, '_blank');
      }

      // Open notification modal for review or manual resend/custom note
      setWhatsappModalOrder({ order: updatedOrder, status });
      setCustomWhatsappNote('');
    }
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

  // ---------------- STORE SETTINGS & ADMIN BRANDING ----------------
  const handleSaveSettings = async () => {
    setSaving(true);
    const updatedSettings = {
      ...data.settings,
      store_name: storeName.trim(),
      admin_logo: adminLogo,
      admin_pin: newPinInput.length >= 4 ? newPinInput : data.settings.admin_pin,
    };
    if (newPinInput.length >= 4) {
      setAdminPinCode(newPinInput);
      localStorage.setItem('ezmart_admin_pin', newPinInput);
    }
    await onUpdateData({
      ...data,
      settings: updatedSettings,
    });
    setSaving(false);
    showToast('Admin Branding & Settings saved successfully!');
  };

  // ---------------- ZIP BACKUP EXPORT & RESTORE ----------------
  const handleDownloadZipBackup = async () => {
    try {
      setSaving(true);
      showToast('Generating full ZIP backup archive with images...', 'success');
      const zip = new JSZip();

      // 1. Raw database JSON file
      zip.file('database.json', JSON.stringify(data, null, 2));

      // 2. Folder for standalone extracted images
      const imgFolder = zip.folder('images');
      let imgCounter = 1;

      const extractImageAndGetRelPath = (base64OrUrl: string | undefined, prefix: string): string => {
        if (!base64OrUrl) return '';
        if (base64OrUrl.startsWith('data:image/')) {
          const parts = base64OrUrl.split(',');
          if (parts.length === 2) {
            const match = parts[0].match(/data:image\/(\w+);base64/);
            const ext = match ? match[1] : 'png';
            const filename = `${prefix}_${imgCounter++}.${ext}`;
            imgFolder?.file(filename, parts[1], { base64: true });
            return `images/${filename}`;
          }
        }
        return base64OrUrl;
      };

      // Create manifest copy with extracted relative image paths
      const dataManifest = JSON.parse(JSON.stringify(data));

      if (dataManifest.settings?.admin_logo) {
        dataManifest.settings.admin_logo = extractImageAndGetRelPath(
          dataManifest.settings.admin_logo,
          'admin_logo'
        );
      }

      if (dataManifest.products) {
        dataManifest.products = dataManifest.products.map((p: any) => ({
          ...p,
          image: extractImageAndGetRelPath(p.image, `prod_${p.id}`),
        }));
      }

      if (dataManifest.categories) {
        dataManifest.categories = dataManifest.categories.map((c: any) => ({
          ...c,
          image: extractImageAndGetRelPath(c.image, `cat_${c.id}`),
        }));
      }

      if (dataManifest.modules) {
        dataManifest.modules = dataManifest.modules.map((m: any) => ({
          ...m,
          image: extractImageAndGetRelPath(m.image, `mod_${m.id}`),
        }));
      }

      zip.file('manifest.json', JSON.stringify(dataManifest, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hyperlocal_full_backup_${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setSaving(false);
      showToast('Full ZIP Backup downloaded successfully!');
    } catch (err: any) {
      setSaving(false);
      showToast('Failed to create ZIP backup: ' + err.message, 'error');
    }
  };

  const handleRestoreZipOrJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.zip')) {
      try {
        setSaving(true);
        const zip = await JSZip.loadAsync(file);
        const dbFile = zip.file('database.json') || zip.file('manifest.json');
        if (!dbFile) {
          setSaving(false);
          return showToast('Invalid ZIP: database.json not found inside zip', 'error');
        }
        const jsonStr = await dbFile.async('string');
        const ok = await onRestoreBackup(jsonStr);
        setSaving(false);
        if (ok) showToast('ZIP Backup database successfully restored!');
        else showToast('Failed to restore database from ZIP.', 'error');
      } catch (err: any) {
        setSaving(false);
        showToast('Error reading ZIP file: ' + err.message, 'error');
      }
    } else {
      // Standard JSON file
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
    }
  };

  // PIN SECURITY LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-amber-100 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30 overflow-hidden p-2">
            {data.settings?.admin_logo ? (
              <img src={data.settings.admin_logo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-1">
            {data.settings?.store_name || 'Admin Suite Access'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Enter security PIN to access the Admin Control Dashboard.
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
                  Incorrect PIN. Try again or use default (1234).
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

  // Low stock products list calculation
  const lowStockProductsList = data.products.filter((p) => {
    const currentStock = p.stock ?? 10;
    const threshold = p.stock_alert_threshold ?? 5;
    return currentStock <= threshold;
  });

  // Filter products for Products screen
  const filteredProductsList = data.products.filter((p) => {
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedModuleFilter !== 'all' && p.moduleId !== selectedModuleFilter) {
      return false;
    }
    if (stockFilter === 'low_stock') {
      const currentStock = p.stock ?? 10;
      const threshold = p.stock_alert_threshold ?? 5;
      if (currentStock > threshold) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-[#f4f2ee] z-50 overflow-y-auto font-sans text-slate-800 selection:bg-orange-500 selection:text-white">
      <div className="min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto bg-[#f8f7f4]">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Custom Admin Brand Logo / Header */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2.5">
                {data.settings?.admin_logo ? (
                  <img
                    src={data.settings.admin_logo}
                    alt="Admin Logo"
                    className="w-9 h-9 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white p-2 flex items-center justify-center shadow-md shadow-orange-500/20">
                    <Store className="w-5 h-5" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <span className="text-base font-black text-slate-900 tracking-tight block truncate">
                    {data.settings?.store_name || 'Admin Suite'}
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 block">Control Dashboard</span>
                </div>
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
                { id: 'categories', label: 'Categories', icon: Grid, badge: data.categories.length },
                { id: 'modules', label: 'Modules', icon: Layers, badge: data.modules.length },
                { id: 'delivery', label: 'Delivery Slots', icon: Clock, badge: deliverySlots.length },
                { id: 'pwa', label: 'PWA Mobile App', icon: Smartphone, badge: 'PWA' },
                { id: 'whatsapp', label: 'Customer WhatsApp', icon: MessageCircle, badge: 'WhatsApp' },
                { id: 'payments', label: 'Payment Options', icon: CreditCard, badge: 'COD / UPI' },
                { id: 'integrations', label: 'n8n Webhook', icon: Link2 },
                { id: 'reports', label: 'Backup & Restore', icon: FileArchive },
                { id: 'settings', label: 'Admin Branding', icon: Settings },
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
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'orders' && 'Orders Management'}
                {activeTab === 'products' && 'Product Inventory & Direct Uploads'}
                {activeTab === 'categories' && 'Module-Wise Categories'}
                {activeTab === 'modules' && 'Modules Configuration'}
                {activeTab === 'delivery' && 'Delivery Slots & Express Delivery Settings'}
                {activeTab === 'pwa' && 'PWA Mobile App Customization'}
                {activeTab === 'integrations' && 'n8n Webhooks Integration'}
                {activeTab === 'reports' && 'Full ZIP & Database Backup'}
                {activeTab === 'settings' && 'Admin Branding & Settings'}
              </h1>
            </div>

            {/* Top Search & Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search products, orders..."
                  className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 shadow-xs"
                />
              </div>

              {/* Quick Save Status */}
              {saving && (
                <div className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </div>
              )}
            </div>
          </div>

          {/* ---------------- SCREEN 1: DASHBOARD OVERVIEW ---------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
                    <span className="bg-emerald-100 px-1.5 py-0.5 rounded-md text-[11px]">Live Sync</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-xs">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-600">Active Modules</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">{data.modules.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {data.categories.length} Categories configured
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS ACTION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-white border border-slate-200 p-5 rounded-3xl text-left hover:border-orange-400 transition-all flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Add / Upload Product</h3>
                    <p className="text-slate-500 text-xs">Direct image upload & price management</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className="bg-white border border-slate-200 p-5 rounded-3xl text-left hover:border-orange-400 transition-all flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Grid className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Module Categories</h3>
                    <p className="text-slate-500 text-xs">Assign categories & logos per module</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="bg-white border border-slate-200 p-5 rounded-3xl text-left hover:border-orange-400 transition-all flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Export ZIP Backup</h3>
                    <p className="text-slate-500 text-xs">Full backup with embedded images</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 2: ORDERS MANAGEMENT ---------------- */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Live Customer Orders</h3>
                  <p className="text-slate-500 text-xs">Manage order statuses & trigger automated WhatsApp updates</p>
                </div>

                {/* Auto-launch WhatsApp Toggle */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <label htmlFor="auto-wa-toggle" className="text-xs font-extrabold text-emerald-900 cursor-pointer select-none">
                    Auto-launch WhatsApp on status update
                  </label>
                  <input
                    id="auto-wa-toggle"
                    type="checkbox"
                    checked={autoOpenWhatsapp}
                    onChange={(e) => setAutoOpenWhatsapp(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
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
                      className="border border-slate-200/80 p-4 rounded-2xl space-y-3 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all"
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
                          {order.delivery_slot_time && (
                            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-xl w-fit mt-1.5 border border-emerald-200">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ഡെലിവറി സമയം: {order.delivery_slot_time}</span>
                              {order.delivery_fee ? (
                                <span className="text-orange-700 ml-1">(Fee: ₹{order.delivery_fee})</span>
                              ) : (
                                <span className="text-emerald-700 ml-1 font-extrabold">(FREE)</span>
                              )}
                            </div>
                          )}

                          {/* Payment Method Badge */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              order.payment_method === 'upi_online'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              <CreditCard className="w-3 h-3 text-emerald-600" />
                              <span>{order.payment_method === 'upi_online' ? 'Online Payment (UPI/GPay)' : 'Cash on Delivery (COD)'}</span>
                            </span>

                            {order.payment_transaction_id && (
                              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Ref/UTR: {order.payment_transaction_id}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Select & Quick WhatsApp Trigger Button */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.order_id, e.target.value as OrderStatus)
                            }
                            className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => {
                              setWhatsappModalOrder({ order, status: order.status });
                              setCustomWhatsappNote('');
                            }}
                            title="Send WhatsApp Update to Customer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Update</span>
                          </button>
                        </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Manage Store Products</h3>
                  <p className="text-slate-500 text-xs">Inventory levels, threshold alerts & direct image uploads</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Stock Alert Quick Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setStockFilter('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        stockFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({data.products.length})
                    </button>
                    <button
                      onClick={() => setStockFilter('low_stock')}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        stockFilter === 'low_stock'
                          ? 'bg-rose-600 text-white shadow-xs font-black'
                          : 'text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Low Stock ({lowStockProductsList.length})</span>
                    </button>
                  </div>

                  <select
                    value={selectedModuleFilter}
                    onChange={(e) => setSelectedModuleFilter(e.target.value)}
                    className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-2xl focus:outline-none"
                  >
                    <option value="all">All Modules</option>
                    {data.modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setEditingProduct({
                        name: '',
                        price: 100,
                        oldPrice: undefined,
                        rating: 4.8,
                        deliveryTime: '20 min',
                        categoryId: data.categories[0]?.id || '',
                        moduleId: data.modules[0]?.id || '',
                        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
                        description: '',
                        available: true,
                        stock: 10,
                        stock_alert_threshold: 5,
                      });
                      setIsNewProduct(true);
                    }}
                    className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
              </div>

              {/* Product Edit/Create Form */}
              {editingProduct && (
                <div className="bg-slate-50 p-5 rounded-3xl border-2 border-orange-300 space-y-4 text-xs animate-in fade-in zoom-in-95 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-black text-orange-600 uppercase tracking-wider text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {isNewProduct ? 'Create New Product' : 'Edit Product Details'}
                    </h4>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-1 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Product Title *</label>
                      <input
                        type="text"
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="e.g. Fresh Organic Tomatoes 1kg"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        placeholder="e.g. 120"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Original Price (Strike) (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.oldPrice || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: Number(e.target.value) })}
                        placeholder="e.g. 160"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category & Module *</label>
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
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        {data.categories.map((c) => {
                          const m = data.modules.find((mod) => mod.id === c.moduleId);
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} ({m?.name || 'General'})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Stock Quantity & Low Stock Alert Threshold Fields */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Current Stock Quantity (Units) *</label>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.stock ?? ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stock: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="e.g. 15"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Stock Alert Threshold *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.stock_alert_threshold ?? ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stock_alert_threshold: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="e.g. 5"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Triggers red warning badge when stock &le; threshold
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="Short item description..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    {/* DIRECT IMAGE UPLOAD & URL SECTION */}
                    <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-orange-600" /> Product Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Image Preview Thumbnail */}
                        <div className="w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 relative group">
                          {editingProduct.image ? (
                            <img
                              src={editingProduct.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        {/* Image Source Inputs */}
                        <div className="flex-1 space-y-2.5 w-full">
                          {/* Direct File Upload Button */}
                          <div>
                            <label className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-orange-600" /> Upload Image File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setEditingProduct({ ...editingProduct, image: base64 });
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-slate-400 block mt-1">
                              Supports PNG, JPG, WebP (Max 10MB)
                            </span>
                          </div>

                          {/* Image URL Input */}
                          <div>
                            <input
                              type="text"
                              value={editingProduct.image || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                              placeholder="Or paste Image URL (https://...)"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#FF7A00] text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              )}

              {/* Product List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProductsList.map((prod) => {
                  const cat = data.categories.find((c) => c.id === prod.categoryId);
                  const mod = data.modules.find((m) => m.id === prod.moduleId);

                  const currentStock = prod.stock ?? 10;
                  const threshold = prod.stock_alert_threshold ?? 5;
                  const isLowStock = currentStock <= threshold;

                  return (
                    <div
                      key={prod.id}
                      className={`border p-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                        isLowStock
                          ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/80'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <img src={prod.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 bg-white" />
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 truncate">{prod.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-orange-600 font-black text-sm">₹{prod.price}</span>
                            {prod.oldPrice && (
                              <span className="line-through text-slate-400 text-[11px]">₹{prod.oldPrice}</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            {cat?.name || 'Category'} • <span className="font-bold text-slate-700">{mod?.name || 'Module'}</span>
                          </div>

                          {/* Visual Stock Alert Badge */}
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            {isLowStock ? (
                              <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-2xs animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                LOW STOCK: {currentStock} left (Alert: &le;{threshold})
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                                <Package className="w-3 h-3 text-slate-400 shrink-0" />
                                Stock: {currentStock} (Alert: &le;{threshold})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsNewProduct(false);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 4: CATEGORIES MANAGEMENT (MODULE-WISE) ---------------- */}
          {activeTab === 'categories' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Module-Wise Categories</h3>
                  <p className="text-slate-500 text-xs">Add, edit, delete categories & category logo images per module</p>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory({
                      name: '',
                      icon: '🏷️',
                      image: '',
                      moduleId: data.modules[0]?.id || '',
                    });
                    setIsNewCategory(true);
                  }}
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              {/* Category Edit/Create Form Modal */}
              {editingCategory && (
                <div className="bg-slate-50 p-5 rounded-3xl border-2 border-emerald-400 space-y-4 text-xs animate-in fade-in zoom-in-95 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-black text-emerald-700 uppercase tracking-wider text-sm flex items-center gap-2">
                      <Grid className="w-4 h-4" />
                      {isNewCategory ? 'Create New Category' : 'Edit Category Details'}
                    </h4>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category Name *</label>
                      <input
                        type="text"
                        value={editingCategory.name || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="e.g. Fresh Vegetables"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Module Association *</label>
                      <select
                        value={editingCategory.moduleId || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, moduleId: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {data.modules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category Icon / Emoji</label>
                      <input
                        type="text"
                        value={editingCategory.icon || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        placeholder="e.g. 🥬 or 🍕"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* DIRECT CATEGORY LOGO UPLOAD & URL */}
                    <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" /> Category Logo Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview */}
                        <div className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                          {editingCategory.image ? (
                            <img src={editingCategory.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{editingCategory.icon || '🏷️'}</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 w-full">
                          <div>
                            <label className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-emerald-600" /> Upload Category Logo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setEditingCategory({ ...editingCategory, image: base64 });
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <input
                            type="text"
                            value={editingCategory.image || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                            placeholder="Or paste Logo Image URL (https://...)"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategory}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                    >
                      Save Category
                    </button>
                  </div>
                </div>
              )}

              {/* Category List grouped/displayed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.categories.map((cat) => {
                  const mod = data.modules.find((m) => m.id === cat.moduleId);
                  const prodCount = data.products.filter((p) => p.categoryId === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      className="border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {cat.image ? (
                            <img src={cat.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{cat.icon}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{cat.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                              Module: {mod?.name || 'General'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {prodCount} items
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsNewCategory(false);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 5: MODULES MANAGEMENT ---------------- */}
          {activeTab === 'modules' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-900">Homepage Modules Configuration</h3>
                  <p className="text-slate-500 text-xs">Add, edit, delete modules & customize module logo images</p>
                </div>

                <button
                  onClick={() => {
                    setEditingModule({
                      name: '',
                      description: '',
                      time: '20-30 min',
                      icon: '📦',
                      image: '',
                      bgColor: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
                      size: 'medium',
                      badge: '',
                    });
                    setIsNewModule(true);
                  }}
                  className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Module
                </button>
              </div>

              {/* Module Edit Form Modal */}
              {editingModule && (
                <div className="bg-slate-50 p-5 rounded-3xl border-2 border-purple-400 space-y-4 text-xs animate-in fade-in zoom-in-95 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-black text-purple-700 uppercase tracking-wider text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      {isNewModule ? 'Create New Homepage Module' : 'Edit Module Details'}
                    </h4>
                    <button
                      onClick={() => setEditingModule(null)}
                      className="p-1 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Module Title *</label>
                      <input
                        type="text"
                        value={editingModule.name || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, name: e.target.value })}
                        placeholder="e.g. Supermarket"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Delivery Time Tag</label>
                      <input
                        type="text"
                        value={editingModule.time || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, time: e.target.value })}
                        placeholder="e.g. 15-20 min"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Module Card Size</label>
                      <select
                        value={editingModule.size || 'medium'}
                        onChange={(e) => setEditingModule({ ...editingModule, size: e.target.value as ModuleSize })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="large">Large (Full Width Banner)</option>
                        <option value="medium">Medium (Standard Card)</option>
                        <option value="small">Small (Compact Grid)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Badge / Tag Text</label>
                      <input
                        type="text"
                        value={editingModule.badge || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, badge: e.target.value })}
                        placeholder="e.g. Hot, 20% OFF"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Short Subtitle / Description</label>
                      <input
                        type="text"
                        value={editingModule.description || ''}
                        onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                        placeholder="e.g. Fresh, daily & trusted essentials"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    {/* DIRECT MODULE LOGO UPLOAD & URL */}
                    <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-purple-600" /> Module Logo / Illustration Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview */}
                        <div className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                          {editingModule.image ? (
                            <img src={editingModule.image} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-3xl">{editingModule.icon || '📦'}</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 w-full">
                          <div>
                            <label className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-purple-600" /> Upload Module Logo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setEditingModule({ ...editingModule, image: base64 });
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <input
                            type="text"
                            value={editingModule.image || ''}
                            onChange={(e) => setEditingModule({ ...editingModule, image: e.target.value })}
                            placeholder="Or paste Logo Image URL (https://...)"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingModule(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveModule}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                    >
                      Save Module
                    </button>
                  </div>
                </div>
              )}

              {/* Module List */}
              <div className="space-y-3">
                {data.modules.map((mod) => {
                  const catCount = data.categories.filter((c) => c.moduleId === mod.id).length;

                  return (
                    <div
                      key={mod.id}
                      className="border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {mod.image ? (
                            <img src={mod.image} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-2xl">{mod.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span className="truncate">{mod.name}</span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                              {mod.size}
                            </span>
                          </div>
                          <div className="text-slate-500 font-medium text-[11px] truncate">
                            {mod.description || 'No description'} • <span className="font-bold text-slate-700">{catCount} categories</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingModule(mod);
                            setIsNewModule(false);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl"
                          title="Edit Module"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- SCREEN: DELIVERY SLOTS MANAGEMENT ---------------- */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              {/* Express Delivery Fee Banner / Settings */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" /> Express / Urgent Delivery Fee (അർജന്റ് ഡെലിവറി)
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Set custom delivery charge for customers requesting immediate quick delivery.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        value={expressFeeInput}
                        onChange={(e) => setExpressFeeInput(Number(e.target.value))}
                        className="w-28 pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="40"
                      />
                    </div>
                    <button
                      onClick={handleSaveExpressFee}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Fee
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Slots Config Card */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" /> Scheduled Batch Delivery Time Slots
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Configure fixed delivery time slots (e.g. 11:00 AM, 12:00 PM Free Delivery Batch, 1:00 PM, 3:00 PM, 5:00 PM).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSlot({ time: '', label: '', fee: 0, isActive: true });
                      setIsNewSlot(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Delivery Time Slot
                  </button>
                </div>

                {/* Slot Editor Form Modal / Drawer */}
                {editingSlot && (
                  <div className="bg-emerald-50/60 border border-emerald-200/80 p-5 rounded-2xl space-y-4 animate-in fade-in">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      {isNewSlot ? '➕ Add New Delivery Time Slot' : '✏️ Edit Delivery Time Slot'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Time Slot Name / Hour *</label>
                        <input
                          type="text"
                          value={editingSlot.time || ''}
                          onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                          placeholder="E.g. 12:00 PM or 11:00 AM - 12:00 PM"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Description / Batch Label</label>
                        <input
                          type="text"
                          value={editingSlot.label || ''}
                          onChange={(e) => setEditingSlot({ ...editingSlot, label: e.target.value })}
                          placeholder="E.g. Free Delivery Batch (ഉച്ചക്ക് 12 മണി ബാച്ച്)"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Delivery Fee (₹) (0 for Free)</label>
                        <input
                          type="number"
                          value={editingSlot.fee ?? 0}
                          onChange={(e) => setEditingSlot({ ...editingSlot, fee: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={editingSlot.isActive !== false}
                            onChange={(e) => setEditingSlot({ ...editingSlot, isActive: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600 rounded"
                          />
                          <span>Active / Enable this Slot</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingSlot(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSlot}
                        className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md cursor-pointer"
                      >
                        Save Time Slot
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery Slots List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deliverySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`border p-4 rounded-2xl space-y-2.5 transition-all ${
                        slot.isActive
                          ? 'border-emerald-200 bg-white shadow-xs'
                          : 'border-slate-200 bg-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>{slot.time}</span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            slot.fee === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {slot.fee === 0 ? 'FREE' : `₹${slot.fee}`}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-600 line-clamp-1">{slot.label}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleToggleSlotActive(slot.id)}
                          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                            slot.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {slot.isActive ? 'Active' : 'Disabled'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingSlot(slot);
                              setIsNewSlot(false);
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 6: INTEGRATIONS (N8N) ---------------- */}
          {activeTab === 'integrations' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs text-xs">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-orange-600" /> n8n WhatsApp Webhook Integration
              </h3>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">n8n Webhook Endpoint URL</label>
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
                    className="bg-[#FF7A00] text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                  >
                    <Save className="w-4 h-4" /> Save Webhook URL
                  </button>

                  <button
                    onClick={handleTestWebhook}
                    className="bg-slate-800 text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Test Trigger
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 7: FULL ZIP & DATABASE BACKUP ---------------- */}
          {activeTab === 'reports' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-xs text-xs">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-orange-600" /> Full ZIP Backup & Database System
              </h3>
              <p className="text-slate-500 text-xs">
                Export and restore full store backups including database records (products, orders, modules, settings) and all uploaded image files in ZIP format.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Export ZIP Backup */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                      <FileArchive className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">Export Complete ZIP Archive</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Creates a bundled `.zip` file containing `database.json` and a dedicated `images/` directory with all uploaded product, category, module, and logo image assets.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadZipBackup}
                    className="w-full bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" /> Export ZIP Backup
                  </button>
                </div>

                {/* Restore Database */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">Restore Database (ZIP / JSON)</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Upload a `.zip` or `.json` backup archive to restore store catalog, modules, categories, products, orders, and custom settings.
                    </p>
                  </div>

                  <label className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-center transition-all">
                    <Upload className="w-4 h-4" /> Upload & Restore File
                    <input
                      type="file"
                      accept=".zip,.json"
                      onChange={handleRestoreZipOrJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 8: ADMIN BRANDING & SETTINGS ---------------- */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-5 shadow-xs text-xs">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" /> Admin Branding & Store Customization
              </h3>

              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-5 max-w-xl">
                {/* Store Name Customization */}
                <div>
                  <label className="block text-slate-800 font-extrabold mb-1">Store / Business Name</label>
                  <p className="text-slate-500 text-[11px] mb-2">Displayed in header & admin dashboard</p>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. EzMart Supermarket"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Admin Logo Customization */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-600" /> Admin Panel Logo Image
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      {adminLogo ? (
                        <img src={adminLogo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Store className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2.5 w-full">
                      <div>
                        <label className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                          <UploadCloud className="w-4 h-4 text-orange-600" /> Upload Admin Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileRead(file, (base64) => {
                                  setAdminLogo(base64);
                                });
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        value={adminLogo}
                        onChange={(e) => setAdminLogo(e.target.value)}
                        placeholder="Or paste Logo Image URL (https://...)"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-slate-800 font-extrabold mb-1">Admin Security PIN</label>
                  <p className="text-slate-500 text-[11px] mb-2">Set 4-8 digit passcode to lock Admin suite</p>
                  <input
                    type="password"
                    maxLength={8}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="bg-white border border-slate-300 font-extrabold rounded-xl px-3 py-2 text-slate-900 text-center w-36 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveSettings}
                    className="bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all text-xs"
                  >
                    <Save className="w-4 h-4" /> Save Admin Branding & Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 9: PWA MOBILE APP CUSTOMIZATION ---------------- */}
          {activeTab === 'pwa' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    Progressive Web App (PWA) Customization & Branding
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Customizable app icon, app name, description & theme colors. Automatically prompts website visitors to install the app.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onTestPWAInstallPrompt) {
                      onTestPWAInstallPrompt();
                      showToast('PWA Install Prompt Modal opened!');
                    } else {
                      showToast('PWA Modal triggered', 'success');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Preview / Test Install Modal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Inputs */}
                <form onSubmit={handleSavePwaSettings} className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  <div className="space-y-4">
                    {/* Enable / Disable PWA Master Toggle Box */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      pwaEnabled 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="font-black text-sm flex items-center gap-2">
                          <Smartphone className={`w-4 h-4 ${pwaEnabled ? 'text-emerald-600' : 'text-rose-600'}`} />
                          <span>PWA Pop-up Installation System</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            pwaEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {pwaEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600">
                          {pwaEnabled 
                            ? 'Website visitors will automatically see the app installation window on page open.' 
                            : 'Installation popup is turned off. Users will not see automatic app install prompts.'}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={pwaEnabled}
                          onChange={(e) => setPwaEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2 pt-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> App Identity & Manifest Details
                    </h4>

                    {/* App Full Name */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Application Name (PWA Title) *
                      </label>
                      <input
                        type="text"
                        value={pwaName}
                        onChange={(e) => setPwaName(e.target.value)}
                        placeholder="e.g. Hyperlocal WhatsApp Store"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Title shown on the installation popup window & app header
                      </span>
                    </div>

                    {/* Short Name */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Short Name (Home Screen Badge) *
                      </label>
                      <input
                        type="text"
                        value={pwaShortName}
                        onChange={(e) => setPwaShortName(e.target.value)}
                        placeholder="e.g. HyperlocalApp"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Label displayed below the mobile phone app icon on home screen
                      </span>
                    </div>

                    {/* App Description */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Application Description *
                      </label>
                      <textarea
                        rows={3}
                        value={pwaDescription}
                        onChange={(e) => setPwaDescription(e.target.value)}
                        placeholder="Describe store highlights (e.g. 15-min delivery, direct WhatsApp ordering...)"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* PWA Icon Upload / Link */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      <label className="block text-slate-800 font-extrabold flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" /> PWA App Icon / Logo Image *
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl border-2 border-emerald-500/20 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-md">
                          {pwaIcon ? (
                            <img src={pwaIcon} alt="PWA Icon" className="w-full h-full object-cover" />
                          ) : (
                            <Smartphone className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 w-full">
                          <div>
                            <label className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-extrabold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 text-xs transition-colors">
                              <UploadCloud className="w-4 h-4 text-emerald-600" /> Direct File Upload from Device
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileRead(file, (base64) => {
                                      setPwaIcon(base64);
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <input
                            type="text"
                            value={pwaIcon}
                            onChange={(e) => setPwaIcon(e.target.value)}
                            placeholder="Or paste App Icon URL (https://...)"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-[11px] text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Colors Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">Theme Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pwaThemeColor}
                            onChange={(e) => setPwaThemeColor(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={pwaThemeColor}
                            onChange={(e) => setPwaThemeColor(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-xl p-2 font-mono text-xs font-bold text-slate-800 uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">App Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pwaBgColor}
                            onChange={(e) => setPwaBgColor(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={pwaBgColor}
                            onChange={(e) => setPwaBgColor(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-xl p-2 font-mono text-xs font-bold text-slate-800 uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save PWA Customization'}</span>
                    </button>
                  </div>
                </form>

                {/* Live Preview Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
                        <Eye className="w-4 h-4" /> Live Installation Window Preview
                      </span>
                      <span className="bg-emerald-900/60 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-700/50">
                        Pop-up Window
                      </span>
                    </div>

                    {/* Simulated Mobile Popup Box */}
                    <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
                      <div className="text-center space-y-2">
                        <img
                          src={pwaIcon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-md border border-slate-200"
                        />
                        <h4 className="font-black text-slate-900 text-base leading-tight">
                          {pwaName || 'Store App'}
                        </h4>
                        <span className="text-[11px] font-bold text-emerald-700 block">
                          {pwaShortName || 'App'} • ⚡ Official Application
                        </span>
                        <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                          {pwaDescription}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1 font-semibold text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>• 1-Tap Home Screen Access</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>• Offline Product Catalog</span>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{ backgroundColor: pwaThemeColor || '#059669' }}
                        className="w-full py-2.5 px-4 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        <span>ഇൻസ്റ്റാൾ ആപ്ലിക്കേഷൻ (Install App)</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                      ℹ️ This installation prompt will automatically pop up when customers open your website on mobile or desktop browsers until the app is installed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 10: CUSTOMER WHATSAPP ORDER ROUTING ---------------- */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    Customer WhatsApp Order Receipt & Messaging Settings
                  </h3>
                  <p className="text-slate-500 text-xs">
                    കസ്റ്റമർ ഓർഡർ സബ്മിറ്റ് ചെയ്യുമ്പോൾ ഓർഡർ വിവരങ്ങൾ കസ്റ്റമറിന്റെ വാട്സാപ്പിലേക്ക് അയക്കുന്ന സംവിധാനം ഇവിടെ മാനേജ് ചെയ്യാം.
                  </p>
                </div>

                <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Business Ready</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls Form */}
                <form onSubmit={handleSaveWhatsappSettings} className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  {/* Master Toggle */}
                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    sendToCustomerWhatsapp 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="space-y-0.5">
                      <div className="font-black text-sm flex items-center gap-2">
                        <MessageCircle className={`w-4 h-4 ${sendToCustomerWhatsapp ? 'text-emerald-600' : 'text-rose-600'}`} />
                        <span>Customer WhatsApp Receipt System</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          sendToCustomerWhatsapp ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {sendToCustomerWhatsapp ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600">
                        {sendToCustomerWhatsapp
                          ? 'കസ്റ്റമർ ഓർഡർ കൺഫോം ചെയ്യുമ്പോൾ ഓർഡർ വിവരങ്ങൾ അവരുടെ വാട്സാപ്പിലേക്ക് ഡയറക്ട് അയക്കും.'
                          : 'Customer WhatsApp receipt generation is turned off.'}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={sendToCustomerWhatsapp}
                        onChange={(e) => setSendToCustomerWhatsapp(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Mode Selector Cards */}
                  <div className="space-y-2">
                    <label className="block text-slate-800 font-extrabold text-xs">
                      WhatsApp Order Target Routing Mode (വാട്സാപ്പ് റൂട്ടിംഗ് രീതി) *
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Option 1: Both */}
                      <button
                        type="button"
                        onClick={() => setWhatsappMode('both')}
                        className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                          whatsappMode === 'both'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Both (രണ്ടും)</span>
                        </div>
                        <p className={`text-[10px] leading-tight font-medium ${whatsappMode === 'both' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Customer + Store Owner order copies
                        </p>
                      </button>

                      {/* Option 2: Customer Only */}
                      <button
                        type="button"
                        onClick={() => setWhatsappMode('customer_only')}
                        className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                          whatsappMode === 'customer_only'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs mb-1">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Customer Only</span>
                        </div>
                        <p className={`text-[10px] leading-tight font-medium ${whatsappMode === 'customer_only' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Send receipt to customer WhatsApp
                        </p>
                      </button>

                      {/* Option 3: Store Admin Only */}
                      <button
                        type="button"
                        onClick={() => setWhatsappMode('store_only')}
                        className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                          whatsappMode === 'store_only'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs mb-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Store Only</span>
                        </div>
                        <p className={`text-[10px] leading-tight font-medium ${whatsappMode === 'store_only' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Send order to Store WhatsApp
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Auto Open Toggle */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-slate-800 block text-xs">
                        Auto-Launch WhatsApp App on Order Submit
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        കസ്റ്റമർ "Confirm Order" അമർത്തിയാൽ വാട്സാപ്പ് ആപ്പ് തനിയെ തുറക്കുക
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={customerWaAutoOpen}
                        onChange={(e) => setCustomerWaAutoOpen(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Store Admin WhatsApp Number */}
                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1">
                      Store Owner WhatsApp Phone Number (കടയുടമയുടെ വാട്സാപ്പ് നമ്പർ) *
                    </label>
                    <input
                      type="text"
                      value={storeWhatsappPhone}
                      onChange={(e) => setStoreWhatsappPhone(e.target.value)}
                      placeholder="e.g. 919876543210"
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Enter full phone number with country code (e.g. 91 for India)
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save WhatsApp Settings'}</span>
                    </button>
                  </div>
                </form>

                {/* Simulated WhatsApp Chat Message Preview */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#0b141a] text-white p-4 rounded-3xl space-y-3 border border-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center font-black text-xs">
                          {storeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{storeName}</h4>
                          <span className="text-[9px] text-emerald-400 font-medium">WhatsApp Business Official</span>
                        </div>
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-800">
                        Live Message Preview
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    <div className="bg-[#202c33] text-slate-100 rounded-2xl p-3.5 space-y-2 text-[11px] shadow-md border border-slate-700/50 font-sans leading-relaxed">
                      <div className="font-bold text-emerald-400">
                        🛍️ *ORDER CONFIRMATION - {storeName}*
                      </div>

                      <div className="text-slate-300 text-[10px]">
                        👤 *Customer:* +919876543210<br />
                        📅 *Delivery:* Free Delivery Batch (12:00 PM Slot)
                      </div>

                      <div className="border-t border-slate-700 pt-1.5 text-slate-200 space-y-0.5">
                        <div className="font-bold text-emerald-300">📦 Order Items:</div>
                        <div>• Fresh Apple (Kashmir) x 2 = ₹240</div>
                        <div>• Organic Farm Milk (1L) x 1 = ₹60</div>
                      </div>

                      <div className="border-t border-slate-700 pt-1.5 flex justify-between font-bold text-slate-100">
                        <span>Grand Total:</span>
                        <span className="text-emerald-400">₹300</span>
                      </div>

                      <div className="text-[9px] text-slate-400 italic pt-1">
                        ✅ Order confirmed via Hyperlocal Store.
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      ℹ️ This formatted message will automatically open in the customer's WhatsApp application when they complete an order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCREEN 11: PAYMENT OPTIONS & UPI CONFIGURATION ---------------- */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Payment Options & Personal UPI Scanner Settings
                  </h3>
                  <p className="text-slate-500 text-xs">
                    ക്യാഷ് ഓൺ ഡെലിവറിയും (COD) പേഴ്സണൽ Google Pay, PhonePe, QR സ്കാനറും യാതൊരു എപിഐ നിരക്കുകളുമില്ലാതെ ലിങ്ക് ചെയ്യാം.
                  </p>
                </div>

                <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Zero API Gateway Fee</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls Form */}
                <form onSubmit={handleSavePaymentSettings} className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  {/* Master Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* COD Toggle */}
                    <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      codEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div>
                        <span className="font-extrabold text-xs block flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Cash on Delivery</span>
                        </span>
                        <span className="text-[10px] opacity-80 block font-medium">
                          {codEnabled ? 'COD Active' : 'Disabled'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={codEnabled}
                          onChange={(e) => setCodEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Online UPI Toggle */}
                    <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      upiEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div>
                        <span className="font-extrabold text-xs block flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span>Online UPI / QR</span>
                        </span>
                        <span className="text-[10px] opacity-80 block font-medium">
                          {upiEnabled ? 'UPI Active' : 'Disabled'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={upiEnabled}
                          onChange={(e) => setUpiEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Wallet Gateway Toggle */}
                    <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      walletEnabled ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div>
                        <span className="font-extrabold text-xs block flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-purple-600" />
                          <span>Store Wallet</span>
                        </span>
                        <span className="text-[10px] opacity-80 block font-medium">
                          {walletEnabled ? 'Wallet Active' : 'Disabled'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={walletEnabled}
                          onChange={(e) => setWalletEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Wallet Configuration Section */}
                  {walletEnabled && (
                    <div className="space-y-3 bg-purple-50/60 p-4 rounded-2xl border border-purple-200">
                      <h4 className="font-black text-purple-950 text-xs flex items-center gap-2 border-b border-purple-200 pb-2">
                        <Wallet className="w-4 h-4 text-purple-600" />
                        <span>Wallet Payment Gateway Settings</span>
                      </h4>
                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">
                          Default Customer Demo Wallet Balance (₹) *
                        </label>
                        <input
                          type="number"
                          value={walletDemoBalance}
                          onChange={(e) => setWalletDemoBalance(Number(e.target.value))}
                          placeholder="500"
                          required
                          className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <p className="text-[10px] text-purple-700 font-medium mt-1">
                          Customers can select Store Wallet at checkout to instantly deduct their order total from this initial balance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* UPI Details Inputs */}
                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Personal UPI & Account Details</span>
                    </h4>

                    {/* UPI ID */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Personal UPI ID (ഉദാഹരണത്തിന്: 9876543210@paytm / store@okaxis) *
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 9876543210@paytm"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* GPay / PhonePe Phone Number */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Google Pay / PhonePe Phone Number (ഗൂഗിൾ പേ നമ്പർ) *
                      </label>
                      <input
                        type="text"
                        value={upiPhone}
                        onChange={(e) => setUpiPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Payee Account Name */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Payee / Business Account Name (അക്കൗണ്ട് ഉടമയുടെ പേര്) *
                      </label>
                      <input
                        type="text"
                        value={upiPayeeName}
                        onChange={(e) => setUpiPayeeName(e.target.value)}
                        placeholder="e.g. Anas Hyperlocal Store"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Store Personal QR Image */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        Store Personal UPI QR Code Image (നിങ്ങളുടെ സ്കാനർ ക്യൂആർ ചിത്രം)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiQrImage}
                          onChange={(e) => setUpiQrImage(e.target.value)}
                          placeholder="Paste image URL or upload below"
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <label className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                          <UploadCloud className="w-4 h-4" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setUpiQrImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Payment Options'}</span>
                    </button>
                  </div>
                </form>

                {/* Simulated Checkout Payment Preview */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-3 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span className="font-extrabold text-xs">Customer Checkout Preview</span>
                      </div>
                      <span className="bg-emerald-900 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full">
                        Live Preview
                      </span>
                    </div>

                    <div className="bg-white text-slate-900 p-3.5 rounded-2xl space-y-3 border border-slate-200">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        പേയ്മെന്റ് രീതി (Payment Option)
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2.5 rounded-xl border text-xs font-bold ${codEnabled ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'opacity-40 line-through'}`}>
                          <Banknote className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                          <div>Cash on Delivery</div>
                        </div>

                        <div className={`p-2.5 rounded-xl border text-xs font-bold ${upiEnabled ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'opacity-40 line-through'}`}>
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                          <div>Online Payment</div>
                        </div>
                      </div>

                      {upiEnabled && (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-2 text-center">
                          <div className="text-[10px] font-bold text-emerald-800">
                            Scan & Pay via GPay / PhonePe
                          </div>

                          {upiQrImage ? (
                            <img src={upiQrImage} alt="QR Code Preview" className="w-28 h-28 object-contain mx-auto rounded-lg border border-slate-200 shadow-xs" />
                          ) : (
                            <div className="w-28 h-28 bg-slate-200 rounded-lg flex items-center justify-center mx-auto text-slate-400 text-[10px] font-bold">
                              No QR Image
                            </div>
                          )}

                          <div className="text-[10px] font-mono font-bold text-slate-800">
                            UPI: {upiId}
                          </div>
                          <div className="text-[10px] font-bold text-slate-700">
                            GPay: +91 {upiPhone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- WHATSAPP AUTOMATED NOTIFICATION MODAL ---------------- */}
          {whatsappModalOrder && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">WhatsApp Order Notification</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Real-time update for Order #{whatsappModalOrder.order.order_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWhatsappModalOrder(null)}
                    className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order Summary Header */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-800">Order #{whatsappModalOrder.order.order_id}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Customer Phone: +{whatsappModalOrder.order.customer_phone}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl font-black text-[11px] inline-block shadow-2xs">
                      {whatsappModalOrder.status}
                    </span>
                  </div>
                </div>

                {/* Optional Custom Note Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <span>Add Custom Message / Delivery Note (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customWhatsappNote}
                    onChange={(e) => setCustomWhatsappNote(e.target.value)}
                    placeholder="e.g. Delivery partner: Rahul (9876543210)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Live Message Preview */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Pre-filled Message Preview:
                  </label>
                  <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl font-mono text-xs whitespace-pre-wrap border border-emerald-800 leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                    {buildWhatsAppMessage(
                      whatsappModalOrder.order,
                      whatsappModalOrder.status,
                      data.settings?.store_name || storeName || 'Hyperlocal Store',
                      customWhatsappNote
                    ).message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      const { message } = buildWhatsAppMessage(
                        whatsappModalOrder.order,
                        whatsappModalOrder.status,
                        data.settings?.store_name || storeName || 'Hyperlocal Store',
                        customWhatsappNote
                      );
                      navigator.clipboard.writeText(message);
                      showToast('WhatsApp message text copied to clipboard!');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Copy Text</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setWhatsappModalOrder(null)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <a
                      href={
                        buildWhatsAppMessage(
                          whatsappModalOrder.order,
                          whatsappModalOrder.status,
                          data.settings?.store_name || storeName || 'Hyperlocal Store',
                          customWhatsappNote
                        ).whatsappUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        showToast('Opening WhatsApp link...');
                        setWhatsappModalOrder(null);
                      }}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send via WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
