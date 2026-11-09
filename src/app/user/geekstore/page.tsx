'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { CatalogItem } from 'types/geekstore';
import GeekstoreService from 'services/geekstore.service';
import PageHeading from 'components/japanese/PageHeading';
import ProductCard from 'components/geekstore/ProductCard';
import ProductDetailModal from 'components/geekstore/ProductDetailModal';

// Link to the external order form (e.g. Google Form, Typeform, etc.)
// Replace with your actual form URL or set NEXT_PUBLIC_GEEKSTORE_FORM_URL in .env
export const ORDER_FORM_URL =
  process.env.NEXT_PUBLIC_GEEKSTORE_FORM_URL || 'https://forms.google.com';

interface SelectedProductState {
  item: CatalogItem;
  quantity: number;
  size?: string;
}

export default function GeekstorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 8;

  // Selected products state
  const [selectedMap, setSelectedMap] = useState<Map<string, SelectedProductState>>(
    new Map(),
  );

  // Selected product for Detail Modal
  const [modalProduct, setModalProduct] = useState<CatalogItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const toast = useToast();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStockToggle = () => {
    setInStockOnly((prev) => !prev);
    setPage(1);
  };

  // Fetch items with React Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['geekstore-items', page, limit, searchQuery, inStockOnly],
    queryFn: () =>
      GeekstoreService.listItems({
        page,
        limit,
        search: searchQuery,
        inStockOnly,
      }),
  });

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  // Calculate selected total quantity and amount
  const selectedEntries = Array.from(selectedMap.values());
  const totalSelectedCount = selectedEntries.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );
  const totalSelectedAmount = selectedEntries.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0,
  );

  const handleOpenDetail = (item: CatalogItem) => {
    setModalProduct(item);
    setIsDetailOpen(true);
  };

  const handleToggleSelectCard = (item: CatalogItem, e: React.MouseEvent) => {
    e.stopPropagation();

    // If item has sizes, open modal to let user choose size
    if (item.sizes && item.sizes.length > 0 && !selectedMap.has(item.id)) {
      handleOpenDetail(item);
      return;
    }

    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        toast({
          title: 'Removed from selection',
          description: `${item.name} removed.`,
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      } else {
        const defaultSize =
          item.sizes && item.sizes.length > 0 ? item.sizes[0] : undefined;
        next.set(item.id, {
          item,
          quantity: 1,
          size: defaultSize,
        });
        toast({
          title: 'Item Selected',
          description: `${item.name} added to your selection.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
      return next;
    });
  };

  const handleConfirmModalSelection = (
    item: CatalogItem,
    quantity: number,
    size?: string,
  ) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      next.set(item.id, { item, quantity, size });
      return next;
    });
    toast({
      title: 'Selection Updated',
      description: `${item.name} ${size ? `(${size})` : ''} × ${quantity} selected.`,
      status: 'success',
      duration: 2500,
      isClosable: true,
    });
  };

  const handleRemoveModalSelection = (itemId: string) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
    toast({
      title: 'Item removed',
      description: 'Removed from selection.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleProceedToForm = () => {
    if (totalSelectedCount === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one product before proceeding.',
        status: 'warning',
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    // Open form link in a new tab
    if (typeof window !== 'undefined') {
      window.open(ORDER_FORM_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
      {/* Page Header */}
      <PageHeading
        eyebrow="GEEKSTORE / MERCHANDISE & GEAR"
        title="Official Geekstore"
        description="Exclusive OpenCode and GeekHaven apparel, hacker accessories, dev stickers, and limited-edition swag. Select your items and proceed to the order form."
        rightContent={
          <div className="flex items-center gap-3">
            <Link
              href="/user/geekstore/orders"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              <Package size={14} />
              <span>My Orders</span>
            </Link>

            <button
              type="button"
              onClick={handleProceedToForm}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                totalSelectedCount > 0
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] shadow-[0_2px_14px_rgba(88,185,154,0.35)]'
                  : 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              <span>Proceed to Form</span>
              {totalSelectedCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--accent-ink)] px-1 font-mono text-[11px] font-bold text-[var(--accent)]">
                  {totalSelectedCount}
                </span>
              )}
              <ExternalLink size={13} />
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar (Category filter removed) */}
      <div className="mt-8 mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 backdrop-blur-xl shadow-[var(--shadow)]">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search hoodies, tees, stickers, deskmats..."
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)] pl-10 pr-10 py-2.5 text-xs text-[var(--fg)] placeholder-[var(--subtle)] outline-none focus:border-[var(--accent)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)] hover:text-[var(--fg)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* In-Stock Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStockToggle}
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-all ${
              inStockOnly
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_10px_rgba(88,185,154,0.2)]'
                : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                inStockOnly
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'border border-[var(--subtle)]'
              }`}
            >
              {inStockOnly && <Check size={10} />}
            </div>
            <span>In Stock Only</span>
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="aspect-[16/10] w-full rounded-[14px] bg-[var(--surface-2)]" />
              <div className="space-y-2 mt-4">
                <div className="h-4 w-3/4 rounded bg-[var(--surface-2)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--surface-2)]" />
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line)] flex justify-between items-center">
                <div className="h-5 w-16 rounded bg-[var(--surface-2)]" />
                <div className="h-8 w-24 rounded-full bg-[var(--surface-2)]" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--r)] border border-red-500/30 bg-red-500/5 py-16 px-4 text-center">
          <p className="text-sm text-red-400 mb-4">
            Could not load merchandise catalog from the backend.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
          >
            <RotateCcw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] py-20 px-4 text-center backdrop-blur-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--subtle)] mb-4">
            <ShoppingBag size={28} />
          </div>
          <h3 className="font-['DM_Sans',sans-serif] text-lg font-bold text-[var(--fg)]">
            No products found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[var(--muted)]">
            Try adjusting your search criteria or uncheck the "In Stock Only" toggle.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="mt-6 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const selectedData = selectedMap.get(item.id);
            const isSelected = !!selectedData;

            return (
              <ProductCard
                key={item.id}
                item={item}
                isSelected={isSelected}
                selectedSize={selectedData?.size}
                selectedQuantity={selectedData?.quantity}
                onSelect={handleOpenDetail}
                onToggleSelect={handleToggleSelectCard}
              />
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
          <span className="text-xs text-[var(--muted)]">
            Showing Page <span className="font-mono text-[var(--fg)] font-bold">{page}</span> of{' '}
            <span className="font-mono text-[var(--fg)] font-bold">{totalPages}</span> ({totalItems} items total)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                const isCurrent = pageNumber === page;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 w-8 rounded-full font-mono text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_0_10px_rgba(88,185,154,0.3)]'
                        : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={modalProduct}
        isOpen={isDetailOpen}
        isSelected={modalProduct ? selectedMap.has(modalProduct.id) : false}
        initialSize={modalProduct ? selectedMap.get(modalProduct.id)?.size : undefined}
        initialQuantity={modalProduct ? selectedMap.get(modalProduct.id)?.quantity : 1}
        onClose={() => setIsDetailOpen(false)}
        onConfirmSelection={handleConfirmModalSelection}
        onRemoveSelection={handleRemoveModalSelection}
      />

      {/* Floating Bottom Bar: Action to proceed to external order form */}
      {totalSelectedCount > 0 && (
        <aside
          aria-label="Proceed to Order Form"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-center justify-between gap-3 rounded-full border border-[var(--border-accent)] bg-[var(--surface-raised)]/95 px-5 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-mono text-xs font-bold">
                {totalSelectedCount}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[var(--fg)]">
                  {totalSelectedCount} item{totalSelectedCount === 1 ? '' : 's'} selected
                </span>
                <span className="font-mono text-[11px] text-[var(--accent)]">
                  Estimated Total: ₹{totalSelectedAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToForm}
              className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-all shadow-[0_2px_12px_rgba(88,185,154,0.35)]"
            >
              <span>Fill Order Form</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
