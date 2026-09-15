'use client';

import {
  Box,
  Grid,
  Text,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { opencodeTokens } from '../../../../theme/opencode-tokens';

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

  const titleColor = opencodeTokens.colors.text.primary;
  const labelColor = opencodeTokens.colors.text.secondary;
  const valueColor = opencodeTokens.colors.text.primary;

  const cardBg = 'transparent';
  const cardBorder = 'transparent';

  const itemBg = opencodeTokens.colors.background.glassDark;
  const itemBorder = opencodeTokens.colors.border.light;

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
      borderColor={itemBorder}
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
