'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Package,
  Calendar,
  MapPin,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from 'types/geekstore';

interface OrderCardProps {
  order: Order;
  onCancelOrder: (orderId: string) => Promise<void>;
}

export default function OrderCard({ order, onCancelOrder }: OrderCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const canCancel = order.status === 'PLACED';

  const handleCancelClick = async () => {
    setIsCancelling(true);
    try {
      await onCancelOrder(order.id);
      setShowConfirmCancel(false);
    } finally {
      setIsCancelling(false);
    }
  };

  // Status badge styling matching the portal's design system
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
        return (
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Clock size={12} /> Placed
          </span>
        );
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-accent)]">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--status-live-bg)] text-[var(--status-live-text)] border border-[var(--status-live-border)]">
            <Truck size={12} /> Fulfilled
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--status-concluded-bg)] text-[var(--status-concluded-text)] border border-[var(--status-concluded-border)]">
            <RotateCcw size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--surface-2)] text-[var(--muted)]">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-[var(--status-live-bg)] text-[var(--status-live-text)] border border-[var(--status-live-border)]">
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-[var(--status-upcoming-bg)] text-[var(--status-upcoming-text)] border border-[var(--status-upcoming-border)]">
            Payment Pending
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            Refunded
          </span>
        );
      case 'FAILED':
        return (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            Payment Failed
          </span>
        );
      default:
        return (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold bg-[var(--surface-2)] text-[var(--muted)]">
            {status}
          </span>
        );
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 backdrop-blur-xl shadow-[var(--shadow)] transition-all">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono text-[var(--subtle)]">
              ORDER
            </span>
            <span className="font-['DM_Mono',monospace] text-sm font-bold text-[var(--fg)]">
              #{order.id}
            </span>
          </div>
          <span className="text-[var(--line)]">•</span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getPaymentStatusBadge(order.paymentStatus)}
          {getOrderStatusBadge(order.status)}
        </div>
      </div>

      {/* Purchased Items List */}
      <div className="space-y-3 mb-5">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--card-soft)]">
                <Image
                  src={item.imageUrl || '/images/kyoto-garden.png'}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-['DM_Sans',sans-serif] text-sm font-semibold text-[var(--fg)] truncate">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                  {item.size && (
                    <span className="font-mono text-[11px] text-[var(--accent)]">
                      Size: {item.size}
                    </span>
                  )}
                  <span>Qty: {item.quantity}</span>
                  <span>•</span>
                  <span className="font-mono">
                    ₹{item.price.toLocaleString('en-IN')} each
                  </span>
                </div>
              </div>
            </div>

            <div className="font-['DM_Mono',monospace] text-sm font-bold text-[var(--fg)] flex-shrink-0">
              ₹{(item.lineTotal || item.price * item.quantity).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Order Info & Total Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-4">
        {/* Delivery Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--fg)]">Delivery Address: </span>
              <span className="text-[var(--muted)]">{order.shippingAddress}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[var(--accent)] flex-shrink-0" />
            <div>
              <span className="font-semibold text-[var(--fg)]">Contact: </span>
              <span className="text-[var(--muted)] font-mono">{order.contactNumber}</span>
            </div>
          </div>
          {order.userNote && (
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-[var(--subtle)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--fg)]">Notes: </span>
                <span className="text-[var(--muted)] italic">{order.userNote}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-[var(--line)] pt-3 md:pt-0 md:pl-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span>Payment Mode:</span>
            <span className="font-mono font-medium text-[var(--fg)]">{order.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
            <span>Campus Fulfillment:</span>
            <span className="text-[var(--status-live-text)] font-semibold">FREE</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-2">
            <span className="text-sm font-bold text-[var(--fg)]">Total Paid / Due:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-mono text-[var(--muted)]">₹</span>
              <span className="font-['DM_Mono',monospace] text-xl font-bold text-[var(--accent)]">
                {order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Guard Section */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
        <div className="text-xs text-[var(--subtle)]">
          {canCancel ? (
            <span>Order is pending fulfillment. You may cancel if needed.</span>
          ) : (
            <span>
              {order.status === 'CANCELLED'
                ? 'This order has been cancelled.'
                : 'Order has been processed and cannot be cancelled.'}
            </span>
          )}
        </div>

        {canCancel && (
          <div>
            {showConfirmCancel ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 font-medium">Are you sure?</span>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelClick}
                  className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setShowConfirmCancel(false)}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                >
                  No, Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmCancel(true)}
                className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

