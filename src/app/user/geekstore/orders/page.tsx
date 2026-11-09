'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import PageHeading from 'components/japanese/PageHeading';
import OrderCard from 'components/geekstore/OrderCard';
import GeekstoreService from 'services/geekstore.service';
import { OrderStatus } from 'types/geekstore';

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Placed', value: 'PLACED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Fulfilled', value: 'FULFILLED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function MyOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 5;

  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['geekstore-my-orders', page, limit, selectedStatus],
    queryFn: () =>
      GeekstoreService.getMyOrders({
        page,
        limit,
        status: selectedStatus,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => GeekstoreService.cancelOrder(orderId),
    onSuccess: (updatedOrder) => {
      toast({
        title: 'Order Cancelled',
        description: `Order #${updatedOrder.id} has been successfully cancelled.`,
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['geekstore-my-orders'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Could not cancel order',
        description: err?.message || 'Something went wrong.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const totalOrders = data?.total || 0;

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  return (
    <div className="w-full max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <PageHeading
        eyebrow="GEEKSTORE / TRACKING & HISTORY"
        title="My Orders & Tracking"
        description="Track campus delivery progress, inspect purchased merchandise and receipt details, or manage placed orders."
        rightContent={
          <div className="flex items-center gap-3">
            <Link
              href="/user/geekstore"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to Storefront</span>
            </Link>
          </div>
        }
      />

      {/* Filter Tabs Bar */}
      <div className="mt-8 mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--line)]">
        {STATUS_TABS.map((tab) => {
          const isSelected = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleStatusChange(tab.value)}
              className={`pb-3 px-3 text-xs font-semibold transition-all relative whitespace-nowrap ${
                isSelected
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders List Container */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] p-6 animate-pulse"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 w-40 rounded bg-[var(--surface-2)]" />
                <div className="h-6 w-24 rounded-full bg-[var(--surface-2)]" />
              </div>
              <div className="space-y-3">
                <div className="h-14 rounded-xl bg-[var(--surface-2)]" />
                <div className="h-10 rounded-xl bg-[var(--surface-2)]" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--r)] border border-red-500/30 bg-red-500/5 py-16 px-4 text-center">
          <p className="text-sm text-red-400 mb-4">
            Could not fetch order history from backend.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--r)] border border-[var(--border)] bg-[var(--surface)] py-20 px-4 text-center backdrop-blur-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--subtle)] mb-4">
            <Package size={28} />
          </div>
          <h3 className="font-['DM_Sans',sans-serif] text-lg font-bold text-[var(--fg)]">
            No orders found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[var(--muted)]">
            {selectedStatus === 'ALL'
              ? "You haven't placed any orders yet. Visit the Geekstore to grab your merch!"
              : `You have no orders currently in "${selectedStatus}" status.`}
          </p>
          <Link
            href="/user/geekstore"
            className="mt-6 flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-all shadow-[0_2px_12px_rgba(88,185,154,0.3)]"
          >
            <ShoppingBag size={14} />
            <span>Visit Geekstore</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancelOrder={async (id) => {
                await cancelMutation.mutateAsync(id);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
          <span className="text-xs text-[var(--muted)]">
            Showing Page <span className="font-mono text-[var(--fg)] font-bold">{page}</span> of{' '}
            <span className="font-mono text-[var(--fg)] font-bold">{totalPages}</span> ({totalOrders} orders total)
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
    </div>
  );
}

