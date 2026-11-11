'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Button,
  Flex,
  Text,
  Badge,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import {
  X,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { AdminOrder } from 'types/geekstore';

interface AdminOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onOpenStatusModal: (order: AdminOrder) => void;
  onOpenPaymentModal: (order: AdminOrder) => void;
}

export default function AdminOrderDetailsModal({
  isOpen,
  onClose,
  order,
  onOpenStatusModal,
  onOpenPaymentModal,
}: AdminOrderDetailsModalProps) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULFILLED':
        return <Badge colorScheme="green">FULFILLED</Badge>;
      case 'APPROVED':
        return <Badge colorScheme="teal">APPROVED</Badge>;
      case 'PLACED':
        return <Badge colorScheme="purple">PLACED</Badge>;
      case 'CANCELLED':
      case 'REJECTED':
        return <Badge colorScheme="red">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'COMPLETED':
        return <Badge colorScheme="green">PAID</Badge>;
      case 'PENDING':
        return <Badge colorScheme="yellow">PENDING</Badge>;
      case 'REFUNDED':
        return <Badge colorScheme="orange">REFUNDED</Badge>;
      case 'FAILED':
        return <Badge colorScheme="red">FAILED</Badge>;
      default:
        return <Badge>{paymentStatus}</Badge>;
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
        maxW="720px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        color="var(--fg)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          p="20px 24px"
          borderBottom="1px solid var(--border)"
          flexWrap="wrap"
          gap={3}
        >
          <Box>
            <Flex align="center" gap={2}>
              <Text fontSize="xl" fontWeight="700">
                Order Details
              </Text>
              <Badge
                fontSize="xs"
                fontFamily="var(--f-mono)"
                borderRadius="md"
                px={2}
                py={0.5}
                bg="var(--surface-2)"
                color="var(--fg)"
                border="1px solid var(--border)"
              >
                #{order.id}
              </Badge>
            </Flex>
            <Flex align="center" gap={2} mt={1} color="var(--fg-muted)" fontSize="xs">
              <Icon as={Calendar} size={13} />
              <Text>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </Text>
            </Flex>
          </Box>

          <Flex align="center" gap={3}>
            {getStatusBadge(order.status)}
            {getPaymentBadge(order.paymentStatus)}
            <IconButton
              aria-label="Close modal"
              size="sm"
              variant="ghost"
              borderRadius="full"
              icon={<X size={18} />}
              onClick={onClose}
            />
          </Flex>
        </Flex>

        {/* Body */}
        <Box p="24px">
          {/* 1. Contributor / User Profile Card */}
          <Box
            p={4}
            bg="var(--surface-2)"
            borderRadius="16px"
            border="1px solid var(--border)"
            mb={5}
          >
            <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color="var(--fg-muted)" mb={3} letterSpacing="wider">
              Customer Profile (OpenCode Contributor)
            </Text>
            <Flex align="center" gap={4}>
              <Avatar
                size="md"
                name={order.user?.name || order.githubId || 'User'}
                src={order.user?.avatarUrl}
                border="2px solid var(--accent)"
              />
              <Box flex="1" minW="0">
                <Flex align="center" gap={2} flexWrap="wrap">
                  <Text fontWeight="700" fontSize="md" color="var(--fg)">
                    {order.user?.name || 'OpenCode Participant'}
                  </Text>
                  <Badge colorScheme="purple" fontSize="11px" borderRadius="full">
                    @{order.user?.githubId || order.githubId || 'contributor'}
                  </Badge>
                </Flex>

                <Flex gap={4} mt={1} flexWrap="wrap" fontSize="xs" color="var(--fg-muted)">
                  {order.user?.college && (
                    <Flex align="center" gap={1}>
                      <Icon as={GraduationCap} size={12} />
                      <Text>{order.user.college}</Text>
                    </Flex>
                  )}
                  {order.user?.email && (
                    <Flex align="center" gap={1}>
                      <Icon as={Mail} size={12} />
                      <Text>{order.user.email}</Text>
                    </Flex>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Box>

          {/* 2. Delivery & Contact Details */}
          <Box
            p={4}
            bg="var(--surface-2)"
            borderRadius="16px"
            border="1px solid var(--border)"
            mb={5}
          >
            <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color="var(--fg-muted)" mb={3} letterSpacing="wider">
              Shipping & Payment Info
            </Text>
            <Flex direction="column" gap={2} fontSize="sm">
              <Flex align="flex-start" gap={2}>
                <Icon as={MapPin} size={16} color="var(--accent)" mt={1} />
                <Box>
                  <Text fontWeight="600" color="var(--fg)">
                    Shipping Address:
                  </Text>
                  <Text color="var(--fg-muted)">{order.shippingAddress || 'Not specified'}</Text>
                </Box>
              </Flex>

              <Flex align="center" gap={2}>
                <Icon as={Phone} size={15} color="var(--accent)" />
                <Text fontWeight="600" color="var(--fg)">
                  Contact Phone:
                </Text>
                <Text color="var(--fg-muted)" fontFamily="var(--f-mono)">
                  {order.contactNumber || 'Not specified'}
                </Text>
              </Flex>

              <Flex align="center" gap={2}>
                <Icon as={CreditCard} size={15} color="var(--accent)" />
                <Text fontWeight="600" color="var(--fg)">
                  Payment Method:
                </Text>
                <Badge colorScheme="blue" fontSize="11px">
                  {order.paymentMethod}
                </Badge>
              </Flex>

              {order.userNote && (
                <Flex align="flex-start" gap={2} mt={1}>
                  <Icon as={FileText} size={15} color="var(--fg-muted)" mt={1} />
                  <Box>
                    <Text fontWeight="600" color="var(--fg)" fontSize="xs">
                      User Order Note:
                    </Text>
                    <Text color="var(--fg-muted)" fontSize="xs">
                      "{order.userNote}"
                    </Text>
                  </Box>
                </Flex>
              )}

              {order.adminNote && (
                <Box
                  mt={2}
                  p={3}
                  borderRadius="10px"
                  bg="rgba(147, 51, 234, 0.1)"
                  border="1px solid rgba(147, 51, 234, 0.3)"
                >
                  <Text fontSize="xs" fontWeight="700" color="purple.300">
                    Admin Memo:
                  </Text>
                  <Text fontSize="xs" color="purple.200">
                    {order.adminNote}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>

          {/* 3. Items Ordered */}
          <Box mb={4}>
            <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color="var(--fg-muted)" mb={2} letterSpacing="wider">
              Ordered Items ({order.items?.length || 0})
            </Text>
            <TableContainer
              borderRadius="14px"
              border="1px solid var(--border)"
              bg="var(--surface-2)"
            >
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Item</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Size</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Qty</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Unit Price</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)" textAlign="right">Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.items?.map((it, idx) => {
                    const itemName = it.name || it.item?.name || `Item ${it.itemId}`;
                    const itemImg = it.imageUrl || it.item?.imageUrl || '/images/kyoto-garden.png';
                    const unitP = it.unitPrice || it.price || it.item?.price || 0;
                    const totP = it.totalPrice || it.lineTotal || unitP * it.quantity;

                    return (
                      <Tr key={it.id || idx}>
                        <Td borderColor="var(--border)">
                          <Flex align="center" gap={3}>
                            <Box
                              position="relative"
                              h="34px"
                              w="34px"
                              borderRadius="6px"
                              overflow="hidden"
                              bg="var(--card-soft)"
                              flexShrink={0}
                            >
                              <Image
                                src={itemImg}
                                alt={itemName}
                                fill
                                className="object-cover"
                              />
                            </Box>
                            <Text fontSize="xs" fontWeight="600" color="var(--fg)" isTruncated maxW="200px">
                              {itemName}
                            </Text>
                          </Flex>
                        </Td>
                        <Td borderColor="var(--border)" fontFamily="var(--f-mono)" fontSize="xs">
                          {it.size || '—'}
                        </Td>
                        <Td borderColor="var(--border)" fontFamily="var(--f-mono)" fontSize="xs">
                          {it.quantity}
                        </Td>
                        <Td borderColor="var(--border)" fontFamily="var(--f-mono)" fontSize="xs">
                          ₹{unitP.toLocaleString('en-IN')}
                        </Td>
                        <Td borderColor="var(--border)" fontFamily="var(--f-mono)" fontSize="xs" textAlign="right" fontWeight="700">
                          ₹{totP.toLocaleString('en-IN')}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>

            <Flex justify="flex-end" align="center" gap={3} mt={4} px={2}>
              <Text fontSize="sm" color="var(--fg-muted)">
                Grand Total:
              </Text>
              <Text fontSize="xl" fontWeight="800" color="var(--fg)" fontFamily="var(--f-mono)">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </Text>
            </Flex>
          </Box>
        </Box>

        {/* Footer */}
        <Flex
          justify="flex-end"
          gap={3}
          p="16px 24px"
          borderTop="1px solid var(--border)"
        >
          <Button
            size="sm"
            variant="outline"
            borderColor="var(--border)"
            color="var(--fg)"
            borderRadius="full"
            onClick={() => {
              onClose();
              onOpenPaymentModal(order);
            }}
          >
            Update Payment
          </Button>

          <Button
            size="sm"
            bg="var(--accent)"
            color="var(--accent-ink)"
            borderRadius="full"
            fontWeight="bold"
            _hover={{ bg: 'var(--accent-hover)' }}
            onClick={() => {
              onClose();
              onOpenStatusModal(order);
            }}
          >
            Change Order Status
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
