export type OrderStatus = 'PLACED' | 'APPROVED' | 'FULFILLED' | 'REJECTED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'COD' | 'ONLINE' | 'UPI';

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  sizes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ListItemsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  inStockOnly?: boolean;
}

export interface ListItemsResponse {
  items: CatalogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  itemId: string;
  name?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  item?: CatalogItem;
  quantity: number;
  size?: string;
  isAvailable?: boolean;
  lineTotal?: number;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  canCheckout: boolean;
  warnings?: string[];
}

export interface CheckoutPayload {
  shippingAddress: string;
  contactNumber: string;
  userNote?: string;
  paymentMethod?: PaymentMethod | string;
}

export interface DirectBuyPayload extends CheckoutPayload {
  quantity: number;
  size?: string;
}

export interface OrderItem {
  id?: string;
  itemId: string;
  name: string;
  imageUrl?: string;
  size?: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: string;
  contactNumber: string;
  userNote?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

