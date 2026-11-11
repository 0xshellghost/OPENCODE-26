'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  useToast,
  SimpleGrid,
  Icon,
  Avatar,
  Switch,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  Plus,
  Trash2,
  Package,
  ShoppingBag,
  RotateCcw,
  Check,
  AlertCircle,
  ExternalLink,
  Edit,
  Search,
  Filter,
  DollarSign,
  Clock,
  Eye,
  CheckCircle,
  Truck,
  CreditCard,
  User,
  XCircle,
  Archive,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GeekstoreService from 'services/geekstore.service';
import {
  CatalogItem,
  AdminOrder,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from 'types/geekstore';
import AdminItemModal from './AdminItemModal';
import AdminOrderStatusModal from './AdminOrderStatusModal';
import AdminOrderDetailsModal from './AdminOrderDetailsModal';

const CATEGORY_OPTIONS = [
  'ALL',
  'Hoodies',
  'T-Shirts',
  'Accessories',
  'Stickers',
  'Drinkware',
  'Merchandise',
];

const ORDER_STATUS_FILTERS = [
  'ALL',
  'PLACED',
  'APPROVED',
  'FULFILLED',
  'REJECTED',
  'CANCELLED',
];

const PAYMENT_STATUS_FILTERS = ['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

const PAYMENT_METHOD_FILTERS = ['ALL', 'CASH', 'COD', 'ONLINE', 'UPI'];

export default function AdminGeekstoreManager() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Top Section Sub-Tab: "items" vs "orders"
  const [subTab, setSubTab] = useState<'items' | 'orders'>('items');

  // -------------------------------------------------------------
  // ITEM MANAGEMENT STATE & FILTERS
  // -------------------------------------------------------------
  const [itemSearch, setItemSearch] = useState('');
  const [itemCategory, setItemCategory] = useState('ALL');
  const [includeInactive, setIncludeInactive] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Item Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<CatalogItem | null>(null);

  // Fetch Items Query
  const {
    data: itemsData,
    isLoading: isItemsLoading,
    refetch: refetchItems,
  } = useQuery({
    queryKey: [
      'admin-geekstore-items',
      itemCategory,
      itemSearch,
      includeInactive,
      includeDeleted,
    ],
    queryFn: () =>
      GeekstoreService.adminListItems({
        category: itemCategory,
        search: itemSearch,
        includeInactive,
        includeDeleted,
        limit: 100,
      }),
  });

  const catalogItems: CatalogItem[] = itemsData?.items || [];

  // Metrics counts
  const activeItemsCount = catalogItems.filter((i) => !i.deletedAt && i.isActive).length;
  const lowStockItemsCount = catalogItems.filter((i) => !i.deletedAt && i.stock <= 5).length;
  const deletedItemsCount = catalogItems.filter((i) => Boolean(i.deletedAt)).length;

  // Delete Mutation (Soft Delete or Permanent Purge)
  const deleteMutation = useMutation({
    mutationFn: ({ itemId, permanent }: { itemId: string; permanent?: boolean }) =>
      GeekstoreService.adminDeleteItem(itemId, permanent),
    onSuccess: (_, vars) => {
      toast({
        title: vars.permanent ? 'Product Permanently Deleted' : 'Product Moved to Trash',
        description: vars.permanent
          ? 'Item was purged from database and storefront.'
          : 'Item marked as deleted and deactivated from user view.',
        status: 'info',
        duration: 3500,
        isClosable: true,
      });
      setDeleteModalItem(null);
      queryClient.invalidateQueries({ queryKey: ['admin-geekstore-items'] });
      queryClient.invalidateQueries({ queryKey: ['geekstore-items'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to delete product',
        description: err?.message || 'Could not delete item.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  // Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: (itemId: string) => GeekstoreService.adminRestoreItem(itemId),
    onSuccess: (data) => {
      toast({
        title: 'Product Restored',
        description: `"${data.item?.name || 'Product'}" has been restored to active inventory.`,
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-geekstore-items'] });
      queryClient.invalidateQueries({ queryKey: ['geekstore-items'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to restore product',
        description: err?.message || 'Could not restore item.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  // -------------------------------------------------------------
  // ORDER MANAGEMENT STATE & FILTERS
  // -------------------------------------------------------------
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
  const [githubIdFilter, setGithubIdFilter] = useState('');

  // Order Modals
  const [selectedOrderForDetails, setSelectedOrderForDetails] =
    useState<AdminOrder | null>(null);
  const [orderToUpdate, setOrderToUpdate] = useState<AdminOrder | null>(null);
  const [orderModalMode, setOrderModalMode] = useState<'status' | 'payment'>(
    'status',
  );
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);

  // Fetch Orders Query
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: [
      'admin-geekstore-orders',
      orderSearch,
      statusFilter,
      paymentStatusFilter,
      paymentMethodFilter,
      githubIdFilter,
    ],
    queryFn: () =>
      GeekstoreService.adminListOrders({
        search: orderSearch,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        paymentMethod: paymentMethodFilter,
        githubId: githubIdFilter,
        limit: 100,
      }),
  });

  const orders: AdminOrder[] = ordersData?.orders || [];

  // Helper callbacks
  const handleOpenCreateModal = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: CatalogItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleOpenStatusModal = (order: AdminOrder) => {
    setOrderToUpdate(order);
    setOrderModalMode('status');
    setIsOrderStatusModalOpen(true);
  };

  const handleOpenPaymentModal = (order: AdminOrder) => {
    setOrderToUpdate(order);
    setOrderModalMode('payment');
    setIsOrderStatusModalOpen(true);
  };

  const handleResetOrderFilters = () => {
    setOrderSearch('');
    setStatusFilter('ALL');
    setPaymentStatusFilter('ALL');
    setPaymentMethodFilter('ALL');
    setGithubIdFilter('');
  };

  // Status Badge Helper
  const renderOrderStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'FULFILLED':
        return (
          <Badge colorScheme="green" fontSize="10px" borderRadius="md">
            FULFILLED
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge colorScheme="teal" fontSize="10px" borderRadius="md">
            APPROVED
          </Badge>
        );
      case 'PLACED':
        return (
          <Badge colorScheme="purple" fontSize="10px" borderRadius="md">
            PLACED
          </Badge>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <Badge colorScheme="red" fontSize="10px" borderRadius="md">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge fontSize="10px" borderRadius="md">
            {status}
          </Badge>
        );
    }
  };

  const renderPaymentStatusBadge = (paymentStatus: PaymentStatus | string) => {
    switch (paymentStatus) {
      case 'COMPLETED':
        return (
          <Badge colorScheme="green" fontSize="10px" borderRadius="md">
            COMPLETED
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge colorScheme="yellow" fontSize="10px" borderRadius="md">
            PENDING
          </Badge>
        );
      case 'REFUNDED':
        return (
          <Badge colorScheme="orange" fontSize="10px" borderRadius="md">
            REFUNDED
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge colorScheme="red" fontSize="10px" borderRadius="md">
            FAILED
          </Badge>
        );
      default:
        return (
          <Badge fontSize="10px" borderRadius="md">
            {paymentStatus}
          </Badge>
        );
    }
  };

  return (
    <Box>
      {/* Sub-Tabs: Products vs Orders */}
      <Flex
        bg="var(--surface-2)"
        p="4px"
        borderRadius="16px"
        border="1px solid var(--border)"
        maxW="450px"
        mb="24px"
      >
        <Button
          flex="1"
          size="sm"
          borderRadius="12px"
          leftIcon={<Icon as={Package} size={15} />}
          bg={subTab === 'items' ? 'var(--accent)' : 'transparent'}
          color={subTab === 'items' ? 'var(--accent-ink)' : 'var(--fg)'}
          fontWeight="700"
          _hover={{
            bg: subTab === 'items' ? 'var(--accent-hover)' : 'var(--surface)',
          }}
          onClick={() => setSubTab('items')}
        >
          Catalog & Items ({catalogItems.length})
        </Button>
        <Button
          flex="1"
          size="sm"
          borderRadius="12px"
          leftIcon={<Icon as={ShoppingBag} size={15} />}
          bg={subTab === 'orders' ? 'var(--accent)' : 'transparent'}
          color={subTab === 'orders' ? 'var(--accent-ink)' : 'var(--fg)'}
          fontWeight="700"
          _hover={{
            bg: subTab === 'orders' ? 'var(--accent-hover)' : 'var(--surface)',
          }}
          onClick={() => setSubTab('orders')}
        >
          Orders Dashboard ({orders.length})
        </Button>
      </Flex>

      {/* ============================================================= */}
      {/* SECTION 1: CATALOG & ITEM MANAGEMENT */}
      {/* ============================================================= */}
      {subTab === 'items' && (
        <Box>
          {/* Quick Metrics Strip */}
          <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={4} mb="20px">
            <Box bg="var(--surface)" border="1px solid var(--border)" borderRadius="16px" p={4} boxShadow="var(--shadow)">
              <Flex align="center" gap={3}>
                <Flex h="40px" w="40px" borderRadius="12px" bg="var(--accent-soft)" color="var(--accent)" align="center" justify="center" flexShrink={0}>
                  <Icon as={Package} size={20} />
                </Flex>
                <Box minW="0">
                  <Text fontSize="xs" color="var(--fg-muted)" fontWeight="500">Total Products</Text>
                  <Text fontSize="xl" fontWeight="bold" color="var(--fg)">{catalogItems.length}</Text>
                </Box>
              </Flex>
            </Box>
            <Box bg="var(--surface)" border="1px solid var(--border)" borderRadius="16px" p={4} boxShadow="var(--shadow)">
              <Flex align="center" gap={3}>
                <Flex h="40px" w="40px" borderRadius="12px" bg="teal.500.15" color="teal.300" align="center" justify="center" flexShrink={0}>
                  <Icon as={CheckCircle} size={20} />
                </Flex>
                <Box minW="0">
                  <Text fontSize="xs" color="var(--fg-muted)" fontWeight="500">Active in Store</Text>
                  <Text fontSize="xl" fontWeight="bold" color="teal.300">{activeItemsCount}</Text>
                </Box>
              </Flex>
            </Box>
            <Box bg="var(--surface)" border="1px solid var(--border)" borderRadius="16px" p={4} boxShadow="var(--shadow)">
              <Flex align="center" gap={3}>
                <Flex h="40px" w="40px" borderRadius="12px" bg="orange.500.15" color="orange.300" align="center" justify="center" flexShrink={0}>
                  <Icon as={AlertCircle} size={20} />
                </Flex>
                <Box minW="0">
                  <Text fontSize="xs" color="var(--fg-muted)" fontWeight="500">Low / Out of Stock</Text>
                  <Text fontSize="xl" fontWeight="bold" color="orange.300">{lowStockItemsCount}</Text>
                </Box>
              </Flex>
            </Box>
            <Box bg="var(--surface)" border="1px solid var(--border)" borderRadius="16px" p={4} boxShadow="var(--shadow)">
              <Flex align="center" gap={3}>
                <Flex h="40px" w="40px" borderRadius="12px" bg="purple.500.15" color="purple.300" align="center" justify="center" flexShrink={0}>
                  <Icon as={ShoppingBag} size={20} />
                </Flex>
                <Box minW="0">
                  <Text fontSize="xs" color="var(--fg-muted)" fontWeight="500">Orders Placed</Text>
                  <Text fontSize="xl" fontWeight="bold" color="purple.300">{orders.length}</Text>
                </Box>
              </Flex>
            </Box>
          </SimpleGrid>

          {/* Header & Controls Card */}
          <Box
            bg="var(--surface)"
            border="1px solid var(--border)"
            p={{ base: '20px', md: '24px' }}
            borderRadius="20px"
            boxShadow="var(--shadow)"
            mb="24px"
          >
            <Flex
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap={4}
              mb="20px"
            >
              <Box>
                <Flex align="center" gap={3}>
                  <Text color="var(--fg)" fontSize="2xl" fontWeight="700">
                    Geekstore Catalog Management
                  </Text>
                  <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                    Database Items
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="var(--fg-muted)" mt={1}>
                  Create, restock, edit pricing, or delete products with cloud image uploads.
                </Text>
              </Box>

              <Button
                bg="var(--accent)"
                color="var(--accent-ink)"
                borderRadius="full"
                px="5"
                fontSize="sm"
                fontWeight="bold"
                _hover={{ bg: 'var(--accent-hover)' }}
                leftIcon={<Icon as={Plus} size={16} />}
                onClick={handleOpenCreateModal}
              >
                Create New Product
              </Button>
            </Flex>

            {/* Filter Bar */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3} mb={4}>
              {/* Search */}
              <Box>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg-muted)" mb={1}>
                  Search Product
                </FormLabel>
                <Input
                  placeholder="Search by name, ID..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  size="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                />
              </Box>

              {/* Category */}
              <Box>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg-muted)" mb={1}>
                  Category
                </FormLabel>
                <Select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  size="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c} style={{ background: '#0B1C2A' }}>
                      {c === 'ALL' ? 'All Categories' : c}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Include Inactive Switch */}
              <Flex
                align="center"
                justify="space-between"
                p={2.5}
                bg="var(--surface-2)"
                borderRadius="12px"
                border="1px solid var(--border)"
              >
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="var(--fg)">
                    Include Inactive
                  </Text>
                  <Text fontSize="10px" color="var(--fg-muted)">
                    Show draft/hidden items
                  </Text>
                </Box>
                <Switch
                  isChecked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  colorScheme="teal"
                  size="sm"
                />
              </Flex>

              {/* Show Trash / Deleted Switch */}
              <Flex
                align="center"
                justify="space-between"
                p={2.5}
                bg={includeDeleted ? 'rgba(239, 68, 68, 0.12)' : 'var(--surface-2)'}
                borderRadius="12px"
                border="1px solid"
                borderColor={includeDeleted ? 'rgba(239, 68, 68, 0.35)' : 'var(--border)'}
                transition="all 0.2s"
              >
                <Box>
                  <Flex align="center" gap={1.5}>
                    <Text fontSize="xs" fontWeight="600" color={includeDeleted ? 'red.300' : 'var(--fg)'}>
                      Show Trash & Deleted
                    </Text>
                    {deletedItemsCount > 0 && (
                      <Badge colorScheme="red" fontSize="9px" borderRadius="full">
                        {deletedItemsCount}
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="10px" color="var(--fg-muted)">
                    {includeDeleted ? 'Viewing archived items' : 'Hidden by default'}
                  </Text>
                </Box>
                <Switch
                  isChecked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  colorScheme="red"
                  size="sm"
                />
              </Flex>
            </SimpleGrid>
          </Box>

          {/* Catalog Products Table */}
          <Box
            bg="var(--surface)"
            border="1px solid var(--border)"
            borderRadius="20px"
            p={{ base: '16px', md: '24px' }}
            boxShadow="var(--shadow)"
          >
            <Flex justify="space-between" align="center" mb="16px">
              <div>
                <Text color="var(--fg)" fontSize="xl" fontWeight="700">
                  Products in Database ({catalogItems.length})
                </Text>
                <Text fontSize="xs" color="var(--fg-muted)">
                  Showing items matching selected filters. Use Edit to adjust price, stock, or availability.
                </Text>
              </div>

              <Button
                size="sm"
                variant="outline"
                borderColor="var(--border)"
                color="var(--fg)"
                borderRadius="full"
                onClick={() => refetchItems()}
                leftIcon={<Icon as={RotateCcw} size={14} />}
              >
                Refresh
              </Button>
            </Flex>

            <TableContainer overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Item</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Category</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Price</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Stock</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Sizes</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Status</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)" textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isItemsLoading ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py="36px">
                        <Text color="var(--fg-muted)" fontSize="sm">
                          Loading products from database...
                        </Text>
                      </Td>
                    </Tr>
                  ) : catalogItems.length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py="36px">
                        <Text color="var(--fg-muted)" fontSize="sm">
                          No products found matching filters. Click "Create New Product" to add one.
                        </Text>
                      </Td>
                    </Tr>
                  ) : (
                    catalogItems.map((prod) => (
                      <Tr
                        key={prod.id}
                        _hover={{ bg: 'var(--surface-2)' }}
                        opacity={prod.deletedAt ? 0.6 : prod.isActive === false ? 0.8 : 1}
                      >
                        {/* Item Name & Thumb */}
                        <Td borderColor="var(--border)" maxW="240px">
                          <Flex align="center" gap="10px">
                            <Box
                              position="relative"
                              h="38px"
                              w="38px"
                              borderRadius="8px"
                              overflow="hidden"
                              bg="var(--card-soft)"
                              flexShrink={0}
                            >
                              <Image
                                src={prod.imageUrl || '/images/kyoto-garden.png'}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            </Box>
                            <Box minW="0">
                              <Text
                                color="var(--fg)"
                                fontWeight="600"
                                fontSize="xs"
                                isTruncated
                              >
                                {prod.name}
                              </Text>
                              <Text
                                color="var(--fg-muted)"
                                fontSize="10px"
                                fontFamily="var(--f-mono)"
                              >
                                {prod.id}
                              </Text>
                            </Box>
                          </Flex>
                        </Td>

                        {/* Category */}
                        <Td borderColor="var(--border)">
                          <Badge
                            fontSize="10px"
                            borderRadius="md"
                            bg="var(--surface-2)"
                            color="var(--accent)"
                            border="1px solid var(--border)"
                          >
                            {prod.category}
                          </Badge>
                        </Td>

                        {/* Price */}
                        <Td borderColor="var(--border)">
                          <Text
                            color="var(--fg)"
                            fontWeight="700"
                            fontFamily="var(--f-mono)"
                            fontSize="xs"
                          >
                            ₹{prod.price.toLocaleString('en-IN')}
                          </Text>
                        </Td>

                        {/* Stock */}
                        <Td borderColor="var(--border)">
                          {prod.stock <= 0 ? (
                            <Badge colorScheme="red" fontSize="10px" borderRadius="md">
                              Out of Stock
                            </Badge>
                          ) : prod.stock <= 5 ? (
                            <Badge colorScheme="orange" fontSize="10px" borderRadius="md">
                              Only {prod.stock} left
                            </Badge>
                          ) : (
                            <Badge colorScheme="green" fontSize="10px" borderRadius="md">
                              {prod.stock} units
                            </Badge>
                          )}
                        </Td>

                        {/* Sizes */}
                        <Td borderColor="var(--border)">
                          <Text fontSize="11px" color="var(--fg-muted)" fontFamily="var(--f-mono)">
                            {prod.sizes && prod.sizes.length > 0
                              ? prod.sizes.join(', ')
                              : '—'}
                          </Text>
                        </Td>

                        {/* Availability / Soft Deleted Badge */}
                        <Td borderColor="var(--border)">
                          {prod.deletedAt ? (
                            <Badge colorScheme="red" fontSize="10px" borderRadius="md">
                              SOFT DELETED
                            </Badge>
                          ) : prod.isActive ? (
                            <Badge colorScheme="teal" fontSize="10px" borderRadius="md">
                              ACTIVE
                            </Badge>
                          ) : (
                            <Badge colorScheme="gray" fontSize="10px" borderRadius="md">
                              INACTIVE
                            </Badge>
                          )}
                        </Td>

                        {/* Actions (Edit / Delete / Restore / Purge) */}
                        <Td borderColor="var(--border)" textAlign="right">
                          <Flex justify="flex-end" align="center" gap="6px">
                            {prod.deletedAt ? (
                              <>
                                <Text
                                  fontSize="10px"
                                  color="red.300"
                                  fontFamily="var(--f-mono)"
                                  fontWeight="600"
                                  mr={1}
                                >
                                  Deleted
                                </Text>
                                <Button
                                  size="xs"
                                  colorScheme="teal"
                                  variant="outline"
                                  borderRadius="full"
                                  isLoading={restoreMutation.isPending}
                                  onClick={() => restoreMutation.mutate(prod.id)}
                                  leftIcon={<Icon as={RotateCcw} size={12} />}
                                >
                                  Restore
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  borderRadius="full"
                                  onClick={() => setDeleteModalItem(prod)}
                                  leftIcon={<Icon as={Trash2} size={12} />}
                                >
                                  Purge
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  borderColor="var(--border)"
                                  color="var(--fg)"
                                  _hover={{ bg: 'var(--surface-2)' }}
                                  borderRadius="full"
                                  onClick={() => handleOpenEditModal(prod)}
                                  leftIcon={<Icon as={Edit} size={12} />}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  color="red.400"
                                  _hover={{ bg: 'rgba(239, 68, 68, 0.1)', color: 'red.300' }}
                                  borderRadius="full"
                                  onClick={() => setDeleteModalItem(prod)}
                                  leftIcon={<Icon as={Trash2} size={12} />}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </Flex>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      {/* ============================================================= */}
      {/* SECTION 2: ORDER MANAGEMENT DASHBOARD */}
      {/* ============================================================= */}
      {subTab === 'orders' && (
        <Box>
          {/* Header & Controls Card */}
          <Box
            bg="var(--surface)"
            border="1px solid var(--border)"
            p={{ base: '20px', md: '24px' }}
            borderRadius="20px"
            boxShadow="var(--shadow)"
            mb="24px"
          >
            <Flex
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap={3}
              mb="18px"
            >
              <Box>
                <Flex align="center" gap={3}>
                  <Text color="var(--fg)" fontSize="2xl" fontWeight="700">
                    Order Management Dashboard
                  </Text>
                  <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                    All Platform Orders
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="var(--fg-muted)" mt={1}>
                  Monitor contributor merchandise orders, review shipping addresses, change delivery statuses, and mark cash/UPI payments.
                </Text>
              </Box>

              <Flex gap={2}>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="var(--border)"
                  color="var(--fg)"
                  borderRadius="full"
                  onClick={handleResetOrderFilters}
                >
                  Reset Filters
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="var(--border)"
                  color="var(--fg)"
                  borderRadius="full"
                  onClick={() => refetchOrders()}
                  leftIcon={<Icon as={RotateCcw} size={14} />}
                >
                  Refresh
                </Button>
              </Flex>
            </Flex>

            {/* Filters Grid */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={3}>
              {/* Search */}
              <Box gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg-muted)" mb={1}>
                  Search Order
                </FormLabel>
                <Input
                  placeholder="Order ID, contact number, or address..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  size="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                />
              </Box>

              {/* Order Status Filter */}
              <Box>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg-muted)" mb={1}>
                  Order Status
                </FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  size="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                >
                  {ORDER_STATUS_FILTERS.map((s) => (
                    <option key={s} value={s} style={{ background: '#0B1C2A' }}>
                      {s === 'ALL' ? 'All Statuses' : s}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Payment Status Filter */}
              <Box>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg-muted)" mb={1}>
                  Payment Status
                </FormLabel>
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  size="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                >
                  {PAYMENT_STATUS_FILTERS.map((p) => (
                    <option key={p} value={p} style={{ background: '#0B1C2A' }}>
                      {p === 'ALL' ? 'All Payments' : p}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Payment Method Filter */}
              <Box>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg-muted)" mb={1}>
                  Payment Method
                </FormLabel>
                <Select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  size="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                >
                  {PAYMENT_METHOD_FILTERS.map((m) => (
                    <option key={m} value={m} style={{ background: '#0B1C2A' }}>
                      {m === 'ALL' ? 'All Methods' : m}
                    </option>
                  ))}
                </Select>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Orders Table */}
          <Box
            bg="var(--surface)"
            border="1px solid var(--border)"
            borderRadius="20px"
            p={{ base: '16px', md: '24px' }}
            boxShadow="var(--shadow)"
          >
            <Flex justify="space-between" align="center" mb="16px">
              <div>
                <Text color="var(--fg)" fontSize="xl" fontWeight="700">
                  User Orders ({orders.length})
                </Text>
                <Text fontSize="xs" color="var(--fg-muted)">
                  Click on an order to view full line items or quick-change status & payment.
                </Text>
              </div>
            </Flex>

            <TableContainer overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Order ID & Date</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Customer Profile</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Items</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Total</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Payment</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)">Order Status</Th>
                    <Th color="var(--fg-muted)" borderColor="var(--border)" textAlign="right">Quick Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isOrdersLoading ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py="36px">
                        <Text color="var(--fg-muted)" fontSize="sm">
                          Loading orders from database...
                        </Text>
                      </Td>
                    </Tr>
                  ) : orders.length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py="36px">
                        <Text color="var(--fg-muted)" fontSize="sm">
                          No orders found matching the filter criteria.
                        </Text>
                      </Td>
                    </Tr>
                  ) : (
                    orders.map((ord) => {
                      const itemCount = ord.items?.reduce(
                        (acc, i) => acc + i.quantity,
                        0,
                      ) || ord.items?.length || 1;

                      return (
                        <Tr key={ord.id} _hover={{ bg: 'var(--surface-2)' }}>
                          {/* Order ID & Date */}
                          <Td borderColor="var(--border)">
                            <Text
                              color="var(--fg)"
                              fontWeight="700"
                              fontSize="xs"
                              fontFamily="var(--f-mono)"
                            >
                              #{ord.id}
                            </Text>
                            <Text
                              color="var(--fg-muted)"
                              fontSize="10px"
                              fontFamily="var(--f-mono)"
                              mt={0.5}
                            >
                              {ord.createdAt
                                ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </Text>
                          </Td>

                          {/* Customer Profile */}
                          <Td borderColor="var(--border)" maxW="200px">
                            <Flex align="center" gap={2}>
                              <Avatar
                                size="xs"
                                name={ord.user?.name || ord.githubId || 'User'}
                                src={ord.user?.avatarUrl}
                              />
                              <Box minW="0">
                                <Text
                                  color="var(--fg)"
                                  fontWeight="600"
                                  fontSize="xs"
                                  isTruncated
                                >
                                  {ord.user?.name || ord.githubId || 'Customer'}
                                </Text>
                                <Text
                                  color="purple.300"
                                  fontSize="10px"
                                  fontFamily="var(--f-mono)"
                                  isTruncated
                                >
                                  @{ord.user?.githubId || ord.githubId || 'contributor'}
                                </Text>
                                {ord.user?.college && (
                                  <Text
                                    color="var(--fg-muted)"
                                    fontSize="10px"
                                    isTruncated
                                  >
                                    {ord.user.college}
                                  </Text>
                                )}
                              </Box>
                            </Flex>
                          </Td>

                          {/* Items Summary */}
                          <Td borderColor="var(--border)">
                            <Text fontSize="xs" fontWeight="600" color="var(--fg)">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </Text>
                            <Text
                              fontSize="10px"
                              color="var(--fg-muted)"
                              isTruncated
                              maxW="160px"
                            >
                              {ord.items && ord.items.length > 0
                                ? ord.items
                                    .map(
                                      (it) =>
                                        `${it.quantity}x ${it.name || it.item?.name || 'Item'}`,
                                    )
                                    .join(', ')
                                : 'Merchandise'}
                            </Text>
                          </Td>

                          {/* Total Amount */}
                          <Td borderColor="var(--border)">
                            <Text
                              color="var(--fg)"
                              fontWeight="700"
                              fontFamily="var(--f-mono)"
                              fontSize="xs"
                            >
                              ₹{ord.totalAmount.toLocaleString('en-IN')}
                            </Text>
                          </Td>

                          {/* Payment Status & Method */}
                          <Td borderColor="var(--border)">
                            <Flex direction="column" gap={1} align="flex-start">
                              {renderPaymentStatusBadge(ord.paymentStatus)}
                              <Badge
                                fontSize="9px"
                                variant="outline"
                                colorScheme="blue"
                              >
                                {ord.paymentMethod}
                              </Badge>
                            </Flex>
                          </Td>

                          {/* Order Status */}
                          <Td borderColor="var(--border)">
                            {renderOrderStatusBadge(ord.status)}
                            {ord.adminNote && (
                              <Text
                                fontSize="9px"
                                color="purple.300"
                                isTruncated
                                maxW="120px"
                                mt={0.5}
                              >
                                Note: {ord.adminNote}
                              </Text>
                            )}
                          </Td>

                          {/* Actions */}
                          <Td borderColor="var(--border)" textAlign="right">
                            <Flex justify="flex-end" align="center" gap={1.5}>
                              {/* Details Modal */}
                              <Tooltip label="View Full Order & Shipping">
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  color="var(--fg)"
                                  borderRadius="full"
                                  onClick={() => setSelectedOrderForDetails(ord)}
                                >
                                  <Icon as={Eye} size={14} />
                                </Button>
                              </Tooltip>

                              {/* Change Status */}
                              <Button
                                size="xs"
                                variant="outline"
                                borderColor="var(--border)"
                                color="var(--fg)"
                                borderRadius="full"
                                fontSize="10px"
                                onClick={() => handleOpenStatusModal(ord)}
                              >
                                Status
                              </Button>

                              {/* Update Payment */}
                              <Button
                                size="xs"
                                bg="var(--surface-2)"
                                border="1px solid var(--border)"
                                color="var(--accent)"
                                _hover={{ bg: 'var(--surface)' }}
                                borderRadius="full"
                                fontSize="10px"
                                onClick={() => handleOpenPaymentModal(ord)}
                              >
                                Payment
                              </Button>
                            </Flex>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* 1. Item Create / Edit Modal */}
      <AdminItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-geekstore-items'] });
          queryClient.invalidateQueries({ queryKey: ['geekstore-items'] });
        }}
      />

      {/* 2. Order Status / Payment Update Modal */}
      <AdminOrderStatusModal
        isOpen={isOrderStatusModalOpen}
        onClose={() => setIsOrderStatusModalOpen(false)}
        order={orderToUpdate}
        mode={orderModalMode}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-geekstore-orders'] });
        }}
      />

      {/* 3. Order Details Modal */}
      <AdminOrderDetailsModal
        isOpen={Boolean(selectedOrderForDetails)}
        onClose={() => setSelectedOrderForDetails(null)}
        order={selectedOrderForDetails}
        onOpenStatusModal={handleOpenStatusModal}
        onOpenPaymentModal={handleOpenPaymentModal}
      />

      {/* 4. Delete Confirmation Modal */}
      {deleteModalItem && (
        <Modal
          isOpen={Boolean(deleteModalItem)}
          onClose={() => setDeleteModalItem(null)}
          isCentered
          size="md"
        >
          <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />
          <ModalContent
            bg="var(--surface)"
            border="1px solid var(--border-strong)"
            borderRadius="20px"
            color="var(--fg)"
            boxShadow="0 18px 48px rgba(0, 0, 0, 0.75)"
          >
            <ModalHeader borderBottom="1px solid var(--border)" pb={3}>
              <Flex align="center" gap={2}>
                <Icon as={Trash2} color="red.400" size={18} />
                <Text fontSize="md" fontWeight="bold">
                  {deleteModalItem.deletedAt
                    ? 'Permanently Purge Product?'
                    : 'Delete Product from Store?'}
                </Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <Text fontSize="sm" color="var(--fg)" mb={2}>
                Are you sure you want to delete{' '}
                <Text as="span" fontWeight="bold" color="var(--accent)">
                  &quot;{deleteModalItem.name}&quot;
                </Text>
                ?
              </Text>
              {deleteModalItem.deletedAt ? (
                <Text fontSize="xs" color="red.300">
                  This product is already in the trash. Purging will permanently remove it from the database and cannot be recovered.
                </Text>
              ) : (
                <Text fontSize="xs" color="var(--fg-muted)">
                  You can move this item to the Trash (Soft Delete) to remove it from the user store while keeping records, or purge it permanently.
                </Text>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid var(--border)" gap={2}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteModalItem(null)}
                borderRadius="full"
              >
                Cancel
              </Button>
              {!deleteModalItem.deletedAt && (
                <Button
                  size="sm"
                  colorScheme="orange"
                  variant="outline"
                  borderRadius="full"
                  isLoading={deleteMutation.isPending}
                  onClick={() =>
                    deleteMutation.mutate({
                      itemId: deleteModalItem.id,
                      permanent: false,
                    })
                  }
                >
                  Move to Trash
                </Button>
              )}
              <Button
                size="sm"
                colorScheme="red"
                borderRadius="full"
                isLoading={deleteMutation.isPending}
                onClick={() =>
                  deleteMutation.mutate({
                    itemId: deleteModalItem.id,
                    permanent: true,
                  })
                }
              >
                {deleteModalItem.deletedAt ? 'Purge Permanently' : 'Delete Permanently'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
