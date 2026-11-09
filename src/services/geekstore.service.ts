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

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

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

// Initial mock fallback dataset for seamless local development
const FALLBACK_ITEMS: CatalogItem[] = [
  {
    id: 'item-1',
    name: 'OpenCode 2026 Founder Hoodie',
    description:
      'Heavyweight 380 GSM fleece hoodie in Obsidian Black with subtle embroidered Kyoto cherry blossom motif and OpenCode terminal branding on sleeve.',
    imageUrl:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    category: 'Hoodies',
    price: 1499,
    stock: 24,
    isActive: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'item-2',
    name: 'GeekHaven Monochrome Tech Tee',
    description:
      '100% combed ring-spun cotton tee with high-density minimalist GeekHaven chest print and woven hem tag. Ultra-breathable for late-night coding sessions.',
    imageUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: 'T-Shirts',
    price: 699,
    stock: 45,
    isActive: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'item-3',
    name: 'OpenCode Sakura Oversized Tee',
    description:
      'Drop-shoulder 240 GSM oversized streetwear t-shirt featuring Kanji typography and Japanese watercolor cherry blossom illustration on the back.',
    imageUrl:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    category: 'T-Shirts',
    price: 799,
    stock: 4,
    isActive: true,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'item-4',
    name: 'Artisan Keyboard Deskmat (Kyoto Midnight)',
    description:
      '900x400mm waterproof micro-weave cloth gaming deskmat with stitched anti-fray edges and non-slip rubber base. Features the official OpenCode Kyoto scenery artwork.',
    imageUrl:
      'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    price: 899,
    stock: 12,
    isActive: true,
  },
  {
    id: 'item-5',
    name: 'Developer Holographic Sticker Pack (15 pcs)',
    description:
      'Waterproof, scratch-resistant vinyl and holographic stickers: Git, Linux, Vim, Rust, TypeScript, GeekHaven, and OpenCode edition badges.',
    imageUrl:
      'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=800&q=80',
    category: 'Stickers',
    price: 199,
    stock: 150,
    isActive: true,
  },
  {
    id: 'item-6',
    name: 'Stainless Steel Insulated Tumbler 750ml',
    description:
      'Double-walled vacuum insulated bottle in matte stealth black. Keeps cold drinks chilly for 24h and coffee hot for 12h. Laser-engraved with binary coordinate.',
    imageUrl:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    category: 'Drinkware',
    price: 599,
    stock: 0,
    isActive: true,
  },
  {
    id: 'item-7',
    name: 'Canvas Commuter Tote Bag',
    description:
      'Heavy-duty 14oz canvas tote with reinforced handles, padded interior sleeve for 15" laptops, and internal zipper pouch for dongles and keys.',
    imageUrl:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    price: 499,
    stock: 18,
    isActive: true,
  },
  {
    id: 'item-8',
    name: 'OpenCode Enamel Lapel Pin Set (3 pcs)',
    description:
      'Hard enamel pins with gold plating and butterfly clutch backing. Includes GeekHaven shield, Sakura blossom, and OpenCode terminal logo.',
    imageUrl:
      'https://images.unsplash.com/photo-1617050318658-a9a3175e34cb?auto=format&fit=crop&w=800&q=80',
    category: 'Accessories',
    price: 299,
    stock: 35,
    isActive: true,
  },
];

// Local storage key for fallback simulation
const FALLBACK_ORDERS_KEY = 'oc_geekstore_orders_v1';

const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'ord-gh-9841',
    githubId: 'tanvimakhija09',
    totalAmount: 2198,
    status: 'PLACED',
    paymentStatus: 'PENDING',
    paymentMethod: 'CASH',
    shippingAddress: 'Room 214, BH-3, Indian Institute of Information Technology, Allahabad - 211012',
    contactNumber: '+91 98765 43210',
    userNote: 'Please keep near reception if not reachable',
    adminNote: 'Awaiting cash collection at desk',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: {
      name: 'Tanvi Makhija',
      email: 'tanvi@iiita.ac.in',
      githubId: 'tanvimakhija09',
      college: 'IIIT Allahabad',
      avatarUrl: 'https://avatars.githubusercontent.com/u/10834241?v=4',
    },
    items: [
      {
        itemId: 'item-1',
        name: 'OpenCode 2026 Founder Hoodie',
        unitPrice: 1499,
        totalPrice: 1499,
        price: 1499,
        lineTotal: 1499,
        quantity: 1,
        size: 'M',
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        item: FALLBACK_ITEMS[0],
      },
      {
        itemId: 'item-2',
        name: 'GeekHaven Monochrome Tech Tee',
        unitPrice: 699,
        totalPrice: 699,
        price: 699,
        lineTotal: 699,
        quantity: 1,
        size: 'L',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        item: FALLBACK_ITEMS[1],
      },
    ],
  },
  {
    id: 'ord-gh-9830',
    githubId: 'torvalds',
    totalAmount: 1499,
    status: 'APPROVED',
    paymentStatus: 'COMPLETED',
    paymentMethod: 'UPI',
    shippingAddress: '45 Hacker Way, Silicon Valley, CA 94025',
    contactNumber: '+1 650 555 0199',
    adminNote: 'Payment verified via UPI (Ref #UPI882910)',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    user: {
      name: 'Linus Torvalds',
      email: 'torvalds@kernel.org',
      githubId: 'torvalds',
      college: 'University of Helsinki',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    },
    items: [
      {
        itemId: 'item-1',
        name: 'OpenCode 2026 Founder Hoodie',
        unitPrice: 1499,
        totalPrice: 1499,
        price: 1499,
        lineTotal: 1499,
        quantity: 1,
        size: 'XL',
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        item: FALLBACK_ITEMS[0],
      },
    ],
  },
  {
    id: 'ord-gh-9782',
    githubId: 'alexchen_dev',
    totalAmount: 899,
    status: 'FULFILLED',
    paymentStatus: 'COMPLETED',
    paymentMethod: 'ONLINE',
    shippingAddress: 'Hostel Nilgiri, IIT Delhi, Hauz Khas, New Delhi - 110016',
    contactNumber: '+91 99887 76655',
    adminNote: 'Dispatched via DTDC tracking #DT99281',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    user: {
      name: 'Alex Chen',
      email: 'alex.chen@iitd.ac.in',
      githubId: 'alexchen_dev',
      college: 'IIT Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    items: [
      {
        itemId: 'item-4',
        name: 'Artisan Keyboard Deskmat (Kyoto Midnight)',
        unitPrice: 899,
        totalPrice: 899,
        price: 899,
        lineTotal: 899,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80',
        item: FALLBACK_ITEMS[3],
      },
    ],
  },
  {
    id: 'ord-gh-9721',
    githubId: 'priyasharma',
    totalAmount: 799,
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'UPI',
    shippingAddress: 'Block 4, NIT Surathkal Campus, Srinivasnagar - 575025',
    contactNumber: '+91 91234 56789',
    adminNote: 'Cancelled by user, items auto-restocked to catalog',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    user: {
      name: 'Priya Sharma',
      email: 'priya@nits.ac.in',
      githubId: 'priyasharma',
      college: 'NIT Surathkal',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    items: [
      {
        itemId: 'item-3',
        name: 'OpenCode Sakura Oversized Tee',
        unitPrice: 799,
        totalPrice: 799,
        price: 799,
        lineTotal: 799,
        quantity: 1,
        size: 'M',
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
        item: FALLBACK_ITEMS[2],
      },
    ],
  },
];

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
  localStorage.setItem(FALLBACK_ORDERS_KEY, JSON.stringify(orders));
}

function getFallbackAdminOrders(): AdminOrder[] {
  if (typeof window === 'undefined') return INITIAL_ADMIN_ORDERS;
  try {
    const raw = localStorage.getItem(FALLBACK_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_ADMIN_ORDERS;
}

function saveFallbackAdminOrders(orders: AdminOrder[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FALLBACK_ORDERS_KEY, JSON.stringify(orders));
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
  const url = `${BACKEND_URL}${path}`;

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
      const data = await res.json();
      return (data?.data !== undefined ? data.data : data) as T;
    }

    // If 404, maybe it's under /api/v1 prefix?
    if (res.status === 404 && !path.startsWith('/api/v1')) {
      try {
        const altRes = await fetch(`${BACKEND_URL}/api/v1${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...(options.headers || {}),
          },
        });
        if (altRes.ok) {
          const altData = await altRes.json();
          return (altData?.data !== undefined ? altData.data : altData) as T;
        }
      } catch {
        // continue to normal handling
      }
    }

    // Try to parse error message from server
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMessage =
        errorJson.message || errorJson.error || JSON.stringify(errorJson);
    } catch {
      // ignore
    }

    // If fallback is provided and backend returned 401, 403, 404 or 5xx server error, use fallback
    if (fallbackFn && (res.status === 401 || res.status === 403 || res.status === 404 || res.status >= 500)) {
      return await fallbackFn();
    }

    throw new Error(errorMessage);
  } catch (error: any) {
    // If backend is unreachable or throws any error (Safari "Load failed", Chrome "Failed to fetch", etc.), use fallback
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
        let filtered = [...FALLBACK_ITEMS].filter((i) => i.isActive);

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
        const found = FALLBACK_ITEMS.find((i) => i.id === itemId);
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
        const item = FALLBACK_ITEMS.find((i) => i.id === itemId);
        if (!item) throw new Error('Product not found');
        if (item.stock < buyData.quantity) {
          throw new Error('Insufficient stock available');
        }

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
        let filtered = [...FALLBACK_ITEMS];

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
        FALLBACK_ITEMS.unshift(newItem);
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
        const item = FALLBACK_ITEMS.find((i) => i.id === itemId);
        if (!item) {
          throw new Error('Item not found');
        }
        if (payload.name !== undefined) item.name = payload.name.trim();
        if (payload.description !== undefined) item.description = payload.description.trim();
        if (payload.imageUrl !== undefined) item.imageUrl = payload.imageUrl.trim();
        if (payload.category !== undefined) item.category = payload.category.trim();
        if (payload.price !== undefined) item.price = Number(payload.price);
        if (payload.stock !== undefined) item.stock = Number(payload.stock);
        if (payload.isActive !== undefined) item.isActive = Boolean(payload.isActive);
        if (payload.sizes !== undefined) item.sizes = payload.sizes;
        item.updatedAt = new Date().toISOString();
        return { ...item };
      },
    );
  },

  /**
   * DELETE /api/v1/admin/geekstore/items/:itemId
   * Soft deletes a product from the catalog.
   */
  async adminDeleteItem(itemId: string): Promise<{ success: boolean; id: string; item?: CatalogItem }> {
    return requestWithFallback<{ success: boolean; id: string; item?: CatalogItem }>(
      `/api/v1/admin/geekstore/items/${itemId}`,
      {
        method: 'DELETE',
      },
      () => {
        const item = FALLBACK_ITEMS.find((i) => i.id === itemId);
        if (item) {
          item.deletedAt = new Date().toISOString();
          item.isActive = false;
        }
        return { success: true, id: itemId, item };
      },
    );
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
          for (const item of order.items) {
            const catItem = FALLBACK_ITEMS.find((c) => c.id === item.itemId);
            if (catItem) {
              catItem.stock += item.quantity;
            }
          }
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

