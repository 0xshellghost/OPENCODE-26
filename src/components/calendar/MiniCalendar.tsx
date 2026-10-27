'use client';

import { Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'styles/MiniCalendar.css';

import Card from 'components/card/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar(props: {
  selectRange?: boolean;
  [x: string]: any;
}) {
  const { selectRange = false, ...rest } = props;
  const [value, onChange] = useState<Date | [Date, Date]>(new Date());

  const accentColor = 'var(--accent)';

  return (
    <Card
      alignItems="center"
      flexDirection="column"
      w="100%"
      p="16px"
      {...rest}
    >
      <Calendar
        onChange={onChange}
        value={value}
        selectRange={selectRange}
        view="month"
        prevLabel={<Icon as={ChevronLeft} w="20px" h="20px" />}
        nextLabel={<Icon as={ChevronRight} w="20px" h="20px" />}
        tileContent={undefined}
        className="mini-calendar"
      />

      <Text
        mt="8px"
        fontSize="xs"
        color="var(--fg-muted)"
      >
        Select a date
      </Text>
    </Card>
  );
}
