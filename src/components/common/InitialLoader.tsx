'use client';

import { Box, Flex, Text, VisuallyHidden, keyframes } from '@chakra-ui/react';
import { opencodeTokens } from 'theme/opencode-tokens';
import { useEffect, useMemo, useRef, useState } from 'react';

/*
 * THEME-INDEPENDENT ON PURPOSE.
 * This loader mounts before / outside Chakra's theme context, so Chakra tokens and responsive
 * objects don't resolve here: `{ base, md }` sizes, `borderRadius="full"`, `mb={2}`, `gap={4}`
 * and `whiteAlpha.700` all silently turn into nothing. That is why the ensō ring and logo
 * collapsed to a 0px box (only a tiny dot and a small dashed ring were visible) and the text
 * spacing was cramped. Use ONLY raw CSS values in this file: px/rem strings, `clamp()` for
 * responsive sizes, and rgba()/hex colours.
 */
const SAKURA = opencodeTokens.colors.accent.sakura;
/** Mint teal with alpha for loader elements. */
const rose = (alpha: number) => `rgba(88, 185, 154, ${alpha})`;

/** Short, on-theme status lines. They advance on a timer and stop on the last one. */
const MESSAGES = ['Lighting the lanterns', 'Gathering petals', 'Opening the gate', 'Almost there'];
const MESSAGE_MS = 1400;
/** The bar creeps toward this and only reaches 100% when the loader is told to exit. */
const PROGRESS_CEILING = 92;

/* ───────────── keyframes ───────────── */

const fadeFloat = keyframes`
  0%   { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const messageIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const dots = keyframes`
  0%   { content: ''; }
  25%  { content: '.'; }
  50%  { content: '..'; }
  75%  { content: '...'; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const spinReverse = keyframes`
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
`;

/* Petals: the OUTER element falls, the INNER element sways and turns.
   (Before, the sway was attached to an empty ::before, so it never did anything visible.) */
const petalFall = keyframes`
  0%   { transform: translate3d(0, -10vh, 0); opacity: 0; }
  10%  { opacity: 0.95; }
  90%  { opacity: 0.95; }
  100% { transform: translate3d(var(--drift, 60px), 110vh, 0); opacity: 0; }
`;

const petalSway = keyframes`
  0%, 100% { transform: translateX(-14px) rotate(-20deg); }
  50%      { transform: translateX(14px) rotate(160deg); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.08); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const breathe = keyframes`
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.7; }
`;

const diamondPulse = keyframes`
  0%, 100% { box-shadow: 0 0 4px rgba(88, 185, 154, 0.4); }
  50%      { box-shadow: 0 0 12px rgba(88, 185, 154, 0.8); }
`;

/* ───────────── sakura petal ───────────── */

interface PetalProps {
  delay: number;
  left: string;
  size: number;
  duration: number;
  drift: number;
}

function SakuraPetal({ delay, left, size, duration, drift }: PetalProps) {
  return (
    <Box
      position="absolute"
      left={left}
      top="-24px"
      opacity={0}
      pointerEvents="none"
      aria-hidden="true"
      style={{ '--drift': `${drift}px`, willChange: 'transform, opacity' } as React.CSSProperties}
      animation={`${petalFall} ${duration}s ease-in-out ${delay}s infinite`}
    >
      <Box
        w={`${size}px`}
        h={`${size * 0.7}px`}
        borderRadius="50% 0 50% 50%"
        bg={`linear-gradient(135deg, ${rose(0.9)}, rgba(184, 229, 213, 0.6))`}
        animation={`${petalSway} ${duration * 0.45}s ease-in-out ${delay}s infinite`}
      />
    </Box>
  );
}

/* ───────────── loader ───────────── */

type InitialLoaderProps = {
  isExiting?: boolean;
  onComplete?: () => void;
  variant?: 'seo' | 'trophy';
};

export default function InitialLoader({ isExiting = false, onComplete }: InitialLoaderProps) {
  const [progress, setProgress] = useState(6);
  const [messageIndex, setMessageIndex] = useState(0);

  /* onComplete: keep the original behaviour (called as soon as the loader mounts),
     but only ONCE. Previously `[onComplete]` as the dependency meant an inline callback
     in the parent re-fired it on every parent render. */
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });
  useEffect(() => {
    onCompleteRef.current?.();
  }, []);

  /* Progress: ease toward the ceiling, never stall at a fake "100%", then fill on exit. */
  useEffect(() => {
    if (isExiting) {
      setProgress(100);
      return undefined;
    }
    const id = setInterval(() => {
      setProgress((p) => p + (PROGRESS_CEILING - p) * 0.07);
    }, 140);
    return () => clearInterval(id);
  }, [isExiting]);

  /* Status text: advance, then stay on the last message. */
  useEffect(() => {
    if (isExiting) return undefined;
    const id = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, MESSAGE_MS);
    return () => clearInterval(id);
  }, [isExiting]);

  // Deterministic petal configs (avoids SSR hydration mismatch). Fewer, slower, calmer than before.
  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: (i * 0.9) % 6,
        left: `${((i * 137.5) % 100).toFixed(1)}%`,
        size: 9 + (i % 5) * 2,
        duration: 7 + (i % 4) * 1.6,
        drift: 40 + (i % 5) * 18,
      })),
    [],
  );

  const statusText = isExiting ? 'Welcome' : MESSAGES[messageIndex];

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy={!isExiting}
      position="fixed"
      inset={0}
      zIndex={99999}
      bg="#07131F"
      backgroundImage="url('/images/loading-bg.png')"
      backgroundSize="cover"
      backgroundPosition="center"
      opacity={isExiting ? 0 : 1}
      // Staged exit: the content fades first (250ms, see the content wrapper below), THEN the backdrop
      // dissolves into the page. Before, everything faded together, so the loader's title, bar and
      // "welcomes you" sat on top of the hero's own text for most of the 700ms.
      transition={isExiting ? 'opacity 600ms ease-out 250ms' : 'none'}
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      pointerEvents={isExiting ? 'none' : 'auto'}
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
    >
      <VisuallyHidden>Loading OpenCode 2026</VisuallyHidden>

      {/* ── Cinematic vignette ── */}
      <Box
        position="absolute"
        inset={0}
        bg="radial-gradient(ellipse 70% 60% at center 45%, rgba(11, 28, 42, 0.15) 0%, rgba(7, 19, 31, 0.55) 50%, rgba(5, 14, 23, 0.85) 100%)"
        pointerEvents="none"
        aria-hidden="true"
      />

      {/* ── Text scrim: the vignette is LIGHTEST in the centre, which is exactly where the text
             sits over the bright torii gate. This darkens only the area behind the text. ── */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="min(760px, 96vw)"
        h="min(560px, 80vh)"
        transform="translate(-50%, -50%)"
        bg="radial-gradient(ellipse at center, rgba(7, 19, 31, 0.72) 0%, rgba(7, 19, 31, 0.45) 45%, transparent 72%)"
        pointerEvents="none"
        aria-hidden="true"
      />

      {/* ── Ambient sakura glow spots ── */}
      <Box
        position="absolute"
        top="20%"
        left="30%"
        w="300px"
        h="300px"
        borderRadius="9999px"
        bg={`radial-gradient(circle, ${rose(0.1)}, transparent 70%)`}
        filter="blur(60px)"
        animation={`${breathe} 6s ease-in-out infinite`}
        pointerEvents="none"
        aria-hidden="true"
      />
      <Box
        position="absolute"
        bottom="25%"
        right="25%"
        w="250px"
        h="250px"
        borderRadius="9999px"
        bg={`radial-gradient(circle, ${rose(0.07)}, transparent 70%)`}
        filter="blur(50px)"
        animation={`${breathe} 8s ease-in-out 2s infinite`}
        pointerEvents="none"
        aria-hidden="true"
      />

      {/* ── Falling petals ── */}
      {petals.map((p) => (
        <SakuraPetal key={p.id} delay={p.delay} left={p.left} size={p.size} duration={p.duration} drift={p.drift} />
      ))}

      {/* ── Main content ── */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        w="100%"
        px="24px"
        opacity={isExiting ? 0 : 1}
        transform={isExiting ? 'translateY(-10px) scale(0.98)' : 'none'}
        transition="opacity 250ms ease-out, transform 250ms ease-out"
      >
        {/* Ensō ring with logo */}
        <Box
          position="relative"
          w="clamp(132px, 16vw, 172px)"
          h="clamp(132px, 16vw, 172px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb="clamp(26px, 3vw, 32px)"
          animation={`${fadeFloat} 1s ease forwards`}
        >
          <Box
            position="absolute"
            inset="-40px"
            borderRadius="9999px"
            bg={`radial-gradient(circle, ${rose(0.19)}, transparent 65%)`}
            animation={`${glowPulse} 4s ease-in-out infinite`}
            pointerEvents="none"
          />

          <Box
            position="absolute"
            inset={0}
            borderRadius="9999px"
            border={`3px solid ${SAKURA}`}
            boxShadow={`0 0 28px ${rose(0.55)}, 0 0 56px ${rose(0.25)}, inset 0 0 22px ${rose(0.3)}`}
            opacity={0.85}
          />

          <Box
            position="absolute"
            inset="-14px"
            borderRadius="9999px"
            border={`1.5px dashed ${rose(0.31)}`}
            animation={`${spin} 25s linear infinite`}
          />

          <Box
            position="absolute"
            inset="12px"
            borderRadius="9999px"
            border={`1px dotted ${rose(0.44)}`}
            animation={`${spinReverse} 18s linear infinite`}
          />

          {/* The glow lives on a PARENT: `filter` on the masked element itself is applied before
              the mask, so its drop-shadow got masked away and never showed. */}
          <Box filter={`drop-shadow(0 0 14px ${rose(0.55)})`}>
            <Box
              w="clamp(62px, 7.5vw, 82px)"
              h="clamp(62px, 7.5vw, 82px)"
              bg={SAKURA}
              style={{
                maskImage: "url('/Logo/opencodelogo.png')",
                WebkitMaskImage: "url('/Logo/opencodelogo.png')",
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            />
          </Box>
        </Box>

        {/* Title */}
        <Text
          as="h1"
          fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
          fontSize="clamp(28px, 4.2vw, 46px)"
          letterSpacing="0.22em"
          fontWeight="300"
          color="#ffffff"
          lineHeight="1.25"
          mb="8px"
          textAlign="center"
          textShadow={`0 2px 18px rgba(0,0,0,0.85), 0 0 42px ${rose(0.2)}`}
          animation={`${fadeFloat} 1s ease 0.15s forwards`}
          opacity={0}
        >
          OPENCODE 2026
        </Text>

        {/* Tagline: was whiteAlpha.700 with no shadow, which sank into the artwork */}
        <Text
          fontFamily="var(--f-body), 'DM Sans', sans-serif"
          fontSize="clamp(10px, 1.1vw, 12px)"
          letterSpacing="0.35em"
          color="rgba(255, 255, 255, 0.92)"
          mb="clamp(34px, 3.4vw, 44px)"
          textAlign="center"
          textShadow="0 1px 10px rgba(0,0,0,0.9)"
          animation={`${fadeFloat} 1s ease 0.3s forwards`}
          opacity={0}
          textTransform="uppercase"
        >
          Where Tradition Meets Creation
        </Text>

        {/* Progress bar */}
        <Flex
          align="center"
          w="100%"
          maxW="480px"
          mb="16px"
          aria-hidden="true"
          animation={`${fadeFloat} 1s ease 0.45s forwards`}
          opacity={0}
        >
          <Box
            w="10px"
            h="10px"
            transform="rotate(45deg)"
            border={`2px solid ${SAKURA}`}
            boxShadow={`0 0 8px ${rose(0.5)}`}
            animation={`${diamondPulse} 2.5s ease-in-out infinite`}
            flexShrink={0}
          />

          <Box
            flex={1}
            h="5px"
            mx="14px"
            position="relative"
            bg={rose(0.14)}
            borderRadius="9999px"
            overflow="hidden"
            border={`1px solid ${rose(0.22)}`}
          >
            {/* `style` (not a Chakra prop) so a changing width doesn't generate a new CSS class every tick */}
            <Box
              position="absolute"
              left={0}
              top={0}
              bottom={0}
              borderRadius="9999px"
              overflow="hidden"
              bg={`linear-gradient(90deg, ${rose(0.35)}, ${rose(0.87)}, ${SAKURA})`}
              boxShadow={`0 0 14px ${rose(0.7)}, 0 0 4px ${SAKURA}`}
              style={{
                width: `${progress}%`,
                transition: isExiting ? 'width 350ms ease-out' : 'width 160ms linear',
              }}
            >
              {/* Shimmer is clipped to the FILLED part only (it used to sweep the empty track too) */}
              <Box
                position="absolute"
                inset={0}
                bg="linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)"
                backgroundSize="200% 100%"
                animation={`${shimmer} 2s linear infinite`}
                pointerEvents="none"
              />
            </Box>
          </Box>

          <Box
            w="10px"
            h="10px"
            transform="rotate(45deg)"
            border={`2px solid ${SAKURA}`}
            boxShadow={`0 0 8px ${rose(0.5)}`}
            animation={`${diamondPulse} 2.5s ease-in-out 0.5s infinite`}
            flexShrink={0}
          />
        </Flex>

        {/* Status line (visual only; the VisuallyHidden text above is what screen readers get) */}
        <Text
          key={statusText}
          aria-hidden="true"
          fontSize="11px"
          color="rgba(255, 255, 255, 0.82)"
          mb="24px"
          minH="16px"
          textAlign="center"
          letterSpacing="0.18em"
          textShadow="0 1px 8px rgba(0,0,0,0.9)"
          fontFamily="var(--f-mono), 'DM Mono', monospace"
          animation={`${messageIn} 0.45s ease ${messageIndex === 0 && !isExiting ? '0.6s' : '0s'} both`}
          sx={
            isExiting
              ? undefined
              : {
                  '&::after': {
                    content: '""',
                    display: 'inline-block',
                    width: '1.6em',
                    textAlign: 'left',
                    animation: `${dots} 1.4s steps(1) infinite`,
                  },
                }
          }
        >
          {statusText}
        </Text>

        {/* Yuzuki welcome */}
        <Text
          fontSize="13px"
          letterSpacing="0.28em"
          fontFamily="var(--f-jp), 'Shippori Mincho', serif"
          mb="24px"
          textAlign="center"
          opacity={0}
          animation={`${fadeFloat} 1.2s ease 2.6s forwards, ${shimmer} 4s linear 3.8s infinite`}
          sx={{
            background: 'linear-gradient(90deg, #B8E5D5, #F4F1E8, #B8E5D5)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ゆづき welcomes you
        </Text>

        {/* Sakura separator */}
        <Flex align="center" gap="16px" aria-hidden="true" animation={`${fadeFloat} 1s ease 0.75s forwards`} opacity={0}>
          <Box w="70px" h="1px" bg={`linear-gradient(90deg, transparent, ${rose(0.31)})`} />
          <Box color={SAKURA} animation={`${glowPulse} 3s ease-in-out infinite`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13 7 19 9 22 12C19 15 13 17 12 22C11 17 5 15 2 12C5 9 11 7 12 2Z" />
            </svg>
          </Box>
          <Box w="70px" h="1px" bg={`linear-gradient(270deg, transparent, ${rose(0.31)})`} />
        </Flex>
      </Flex>
    </Box>
  );
}