'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  SimpleGrid,
  Box,
  Text,
  Flex,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { CatalogItem } from 'types/geekstore';
import GeekstoreService from 'services/geekstore.service';

const CATEGORY_OPTIONS = [
  'Hoodies',
  'T-Shirts',
  'Accessories',
  'Stickers',
  'Drinkware',
  'Merchandise',
];

interface AdminItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: CatalogItem | null;
  onSuccess: (saved: CatalogItem) => void;
}

export default function AdminItemModal({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}: AdminItemModalProps) {
  const toast = useToast();
  const isEditing = Boolean(itemToEdit);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Hoodies');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [sizesInput, setSizesInput] = useState('S, M, L, XL, XXL');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setDescription(itemToEdit.description || '');
      setImageUrl(itemToEdit.imageUrl || '');
      setCategory(itemToEdit.category || 'Hoodies');
      setPrice(String(itemToEdit.price || ''));
      setStock(String(itemToEdit.stock ?? '0'));
      setSizesInput(
        itemToEdit.sizes && itemToEdit.sizes.length > 0
          ? itemToEdit.sizes.join(', ')
          : '',
      );
      setIsActive(itemToEdit.isActive !== false);
    } else {
      // Defaults for create mode
      setName('');
      setDescription('');
      setImageUrl('');
      setCategory('Hoodies');
      setPrice('');
      setStock('20');
      setSizesInput('S, M, L, XL, XXL');
      setIsActive(true);
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Product name is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: 'Please enter a valid price in INR (greater than 0)',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast({
        title: 'Please enter a valid stock quantity (0 or greater)',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const parsedSizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      if (isEditing && itemToEdit) {
        const updated = await GeekstoreService.adminUpdateItem(itemToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          category,
          price: priceNum,
          stock: stockNum,
          sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
          isActive,
        });
        toast({
          title: 'Product Updated Successfully! ✏️',
          description: `"${updated.name}" has been updated.`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        onSuccess(updated);
        onClose();
      } else {
        const created = await GeekstoreService.adminCreateItem({
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          category,
          price: priceNum,
          stock: stockNum,
          sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
          isActive,
        });
        toast({
          title: 'Product Added Successfully! 🎉',
          description: `"${created.name}" is now available in the Geekstore catalog.`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      toast({
        title: isEditing ? 'Failed to update product' : 'Failed to create product',
        description: err?.message || 'Something went wrong.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
      <ModalContent
        bg="var(--surface)"
        border="1px solid var(--border)"
        boxShadow="0 12px 40px rgba(0, 0, 0, 0.6)"
        borderRadius="20px"
        color="var(--fg)"
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader borderBottom="1px solid var(--border)" pb={4}>
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontSize="lg" fontWeight="700">
                  {isEditing ? 'Edit Merchandise Product' : 'Create New Merchandise Item'}
                </Text>
                <Text fontSize="xs" color="var(--fg-muted)" fontWeight="normal" mt={1}>
                  {isEditing
                    ? `Update product ID: ${itemToEdit?.id}`
                    : 'Publish an official hoodie, tee, sticker, or accessory to the database'}
                </Text>
              </Box>
              {isEditing && (
                <Badge
                  colorScheme={isActive ? 'green' : 'gray'}
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={5}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              {/* Product Name */}
              <FormControl isRequired gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                  Product Name
                </FormLabel>
                <Input
                  placeholder="e.g. OpenCode 2026 Founder Hoodie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  fontSize="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                />
              </FormControl>

              {/* Category */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                  Category
                </FormLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  fontSize="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c} style={{ background: '#0B1C2A' }}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Price */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                  Price in INR (₹)
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 1499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  fontSize="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                />
              </FormControl>

              {/* Stock Quantity */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                  Stock Quantity (Restock)
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 25"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  fontSize="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                />
              </FormControl>

              {/* Available Sizes */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                  Available Sizes (comma-separated)
                </FormLabel>
                <Input
                  placeholder="S, M, L, XL, XXL"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  fontSize="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                />
              </FormControl>

              {/* Image URL */}
              <FormControl gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                  Image URL (Cloudinary / Unsplash)
                </FormLabel>
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  bg="var(--surface-2)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  borderRadius="12px"
                  fontSize="sm"
                  _focus={{ borderColor: 'var(--accent)' }}
                />
              </FormControl>
            </SimpleGrid>

            {/* Image Preview if provided */}
            {imageUrl && (
              <Box
                mb={4}
                p={2}
                border="1px solid var(--border)"
                borderRadius="12px"
                bg="var(--surface-2)"
              >
                <Flex align="center" gap={3}>
                  <Box
                    position="relative"
                    h="50px"
                    w="50px"
                    borderRadius="8px"
                    overflow="hidden"
                    bg="var(--card-soft)"
                    flexShrink={0}
                  >
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="var(--fg)">
                      Image Preview
                    </Text>
                    <Text fontSize="10px" color="var(--fg-muted)" isTruncated maxW="380px">
                      {imageUrl}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {/* Description */}
            <FormControl mb={4}>
              <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                Product Description
              </FormLabel>
              <Textarea
                rows={3}
                placeholder="e.g. Heavyweight 380 GSM fleece hoodie with embroidered cherry blossom motif..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                bg="var(--surface-2)"
                border="1px solid var(--border)"
                color="var(--fg)"
                borderRadius="12px"
                fontSize="sm"
                _focus={{ borderColor: 'var(--accent)' }}
              />
            </FormControl>

            {/* Active Status Switch */}
            <FormControl display="flex" alignItems="center" justifyContent="space-between" p={3} bg="var(--surface-2)" borderRadius="12px" border="1px solid var(--border)">
              <Box>
                <FormLabel htmlFor="is-active-switch" mb="0" fontSize="sm" fontWeight="600" color="var(--fg)">
                  Catalog Availability (isActive)
                </FormLabel>
                <Text fontSize="xs" color="var(--fg-muted)">
                  {isActive
                    ? 'Visible to users on /user/geekstore'
                    : 'Hidden from user store (Catalog Draft / Archived)'}
                </Text>
              </Box>
              <Switch
                id="is-active-switch"
                isChecked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                colorScheme="teal"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter borderTop="1px solid var(--border)" gap={3}>
            <Button variant="ghost" color="var(--fg-muted)" onClick={onClose} borderRadius="full">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText={isEditing ? 'Saving...' : 'Creating...'}
              bg="var(--accent)"
              color="var(--accent-ink)"
              borderRadius="full"
              px={6}
              fontWeight="bold"
              _hover={{ bg: 'var(--accent-hover)' }}
            >
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

