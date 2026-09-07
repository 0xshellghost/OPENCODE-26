'use client';

import {
  Box,
  Grid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card';

export default function GeneralInformation(props: {
  name: string;
  githubId: string;
  discordId?: string;
  college?: string;
  email?: string;
  gender?: string;
  year?: string;
  role?: string;
  [x: string]: any;
}) {
  const { name, githubId, discordId, college, email, gender, year, role, ...rest } =
    props;

  const titleColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'white');

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');

  const itemBg = useColorModeValue('gray.50', 'transparent');
  const itemBorder = useColorModeValue('gray.200', 'transparent');

  const Item = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => (
    <Box
      bg={itemBg}
      
      border="1px solid"
      borderColor="gray.500"
      borderRadius="14px"
      px="14px"
      py="12px"
    >
      <Text
        fontSize="10px"
        fontWeight="700"
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="0.8px"
        mb="4px"
      >
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="600"
        color={valueColor}
        noOfLines={2}
      >
        {value || '—'}
      </Text>
    </Box>
  );

  return (
    <Card
      p="20px"
      bg={cardBg}
    
      borderColor={cardBorder}
      borderRadius="20px"
      {...rest}
    >
      {/* Header */}
      <Text
        fontSize="lg"
        fontWeight="800"
        color={titleColor}
        mb="18px"
      >
        General Information
      </Text>

      {/* Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
        }}
        gap="14px"
      >
        <Item label="Name" value={name} />
        <Item label="GitHub" value={`@${githubId}`} />
        {role && <Item label="Role & Affiliation" value={role} />}
        {college && <Item label="College" value={college} />}
        {gender && (
          <Item
            label="Gender"
            value={
              gender.toLowerCase() === 'male'
                ? 'Male'
                : gender.toLowerCase() === 'female'
                  ? 'Female'
                  : gender.toLowerCase() === 'other'
                    ? 'Other'
                    : gender
            }
          />
        )}
        {year && <Item label="Year" value={year} />}
        {discordId && <Item label="Discord ID" value={discordId} />}
        {email && <Item label="Email" value={email} />}
      </Grid>
    </Card>
  );
}
