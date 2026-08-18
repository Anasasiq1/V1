export type ModuleSize = 'large' | 'medium' | 'small' | 'banner';

export interface Module {
  id: string;
  name: string;
  description: string;
  time: string;
  icon: string;
  image?: string;
  bgColor: string;
  textColor?: string;
  size: ModuleSize;
  order: number;
  badge?: string;
  active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  moduleId: string;
  icon: string;
  image?: string;
  order?: number;
  active?: boolean;
}

export interface ProductVariant {
  name: string;
  price: number;
}

export interface ProductCustomField {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  moduleId: string;
  price: number;
  oldPrice?: number;
  rating: number;
  deliveryTime: string;
  image: string;
  description: string;
  variants?: ProductVariant[];
  available: boolean;
  stock?: number;
  stock_alert_threshold?: number;
  customFields?: ProductCustomField[];
  cart_interest_count?: number;
  requires_prescription?: boolean;
  order?: number;
}

export interface ItemPrescription {
  fileName: string;
  fileData?: string;
  fileType?: string;
}

export type OrderStatus = 'Order Placed' | 'Preparing' | 'Packing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface DeliverySlot {
  id: string;
  time: string;
  label: string;
  fee: number;
  isFree: boolean;
  isActive: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  linkModuleId?: string;
  active?: boolean;
  btnText?: string;
  bgGradient?: string;
  icon?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  category: string;
  variantName?: string;
  prescription?: ItemPrescription;
}

export interface Order {
  order_id: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  delivery_type?: 'scheduled' | 'urgent';
  delivery_slot_time?: string;
  delivery_fee?: number;
  notes: string;
  order_time: string;
  status: OrderStatus;
  is_food_order?: boolean;
  payment_method?: 'cod' | 'upi_online' | 'wallet';
  payment_status?: 'Pending' | 'Paid (COD)' | 'Paid (UPI Verified)' | 'Paid (Wallet)' | 'Failed';
  payment_transaction_id?: string;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  variantName?: string;
  price: number;
  image: string;
  qty: number;
  categoryId: string;
  prescription?: ItemPrescription;
}

export interface StoreSettings {
  n8n_webhook_url: string;
  store_name: string;
  delivery_address: string;
  admin_pin: string;
  admin_logo?: string;
  express_delivery_fee?: number;
  delivery_slots?: DeliverySlot[];
  pwa_enabled?: boolean;
  pwa_name?: string;
  pwa_short_name?: string;
  pwa_description?: string;
  pwa_icon?: string;
  pwa_theme_color?: string;
  pwa_bg_color?: string;
  send_to_customer_whatsapp?: boolean;
  whatsapp_mode?: 'both' | 'customer_only' | 'store_only';
  customer_wa_auto_open?: boolean;
  store_whatsapp_phone?: string;
  cod_enabled?: boolean;
  upi_enabled?: boolean;
  wallet_enabled?: boolean;
  wallet_demo_balance?: number;
  upi_id?: string;
  upi_phone?: string;
  upi_payee_name?: string;
  upi_qr_image?: string;
}

export interface AppData {
  modules: Module[];
  categories: Category[];
  products: Product[];
  banners: PromoBanner[];
  orders: Order[];
  settings: StoreSettings;
}
