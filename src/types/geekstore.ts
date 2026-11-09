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
  deletedAt?: string | null;
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
  githubId?: string;
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

export interface AdminUserProfile {
  name: string;
  email: string;
  githubId: string;
  college: string;
  avatarUrl?: string;
}

export interface AdminOrderItem {
  id?: string;
  itemId: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  price?: number;
  lineTotal?: number;
  size?: string;
  name?: string;
  imageUrl?: string;
  item?: CatalogItem;
}

export interface AdminOrder extends Omit<Order, 'items'> {
  items: AdminOrderItem[];
  user?: AdminUserProfile;
  adminNote?: string;
}

export interface AdminItemFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  includeInactive?: boolean;
  includeDeleted?: boolean;
}

export interface AdminOrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  githubId?: string;
  search?: string;
}

export interface AdminItemListResponse {
  items: CatalogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrderListResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


