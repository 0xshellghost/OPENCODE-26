'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useToast } from '@chakra-ui/react';
import {
  Cart,
  CatalogItem,
  CheckoutPayload,
  DirectBuyPayload,
  Order,
} from 'types/geekstore';
import GeekstoreService, {
  generateIdempotencyKey,
} from 'services/geekstore.service';
import { useAuth } from 'contexts/AuthContext';

interface DirectBuyItem {
  item: CatalogItem;
  quantity: number;
  size?: string;
}

interface GeekstoreCartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (
    itemId: string,
    quantity?: number,
    size?: string,
  ) => Promise<boolean>;
  updateCartItem: (
    cartItemId: string,
    quantity?: number,
    size?: string,
  ) => Promise<boolean>;
  removeCartItem: (cartItemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  // Checkout modal controls
  isCheckoutOpen: boolean;
  directBuyItem: DirectBuyItem | null;
  openCheckout: (directItem?: DirectBuyItem) => void;
  closeCheckout: () => void;
  processCheckout: (payload: CheckoutPayload) => Promise<Order | null>;
  totalCartCount: number;
}

const GeekstoreCartContext = createContext<GeekstoreCartContextType | undefined>(
  undefined,
);

export function GeekstoreCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [directBuyItem, setDirectBuyItem] = useState<DirectBuyItem | null>(null);

  const toast = useToast();
  const { isLoggedIn } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await GeekstoreService.getCart();
      setCart(data);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, isLoggedIn]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = (directItem?: DirectBuyItem) => {
    if (directItem) {
      setDirectBuyItem(directItem);
    } else {
      setDirectBuyItem(null);
    }
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setDirectBuyItem(null);
  };

  const addToCart = async (
    itemId: string,
    quantity = 1,
    size?: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const updatedCart = await GeekstoreService.addToCart({
        itemId,
        quantity,
        size,
      });
      setCart(updatedCart);
      toast({
        title: 'Added to Cart',
        description: `Successfully added ${quantity} item${quantity > 1 ? 's' : ''} to your cart.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return true;
    } catch (err: any) {
      toast({
        title: 'Could not add to cart',
        description: err?.message || 'Something went wrong.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (
    cartItemId: string,
    quantity?: number,
    size?: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const updatedCart = await GeekstoreService.updateCartItem(cartItemId, {
        quantity,
        size,
      });
      setCart(updatedCart);
      return true;
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.message || 'Failed to update item.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCartItem = async (cartItemId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const updatedCart = await GeekstoreService.removeCartItem(cartItemId);
      setCart(updatedCart);
      toast({
        title: 'Item removed',
        description: 'Product removed from your cart.',
        status: 'info',
        duration: 2500,
        isClosable: true,
      });
      return true;
    } catch (err: any) {
      toast({
        title: 'Failed to remove',
        description: err?.message || 'Could not remove item.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const updatedCart = await GeekstoreService.clearCart();
      setCart(updatedCart);
      toast({
        title: 'Cart Cleared',
        description: 'All items removed from your cart.',
        status: 'info',
        duration: 2500,
        isClosable: true,
      });
      return true;
    } catch (err: any) {
      toast({
        title: 'Could not clear cart',
        description: err?.message || 'Something went wrong.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const processCheckout = async (
    payload: CheckoutPayload,
  ): Promise<Order | null> => {
    try {
      setIsLoading(true);
      const idempotencyKey = generateIdempotencyKey();

      let order: Order;
      if (directBuyItem) {
        order = await GeekstoreService.directBuy(
          directBuyItem.item.id,
          {
            ...payload,
            quantity: directBuyItem.quantity,
            size: directBuyItem.size,
          },
          idempotencyKey,
        );
      } else {
        order = await GeekstoreService.checkoutCart(payload, idempotencyKey);
        // Refresh local cart after successful cart checkout
        await fetchCart();
      }

      toast({
        title: 'Order Placed Successfully! 🎉',
        description: `Order ID: ${order.id}. Track it anytime under My Orders.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return order;
    } catch (err: any) {
      toast({
        title: 'Checkout Failed',
        description:
          err?.message ||
          'Failed to place order. Please review your details and stock availability.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const totalCartCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <GeekstoreCartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        isCheckoutOpen,
        directBuyItem,
        openCheckout,
        closeCheckout,
        processCheckout,
        totalCartCount,
      }}
    >
      {children}
    </GeekstoreCartContext.Provider>
  );
}

export function useGeekstoreCart() {
  const ctx = useContext(GeekstoreCartContext);
  if (!ctx) {
    throw new Error(
      'useGeekstoreCart must be used within a GeekstoreCartProvider',
    );
  }
  return ctx;
}

