'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  CreditCard,
  MapPin,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useGeekstoreCart } from 'contexts/GeekstoreCartContext';
import { CheckoutPayload, Order } from 'types/geekstore';

export default function CheckoutModal() {
  const {
    cart,
    isCheckoutOpen,
    directBuyItem,
    closeCheckout,
    processCheckout,
    isLoading,
  } = useGeekstoreCart();

  const [formData, setFormData] = useState<CheckoutPayload>({
    shippingAddress: '',
    contactNumber: '',
    userNote: '',
    paymentMethod: 'CASH',
  });

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (isCheckoutOpen) {
      setConfirmedOrder(null);
      setValidationError('');
    }
  }, [isCheckoutOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCheckoutOpen && !isLoading) {
        closeCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckoutOpen, isLoading, closeCheckout]);

  if (!isCheckoutOpen) return null;

  // Calculate items summary for this checkout
  const isDirectBuy = !!directBuyItem;
  const items = isDirectBuy
    ? [
        {
          name: directBuyItem.item.name,
          quantity: directBuyItem.quantity,
          size: directBuyItem.size,
          price: directBuyItem.item.price,
          total: directBuyItem.item.price * directBuyItem.quantity,
        },
      ]
    : cart?.items.map((i) => ({
        name: i.name || i.item?.name || 'Item',
        quantity: i.quantity,
        size: i.size,
        price: i.price || i.item?.price || 0,
        total: (i.price || i.item?.price || 0) * i.quantity,
      })) || [];

  const totalAmount = isDirectBuy
    ? directBuyItem.item.price * directBuyItem.quantity
    : cart?.subtotal || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.shippingAddress.trim()) {
      setValidationError('Please provide your campus delivery address or room number.');
      return;
    }
    if (formData.shippingAddress.length > 1000) {
      setValidationError('Shipping address must be under 1000 characters.');
      return;
    }

    if (!formData.contactNumber.trim()) {
      setValidationError('Contact number is required for delivery coordination.');
      return;
    }
    if (formData.contactNumber.length > 30) {
      setValidationError('Contact number must be under 30 characters.');
      return;
    }

    if (formData.userNote && formData.userNote.length > 500) {
      setValidationError('Delivery notes cannot exceed 500 characters.');
      return;
    }

    const order = await processCheckout(formData);
    if (order) {
      setConfirmedOrder(order);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isLoading && closeCheckout()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-[var(--r)] border border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-[var(--shadow)] backdrop-blur-2xl z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Truck size={16} />
            </div>
            <h3 className="font-['DM_Sans',sans-serif] text-base font-bold text-[var(--fg)]">
              {confirmedOrder
                ? 'Order Confirmed'
                : isDirectBuy
                ? 'Instant Checkout'
                : 'Cart Checkout'}
            </h3>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={closeCheckout}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)] transition-colors disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        {confirmedOrder ? (
          /* Confirmation Success View */
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--status-live-bg)] text-[var(--status-live-text)] border border-[var(--status-live-border)] mb-4 animate-in zoom-in duration-300">
              <CheckCircle2 size={36} />
            </div>

            <h4 className="font-['DM_Sans',sans-serif] text-xl font-bold text-[var(--fg)]">
              Thank You! Your Order is Placed.
            </h4>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Your merchandise request has been recorded. Our team will coordinate campus delivery.
            </p>

            <div className="my-6 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-3">
                <span className="text-xs text-[var(--muted)]">Order ID</span>
                <span className="font-['DM_Mono',monospace] text-xs font-bold text-[var(--accent)]">
                  {confirmedOrder.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                <span>Total Payable</span>
                <span className="font-['DM_Mono',monospace] text-sm font-bold text-[var(--fg)]">
                  ₹{confirmedOrder.totalAmount.toLocaleString('en-IN')} ({confirmedOrder.paymentMethod})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Delivery To</span>
                <span className="text-xs text-[var(--fg)] truncate max-w-[240px]">
                  {confirmedOrder.shippingAddress}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/user/geekstore/orders"
                onClick={closeCheckout}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-2.5 px-4 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-all shadow-[0_2px_12px_rgba(88,185,154,0.3)]"
              >
                <span>View My Orders</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={closeCheckout}
                className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-2.5 px-4 text-xs font-semibold text-[var(--fg)] hover:bg-[var(--surface)] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmit} className="p-6">
            {/* Validation Error Banner */}
            {validationError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Order Items Preview */}
            <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-2 flex items-center justify-between">
                <span>Items ({items.length})</span>
                <span className="font-mono text-[var(--accent)] font-bold">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {items.map((itm, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[var(--fg)] truncate max-w-[260px]">
                      {itm.name} {itm.size && `(${itm.size})`} × {itm.quantity}
                    </span>
                    <span className="font-mono text-[var(--muted)]">
                      ₹{itm.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg)] mb-1.5">
                <MapPin size={13} className="text-[var(--accent)]" />
                <span>Campus / Hostel Delivery Address *</span>
              </label>
              <textarea
                required
                maxLength={1000}
                rows={2}
                value={formData.shippingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, shippingAddress: e.target.value })
                }
                placeholder="e.g. Room 214, BH-3, IIIT Allahabad Campus"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-xs text-[var(--fg)] placeholder-[var(--subtle)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
              />
              <span className="text-[10px] text-[var(--subtle)]">
                Provide hostel room, department, or campus pickup spot.
              </span>
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg)] mb-1.5">
                <Phone size={13} className="text-[var(--accent)]" />
                <span>Contact Phone Number *</span>
              </label>
              <input
                type="tel"
                required
                maxLength={30}
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                placeholder="e.g. +91 9876543210"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs text-[var(--fg)] placeholder-[var(--subtle)] outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* User Delivery Note */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg)] mb-1.5">
                <FileText size={13} className="text-[var(--accent)]" />
                <span>Special Instructions (Optional)</span>
              </label>
              <input
                type="text"
                maxLength={500}
                value={formData.userNote || ''}
                onChange={(e) =>
                  setFormData({ ...formData, userNote: e.target.value })
                }
                placeholder="e.g. Call before coming; leave with roommate if not available"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs text-[var(--fg)] placeholder-[var(--subtle)] outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg)] mb-2">
                <CreditCard size={13} className="text-[var(--accent)]" />
                <span>Payment Method</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CASH', label: 'Cash on Delivery (Campus)', sub: 'Pay in cash upon delivery' },
                  { id: 'UPI', label: 'UPI / Online Payment', sub: 'Scan QR or UPI transfer' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: pm.id })
                    }
                    className={`flex flex-col text-left rounded-xl p-3 border transition-all ${
                      formData.paymentMethod === pm.id
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]/20'
                        : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--line)]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-[var(--fg)]">
                      {pm.label}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] mt-0.5">
                      {pm.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-3 px-4 text-sm font-semibold text-[var(--accent-ink)] transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_4px_16px_rgba(88,185,154,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-[var(--accent-ink)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Place Order • ₹{totalAmount.toLocaleString('en-IN')}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

