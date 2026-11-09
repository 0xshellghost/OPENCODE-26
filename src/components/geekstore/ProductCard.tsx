'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Plus } from 'lucide-react';
import { CatalogItem } from 'types/geekstore';
import SpotlightCard from 'components/reactbits/SpotlightCard';

interface ProductCardProps {
  item: CatalogItem;
  isSelected?: boolean;
  selectedSize?: string;
  selectedQuantity?: number;
  onSelect: (item: CatalogItem) => void;
  onToggleSelect: (item: CatalogItem, e: React.MouseEvent) => void;
}

export default function ProductCard({
  item,
  isSelected = false,
  selectedSize,
  selectedQuantity = 1,
  onSelect,
  onToggleSelect,
}: ProductCardProps) {
  const isOutOfStock = item.stock <= 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;

  return (
    <SpotlightCard
      spotlightColor="rgba(88, 185, 154, 0.12)"
      className={`group relative flex flex-col justify-between rounded-[var(--r)] border bg-[var(--surface)] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
        isSelected
          ? 'border-[var(--accent)] shadow-[0_0_24px_rgba(88,185,154,0.22)] ring-1 ring-[var(--accent)]'
          : 'border-[var(--border)] hover:border-[var(--border-accent)] hover:shadow-[var(--shadow)]'
      }`}
      onClick={() => onSelect(item)}
    >
      <div>
        {/* Header Category & Stock Status Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 min-w-0">
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--accent)] truncate max-w-[120px]">
            {item.category}
          </span>

          {isOutOfStock ? (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-red-400 whitespace-nowrap flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300 whitespace-nowrap flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Only {item.stock} left
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--status-live-text)] whitespace-nowrap flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-live-text)]" />
              In Stock
            </span>
          )}
        </div>

        {/* Product Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[14px] bg-[var(--card-soft)]">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />

          {/* Selected Badge Overlay */}
          {isSelected && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent-ink)] shadow-lg backdrop-blur-md">
              <Check size={12} className="stroke-[3]" />
              <span>Selected {selectedSize ? `(${selectedSize})` : ''}</span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="mt-3.5 flex flex-col gap-1.5">
          <h3 className="font-['DM_Sans',sans-serif] text-base font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Sizes Tag (Placed cleanly away from price) */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span className="text-[10.5px] font-mono text-[var(--subtle)] mr-0.5">
                Sizes:
              </span>
              {item.sizes.map((s) => (
                <span
                  key={s}
                  className="rounded px-1.5 py-0.5 text-[9.5px] font-mono font-medium bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Selection Action */}
      <div className="mt-4 pt-3.5 border-t border-[var(--line)]">
        <div className="mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-mono text-[var(--muted)]">₹</span>
            <span className="font-['DM_Mono',monospace] text-xl font-bold tracking-tight text-[var(--fg)]">
              {item.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => onToggleSelect(item, e)}
            className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-semibold transition-all duration-200 ${
              isSelected
                ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_2px_12px_rgba(88,185,154,0.35)] hover:bg-[var(--accent-hover)]'
                : 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isSelected ? (
              <>
                <Check size={14} className="stroke-[2.5]" />
                <span>Selected {selectedQuantity > 1 ? `(${selectedQuantity} pcs)` : ''}</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Select for Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}
