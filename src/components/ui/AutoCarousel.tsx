'use client';

import { Box, IconButton } from '@chakra-ui/react';
import { ReactNode, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

/**
 * STABILITY RULES:
 * - Swiper controls transforms
 * - We control visibility
 * - Parent clips overflow
 */

const swiperStyles = `
  .swiper {
    width: 100%;
    padding: 48px 0;
    overflow: visible;
  }
  
  /* Before Swiper initializes: Show only the first slide, centered */
  .swiper:not(.swiper-initialized) .swiper-wrapper {
    display: flex !important;
    justify-content: center !important;
    align-items: center;
  }
  
  .swiper:not(.swiper-initialized) .swiper-slide {
    opacity: 0 !important;
    pointer-events: none;
  }
  
  .swiper:not(.swiper-initialized) .swiper-slide:first-child {
    opacity: 1 !important;
  }

  .swiper-wrapper {
    display: flex !important;
    align-items: center;
    overflow: visible;
  }

  .swiper-slide {
    width: min(420px, 85vw);
    will-change: transform;
    transition: opacity 0.25s ease;
  }

  /* Hide distant slides completely */
  .swiper-slide:not(
    .swiper-slide-active,
    .swiper-slide-prev,
    .swiper-slide-next
  ) {
    opacity: 0 !important;
    pointer-events: none;
  }

  .swiper-slide-prev,
  .swiper-slide-next {
    opacity: 0.6;
  }

  .swiper-slide-active {
    opacity: 1;
    z-index: 10;
  }
`;

interface AutoCarouselProps {
  children: ReactNode[];
}

export function AutoCarousel({ children }: AutoCarouselProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (!children || children.length === 0) return null;

  /* Single slide → static */
  if (children.length === 1) {
    return (
      <Box py="40px" display="flex" justifyContent="center">
        <Box maxW="min(420px, 85vw)" w="100%">
          {children[0]}
        </Box>
      </Box>
    );
  }

  return (
    /* Parent clips depth */
    <Box position="relative" overflow="hidden" w="full">
      <style>{swiperStyles}</style>

      {/* Navigation buttons */}
      <IconButton
        ref={prevRef}
        aria-label="Previous"
        icon={<ChevronLeft size={18} />}
        position="absolute"
        left={{ base: '6px', md: '4%' }}
        top="50%"
        transform="translateY(-50%)"
        zIndex={20}
        size={{ base: 'md', md: 'lg' }}
        isRound
        bg="var(--surface)"
        color="var(--fg)"
        border="1px solid var(--border)"
        boxShadow="0 4px 14px 0 rgba(0, 0, 0, 0.4)"
        _hover={{ bg: 'var(--surface-2)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
        _active={{ bg: 'var(--surface)' }}
        _focusVisible={{ boxShadow: '0 0 0 2px var(--accent)', outline: 'none' }}
      />

      <IconButton
        ref={nextRef}
        aria-label="Next"
        icon={<ChevronRight size={18} />}
        position="absolute"
        right={{ base: '6px', md: '4%' }}
        top="50%"
        transform="translateY(-50%)"
        zIndex={20}
        size={{ base: 'md', md: 'lg' }}
        isRound
        bg="var(--surface)"
        color="var(--fg)"
        border="1px solid var(--border)"
        boxShadow="0 4px 14px 0 rgba(0, 0, 0, 0.4)"
        _hover={{ bg: 'var(--surface-2)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
        _active={{ bg: 'var(--surface)' }}
        _focusVisible={{ boxShadow: '0 0 0 2px var(--accent)', outline: 'none' }}
      />

      <Swiper
        modules={[EffectCoverflow, Navigation]}
        effect="coverflow"
        centeredSlides
        slidesPerView="auto"
        grabCursor
        speed={500}
        loop={false}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 1.2,
          slideShadows: false,
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper: SwiperType) => {
          if (
            swiper.params.navigation &&
            typeof swiper.params.navigation !== 'boolean'
          ) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
      >
        {children.map((child, index) => (
          <SwiperSlide key={index}>
            {/* Padding prevents edge clipping */}
            <Box px="6px">{child}</Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
