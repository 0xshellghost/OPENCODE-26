'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useGeekstoreCart } from 'contexts/GeekstoreCartContext';

export default function CartDrawer() {
  const {
    cart,
    isLoading,
    isCartOpen,
    closeCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    openCheckout,
  } = useGeekstoreCart();

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const canCheckout =
    cart?.canCheckout !== false && items.length > 0 && !isLoading;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative flex h-full w-full max-w-md flex-col justify-between border-l border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-2xl backdrop-blur-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-['DM_Sans',sans-serif] text-base font-bold text-[var(--fg)]">
                Your Shopping Cart
              </h2>
              <span className="text-xs text-[var(--muted)]">
                {items.length} unique item{items.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => clearCart()}
                title="Clear all items"
                className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-[var(--subtle)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Body: Line Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--subtle)] mb-4">
                <ShoppingBag size={28} />
              </div>
              <h3 className="font-['DM_Sans',sans-serif] text-lg font-semibold text-[var(--fg)]">
                Your cart is empty
              </h3>
              <p className="mt-1 max-w-[220px] text-xs text-[var(--muted)]">
                Explore the official Geekstore catalog and add your favorite swag!
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-all shadow-[0_2px_12px_rgba(88,185,154,0.3)]"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            items.map((lineItem) => {
              const itemDetails = lineItem.item;
              const hasStockIssue =
                lineItem.isAvailable === false ||
                (itemDetails && itemDetails.stock < lineItem.quantity);

              return (
                <div
                  key={lineItem.id}
                  className={`relative flex gap-3.5 rounded-xl border p-3 transition-all ${
                    hasStockIssue
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'border-[var(--border)] bg-[var(--surface-2)]/60'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--card-soft)]">
                    <Image
                      src={lineItem.imageUrl || '/images/kyoto-garden.png'}
                      alt={lineItem.name || 'Product'}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Item Content */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-['DM_Sans',sans-serif] text-sm font-semibold text-[var(--fg)] line-clamp-1">
                          {lineItem.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeCartItem(lineItem.id)}
                          className="text-[var(--subtle)] hover:text-red-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs">
                        {lineItem.size && (
                          <span className="rounded bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[var(--accent)] border border-[var(--border)]">
                            Size: {lineItem.size}
                          </span>
                        )}
                        <span className="font-mono text-xs text-[var(--muted)]">
                          ₹{(lineItem.price || 0).toLocaleString('en-IN')} each
                        </span>
                      </div>
                    </div>

                    {/* Stock Alert Warning */}
                    {hasStockIssue && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
                        <AlertTriangle size={12} />
                        <span>
                          {itemDetails && itemDetails.stock === 0
                            ? 'Out of stock'
                            : `Only ${itemDetails?.stock || 0} remaining`}
                        </span>
                      </div>
                    )}

                    {/* Quantity Controls & Line Total */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem(
                              lineItem.id,
                              lineItem.quantity - 1,
                              lineItem.size,
                            )
                          }
                          className="flex h-6 w-6 items-center justify-center text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 text-center font-['DM_Mono',monospace] text-xs font-bold text-[var(--fg)]">
                          {lineItem.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={
                            lineItem.quantity >= 10 ||
                            (itemDetails &&
                              lineItem.quantity >= itemDetails.stock)
                          }
                          onClick={() =>
                            updateCartItem(
                              lineItem.id,
                              lineItem.quantity + 1,
                              lineItem.size,
                            )
                          }
                          className="flex h-6 w-6 items-center justify-center text-[var(--fg)] hover:text-[var(--accent)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <div className="font-['DM_Mono',monospace] text-sm font-bold text-[var(--fg)]">
                        ₹
                        {(
                          lineItem.lineTotal ||
                          (lineItem.price || 0) * lineItem.quantity
                        ).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer: Subtotal and Checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-[var(--line)] bg-[var(--surface-raised)]/90 px-6 py-5 backdrop-blur-md">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Subtotal</span>
                <span className="font-mono text-sm text-[var(--fg)]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Campus Delivery</span>
                <span className="font-mono text-xs text-[var(--status-live-text)] font-medium">
                  FREE
                </span>
              </div>
              <div className="border-t border-[var(--line)] pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--fg)]">Total</span>
                <span className="font-['DM_Mono',monospace] text-xl font-bold text-[var(--accent)]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canCheckout}
              onClick={() => {
                closeCart();
                openCheckout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-3 px-4 text-sm font-semibold text-[var(--accent-ink)] transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_4px_16px_rgba(88,185,154,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--accent)]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </button>

            {!canCheckout && (
              <p className="mt-2 text-center text-[11px] text-red-400">
                Please resolve stock warnings or adjust quantities before checking
                out.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

