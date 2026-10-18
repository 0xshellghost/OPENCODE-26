'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Spinner,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  ArrowUpRight,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  ShieldAlert,
  Flame,
  Trophy,
  Clock,
  Zap,
  Crosshair,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  renderSnapshotToCanvas,
  drawPixel,
} from '../../../utils/rplaceProtocol';

const RPLACE_API_URL = process.env.NEXT_PUBLIC_RPLACE_API_URL || 'http://localhost:3001';
const RPLACE_WS_URL = process.env.NEXT_PUBLIC_RPLACE_WS_URL || 'ws://localhost:3001/ws';
const RPLACE_APP_URL = process.env.NEXT_PUBLIC_RPLACE_APP_URL || 'http://localhost:5173';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Sakura theme helpers (all colors come from the CSS variables in App.css) ───
const SERIF = "Georgia, 'Times New Roman', serif";
const LIVE_GREEN = '#7fcf9f'; // semantic "live" color, softened to sit with the sakura palette

const pill = {
  px: '11px',
  py: '5px',
  bg: 'var(--card-soft)',
  border: '1px solid var(--border)',
  borderRadius: 'full',
} as const;

const secondaryBtn = {
  size: 'sm',
  variant: 'outline',
  borderColor: 'var(--border)',
  color: 'var(--text)',
  bg: 'var(--card-soft)',
  borderRadius: '10px',
  fontWeight: '500',
  _hover: { bg: 'var(--accent-soft)', borderColor: 'var(--border-strong)' },
} as const;

const primaryBtn = {
  bg: 'var(--accent)',
  color: 'var(--accent-ink)',
  fontWeight: '600',
  borderRadius: '10px',
  boxShadow: '0 6px 22px var(--accent-soft)',
  transition: 'all 0.2s ease',
  _hover: { bg: 'var(--accent-hover)', transform: 'translateY(-1px)' },
  _active: { transform: 'translateY(0)' },
} as const;

const statTile = {
  p: '18px 20px',
  borderRadius: '14px',
  bg: 'var(--card-soft)',
  border: '1px solid var(--border)',
  transition: 'all 0.2s ease',
  _hover: { borderColor: 'var(--border-strong)', transform: 'translateY(-2px)' },
} as const;

const tileLabel = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--subtle)',
} as const;

function parseJwt(token: string) {
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

function calculateTier(points: number) {
  if (points >= 100) return { maxPixels: 10, cooldown: 5 };
  if (points >= 50) return { maxPixels: 5, cooldown: 10 };
  if (points >= 20) return { maxPixels: 3, cooldown: 15 };
  if (points >= 10) return { maxPixels: 2, cooldown: 30 };
  return { maxPixels: 1, cooldown: 60 };
}

export default function RPlaceCanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number } | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toast = useToast();

  // RPlace WebSocket and Leaderboard state
  const [wsConnected, setWsConnected] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [maxPixels, setMaxPixels] = useState(1);
  const [cooldown, setCooldown] = useState(60);
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [reconnectCounter, setReconnectCounter] = useState(0);

  // 1. Fetch user Leaderboard Points from gh-portal-backend
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    setUserToken(token);

    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.id) {
        const username = decoded.id;
        setUserHandle(username);

        fetch(`${BACKEND_API_URL}/api/v1/participant/${encodeURIComponent(username)}/pr-points`)
          .then((res) => (res.ok ? res.json() : null))
          .then((body) => {
            if (body && body.data) {
              const points = typeof body.data === 'number' ? body.data : (body.data.points ?? 0);
              setUserPoints(points);
              const tier = calculateTier(points);
              setMaxPixels(tier.maxPixels);
              setCooldown(tier.cooldown);
            }
          })
          .catch((err) => {
            console.error('Failed to fetch leaderboard PR points:', err);
          });
      }
    }
  }, []);

  // 2. Connect to RPlace Backend WebSocket
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let rafId: number | null = null;
    let pendingPixels: { x: number; y: number; colorId: number }[] = [];

    const flushPixels = () => {
      if (!canvasRef.current || pendingPixels.length === 0) {
        rafId = null;
        return;
      }
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        for (let i = 0; i < pendingPixels.length; i++) {
          const p = pendingPixels[i];
          drawPixel(ctx, p.x, p.y, p.colorId);
        }
      }
      pendingPixels = [];
      rafId = null;
    };

    const connectToRPlaceWs = () => {
      try {
        ws = new WebSocket(RPLACE_WS_URL);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer && canvasRef.current) {
            if (event.data.byteLength >= 9) {
              const view = new DataView(event.data);
              for (let i = 0; i + 9 <= event.data.byteLength; i += 9) {
                const x = view.getUint16(i, true);
                const y = view.getUint16(i + 2, true);
                const colorId = view.getUint8(i + 4);
                pendingPixels.push({ x, y, colorId });
              }
              if (rafId === null) {
                rafId = requestAnimationFrame(flushPixels);
              }
            }
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectToRPlaceWs, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
      }
    };

    connectToRPlaceWs();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [reconnectCounter]);

  const reconnectWs = useCallback(() => {
    setReconnectCounter((c) => c + 1);
  }, []);

  const rplaceAppUrlWithAuth = useMemo(() => {
    if (!userToken && !userHandle) return RPLACE_APP_URL;
    const params = new URLSearchParams();
    if (userToken) params.set('token', userToken);
    if (userHandle) params.set('user', userHandle);
    return `${RPLACE_APP_URL}?${params.toString()}`;
  }, [userToken, userHandle]);

  // Fetch the binary snapshot of the canvas every 5 minutes
  const {
    data: boardBuffer,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['rplace-board-snapshot'],
    queryFn: async () => {
      const response = await fetch('/api/rplace/board', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch canvas snapshot (${response.status} ${response.statusText})`);
      }
      return await response.arrayBuffer();
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: REFRESH_INTERVAL_MS,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Render snapshot whenever new data arrives
  useEffect(() => {
    if (!canvasRef.current || !boardBuffer) return;
    renderSnapshotToCanvas(canvasRef.current, boardBuffer);
  }, [boardBuffer]);

  // Relative synced time ticker
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const relativeSyncedText = useMemo(() => {
    if (!dataUpdatedAt) return 'Pending initial sync...';
    const diffSec = Math.max(0, Math.floor((Date.now() - dataUpdatedAt) / 1000));
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAt, tick]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(Math.round((prev + 0.25) * 100) / 100, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(Math.round((prev - 0.25) * 100) / 100, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((prev) => {
        const next = Math.round((prev + delta) * 100) / 100;
        return Math.min(Math.max(next, 0.5), 3.0);
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      setPan({
        x: dragStartRef.current.initialPanX + dx,
        y: dragStartRef.current.initialPanY + dy,
      });
    }

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      if (clientX >= 0 && clientX <= rect.width && clientY >= 0 && clientY <= rect.height) {
        const x = Math.min(CANVAS_WIDTH - 1, Math.max(0, Math.floor((clientX / rect.width) * CANVAS_WIDTH)));
        const y = Math.min(CANVAS_HEIGHT - 1, Math.max(0, Math.floor((clientY / rect.height) * CANVAS_HEIGHT)));
        setHoverCoords({ x, y });
      } else {
        setHoverCoords(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    setHoverCoords(null);
  };

  const handleDoubleClick = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen((prev) => !prev);
      });
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Download snapshot as PNG
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    try {
      const link = document.createElement('a');
      link.download = `rplace-canvas-snapshot-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
      toast({ title: 'Canvas snapshot downloaded!', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Failed to download snapshot', status: 'error', duration: 3000, isClosable: true });
    }
  }, [toast]);

  // Points progress calculation
  const points = userPoints ?? 0;
  const targetPoints = 100;
  const isMaxBoost = points >= targetPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((points / targetPoints) * 100)));

  return (
    // NOTE: no fixed overlay here any more. The layout's <main className="oc-main"> already
    // provides max-width + padding, so this page only needs to stack its sections.
    <VStack spacing="24px" align="stretch" w="100%">
      {/* ─── 1. HEADER (same markup/classes as the other pages) ─── */}
      <div className="oc-page-heading" style={{ marginBottom: 0 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          gap="24px"
          w="100%"
        >
          <Box flex="1" minW={0}>
            <p className="oc-eyebrow">
              <span />
              Community Canvas · OpenCode 2026
            </p>

            <Flex align="center" gap="14px" flexWrap="wrap" mb="17px">
              <h1 style={{ marginBottom: 0 }}>R/Place Canvas</h1>
              <HStack
                spacing="6px"
                px="10px"
                py="4px"
                bg="rgba(127, 207, 159, 0.12)"
                border="1px solid rgba(127, 207, 159, 0.35)"
                borderRadius="full"
              >
                <Box w="7px" h="7px" borderRadius="full" bg={LIVE_GREEN} className="pulse-live-dot" />
                <Text fontSize="11px" fontWeight="700" color={LIVE_GREEN} letterSpacing="0.1em">
                  LIVE
                </Text>
              </HStack>
            </Flex>

            <p className="oc-description">
              Every contribution leaves its mark. View the live community canvas snapshot (auto-updates every 5
              minutes) or jump into the arena to put your pixel on the canvas.
            </p>
          </Box>

          <Button
            as="a"
            href={rplaceAppUrlWithAuth}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Put Pixels on Canvas"
            h="auto"
            minH="46px"
            px="22px"
            py="12px"
            fontSize="13px"
            w={{ base: '100%', md: 'auto' }}
            flexShrink={0}
            rightIcon={<ArrowUpRight size={16} />}
            {...primaryBtn}
          >
            Put Pixels on Canvas
          </Button>
        </Flex>
      </div>

      {/* ─── 2. STATUS & CONTROLS ─── */}
      <Box className="glass-panel" p={{ base: '12px 14px', md: '14px 20px' }}>
        <Flex w="100%" align="center" justify="space-between" flexWrap="wrap" gap="14px">
          <HStack spacing="10px" flexWrap="wrap">
            {/* Snapshot status */}
            <HStack
              {...pill}
              spacing="7px"
              bg={isError ? 'rgba(252, 129, 129, 0.12)' : 'rgba(127, 207, 159, 0.1)'}
              borderColor={isError ? 'rgba(252, 129, 129, 0.35)' : 'rgba(127, 207, 159, 0.3)'}
            >
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={isError ? '#FC8181' : LIVE_GREEN}
                boxShadow={`0 0 8px ${isError ? '#FC8181' : LIVE_GREEN}`}
              />
              <Text fontSize="12px" fontWeight="600" color={isError ? '#FC8181' : 'var(--text)'}>
                {isError ? 'Snapshot Error' : 'Snapshot Live'}
              </Text>
            </HStack>

            {/* Auto-sync */}
            <HStack {...pill} spacing="6px">
              <Clock size={12} color="var(--accent)" />
              <Text fontSize="12px" fontWeight="500" color="var(--muted)">
                Auto-syncs every 5 mins
              </Text>
            </HStack>

            {/* Last synced */}
            <HStack {...pill} spacing="6px">
              <Text fontSize="12px" color="var(--subtle)">
                Last synced:
              </Text>
              <Text fontSize="12px" fontWeight="700" color="var(--text)">
                {relativeSyncedText}
              </Text>
            </HStack>

            {/* Canvas WS */}
            <HStack
              {...pill}
              spacing="7px"
              bg={wsConnected ? 'rgba(127, 207, 159, 0.08)' : 'rgba(237, 137, 54, 0.12)'}
              borderColor={wsConnected ? 'rgba(127, 207, 159, 0.28)' : 'rgba(237, 137, 54, 0.35)'}
            >
              <Box
                w="7px"
                h="7px"
                borderRadius="full"
                bg={wsConnected ? LIVE_GREEN : '#ED8936'}
                boxShadow={wsConnected ? `0 0 6px ${LIVE_GREEN}` : 'none'}
              />
              <Text fontSize="12px" fontWeight="600" color={wsConnected ? LIVE_GREEN : '#F6AD55'}>
                {wsConnected ? 'Canvas WS: Live' : 'Canvas WS: Reconnecting...'}
              </Text>
              {!wsConnected && (
                <Tooltip label="Retry WebSocket connection" hasArrow>
                  <IconButton
                    aria-label="Retry WebSocket connection"
                    icon={<RefreshCw size={11} />}
                    size="xs"
                    variant="ghost"
                    color="#F6AD55"
                    _hover={{ bg: 'rgba(237, 137, 54, 0.2)' }}
                    onClick={reconnectWs}
                    h="18px"
                    minW="18px"
                  />
                </Tooltip>
              )}
            </HStack>
          </HStack>

          {/* Controls */}
          <HStack spacing="10px" flexWrap="wrap">
            <HStack
              bg="var(--card-soft)"
              p="3px 6px"
              borderRadius="12px"
              border="1px solid var(--border)"
              spacing="2px"
            >
              <Tooltip label="Zoom out (or scroll down)" hasArrow>
                <IconButton
                  aria-label="Zoom out"
                  icon={<ZoomOut size={15} />}
                  size="sm"
                  variant="ghost"
                  color="var(--text)"
                  _hover={{ bg: 'var(--accent-soft)' }}
                  onClick={handleZoomOut}
                  isDisabled={zoom <= 0.5}
                />
              </Tooltip>
              <Text fontSize="12px" fontWeight="700" minW="44px" textAlign="center" color="var(--text)">
                {Math.round(zoom * 100)}%
              </Text>
              <Tooltip label="Zoom in (or scroll up)" hasArrow>
                <IconButton
                  aria-label="Zoom in"
                  icon={<ZoomIn size={15} />}
                  size="sm"
                  variant="ghost"
                  color="var(--text)"
                  _hover={{ bg: 'var(--accent-soft)' }}
                  onClick={handleZoomIn}
                  isDisabled={zoom >= 3.0}
                />
              </Tooltip>
              <Tooltip label="Reset zoom & pan (or double-click canvas)" hasArrow>
                <IconButton
                  aria-label="Reset zoom"
                  icon={<RotateCcw size={13} />}
                  size="sm"
                  variant="ghost"
                  color="var(--muted)"
                  _hover={{ bg: 'var(--accent-soft)', color: 'var(--text)' }}
                  onClick={handleResetZoom}
                />
              </Tooltip>
            </HStack>

            <Tooltip label={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen canvas'} hasArrow>
              <IconButton
                aria-label="Toggle fullscreen"
                icon={isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                onClick={toggleFullscreen}
                {...secondaryBtn}
              />
            </Tooltip>

            <Tooltip label="Download current snapshot as PNG" hasArrow>
              <Button
                aria-label="Save PNG"
                leftIcon={<Download size={14} />}
                onClick={handleDownload}
                {...secondaryBtn}
              >
                Save PNG
              </Button>
            </Tooltip>

            <Tooltip label="Fetch latest snapshot from server" hasArrow>
              <Button
                aria-label="Sync Now"
                leftIcon={<RefreshCw size={13} />}
                isLoading={isFetching}
                onClick={() => refetch()}
                {...secondaryBtn}
                borderColor="var(--accent)"
                color="var(--accent)"
                bg="transparent"
                _hover={{ bg: 'var(--accent-soft)' }}
              >
                Sync Now
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </Box>

      {/* ─── 3. HERO CANVAS ─── */}
      <Box
        ref={containerRef}
        className="glass-panel"
        p={{ base: '10px', sm: '14px', md: '16px' }}
        borderRadius={isFullscreen ? '0 !important' : undefined}
        position={isFullscreen ? 'fixed' : 'relative'}
        inset={isFullscreen ? 0 : 'auto'}
        zIndex={isFullscreen ? 9999 : 1}
        h={isFullscreen ? '100vh' : 'auto'}
        overflow="hidden"
        sx={isFullscreen ? { background: 'var(--bg) !important' } : undefined}
      >
        <Box
          ref={viewportRef}
          w="100%"
          h={isFullscreen ? '100%' : 'auto'}
          borderRadius={isFullscreen ? '0' : '14px'}
          border="1px solid var(--border)"
          background="radial-gradient(circle, var(--border) 1px, transparent 1px) 0 0 / 18px 18px, var(--card-strong)"
          position="relative"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH={{ base: '260px', sm: '380px', md: '560px' }}
          p={{ base: '8px', sm: '12px', md: '16px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleDoubleClick}
          cursor={isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'crosshair'}
          userSelect="none"
        >
          {/* Loading skeleton */}
          {isLoading && (
            <Flex direction="column" align="center" justify="center" minH="450px" w="100%">
              <Box
                w="100%"
                maxW="900px"
                h={{ base: '240px', sm: '360px', md: '480px' }}
                borderRadius="12px"
                bg="linear-gradient(90deg, transparent 25%, var(--accent-soft) 50%, transparent 75%)"
                backgroundSize="200% 100%"
                animation="skeleton-shimmer 1.8s linear infinite"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack spacing="12px">
                  <Spinner size="lg" color="var(--accent)" thickness="3px" />
                  <Text fontSize="14px" fontWeight="500" color="var(--muted)">
                    Loading canvas snapshot...
                  </Text>
                </VStack>
              </Box>
            </Flex>
          )}

          {/* Error state */}
          {isError && (
            <Flex direction="column" align="center" justify="center" minH="380px" gap="14px" textAlign="center" p="20px">
              <Box p="16px" borderRadius="full" bg="rgba(245, 101, 101, 0.15)" color="#FC8181">
                <ShieldAlert size={36} />
              </Box>
              <Text fontFamily={SERIF} fontSize="24px" color="var(--text)">
                Unable to load canvas snapshot
              </Text>
              <Text fontSize="13px" color="var(--muted)" maxW="460px">
                Could not reach the R/Place backend server at{' '}
                <code style={{ color: 'var(--accent)' }}>{RPLACE_API_URL}</code>. Ensure the backend is running and
                reachable.
              </Text>
              <button className="oc-button" onClick={() => refetch()}>
                Retry Connection
              </button>
            </Flex>
          )}

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              display: isLoading || isError ? 'none' : 'block',
              width: '100%',
              maxWidth: `${CANVAS_WIDTH * zoom}px`,
              aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
              height: 'auto',
              imageRendering: 'pixelated',
              borderRadius: '6px',
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease, max-width 0.15s ease',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border-strong)',
              willChange: 'transform, max-width',
            }}
          />

          {/* Coordinates pill */}
          {!isLoading && !isError && (
            <HStack
              spacing="6px"
              bg="var(--nav-bg)"
              backdropFilter="blur(14px)"
              border="1px solid var(--border)"
              borderRadius="full"
              px="12px"
              py="5px"
              position="absolute"
              bottom="14px"
              left="14px"
              pointerEvents="none"
              zIndex={10}
            >
              <Crosshair size={12} color="var(--accent)" />
              <Text fontSize="12px" fontWeight="600" fontFamily="mono" color="var(--text)">
                {hoverCoords !== null ? `X: ${hoverCoords.x} · Y: ${hoverCoords.y}` : 'Hover canvas for coordinates'}
              </Text>
            </HStack>
          )}

          {/* Hints */}
          {!isLoading && !isError && (
            <HStack
              spacing="6px"
              bg="var(--nav-bg)"
              backdropFilter="blur(14px)"
              border="1px solid var(--border)"
              borderRadius="full"
              px="11px"
              py="4px"
              position="absolute"
              bottom="14px"
              right="14px"
              pointerEvents="none"
              display={{ base: 'none', md: 'flex' }}
              zIndex={10}
            >
              <Text fontSize="11px" color="var(--subtle)">
                Scroll to zoom · Drag to pan · Double-click to reset
              </Text>
            </HStack>
          )}
        </Box>
      </Box>

      {/* ─── 4. POINTS BOOST ─── */}
      <Box className="glass-panel" p={{ base: '20px', sm: '24px', md: '32px' }}>
        <p className="oc-eyebrow">
          <span />
          Leaderboard Advantage
        </p>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(26px, 3vw, 34px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: 10,
            color: 'var(--text)',
          }}
        >
          Canvas Powers &amp; Participant Status
        </h2>
        <p className="oc-description">
          OpenCode PR points boost your canvas capabilities. Reach 100+ points to unlock the maximum placement burst
          of 10 pixels with a rapid 5-second cooldown.
        </p>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="16px" my="24px" w="100%">
          {/* Points */}
          <Box {...statTile}>
            <Flex justify="space-between" align="center" mb="8px">
              <Text {...tileLabel}>Leaderboard Points</Text>
              <Box p="6px" borderRadius="10px" bg="var(--accent-soft)" color="var(--accent)">
                <Flame size={17} />
              </Box>
            </Flex>
            <Text fontFamily={SERIF} fontSize="34px" color="var(--text)" letterSpacing="-0.02em" lineHeight="1.2">
              {userPoints !== null ? userPoints : 0}
            </Text>
            <Text fontSize="12px" color="var(--subtle)" mt="4px">
              {userHandle ? `@${userHandle}` : 'Earned via OpenCode PR merges'}
            </Text>
          </Box>

          {/* Pixels */}
          <Box {...statTile}>
            <Flex justify="space-between" align="center" mb="8px">
              <Text {...tileLabel}>Pixels Available</Text>
              <Box p="6px" borderRadius="10px" bg="rgba(127, 207, 159, 0.14)" color={LIVE_GREEN}>
                <Palette size={17} />
              </Box>
            </Flex>
            <Text fontFamily={SERIF} fontSize="34px" color="var(--text)" letterSpacing="-0.02em" lineHeight="1.2">
              {maxPixels}{' '}
              <Text as="span" fontFamily="'DM Sans', sans-serif" fontSize="14px" color="var(--muted)">
                {maxPixels === 1 ? 'pixel' : 'pixels'}
              </Text>
            </Text>
            <Text fontSize="12px" color="var(--subtle)" mt="4px">
              Burst capacity per reload
            </Text>
          </Box>

          {/* Cooldown */}
          <Box {...statTile}>
            <Flex justify="space-between" align="center" mb="8px">
              <Text {...tileLabel}>Cooldown</Text>
              <Box p="6px" borderRadius="10px" bg="rgba(230, 194, 122, 0.15)" color="#e6c27a">
                <Zap size={17} />
              </Box>
            </Flex>
            <Text fontFamily={SERIF} fontSize="34px" color="var(--text)" letterSpacing="-0.02em" lineHeight="1.2">
              {cooldown}
              <Text as="span" fontFamily="'DM Sans', sans-serif" fontSize="14px" color="var(--muted)">
                {' '}
                sec
              </Text>
            </Text>
            <Text fontSize="12px" color="var(--subtle)" mt="4px">
              Cooldown duration per pixel drop
            </Text>
          </Box>
        </SimpleGrid>

        {/* Progress */}
        <Box p="18px 20px" borderRadius="14px" bg="var(--card-soft)" border="1px solid var(--border)" w="100%" mb="24px">
          <Flex justify="space-between" align="center" mb="12px" flexWrap="wrap" gap="8px">
            <HStack spacing="10px" flexWrap="wrap">
              <Text fontSize="13px" fontWeight="600" color="var(--text)">
                {isMaxBoost ? 'Max boost unlocked' : `${points} / ${targetPoints} points to unlock 10 pixels`}
              </Text>
              <Box
                px="10px"
                py="2px"
                borderRadius="full"
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.06em"
                bg={isMaxBoost ? 'rgba(127, 207, 159, 0.16)' : 'var(--accent-soft)'}
                color={isMaxBoost ? LIVE_GREEN : 'var(--accent)'}
                border="1px solid"
                borderColor={isMaxBoost ? 'rgba(127, 207, 159, 0.4)' : 'var(--border-strong)'}
              >
                {isMaxBoost ? 'MAX BOOST' : `${targetPoints - points} PTS TO GO`}
              </Box>
            </HStack>
            <Text fontSize="12px" color="var(--subtle)">
              {isMaxBoost ? '10 pixels · 5s cooldown active' : 'Target: 10 pixels · 5s cooldown'}
            </Text>
          </Flex>

          <Box
            w="100%"
            h="8px"
            borderRadius="full"
            bg="var(--accent-soft)"
            overflow="hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={targetPoints}
            aria-valuenow={Math.min(points, targetPoints)}
          >
            <Box
              h="100%"
              w={`${progressPercent}%`}
              bg="var(--accent)"
              borderRadius="full"
              boxShadow="0 0 12px var(--accent)"
              transition="width 0.4s ease"
            />
          </Box>
        </Box>

        {/* Actions */}
        <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="center" gap="14px">
          <Link href="/user/leaderboard/Opencode" className="oc-button oc-button-secondary" aria-label="View Leaderboard">
            <Trophy size={16} />
            View Leaderboard
          </Link>

          <a
            href={rplaceAppUrlWithAuth}
            target="_blank"
            rel="noopener noreferrer"
            className="oc-button"
            aria-label="Launch R/Place App"
          >
            Launch R/Place App
            <ExternalLink size={16} />
          </a>
        </Flex>
      </Box>
    </VStack>
  );
}