'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
  VStack,
  HStack,
  Text,
  Box,
  Image,
  SimpleGrid,
  Switch,
  Badge,
  useToast,
  Flex,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { Upload, X, Calendar, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { FetchedEventDetails } from 'api/events/events';
import { updateEventDetails } from 'api/admin/admin';
import { resolveImageUrl } from 'utils/eventImages';

interface CoverImageItem {
  id: number;
  url: string;
}

export interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  onSuccess?: (updatedEvent: any) => void;
}

export default function EditEventModal({
  isOpen,
  onClose,
  eventName,
  onSuccess,
}: EditEventModalProps) {
  const toast = useToast();

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFlagship, setIsFlagship] = useState(false);

  // Media states
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [existingCovers, setExistingCovers] = useState<CoverImageItem[]>([]);
  const [removedCoverIds, setRemovedCoverIds] = useState<number[]>([]);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [coverPreviews, setCoverPreviews] = useState<string[]>([]);

  // Fetch current details whenever modal opens or eventName changes
  useEffect(() => {
    if (!isOpen || !eventName) return;

    let isMounted = true;
    setIsLoadingDetails(true);

    // Reset local selections
    setLogoFile(null);
    setLogoPreview(null);
    setCoverFiles([]);
    setCoverPreviews([]);
    setRemovedCoverIds([]);

    FetchedEventDetails(eventName)
      .then((data) => {
        if (!isMounted || !data) return;

        setTitle(data.name || eventName);
        setDescription(data.description || '');

        // Format dates for <input type="date" />
        if (data.startDate) {
          try {
            setStartDate(new Date(data.startDate).toISOString().split('T')[0]);
          } catch {
            setStartDate('');
          }
        } else {
          setStartDate('');
        }

        if (data.endDate) {
          try {
            setEndDate(new Date(data.endDate).toISOString().split('T')[0]);
          } catch {
            setEndDate('');
          }
        } else {
          setEndDate('');
        }

        setIsFlagship(Boolean(data.isFlagship));
        setExistingLogoUrl(data.logoImageURL || null);

        if (Array.isArray(data.coverImagesURL)) {
          setExistingCovers(
            data.coverImagesURL.map((cov: any, idx: number) => ({
              id: cov.id ?? idx,
              url: cov.url,
            }))
          );
        } else {
          setExistingCovers([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch event details for editing:', err);
        toast({
          title: 'Could not load event data',
          description: err.message || 'Please verify network connection and admin permissions.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, eventName, toast]);

  // Handle Logo Upload selection
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleClearNewLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Handle Cover Images selection
  const handleCoversChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setCoverFiles((prev) => [...prev, ...selected]);
      const newUrls = selected.map((file) => URL.createObjectURL(file));
      setCoverPreviews((prev) => [...prev, ...newUrls]);
    }
  };

  const handleRemoveExistingCover = (id: number) => {
    setRemovedCoverIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleUndoRemoveExistingCover = (id: number) => {
    setRemovedCoverIds((prev) => prev.filter((item) => item !== id));
  };

  const handleRemoveNewCover = (index: number) => {
    setCoverFiles((prev) => prev.filter((_, idx) => idx !== index));
    setCoverPreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ title: 'Event title is required', status: 'warning', isClosable: true });
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date cannot be earlier than start date.',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (startDate) {
        formData.append('startDate', new Date(startDate).toISOString());
      }
      if (endDate) {
        formData.append('endDate', new Date(endDate).toISOString());
      }
      formData.append('isFlagship', String(isFlagship));

      if (logoFile) {
        formData.append('logoImage', logoFile);
      }

      if (coverFiles.length > 0) {
        coverFiles.forEach((file) => formData.append('coverImages', file));
      }

      if (removedCoverIds.length > 0) {
        formData.append('removeCoverImageIds', removedCoverIds.join(','));
      }

      const result = await updateEventDetails(eventName, formData);

      toast({
        title: 'Event Updated Successfully',
        description: `Changes to "${title}" have been saved.`,
        status: 'success',
        duration: 3500,
        isClosable: true,
      });

      if (onSuccess) {
        onSuccess(result?.data || result);
      }

      onClose();
    } catch (err: any) {
      console.error('Error updating event:', err);
      toast({
        title: 'Failed to update event',
        description: err.message || 'An unexpected error occurred while saving changes.',
        status: 'error',
        duration: 5000,
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
                <Flex align="center" gap="8px">
                  <Text fontSize="xl" fontWeight="700" color="var(--fg)">
                    Edit Event
                  </Text>
                  <Badge colorScheme="purple" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                    Admin
                  </Badge>
                </Flex>
                <Text fontSize="xs" color="var(--fg-muted)" fontWeight="normal" mt={1}>
                  Update configuration, visual branding, and dates for {eventName}
                </Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="var(--fg-muted)" _hover={{ color: 'var(--fg)' }} />

          {/* Body */}
          <ModalBody py={5} px={6} overflowY="auto">
            {isLoadingDetails ? (
              <Flex minH="240px" align="center" justify="center" direction="column" gap={3}>
                <Spinner size="lg" color="var(--accent)" />
                <Text fontSize="sm" color="var(--fg-muted)">
                  Loading event parameters...
                </Text>
              </Flex>
            ) : (
              <VStack spacing={5} align="stretch">
                {/* Event Name */}
                <FormControl isRequired>
                  <Flex justify="space-between" align="center" mb={1}>
                    <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)" mb={0}>
                      Event Title / Name
                    </FormLabel>
                    {title.trim().toLowerCase() !== eventName.toLowerCase() && (
                      <Badge colorScheme="orange" fontSize="10px" borderRadius="md">
                        Renaming Event
                      </Badge>
                    )}
                  </Flex>
                  <Input
                    placeholder="e.g. OPENCODE'26"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    bg="var(--surface-2)"
                    border="1px solid var(--border)"
                    color="var(--fg)"
                    _focus={{ borderColor: 'var(--accent)' }}
                  />
                  {title.trim().toLowerCase() !== eventName.toLowerCase() && (
                    <Text fontSize="11px" color="orange.300" mt={1}>
                      Note: Renaming this event updates all linked repos, participant records, and leaderboard entries.
                    </Text>
                  )}
                </FormControl>

                {/* Description */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                    Event Description
                  </FormLabel>
                  <Textarea
                    placeholder="Describe the event, mission, and instructions for participants..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    bg="var(--surface-2)"
                    border="1px solid var(--border)"
                    color="var(--fg)"
                    _focus={{ borderColor: 'var(--accent)' }}
                  />
                </FormControl>

                {/* Dates */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                      Start Date
                    </FormLabel>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      bg="var(--surface-2)"
                      border="1px solid var(--border)"
                      color="var(--fg)"
                      _focus={{ borderColor: 'var(--accent)' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)">
                      End Date
                    </FormLabel>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      bg="var(--surface-2)"
                      border="1px solid var(--border)"
                      color="var(--fg)"
                      _focus={{ borderColor: 'var(--accent)' }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Flagship Event Switch */}
                <FormControl display="flex" alignItems="center" justifyContent="space-between" bg="var(--surface-2)" p={3} borderRadius="12px" border="1px solid var(--border)">
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="var(--fg)">
                      Flagship Event Status
                    </Text>
                    <Text fontSize="xs" color="var(--fg-muted)">
                      Feature this event prominently as the primary seasonal showcase on the platform.
                    </Text>
                  </Box>
                  <Switch
                    isChecked={isFlagship}
                    onChange={(e) => setIsFlagship(e.target.checked)}
                    colorScheme="purple"
                  />
                </FormControl>

                {/* Logo Image */}
                <Box>
                  <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)" mb={2}>
                    Event Logo
                  </FormLabel>
                  <Flex align="center" gap={4} wrap="wrap">
                    {/* Active preview (new or existing) */}
                    {(logoPreview || existingLogoUrl) && (
                      <Box position="relative" w="64px" h="64px" borderRadius="12px" overflow="hidden" border="1px solid var(--border)" bg="black">
                        <Image
                          src={logoPreview || resolveImageUrl(existingLogoUrl || undefined)}
                          alt="Event logo"
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                        {logoPreview && (
                          <IconButton
                            aria-label="Remove new logo"
                            icon={<X size={12} />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top="2px"
                            right="2px"
                            onClick={handleClearNewLogo}
                          />
                        )}
                      </Box>
                    )}

                    <Box flex="1">
                      <Button
                        as="label"
                        htmlFor="edit-event-logo-input"
                        size="sm"
                        variant="outline"
                        leftIcon={<Upload size={14} />}
                        cursor="pointer"
                        border="1px dashed var(--border-strong)"
                        _hover={{ borderColor: 'var(--accent)', bg: 'var(--surface-2)' }}
                      >
                        {logoPreview || existingLogoUrl ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      <Input
                        id="edit-event-logo-input"
                        type="file"
                        accept="image/*"
                        display="none"
                        onChange={handleLogoChange}
                      />
                      <Text fontSize="11px" color="var(--fg-muted)" mt={1}>
                        PNG, JPG, or SVG. Square aspect ratio recommended.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {/* Cover Images */}
                <Box>
                  <FormLabel fontSize="xs" fontWeight="600" color="var(--fg)" mb={2}>
                    Cover Banners
                  </FormLabel>

                  {/* Existing covers */}
                  {existingCovers.length > 0 && (
                    <Box mb={3}>
                      <Text fontSize="11px" color="var(--fg-muted)" mb={1.5}>
                        Current Banners:
                      </Text>
                      <Flex gap={2} wrap="wrap">
                        {existingCovers.map((cov) => {
                          const isRemoved = removedCoverIds.includes(cov.id);
                          return (
                            <Box
                              key={cov.id}
                              position="relative"
                              w="110px"
                              h="60px"
                              borderRadius="8px"
                              overflow="hidden"
                              border="1px solid var(--border)"
                              opacity={isRemoved ? 0.4 : 1}
                              filter={isRemoved ? 'grayscale(100%)' : 'none'}
                              transition="all 0.2s"
                            >
                              <Image
                                src={resolveImageUrl(cov.url)}
                                alt="Cover banner"
                                w="100%"
                                h="100%"
                                objectFit="cover"
                              />
                              <IconButton
                                aria-label={isRemoved ? 'Undo remove' : 'Remove banner'}
                                icon={isRemoved ? <Sparkles size={12} /> : <X size={12} />}
                                size="xs"
                                colorScheme={isRemoved ? 'green' : 'red'}
                                position="absolute"
                                top="2px"
                                right="2px"
                                onClick={() =>
                                  isRemoved
                                    ? handleUndoRemoveExistingCover(cov.id)
                                    : handleRemoveExistingCover(cov.id)
                                }
                              />
                            </Box>
                          );
                        })}
                      </Flex>
                    </Box>
                  )}

                  {/* Newly selected cover previews */}
                  {coverPreviews.length > 0 && (
                    <Box mb={3}>
                      <Text fontSize="11px" color="var(--accent)" mb={1.5}>
                        New Banners to Add:
                      </Text>
                      <Flex gap={2} wrap="wrap">
                        {coverPreviews.map((url, idx) => (
                          <Box
                            key={idx}
                            position="relative"
                            w="110px"
                            h="60px"
                            borderRadius="8px"
                            overflow="hidden"
                            border="1px solid var(--accent)"
                          >
                            <Image
                              src={url}
                              alt="New cover preview"
                              w="100%"
                              h="100%"
                              objectFit="cover"
                            />
                            <IconButton
                              aria-label="Remove pending banner"
                              icon={<X size={12} />}
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top="2px"
                              right="2px"
                              onClick={() => handleRemoveNewCover(idx)}
                            />
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  {/* Upload button for covers */}
                  <Button
                    as="label"
                    htmlFor="edit-event-covers-input"
                    size="sm"
                    variant="outline"
                    leftIcon={<Upload size={14} />}
                    cursor="pointer"
                    border="1px dashed var(--border-strong)"
                    _hover={{ borderColor: 'var(--accent)', bg: 'var(--surface-2)' }}
                  >
                    Add Cover Banners
                  </Button>
                  <Input
                    id="edit-event-covers-input"
                    type="file"
                    accept="image/*"
                    multiple
                    display="none"
                    onChange={handleCoversChange}
                  />
                  <Text fontSize="11px" color="var(--fg-muted)" mt={1}>
                    Landscape images (16:9 ratio recommended). Max 5 banners total.
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          {/* Footer */}
          <ModalFooter borderTop="1px solid var(--border)" py={3} px={6}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="purple"
                isLoading={isSubmitting}
                loadingText="Saving..."
                isDisabled={isLoadingDetails}
              >
                Save Changes
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
