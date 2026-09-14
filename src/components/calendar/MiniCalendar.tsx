'use client';

import { Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MiniCalendar.css'; // ⬅️ IMPORTANT

import Card from 'components/card/Card';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function MiniCalendar(props: {
  selectRange?: boolean;
  [x: string]: any;
}) {
  const { selectRange = false, ...rest } = props;
  const [value, onChange] = useState<Date | [Date, Date]>(new Date());

  const accentColor = useColorModeValue('#e9a7b2', '#e9a7b2');

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
        prevLabel={<Icon as={MdChevronLeft} w="20px" h="20px" />}
        nextLabel={<Icon as={MdChevronRight} w="20px" h="20px" />}
        tileContent={null}
        className="mini-calendar"
      />

      <Text
        mt="8px"
        fontSize="xs"
        color={useColorModeValue('gray.500', 'gray.400')}
      >
        Select a date
      </Text>
    </Card>
  );
}
