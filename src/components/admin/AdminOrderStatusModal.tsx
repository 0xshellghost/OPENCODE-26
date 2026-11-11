'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Text,
  Flex,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
} from '@chakra-ui/react';
import { X } from 'lucide-react';
import { AdminOrder, OrderStatus, PaymentStatus } from 'types/geekstore';
import GeekstoreService from 'services/geekstore.service';

interface AdminOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  mode: 'status' | 'payment';
  onSuccess: (updated: AdminOrder) => void;
}

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'PLACED',
  'APPROVED',
  'FULFILLED',
  'REJECTED',
  'CANCELLED',
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
];

export default function AdminOrderStatusModal({
  isOpen,
  onClose,
  order,
  mode,
  onSuccess,
}: AdminOrderStatusModalProps) {
  const toast = useToast();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PLACED');
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<PaymentStatus>('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status || 'PLACED');
      setSelectedPaymentStatus(order.paymentStatus || 'PENDING');
      setAdminNote(order.adminNote || '');
    }
  }, [order, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const isTerminalStatus = ['REJECTED', 'CANCELLED'].includes(order.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'status') {
        const updated = await GeekstoreService.adminUpdateOrderStatus(order.id, {
          status: selectedStatus,
          adminNote: adminNote.trim() || undefined,
        });

        toast({
          title: 'Order Status Updated',
          description: `Order #${order.id} status changed to ${selectedStatus}.`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        onSuccess(updated);
        onClose();
      } else {
        const updated = await GeekstoreService.adminUpdateOrderPayment(order.id, {
          paymentStatus: selectedPaymentStatus,
          adminNote: adminNote.trim() || undefined,
        });

        toast({
          title: 'Payment Status Updated',
          description: `Order #${order.id} payment status changed to ${selectedPaymentStatus}.`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        onSuccess(updated);
        onClose();
      }
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Could not update order.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.800"
      backdropFilter="blur(8px)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: '12px', md: '20px' }}
      onClick={onClose}
    >
      <Box
        bg="var(--surface)"
        border="1px solid var(--border)"
        boxShadow="0 16px 48px rgba(0, 0, 0, 0.7)"
        borderRadius="24px"
        maxW="520px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        color="var(--fg)"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            p="20px 24px"
            borderBottom="1px solid var(--border)"
          >
            <Box>
              <Text fontSize="lg" fontWeight="700">
                {mode === 'status' ? 'Update Order Status' : 'Update Payment Status'}
              </Text>
              <Flex align="center" gap={2} mt={1}>
                <Text fontSize="xs" color="var(--fg-muted)" fontFamily="var(--f-mono)">
                  Order ID: {order.id}
                </Text>
                <Badge colorScheme="purple" fontSize="10px" borderRadius="md">
                  @{order.githubId || order.user?.githubId || 'unknown'}
                </Badge>
              </Flex>
            </Box>

            <IconButton
              aria-label="Close modal"
              size="sm"
              variant="ghost"
              borderRadius="full"
              icon={<X size={18} />}
              onClick={onClose}
            />
          </Flex>

          {/* Body */}
          <Box p="24px">
            {mode === 'status' ? (
              <>
                <FormControl isRequired mb={4}>
                  <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                    Order Status
                  </FormLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    bg="var(--surface-2)"
                    border="1px solid var(--border)"
                    color="var(--fg)"
                    borderRadius="12px"
                    fontSize="sm"
                    _focus={{ borderColor: 'var(--accent)' }}
                  >
                    {ORDER_STATUS_OPTIONS.map((st) => (
                      <option
                        key={st}
                        value={st}
                        disabled={isTerminalStatus && !['REJECTED', 'CANCELLED'].includes(st)}
                        style={{ background: '#0B1C2A' }}
                      >
                        {st}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {['CANCELLED', 'REJECTED'].includes(selectedStatus) && !isTerminalStatus && (
                  <Alert
                    status="warning"
                    borderRadius="12px"
                    mb={4}
                    bg="rgba(245, 158, 11, 0.15)"
                    border="1px solid rgba(245, 158, 11, 0.3)"
                    color="orange.200"
                  >
                    <AlertIcon color="orange.400" />
                    <AlertDescription fontSize="xs">
                      Marking as <strong>CANCELLED</strong> or <strong>REJECTED</strong> will
                      automatically restock reserved merchandise back to the catalog inventory.
                    </AlertDescription>
                  </Alert>
                )}

                {isTerminalStatus && (
                  <Alert
                    status="info"
                    borderRadius="12px"
                    mb={4}
                    bg="rgba(59, 130, 246, 0.15)"
                    border="1px solid rgba(59, 130, 246, 0.3)"
                    color="blue.200"
                  >
                    <AlertIcon color="blue.400" />
                    <AlertDescription fontSize="xs">
                      This order is already in a terminal state ({order.status}) and cannot be
                      reverted to active.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <>
                <FormControl isRequired mb={4}>
                  <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                    Payment Status
                  </FormLabel>
                  <Select
                    value={selectedPaymentStatus}
                    onChange={(e) =>
                      setSelectedPaymentStatus(e.target.value as PaymentStatus)
                    }
                    bg="var(--surface-2)"
                    border="1px solid var(--border)"
                    color="var(--fg)"
                    borderRadius="12px"
                    fontSize="sm"
                    _focus={{ borderColor: 'var(--accent)' }}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} style={{ background: '#0B1C2A' }}>
                        {st}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Alert
                  status="info"
                  borderRadius="12px"
                  mb={4}
                  bg="rgba(20, 184, 166, 0.12)"
                  border="1px solid rgba(20, 184, 166, 0.3)"
                  color="teal.200"
                >
                  <AlertIcon color="teal.400" />
                  <AlertDescription fontSize="xs">
                    Current payment method: <strong>{order.paymentMethod}</strong>.
                    Mark as <strong>COMPLETED</strong> upon cash collection or payment verification.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {/* Optional Admin Note */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                Admin Note (Optional internal memo)
              </FormLabel>
              <Textarea
                rows={3}
                placeholder="e.g. Cash collected at registration booth / Items dispatched via DTDC..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                bg="var(--surface-2)"
                border="1px solid var(--border)"
                color="var(--fg)"
                borderRadius="12px"
                fontSize="sm"
                _focus={{ borderColor: 'var(--accent)' }}
              />
            </FormControl>
          </Box>

          {/* Footer */}
          <Flex
            justify="flex-end"
            gap={3}
            p="16px 24px"
            borderTop="1px solid var(--border)"
          >
            <Button variant="ghost" color="var(--fg-muted)" onClick={onClose} borderRadius="full">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText="Updating..."
              bg="var(--accent)"
              color="var(--accent-ink)"
              borderRadius="full"
              px={6}
              fontWeight="bold"
              _hover={{ bg: 'var(--accent-hover)' }}
            >
              Confirm Update
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
