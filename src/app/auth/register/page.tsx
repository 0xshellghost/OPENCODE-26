'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import DefaultAuthLayout from 'layouts/auth/Default';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { sendRegData } from '../../../api/profile/profile';

export default function SignIn() {
  const [formData, setformData] = useState({
    name: '',
    email: '',
    gender: '',
    degree: 'BTECH',
    branch: 'IT',
    college: 'IIIT Allahabad',
    discordId: '',
    githubId: '',
    graduationYear: '',
    avatarUrl: '',
    year: '',
  });

  const toast = useToast();
  const router = useRouter();

  const [collegeType, setCollegeType] = useState('IIIT Allahabad');
  const [otherCollege, setOtherCollege] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const querystring = window.location.search;
      const urlParam = new URLSearchParams(querystring);
      const TokenParam = urlParam.get('token');
      const avatarUrl = urlParam.get('avatar_url');

      setformData((prev) => ({
        ...prev,
        avatarUrl: avatarUrl || '',
      }));

      if (TokenParam) {
        localStorage.setItem('token', TokenParam);
      }
    }
  }, []);

  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('navy.700', 'secondaryGray.600');
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setformData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCollegeTypeChange = (
    e: ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    setCollegeType(value);
    if (value === 'IIIT Allahabad') {
      setformData((prev) => ({
        ...prev,
        college: 'IIIT Allahabad',
      }));
    } else {
      setformData((prev) => ({
        ...prev,
        college: otherCollege,
      }));
    }
  };

  const handleOtherCollegeChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = e.target;
    setOtherCollege(value);
    setformData((prev) => ({
      ...prev,
      college: value,
    }));
  };

  const registerMutation = useMutation({
    mutationFn: sendRegData,
    onSuccess: () => {
      router.push(
        `/user/home?token=${localStorage.getItem('token')}&avatar_url=${formData.avatarUrl
        }`,
      );
    },
    onError: () => {
      console.log('Error');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key as keyof typeof formData];
        if (typeof value === 'string' && value.trim() === '') {
          console.error(`Error: ${key} is blank`);
          toast({
            title: `${key === 'college' ? 'College' : key} is Required `,
            description: `Please enter ${key === 'college' ? 'your college name' : `the ${key}`}`,
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
          return;
        }
      }
    }

    if (!formData.gender) {
      toast({
        title: 'Gender is required',
        description: 'Please select your gender.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    const dataToSend = { ...formData, gender: formData.gender.trim().toLowerCase() };
    registerMutation.mutate(dataToSend);
  };

  return (
    <DefaultAuthLayout illustrationBackground={'/img/auth/auth.png'}>
      <Container maxW="full" centerContent>
        <Flex
          maxW={{ base: '100%', md: 'max-content' }}
          w="100%"
          mx={{ base: 'auto', lg: '0px' }}
          me="auto"
          h="100%"
          alignItems="start"
          justifyContent="center"
          mb={{ base: '30px', md: '60px' }}
          px={{ base: '25px', md: '0px' }}
          mt={{ base: '40px', md: '14vh' }}
          flexDirection="column"
        >
          <Box me="auto">
            <Heading
              color={textColor}
              fontSize={{ base: '28px', md: '36px' }}
              mb="10px"
            >
              Register
            </Heading>
            <Text
              mb="28px"
              ms="4px"
              color={textColorSecondary}
              fontWeight="400"
              fontSize="md"
            >
              Register for GeekPortal with Below Details...
            </Text>
          </Box>
          <Flex
            zIndex="2"
            direction="column"
            w={{ base: '100%', md: '900px' }}
            maxW="100%"
            background="transparent"
            borderRadius="15px"
            mx={{ base: 'auto', lg: 'unset' }}
            me="auto"
            mb={{ base: '20px', md: 'auto' }}
          >
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
              gap={{ base: 4, md: 6 }}
            >
              {/* Name */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Name<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    type="text"
                    placeholder="Enter Name"
                    name="name"
                    onChange={handleChange}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  />
                </FormControl>
              </GridItem>

              {/* Email */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Email<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    type="email"
                    placeholder="iec2022117@iiita.ac.in"
                    onChange={handleChange}
                    name="email"
                    value={formData.email}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  />
                </FormControl>
              </GridItem>

              {/* Degree */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Degree<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Select
                    placeholder="Select option"
                    isRequired={true}
                    variant="auth"
                    name="degree"
                    fontSize="sm"
                    onChange={handleChange}
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  >
                    <option value="BTECH">BTECH</option>
                    <option value="MTECH">MTECH</option>
                    <option value="PHD">PHD</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
              </GridItem>

              {/* Branch */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Enter Your Branch<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    type="text"
                    name="branch"
                    placeholder="Electronic and Communication"
                    mb="24px"
                    onChange={handleChange}
                    fontWeight="500"
                    size="lg"
                  />
                </FormControl>
              </GridItem>

              {/* College */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    College<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Select
                    isRequired={true}
                    variant="auth"
                    name="collegeType"
                    value={collegeType}
                    fontSize="sm"
                    onChange={handleCollegeTypeChange}
                    ms={{ base: '0px', md: '0px' }}
                    mb={collegeType === 'Other' ? '16px' : '24px'}
                    fontWeight="500"
                    size="lg"
                  >
                    <option value="IIIT Allahabad">IIIT Allahabad</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                {collegeType === 'Other' && (
                  <FormControl>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Enter College Name<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      type="text"
                      name="college"
                      value={otherCollege}
                      onChange={handleOtherCollegeChange}
                      placeholder="Enter your college name"
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                    />
                  </FormControl>
                )}
              </GridItem>

              {/* Discord ID */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Enter Discord ID<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    type="text"
                    name="discordId"
                    onChange={handleChange}
                    placeholder="akshayw1"
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  />
                </FormControl>
              </GridItem>

              {/* Graduation Year */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Enter Graduation Year<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    type="number"
                    name="graduationYear"
                    onChange={handleChange}
                    placeholder="2028"
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  />
                </FormControl>
              </GridItem>

              {/* Github ID */}
              <GridItem>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Enter Github ID<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    type="text"
                    name="githubId"
                    onChange={handleChange}
                    placeholder="akshayw1"
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  />
                </FormControl>
              </GridItem>

              {/* Year */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Year<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Select
                    placeholder="Select Year"
                    isRequired={true}
                    variant="auth"
                    name="year"
                    value={formData.year}
                    fontSize="sm"
                    onChange={handleChange}
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  >
                    <option value="School">School</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Passout">Passout</option>
                  </Select>
                </FormControl>
              </GridItem>

              {/* Gender */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Gender<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Select
                    placeholder="Select Gender"
                    isRequired={true}
                    variant="auth"
                    name="gender"
                    value={formData.gender}
                    fontSize="sm"
                    onChange={handleChange}
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              onClick={handleSubmit}
            >
              Register
            </Button>

            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="start"
              maxW="100%"
              mt="0px"
            >
              <Link href="/auth/sign-in">
                <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                  Having a existing account?
                  <Text
                    color={textColorBrand}
                    as="span"
                    ms="5px"
                    fontWeight="500"
                  >
                    Login
                  </Text>
                </Text>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </DefaultAuthLayout>
  );
}
