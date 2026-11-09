import {
  CatalogItem,
  Cart,
  CartItem,
  CheckoutPayload,
  DirectBuyPayload,
  ListItemsParams,
  ListItemsResponse,
  Order,
  OrdersParams,
  OrdersResponse,
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
const FALLBACK_CART_KEY = 'oc_geekstore_cart_v1';
const FALLBACK_ORDERS_KEY = 'oc_geekstore_orders_v1';

function getFallbackCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], subtotal: 0, totalItems: 0, canCheckout: true };
  }
  try {
    const raw = localStorage.getItem(FALLBACK_CART_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return { items: [], subtotal: 0, totalItems: 0, canCheckout: true };
}

function saveFallbackCart(cart: Cart) {
  if (typeof window === 'undefined') return;
  cart.totalItems = cart.items.reduce((acc, i) => acc + i.quantity, 0);
  cart.subtotal = cart.items.reduce(
    (acc, i) => acc + (i.price || 0) * i.quantity,
    0,
  );
  cart.canCheckout =
    cart.items.length > 0 &&
    cart.items.every((i) => i.isAvailable !== false && (i.quantity <= 10));
  localStorage.setItem(FALLBACK_CART_KEY, JSON.stringify(cart));
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

    // If fallback is provided and backend returned 404 or 5xx server error, use fallback
    if (fallbackFn && (res.status === 404 || res.status >= 500)) {
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
   * GET /geekstore/cart
   * Retrieve the current user's synchronized cart.
   */
  async getCart(): Promise<Cart> {
    return requestWithFallback<Cart>(
      '/geekstore/cart',
      { method: 'GET' },
      () => getFallbackCart(),
    );
  },

  /**
   * POST /geekstore/cart/items
   * Add a product variant to the cart.
   */
  async addToCart({
    itemId,
    quantity,
    size,
  }: {
    itemId: string;
    quantity: number;
    size?: string;
  }): Promise<Cart> {
    return requestWithFallback<Cart>(
      '/geekstore/cart/items',
      {
        method: 'POST',
        body: JSON.stringify({ itemId, quantity, size }),
      },
      () => {
        const item = FALLBACK_ITEMS.find((i) => i.id === itemId);
        if (!item) throw new Error('Product not found');
        if (item.stock < quantity) throw new Error('Insufficient stock available');

        const cart = getFallbackCart();
        const existingIndex = cart.items.findIndex(
          (ci) => ci.itemId === itemId && ci.size === size,
        );

        if (existingIndex > -1) {
          const newQty = cart.items[existingIndex].quantity + quantity;
          if (newQty > 10) {
            throw new Error('Maximum 10 units allowed per item');
          }
          if (newQty > item.stock) {
            throw new Error(`Only ${item.stock} units available in stock`);
          }
          cart.items[existingIndex].quantity = newQty;
          cart.items[existingIndex].lineTotal = newQty * item.price;
        } else {
          if (quantity > 10) {
            throw new Error('Maximum 10 units allowed per item');
          }
          cart.items.push({
            id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            itemId: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            category: item.category,
            item,
            quantity,
            size,
            isAvailable: item.stock >= quantity,
            lineTotal: quantity * item.price,
          });
        }

        saveFallbackCart(cart);
        return cart;
      },
    );
  },

  /**
   * PATCH /geekstore/cart/items/:cartItemId
   * Update quantity or size of a line item in cart.
   */
  async updateCartItem(
    cartItemId: string,
    { quantity, size }: { quantity?: number; size?: string },
  ): Promise<Cart> {
    return requestWithFallback<Cart>(
      `/geekstore/cart/items/${cartItemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ quantity, size }),
      },
      () => {
        const cart = getFallbackCart();
        const itemIndex = cart.items.findIndex((ci) => ci.id === cartItemId);
        if (itemIndex === -1) throw new Error('Cart item not found');

        const current = cart.items[itemIndex];
        const product =
          current.item || FALLBACK_ITEMS.find((i) => i.id === current.itemId);

        if (quantity !== undefined) {
          if (quantity < 1) {
            cart.items.splice(itemIndex, 1);
          } else {
            if (quantity > 10) throw new Error('Quantity cannot exceed 10');
            if (product && product.stock < quantity) {
              throw new Error(`Only ${product.stock} units available in stock`);
            }
            current.quantity = quantity;
            current.lineTotal = quantity * (current.price || product?.price || 0);
          }
        }

        if (size !== undefined) {
          current.size = size;
        }

        saveFallbackCart(cart);
        return cart;
      },
    );
  },

  /**
   * DELETE /geekstore/cart/items/:cartItemId
   * Remove a line item from the cart.
   */
  async removeCartItem(cartItemId: string): Promise<Cart> {
    return requestWithFallback<Cart>(
      `/geekstore/cart/items/${cartItemId}`,
      { method: 'DELETE' },
      () => {
        const cart = getFallbackCart();
        cart.items = cart.items.filter((ci) => ci.id !== cartItemId);
        saveFallbackCart(cart);
        return cart;
      },
    );
  },

  /**
   * DELETE /geekstore/cart
   * Clear all items from the cart.
   */
  async clearCart(): Promise<Cart> {
    return requestWithFallback<Cart>(
      '/geekstore/cart',
      { method: 'DELETE' },
      () => {
        const cart: Cart = {
          items: [],
          subtotal: 0,
          totalItems: 0,
          canCheckout: false,
        };
        saveFallbackCart(cart);
        return cart;
      },
    );
  },

  /**
   * POST /geekstore/cart/checkout
   * Checkout entire cart with shipping and payment info.
   * Includes x-idempotency-key header.
   */
  async checkoutCart(
    checkoutData: CheckoutPayload,
    idempotencyKey?: string,
  ): Promise<Order> {
    const key = idempotencyKey || generateIdempotencyKey();

    return requestWithFallback<Order>(
      '/geekstore/cart/checkout',
      {
        method: 'POST',
        headers: {
          'x-idempotency-key': key,
        },
        body: JSON.stringify(checkoutData),
      },
      () => {
        const cart = getFallbackCart();
        if (cart.items.length === 0) {
          throw new Error('Your cart is empty');
        }

        const newOrder: Order = {
          id: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'PLACED',
          paymentStatus: 'PENDING',
          paymentMethod: checkoutData.paymentMethod || 'CASH',
          shippingAddress: checkoutData.shippingAddress,
          contactNumber: checkoutData.contactNumber,
          userNote: checkoutData.userNote,
          idempotencyKey: key,
          items: cart.items.map((ci) => ({
            id: ci.id,
            itemId: ci.itemId,
            name: ci.name || ci.item?.name || 'Item',
            imageUrl: ci.imageUrl || ci.item?.imageUrl,
            size: ci.size,
            quantity: ci.quantity,
            price: ci.price || ci.item?.price || 0,
            lineTotal: (ci.price || ci.item?.price || 0) * ci.quantity,
          })),
          totalAmount: cart.subtotal,
          createdAt: new Date().toISOString(),
        };

        const orders = getFallbackOrders();
        orders.unshift(newOrder);
        saveFallbackOrders(orders);

        // Clear cart after checkout
        saveFallbackCart({
          items: [],
          subtotal: 0,
          totalItems: 0,
          canCheckout: false,
        });

        return newOrder;
      },
    );
  },

  /**
   * POST /geekstore/items/:itemId/buy
   * Direct instant purchase for a single item without adding to cart.
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
};

export default GeekstoreService;

