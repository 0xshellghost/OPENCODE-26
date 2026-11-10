import {
  CatalogItem,
  CheckoutPayload,
  DirectBuyPayload,
  ListItemsParams,
  ListItemsResponse,
  Order,
  OrdersParams,
  OrdersResponse,
  AdminItemFilterParams,
  AdminItemListResponse,
  AdminOrder,
  AdminOrderFilterParams,
  AdminOrderListResponse,
  OrderStatus,
  PaymentStatus,
} from 'types/geekstore';
import { getApiBase } from 'utils/apiBase';

function getBackendUrl() {
  return getApiBase();
}

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fallback storage (empty by default; populated only when real products or orders exist)
const FALLBACK_ITEMS: CatalogItem[] = [];
const INITIAL_ADMIN_ORDERS: AdminOrder[] = [];

// Local storage key for catalog & fallback simulation
const FALLBACK_ITEMS_KEY = 'oc_geekstore_items_v2';
const FALLBACK_ORDERS_KEY = 'oc_geekstore_orders_v1';

export function getFallbackItems(): CatalogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FALLBACK_ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any legacy dummy/mock items if previously stored in localStorage
        const clean = parsed.filter(
          (item) => item && !String(item.id).startsWith('item-'),
        );
        return clean;
      }
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function saveFallbackItems(items: CatalogItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FALLBACK_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

function getFallbackOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FALLBACK_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return [];
}

function saveFallbackOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FALLBACK_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    // ignore
  }
}

function getFallbackAdminOrders(): AdminOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FALLBACK_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy dummy orders
        return parsed.filter(
          (ord) => ord && !String(ord.id).startsWith('ord-gh-'),
        );
      }
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function saveFallbackAdminOrders(orders: AdminOrder[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FALLBACK_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    // ignore
  }
}

/**
 * Universal request wrapper that prioritizes the backend API,
 * checking `/geekstore` and `/api/v1/geekstore`, and gracefully
 * falling back for seamless frontend presentation.
 */
async function requestWithFallback<T>(
  path: string,
  options: RequestInit = {},
  fallbackFn?: () => Promise<T> | T,
): Promise<T> {
  const url = `${getBackendUrl()}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options.headers || {}),
      },
    });

    if (res.ok) {
      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : { success: true };
      } catch {
        data = { success: true };
      }
      return (data?.data !== undefined ? data.data : data) as T;
    }

    // If 404, maybe it's under /api/v1 prefix?
    if (res.status === 404 && !path.startsWith('/api/v1')) {
      try {
        const altRes = await fetch(`${getBackendUrl()}/api/v1${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...(options.headers || {}),
          },
        });
        if (altRes.ok) {
          let altData: any = null;
          try {
            const text = await altRes.text();
            altData = text ? JSON.parse(text) : { success: true };
          } catch {
            altData = { success: true };
          }
          return (altData?.data !== undefined ? altData.data : altData) as T;
        }
      } catch {
        // continue to normal handling
      }
    }

    // Try to parse error message from server
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const text = await res.text();
      if (text) {
        try {
          const errorJson = JSON.parse(text);
          errorMessage =
            errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // ignore
    }

    // If fallback is provided and backend returned an error, use fallback
    if (fallbackFn) {
      return await fallbackFn();
    }

    throw new Error(errorMessage);
  } catch (error: any) {
    // If backend is unreachable or throws any error, use fallback
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw error;
  }
}

export const GeekstoreService = {
  /**
   * GET /geekstore/items
   * List catalog items with filtering, search, and pagination.
   */
  async listItems(params: ListItemsParams = {}): Promise<ListItemsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.category && params.category !== 'All')
      query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.inStockOnly) query.set('inStockOnly', 'true');

    const path = `/geekstore/items${query.toString() ? `?${query.toString()}` : ''}`;

    return requestWithFallback<ListItemsResponse>(
      path,
      { method: 'GET' },
      () => {
        const storedItems = getFallbackItems();
        let filtered = [...storedItems].filter((i) => i.isActive && !i.deletedAt);

        if (params.category && params.category !== 'All') {
          filtered = filtered.filter(
            (i) => i.category.toLowerCase() === params.category!.toLowerCase(),
          );
        }

        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.description.toLowerCase().includes(q) ||
              i.category.toLowerCase().includes(q),
          );
        }

        if (params.inStockOnly) {
          filtered = filtered.filter((i) => i.stock > 0);
        }

        const page = params.page || 1;
        const limit = params.limit || 8;
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const items = filtered.slice(startIndex, startIndex + limit);

        return {
          items,
          total,
          page,
          limit,
          totalPages,
        };
      },
    );
  },

  /**
   * GET /geekstore/items/:itemId
   * Retrieve details for a single item by ID.
   */
  async getItemById(itemId: string): Promise<CatalogItem> {
    return requestWithFallback<CatalogItem>(
      `/geekstore/items/${itemId}`,
      { method: 'GET' },
      () => {
        const storedItems = getFallbackItems();
        const found = storedItems.find((i) => i.id === itemId && !i.deletedAt);
        if (!found) throw new Error('Product not found');
        return found;
      },
    );
  },


  /**
   * POST /geekstore/items/:itemId/buy
   * Direct instant purchase for a single item.
   * Includes x-idempotency-key header.
   */
  async directBuy(
    itemId: string,
    buyData: DirectBuyPayload,
    idempotencyKey?: string,
  ): Promise<Order> {
    const key = idempotencyKey || generateIdempotencyKey();

    return requestWithFallback<Order>(
      `/geekstore/items/${itemId}/buy`,
      {
        method: 'POST',
        headers: {
          'x-idempotency-key': key,
        },
        body: JSON.stringify(buyData),
      },
      () => {
        const storedItems = getFallbackItems();
        const item = storedItems.find((i) => i.id === itemId);
        if (!item) throw new Error('Product not found');
        if (item.stock < buyData.quantity) {
          throw new Error('Insufficient stock available');
        }

        // Deduct stock in persistent store
        item.stock -= buyData.quantity;
        saveFallbackItems(storedItems);

        const newOrder: Order = {
          id: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'PLACED',
          paymentStatus: 'PENDING',
          paymentMethod: buyData.paymentMethod || 'CASH',
          shippingAddress: buyData.shippingAddress,
          contactNumber: buyData.contactNumber,
          userNote: buyData.userNote,
          idempotencyKey: key,
          items: [
            {
              itemId: item.id,
              name: item.name,
              imageUrl: item.imageUrl,
              size: buyData.size,
              quantity: buyData.quantity,
              price: item.price,
              lineTotal: item.price * buyData.quantity,
            },
          ],
          totalAmount: item.price * buyData.quantity,
          createdAt: new Date().toISOString(),
        };

        const orders = getFallbackOrders();
        orders.unshift(newOrder);
        saveFallbackOrders(orders);

        return newOrder;
      },
    );
  },

  /**
   * GET /geekstore/orders/me
   * Retrieve order history of the current user.
   */
  async getMyOrders(params: OrdersParams = {}): Promise<OrdersResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status && params.status !== 'ALL')
      query.set('status', params.status);

    const path = `/geekstore/orders/me${query.toString() ? `?${query.toString()}` : ''}`;

    return requestWithFallback<OrdersResponse>(
      path,
      { method: 'GET' },
      () => {
        let all = getFallbackOrders();

        if (params.status && params.status !== 'ALL') {
          all = all.filter((o) => o.status === params.status);
        }

        const page = params.page || 1;
        const limit = params.limit || 10;
        const total = all.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const orders = all.slice(startIndex, startIndex + limit);

        return {
          orders,
          total,
          page,
          limit,
          totalPages,
        };
      },
    );
  },

  /**
   * GET /geekstore/orders/:orderId
   * Retrieve detailed status for a specific order.
   */
  async getOrderById(orderId: string): Promise<Order> {
    return requestWithFallback<Order>(
      `/geekstore/orders/${orderId}`,
      { method: 'GET' },
      () => {
        const found = getFallbackOrders().find((o) => o.id === orderId);
        if (!found) throw new Error('Order not found');
        return found;
      },
    );
  },

  /**
   * POST /geekstore/orders/:orderId/cancel
   * Cancel an order. Strictly allowed ONLY when status === 'PLACED'.
   */
  async cancelOrder(orderId: string): Promise<Order> {
    return requestWithFallback<Order>(
      `/geekstore/orders/${orderId}/cancel`,
      { method: 'POST' },
      () => {
        const orders = getFallbackOrders();
        const order = orders.find((o) => o.id === orderId);
        if (!order) throw new Error('Order not found');

        if (order.status !== 'PLACED') {
          throw new Error(
            `Cannot cancel an order in "${order.status}" status. Only "PLACED" orders can be cancelled.`,
          );
        }

        order.status = 'CANCELLED';
        order.updatedAt = new Date().toISOString();
        saveFallbackOrders(orders);
        return order;
      },
    );
  },
  /**
   * GET /api/v1/admin/geekstore/items
   * List all products for admin management with filters:
   * includeInactive, includeDeleted, category, search, page, limit.
   */
  async adminListItems(
    params: AdminItemFilterParams = {},
  ): Promise<AdminItemListResponse> {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    if (params.category && params.category !== 'ALL') q.append('category', params.category);
    if (params.search) q.append('search', params.search);
    if (params.includeInactive !== undefined)
      q.append('includeInactive', String(params.includeInactive));
    if (params.includeDeleted !== undefined)
      q.append('includeDeleted', String(params.includeDeleted));

    const path = `/api/v1/admin/geekstore/items${q.toString() ? `?${q.toString()}` : ''}`;

    const raw = await requestWithFallback<any>(
      path,
      { method: 'GET' },
      () => {
        const storedItems = getFallbackItems();
        let filtered = [...storedItems];

        if (params.includeDeleted !== true) {
          filtered = filtered.filter((i) => !i.deletedAt);
        }

        if (params.includeInactive !== true) {
          filtered = filtered.filter((i) => i.isActive !== false);
        }

        if (params.category && params.category !== 'ALL' && params.category.trim()) {
          filtered = filtered.filter(
            (i) => i.category.toLowerCase() === params.category!.trim().toLowerCase(),
          );
        }

        if (params.search && params.search.trim()) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter(
            (i) =>
              i.name.toLowerCase().includes(s) ||
              (i.description && i.description.toLowerCase().includes(s)) ||
              i.id.toLowerCase().includes(s),
          );
        }

        const page = params.page || 1;
        const limit = params.limit || 50;
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const skip = (page - 1) * limit;
        const items = filtered.slice(skip, skip + limit);

        return { items, total, page, limit, totalPages };
      },
    );

    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
    const total = raw?.pagination?.total ?? raw?.total ?? items.length;
    const page = raw?.pagination?.page ?? raw?.page ?? 1;
    const limit = raw?.pagination?.limit ?? raw?.limit ?? 50;
    const totalPages = raw?.pagination?.totalPages ?? raw?.totalPages ?? (Math.ceil(total / limit) || 1);

    return { items, total, page, limit, totalPages };
  },

  /**
   * POST /api/v1/admin/geekstore/items
   * Admin adds a new product to the catalog.
   */
  async adminCreateItem(payload: {
    name: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    price: number;
    stock: number;
    sizes?: string[];
    isActive?: boolean;
  }): Promise<CatalogItem> {
    return requestWithFallback<CatalogItem>(
      '/api/v1/admin/geekstore/items',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => {
        const storedItems = getFallbackItems();
        const newItem: CatalogItem = {
          id: `item-${Date.now()}`,
          name: payload.name.trim(),
          description: payload.description?.trim() || '',
          imageUrl:
            payload.imageUrl?.trim() ||
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          category: payload.category?.trim() || 'Merchandise',
          price: Number(payload.price),
          stock: Number(payload.stock),
          isActive: payload.isActive !== false,
          sizes: payload.sizes || ['S', 'M', 'L', 'XL'],
          deletedAt: null,
          createdAt: new Date().toISOString(),
        };
        storedItems.unshift(newItem);
        saveFallbackItems(storedItems);
        return newItem;
      },
    );
  },

  /**
   * Alias for backward compatibility
   */
  async adminAddItem(payload: {
    name: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    price: number;
    stock: number;
    sizes?: string[];
    isActive?: boolean;
  }): Promise<CatalogItem> {
    return this.adminCreateItem(payload);
  },

  /**
   * PATCH /api/v1/admin/geekstore/items/:itemId
   * Admin updates an existing product (price, stock, isActive, etc.)
   */
  async adminUpdateItem(
    itemId: string,
    payload: {
      name?: string;
      description?: string;
      imageUrl?: string;
      category?: string;
      price?: number;
      stock?: number;
      sizes?: string[];
      isActive?: boolean;
    },
  ): Promise<CatalogItem> {
    return requestWithFallback<CatalogItem>(
      `/api/v1/admin/geekstore/items/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      () => {
        const storedItems = getFallbackItems();
        const itemIndex = storedItems.findIndex((i) => i.id === itemId);
        if (itemIndex === -1) {
          throw new Error('Item not found');
        }
        const item = storedItems[itemIndex];
        if (payload.name !== undefined) item.name = payload.name.trim();
        if (payload.description !== undefined) item.description = payload.description.trim();
        if (payload.imageUrl !== undefined) item.imageUrl = payload.imageUrl.trim();
        if (payload.category !== undefined) item.category = payload.category.trim();
        if (payload.price !== undefined) item.price = Number(payload.price);
        if (payload.stock !== undefined) item.stock = Number(payload.stock);
        if (payload.isActive !== undefined) item.isActive = Boolean(payload.isActive);
        if (payload.sizes !== undefined) item.sizes = payload.sizes;
        item.updatedAt = new Date().toISOString();
        storedItems[itemIndex] = { ...item };
        saveFallbackItems(storedItems);
        return { ...item };
      },
    );
  },

  /**
   * DELETE /api/v1/admin/geekstore/items/:itemId
   * Soft deletes or permanently purges a product from the catalog.
   */
  async adminDeleteItem(
    itemId: string,
    permanent: boolean = false,
  ): Promise<{ success: boolean; id: string; item?: CatalogItem }> {
    const query = permanent ? '?permanent=true' : '';
    return requestWithFallback<{ success: boolean; id: string; item?: CatalogItem }>(
      `/api/v1/admin/geekstore/items/${itemId}${query}`,
      {
        method: 'DELETE',
      },
      () => {
        const storedItems = getFallbackItems();
        if (permanent) {
          const remaining = storedItems.filter((i) => i.id !== itemId);
          saveFallbackItems(remaining);
          return { success: true, id: itemId };
        }

        const itemIndex = storedItems.findIndex((i) => i.id === itemId);
        if (itemIndex !== -1) {
          storedItems[itemIndex].deletedAt = new Date().toISOString();
          storedItems[itemIndex].isActive = false;
          saveFallbackItems(storedItems);
          return { success: true, id: itemId, item: storedItems[itemIndex] };
        }
        return { success: true, id: itemId };
      },
    );
  },

  /**
   * POST /api/v1/admin/geekstore/items/:itemId/restore
   * Restores a soft-deleted product to active catalog.
   */
  async adminRestoreItem(
    itemId: string,
  ): Promise<{ success: boolean; id: string; item?: CatalogItem }> {
    return requestWithFallback<{ success: boolean; id: string; item?: CatalogItem }>(
      `/api/v1/admin/geekstore/items/${itemId}/restore`,
      {
        method: 'POST',
      },
      () => {
        const storedItems = getFallbackItems();
        const itemIndex = storedItems.findIndex((i) => i.id === itemId);
        if (itemIndex !== -1) {
          storedItems[itemIndex].deletedAt = null;
          storedItems[itemIndex].isActive = true;
          storedItems[itemIndex].updatedAt = new Date().toISOString();
          saveFallbackItems(storedItems);
          return { success: true, id: itemId, item: storedItems[itemIndex] };
        }
        throw new Error('Item not found');
      },
    );
  },

  /**
   * Upload an image to the cloud storage provider via backend Cloudinary
   * (POST /api/v1/admin/geekstore/upload) with local fallback.
   */
  async uploadImage(
    file: File,
  ): Promise<{ success: boolean; url: string; provider?: string; publicId?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);
    formData.append('folder', 'geekstore');

    // 1. Upload directly to backend Cloudinary endpoint
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${getBackendUrl()}/api/v1/admin/geekstore/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;
        return {
          success: true,
          url: payload.url || payload.secure_url,
          provider: 'backend-cloudinary',
          publicId: payload.publicId || payload.public_id,
        };
      }
    } catch (e) {
      console.warn('Backend Cloudinary upload error, falling back to local route:', e);
    }

    // 2. Fallback to local Next.js proxy/handler if backend is offline
    const res = await fetch('/api/geekstore/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.error || `Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  },

  /**
   * GET /api/v1/admin/geekstore/orders
   * View all user orders across the platform with user profiles,
   * with filters for status, paymentStatus, paymentMethod, githubId, search.
   */
  async adminListOrders(
    params: AdminOrderFilterParams = {},
  ): Promise<AdminOrderListResponse> {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    if (params.status && params.status !== 'ALL') q.append('status', params.status);
    if (params.paymentStatus && params.paymentStatus !== 'ALL') q.append('paymentStatus', params.paymentStatus);
    if (params.paymentMethod && params.paymentMethod !== 'ALL') q.append('paymentMethod', params.paymentMethod);
    if (params.githubId) q.append('githubId', params.githubId);
    if (params.search) q.append('search', params.search);

    const path = `/api/v1/admin/geekstore/orders${q.toString() ? `?${q.toString()}` : ''}`;

    const raw = await requestWithFallback<any>(
      path,
      { method: 'GET' },
      () => {
        let orders = getFallbackAdminOrders();

        if (params.status && params.status !== 'ALL') {
          orders = orders.filter(
            (o) => o.status.toUpperCase() === params.status!.toUpperCase(),
          );
        }

        if (params.paymentStatus && params.paymentStatus !== 'ALL') {
          orders = orders.filter(
            (o) =>
              o.paymentStatus.toUpperCase() ===
              params.paymentStatus!.toUpperCase(),
          );
        }

        if (params.paymentMethod && params.paymentMethod !== 'ALL') {
          orders = orders.filter(
            (o) =>
              o.paymentMethod.toUpperCase() ===
              params.paymentMethod!.toUpperCase(),
          );
        }

        if (params.githubId && params.githubId.trim()) {
          const g = params.githubId.trim().toLowerCase();
          orders = orders.filter(
            (o) =>
              (o.githubId && o.githubId.toLowerCase().includes(g)) ||
              (o.user?.githubId && o.user.githubId.toLowerCase().includes(g)),
          );
        }

        if (params.search && params.search.trim()) {
          const s = params.search.trim().toLowerCase();
          orders = orders.filter(
            (o) =>
              o.id.toLowerCase().includes(s) ||
              o.contactNumber.toLowerCase().includes(s) ||
              o.shippingAddress.toLowerCase().includes(s) ||
              (o.user?.name && o.user.name.toLowerCase().includes(s)) ||
              (o.user?.email && o.user.email.toLowerCase().includes(s)) ||
              (o.user?.githubId && o.user.githubId.toLowerCase().includes(s)),
          );
        }

        const page = params.page || 1;
        const limit = params.limit || 50;
        const total = orders.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const skip = (page - 1) * limit;
        const paginated = orders.slice(skip, skip + limit);

        return { orders: paginated, total, page, limit, totalPages };
      },
    );

    const orders = Array.isArray(raw?.orders) ? raw.orders : Array.isArray(raw) ? raw : [];
    const total = raw?.pagination?.total ?? raw?.total ?? orders.length;
    const page = raw?.pagination?.page ?? raw?.page ?? 1;
    const limit = raw?.pagination?.limit ?? raw?.limit ?? 50;
    const totalPages = raw?.pagination?.totalPages ?? raw?.totalPages ?? (Math.ceil(total / limit) || 1);

    return { orders, total, page, limit, totalPages };
  },

  /**
   * PATCH /api/v1/admin/geekstore/orders/:orderId/status
   * Change Order Status with optional admin note.
   * Cancelling/rejecting auto-restocks items. Terminal statuses cannot be reverted.
   */
  async adminUpdateOrderStatus(
    orderId: string,
    payload: { status: OrderStatus; adminNote?: string },
  ): Promise<AdminOrder> {
    return requestWithFallback<AdminOrder>(
      `/api/v1/admin/geekstore/orders/${orderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      () => {
        const orders = getFallbackAdminOrders();
        const order = orders.find((o) => o.id === orderId);
        if (!order) {
          throw new Error('Order not found');
        }

        // Terminal status check
        const isTerminal = ['REJECTED', 'CANCELLED'].includes(order.status);
        const targetIsActive = !['REJECTED', 'CANCELLED'].includes(payload.status);
        if (isTerminal && targetIsActive) {
          throw new Error('Cannot move rejected or cancelled order back to active');
        }

        const shouldRestock =
          ['REJECTED', 'CANCELLED'].includes(payload.status) && !isTerminal;

        if (shouldRestock) {
          // Auto-restock items in catalog
          const catalog = getFallbackItems();
          for (const item of order.items) {
            const catItem = catalog.find((c) => c.id === item.itemId);
            if (catItem) {
              catItem.stock += item.quantity;
            }
          }
          saveFallbackItems(catalog);
          if (order.paymentStatus === 'COMPLETED') {
            order.paymentStatus = 'REFUNDED';
          }
        }

        order.status = payload.status;
        if (payload.adminNote !== undefined) {
          order.adminNote = payload.adminNote.trim();
        }
        order.updatedAt = new Date().toISOString();
        saveFallbackAdminOrders(orders);
        return { ...order };
      },
    );
  },

  /**
   * PATCH /api/v1/admin/geekstore/orders/:orderId/payment
   * Change Payment Status (e.g., mark as COMPLETED upon cash collection)
   * with optional admin note.
   */
  async adminUpdateOrderPayment(
    orderId: string,
    payload: { paymentStatus: PaymentStatus; adminNote?: string },
  ): Promise<AdminOrder> {
    return requestWithFallback<AdminOrder>(
      `/api/v1/admin/geekstore/orders/${orderId}/payment`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      () => {
        const orders = getFallbackAdminOrders();
        const order = orders.find((o) => o.id === orderId);
        if (!order) {
          throw new Error('Order not found');
        }

        order.paymentStatus = payload.paymentStatus;
        if (payload.adminNote !== undefined) {
          order.adminNote = payload.adminNote.trim();
        }
        order.updatedAt = new Date().toISOString();
        saveFallbackAdminOrders(orders);
        return { ...order };
      },
    );
  },
};

export default GeekstoreService;

