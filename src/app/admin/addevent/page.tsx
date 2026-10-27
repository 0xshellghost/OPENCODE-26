'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
  Heading,
  Grid,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

// Define the shape of the JWT payload
interface JWTPayload {
  roles?: {
    isAdmin: boolean;
  };
  [key: string]: any;
}

export default function Addevent() {
  const router = useRouter();
  const toast = useToast();
  const calendarIconFilter = useColorModeValue('none', 'invert(1)');

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper to decode JWT payload
  function parseJwt(token: string | null): JWTPayload | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Security check: Redirect if not admin
  useEffect(() => {
    if (isMounted) {
      const token = localStorage.getItem('token');
      const payload = parseJwt(token);
      if (!payload?.roles?.isAdmin) {
        console.error('Only admin can create events');
        router.push('/user/events');
      }
    }
  }, [isMounted, router]);

  if (!isMounted) {
    return null;
  }

  const logoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    }
  };

  const coverUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCoverFiles(Array.from(event.target.files));
    } else {
      setCoverFiles([]);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEventData({
      ...eventData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!eventData.title || !eventData.description || !eventData.startDate || !eventData.endDate) {
      toast({ title: 'Please fill all fields', status: 'warning', isClosable: true });
      return;
    }

    if (!logoFile) {
      toast({ title: 'Logo image is required', status: 'warning', isClosable: true });
      return;
    }

    const token = localStorage.getItem('token');
    const payload = parseJwt(token);

    if (!payload?.roles?.isAdmin) {
      toast({ title: 'Only admin can create events', status: 'error', isClosable: true });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('startDate', new Date(eventData.startDate).toISOString());
    formData.append('endDate', new Date(eventData.endDate).toISOString());

    if (logoFile) {
      formData.append('logoImage', logoFile);
    }
    
    if (coverFiles && coverFiles.length > 0) {
      coverFiles.forEach((f) => formData.append('coverImages', f));
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://opencode-26-backend.onrender.com').replace(/\/+$/, '');
      await axios.post(
        `${baseUrl}/api/v1/admin/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({ title: 'Event Created Successfully', status: 'success', isClosable: true });
      router.push('/admin/viewevents');
    } catch (error: any) {
      console.error(
        'Error creating event:',
        error?.response?.data || error.message
      );
      const errorDetail =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        'Internal server error';
      toast({ 
        title: 'Failed to create event', 
        description: errorDetail,
        status: 'error', 
        duration: 7000,
        isClosable: true 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={{ base: '12px', sm: '20px' }}>
      <Text color="var(--fg)" fontSize="2xl" mb="24px" fontWeight="700">
        Add New Event
      </Text>

      <Box
        bg="var(--surface)"
        border="1px solid var(--border)"
        p={{ base: '18px', sm: '30px' }}
        borderRadius="20px"
        boxShadow="var(--shadow)"
        mb="24px"
        maxW="800px"
        mx="auto"
      >
        <Heading size="md" mb="12px" color="var(--fg)">
          Event Details
        </Heading>
        <Text fontSize="sm" mb="24px" color="var(--fg-muted)">
          Create a new event by filling out the information below.
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing="24px">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">
                Event Title
              </FormLabel>
              <Input
                type="text"
                name="title"
                variant="auth"
                placeholder="e.g. OpenCode 2026"
                value={eventData.title}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">
                Event Description
              </FormLabel>
              <Textarea
                name="description"
                variant="auth"
                rows={4}
                placeholder="Enter event description..."
                value={eventData.description}
                onChange={handleChange}
              />
            </FormControl>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="24px">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">
                  Start Date
                </FormLabel>
                <Input
                  type="date"
                  name="startDate"
                  variant="auth"
                  value={eventData.startDate}
                  onChange={handleChange}
                  css={{
                    '::-webkit-calendar-picker-indicator': {
                      filter: calendarIconFilter,
                    },
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">
                  End Date
                </FormLabel>
                <Input
                  type="date"
                  name="endDate"
                  variant="auth"
                  value={eventData.endDate}
                  onChange={handleChange}
                  css={{
                    '::-webkit-calendar-picker-indicator': {
                      filter: calendarIconFilter,
                    },
                  }}
                />
              </FormControl>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="24px">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">
                  Logo Image
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  variant="auth"
                  p="1"
                  onChange={logoUpload}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">
                  Banner Image (Cover)
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  variant="auth"
                  p="1"
                  onChange={coverUpload}
                />
                {coverFiles.length > 0 && (
                  <Text fontSize="xs" color="var(--fg-muted)" mt="2">
                    {coverFiles[0].name} selected
                  </Text>
                )}
              </FormControl>
            </Grid>

            <Box textAlign="right" mt="16px">
              <Button
                variant="brand"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Create Event
              </Button>
            </Box>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
