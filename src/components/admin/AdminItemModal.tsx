'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Spinner,
  Icon,
} from '@chakra-ui/react';
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Image Upload States
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{
    provider?: string;
    fileName?: string;
    fileSize?: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
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
      setUploadInfo(null);
      // If item already has a URL, default to 'url' view if it's external, or 'upload'
      setImageInputMode(itemToEdit.imageUrl ? 'url' : 'upload');
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
      setUploadInfo(null);
      setImageInputMode('upload');
    }
  }, [itemToEdit, isOpen]);

  // Handle direct file upload to cloud
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file (PNG, JPG, WebP, GIF, SVG).',
        status: 'warning',
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: `Image size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed is 10 MB.`,
        status: 'warning',
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setImageLoadError(false);

    try {
      const res = await GeekstoreService.uploadImage(file);
      if (res?.url) {
        setImageUrl(res.url);
        const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
        setUploadInfo({
          provider: res.provider || 'cloud',
          fileName: file.name,
          fileSize: sizeFormatted,
        });

        toast({
          title: 'Image Uploaded Successfully',
          description: `Uploaded successfully (${res.provider === 'cloudinary' ? 'Cloudinary Cloud' : 'Storage'}). Ready to publish.`,
          status: 'success',
          duration: 3500,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err?.message || 'Could not upload image to cloud storage.',
        status: 'error',
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

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
          title: 'Product Updated Successfully',
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
          title: 'Product Added Successfully',
          description: `"${created.name}" is now live in the Geekstore catalog.`,
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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent
        bg="var(--surface)"
        border="1px solid var(--border-strong)"
        boxShadow="0 18px 48px rgba(0, 0, 0, 0.75)"
        borderRadius="24px"
        color="var(--fg)"
        maxH="90vh"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Header */}
          <ModalHeader borderBottom="1px solid var(--border)" pb={4} px={6} pt={6}>
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontSize="xl" fontWeight="700" color="var(--fg)">
                  {isEditing ? 'Edit Merchandise Product' : 'Create New Merchandise Item'}
                </Text>
                <Text fontSize="xs" color="var(--fg-muted)" fontWeight="normal" mt={1}>
                  {isEditing
                    ? `Update product ID: ${itemToEdit?.id}`
                    : 'Publish an official hoodie, tee, sticker, or accessory to the database with cloud images'}
                </Text>
              </Box>
              {isEditing && (
                <Badge
                  colorScheme={isActive ? 'green' : 'gray'}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                >
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          {/* Body */}
          <ModalBody py={5} px={6} overflowY="auto">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              {/* Product Name */}
              <FormControl isRequired gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                  Product Name
                </FormLabel>
                <Input
                  placeholder="e.g. OpenCode Developer T-Shirt"
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

              {/* ------------------------------------------------------------- */}
              {/* IMAGE UPLOAD & CLOUD STORAGE SECTION */}
              {/* ------------------------------------------------------------- */}
              <FormControl gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <Flex justify="space-between" align="center" mb={2}>
                  <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)" mb={0}>
                    Product Image (Cloud Storage & Frontend Display)
                  </FormLabel>

                  {/* Mode Toggle Buttons */}
                  <Flex bg="var(--surface-2)" p="2px" borderRadius="full" border="1px solid var(--border)">
                    <Button
                      size="xs"
                      borderRadius="full"
                      px={3}
                      fontSize="10px"
                      bg={imageInputMode === 'upload' ? 'var(--accent)' : 'transparent'}
                      color={imageInputMode === 'upload' ? 'var(--accent-ink)' : 'var(--fg-muted)'}
                      fontWeight="bold"
                      _hover={{ color: 'var(--fg)' }}
                      onClick={() => setImageInputMode('upload')}
                      leftIcon={<Icon as={UploadCloud} size={12} />}
                    >
                      Cloud Upload
                    </Button>
                    <Button
                      size="xs"
                      borderRadius="full"
                      px={3}
                      fontSize="10px"
                      bg={imageInputMode === 'url' ? 'var(--accent)' : 'transparent'}
                      color={imageInputMode === 'url' ? 'var(--accent-ink)' : 'var(--fg-muted)'}
                      fontWeight="bold"
                      _hover={{ color: 'var(--fg)' }}
                      onClick={() => setImageInputMode('url')}
                      leftIcon={<Icon as={LinkIcon} size={12} />}
                    >
                      Direct URL
                    </Button>
                  </Flex>
                </Flex>

                {/* Upload Mode: Drag & Drop Dropzone */}
                {imageInputMode === 'upload' && (
                  <Box>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    <Box
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      cursor={isUploading ? 'not-allowed' : 'pointer'}
                      p={5}
                      borderRadius="16px"
                      border="2px dashed"
                      borderColor={
                        isDragOver
                          ? 'var(--accent)'
                          : isUploading
                          ? 'var(--accent)'
                          : 'var(--border-strong)'
                      }
                      bg={
                        isDragOver
                          ? 'var(--accent-soft)'
                          : 'var(--surface-2)'
                      }
                      transition="all 0.2s ease"
                      textAlign="center"
                      _hover={{ borderColor: 'var(--accent)', bg: 'var(--surface-3)' }}
                    >
                      {isUploading ? (
                        <Flex direction="column" align="center" justify="center" py={4} gap={3}>
                          <Spinner color="var(--accent)" size="md" thickness="3px" />
                          <Text fontSize="sm" fontWeight="600" color="var(--fg)">
                            Uploading image to Cloud...
                          </Text>
                          <Text fontSize="xs" color="var(--fg-muted)">
                            Processing and optimizing for high-performance frontend CDN
                          </Text>
                        </Flex>
                      ) : (
                        <Flex direction="column" align="center" justify="center" py={3} gap={2}>
                          <Flex
                            h="44px"
                            w="44px"
                            align="center"
                            justify="center"
                            borderRadius="full"
                            bg="var(--accent-soft)"
                            color="var(--accent)"
                          >
                            <Icon as={UploadCloud} size={22} />
                          </Flex>
                          <Text fontSize="sm" fontWeight="600" color="var(--fg)">
                            Click to upload or drag & drop image
                          </Text>
                          <Text fontSize="11px" color="var(--fg-muted)">
                            Supports PNG, JPG, WebP, GIF, SVG up to 10MB
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </Box>
                )}

                {/* URL Mode: Text Input */}
                {imageInputMode === 'url' && (
                  <Box>
                    <Input
                      placeholder="Paste image URL: https://res.cloudinary.com/... or https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageLoadError(false);
                      }}
                      bg="var(--surface-2)"
                      border="1px solid var(--border)"
                      color="var(--fg)"
                      borderRadius="12px"
                      fontSize="sm"
                      _focus={{ borderColor: 'var(--accent)' }}
                    />
                    <Text fontSize="10px" color="var(--fg-muted)" mt={1}>
                      Supports direct Cloudinary links, Unsplash images, or hosted asset URLs.
                    </Text>
                  </Box>
                )}

                {/* Uploaded / Selected Image Preview Card */}
                {imageUrl && (
                  <Box
                    mt={3}
                    p={3}
                    border="1px solid var(--border-accent)"
                    borderRadius="14px"
                    bg="var(--surface-2)"
                  >
                    <Flex align="center" justify="space-between" gap={3}>
                      <Flex align="center" gap={3} minW="0">
                        <Box
                          position="relative"
                          h="56px"
                          w="56px"
                          borderRadius="10px"
                          overflow="hidden"
                          bg="var(--card-soft)"
                          border="1px solid var(--border)"
                          flexShrink={0}
                        >
                          {!imageLoadError ? (
                            <Image
                              src={imageUrl}
                              alt="Product Preview"
                              fill
                              className="object-cover"
                              onError={() => setImageLoadError(true)}
                              unoptimized
                            />
                          ) : (
                            <Flex h="100%" w="100%" align="center" justify="center" bg="red.900.20" color="red.300">
                              <Icon as={AlertCircle} size={20} />
                            </Flex>
                          )}
                        </Box>
                        <Box minW="0">
                          <Flex align="center" gap={2}>
                            <Text fontSize="xs" fontWeight="700" color="var(--fg)" isTruncated maxW="280px">
                              {uploadInfo?.fileName || 'Product Image Attached'}
                            </Text>
                            <Badge
                              colorScheme={imageUrl.startsWith('https://res.cloudinary.com') ? 'purple' : 'teal'}
                              fontSize="9px"
                              borderRadius="full"
                              px={2}
                            >
                              {imageUrl.startsWith('https://res.cloudinary.com')
                                ? 'Cloudinary Cloud'
                                : uploadInfo?.provider || 'Cloud Stored'}
                            </Badge>
                          </Flex>
                          <Text fontSize="10px" color="var(--fg-muted)" fontFamily="mono" isTruncated maxW="340px" mt={0.5}>
                            {imageUrl}
                          </Text>
                          {uploadInfo?.fileSize && (
                            <Text fontSize="10px" color="var(--accent)" mt={0.5}>
                              File size: {uploadInfo.fileSize}
                            </Text>
                          )}
                        </Box>
                      </Flex>

                      <Flex align="center" gap={2}>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          borderRadius="full"
                          leftIcon={<Icon as={Trash2} size={13} />}
                          onClick={() => {
                            setImageUrl('');
                            setUploadInfo(null);
                          }}
                        >
                          Remove
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                )}
              </FormControl>
            </SimpleGrid>

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
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={3.5}
              bg="var(--surface-2)"
              borderRadius="14px"
              border="1px solid var(--border)"
            >
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
                size="md"
              />
            </FormControl>
          </ModalBody>

          {/* Footer */}
          <ModalFooter borderTop="1px solid var(--border)" px={6} py={4} gap={3}>
            <Button
              variant="ghost"
              color="var(--fg-muted)"
              onClick={onClose}
              borderRadius="full"
              fontSize="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || isUploading}
              loadingText={isUploading ? 'Uploading Image...' : isEditing ? 'Saving...' : 'Creating...'}
              bg="var(--accent)"
              color="var(--accent-ink)"
              borderRadius="full"
              px={6}
              fontWeight="bold"
              fontSize="sm"
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
