'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  Trash2,
} from 'lucide-react';
import { CatalogItem } from 'types/geekstore';

interface ProductDetailModalProps {
  item: CatalogItem | null;
  isOpen: boolean;
  isSelected?: boolean;
  initialSize?: string;
  initialQuantity?: number;
  onClose: () => void;
  onConfirmSelection: (item: CatalogItem, quantity: number, size?: string) => void;
  onRemoveSelection?: (itemId: string) => void;
}

export default function ProductDetailModal({
  item,
  isOpen,
  isSelected = false,
  initialSize,
  initialQuantity = 1,
  onClose,
  onConfirmSelection,
  onRemoveSelection,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (item) {
      if (initialSize) {
        setSelectedSize(initialSize);
      } else if (item.sizes && item.sizes.length > 0) {
        setSelectedSize(item.sizes[0]);
      } else {
        setSelectedSize('');
      }
      setQuantity(initialQuantity || 1);
    }
  }, [item, isOpen, initialSize, initialQuantity]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isOutOfStock = item.stock <= 0;
  const maxAllowedQuantity = Math.min(10, Math.max(1, item.stock));

  const handleIncrement = () => {
    if (quantity < maxAllowedQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[var(--r)] border border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-[var(--shadow)] backdrop-blur-2xl z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)]/80 text-[var(--fg)] border border-[var(--border)] transition-transform hover:scale-110 hover:text-[var(--accent)]"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Showcase */}
          <div className="relative aspect-square md:aspect-auto md:h-full min-h-[320px] bg-[var(--card-soft)] overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-raised)]/80 via-transparent to-transparent md:hidden" />
            <div className="absolute bottom-4 left-4">
              <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-[var(--card-bg)]/90 text-[var(--accent)] border border-[var(--border)] backdrop-blur-md">
                {item.category}
              </span>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 pr-6">
                <span className="text-xs uppercase tracking-widest text-[var(--muted)] font-mono">
                  ITEM ID: {item.id}
                </span>
                {isOutOfStock ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Out of Stock
                  </span>
                ) : item.stock <= 5 ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Only {item.stock} left
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--status-live-text)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-live-text)]" />
                    In Stock ({item.stock} units)
                  </span>
                )}
              </div>

              <h2 className="font-['DM_Sans',sans-serif] text-2xl font-bold text-[var(--fg)] tracking-tight">
                {item.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-sm font-mono text-[var(--muted)]">₹</span>
                <span className="font-['DM_Mono',monospace] text-3xl font-bold tracking-tight text-[var(--fg)]">
                  {item.price.toLocaleString('en-IN')}
                </span>
                <span className="ml-2 text-xs text-[var(--subtle)]">
                  Inclusive of all taxes
                </span>
              </div>

              <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--line)] pt-4">
                {item.description}
              </p>

              {/* Size Selector */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
                      Select Size
                    </label>
                    <span className="text-xs text-[var(--muted)]">
                      Regular Fit
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((size) => {
                      const isChosen = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[42px] h-10 px-3 rounded-lg text-xs font-semibold font-mono transition-all duration-200 border ${
                            isChosen
                              ? 'bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] shadow-[0_0_12px_rgba(88,185,154,0.3)]'
                              : 'bg-[var(--surface-2)] text-[var(--fg)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity <= 1}
                      onClick={handleDecrement}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--fg)] hover:bg-[var(--surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-['DM_Mono',monospace] text-sm font-bold text-[var(--fg)]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity >= maxAllowedQuantity}
                      onClick={handleIncrement}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--fg)] hover:bg-[var(--surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-[var(--subtle)]">
                    Max 10 per order
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 pt-6 border-t border-[var(--line)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    onConfirmSelection(item, quantity, selectedSize);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 px-4 text-sm font-semibold transition-all duration-200 bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] hover:shadow-[0_4px_16px_rgba(88,185,154,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check size={16} />
                  <span>{isSelected ? 'Update Selection' : 'Confirm Selection'}</span>
                </button>

                {isSelected && onRemoveSelection && (
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveSelection(item.id);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-full py-3 px-4 text-sm font-semibold border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--subtle)]">
                <span className="flex items-center gap-1">
                  <Truck size={13} /> Campus hand-delivery
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} /> Official GeekHaven Swag
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
