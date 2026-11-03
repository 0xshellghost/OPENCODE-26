'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
} from '@chakra-ui/react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  RefreshCw,
  RotateCcw,
  Crosshair,
  Clock,
  Palette as PaletteIcon,
  ShieldAlert,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  renderSnapshotToCanvas,
  drawPixel,
} from '../../utils/rplaceProtocol';

// 16-color standard palette aligned with backend protocol indices
export const PALETTE = [
  { id: 0, name: 'White', hex: '#FFFFFF', isDark: false },
  { id: 1, name: 'Black', hex: '#000000', isDark: true },
  { id: 2, name: 'Red', hex: '#FF0000', isDark: true },
  { id: 3, name: 'Green', hex: '#00FF00', isDark: false },
  { id: 4, name: 'Blue', hex: '#0000FF', isDark: true },
  { id: 5, name: 'Yellow', hex: '#FFFF00', isDark: false },
  { id: 6, name: 'Orange', hex: '#FFA500', isDark: false },
  { id: 7, name: 'Purple', hex: '#800080', isDark: true },
  { id: 8, name: 'Cyan', hex: '#00FFFF', isDark: false },
  { id: 9, name: 'Pink', hex: '#FFC0CB', isDark: false },
  { id: 10, name: 'Brown', hex: '#A52A2A', isDark: true },
  { id: 11, name: 'Dark Gray', hex: '#808080', isDark: true },
  { id: 12, name: 'Light Gray', hex: '#C0C0C0', isDark: false },
  { id: 13, name: 'Light Blue', hex: '#ADD8E6', isDark: false },
  { id: 14, name: 'Light Green', hex: '#90EE90', isDark: false },
  { id: 15, name: 'Gold', hex: '#FFD700', isDark: false },
] as const;

interface CanvasProps {
  userTier?: {
    maxPixels: number;
    cooldown: number;
  };
  userHandle?: string | null;
}

const pillStyle = {
  px: '12px',
  py: '6px',
  bg: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'full',
  backdropFilter: 'blur(8px)',
} as const;

const controlBtnStyle = {
  size: 'sm',
  variant: 'outline',
  borderColor: 'rgba(255,255,255,0.1)',
  color: 'var(--text)',
  bg: 'rgba(255,255,255,0.04)',
  borderRadius: '10px',
  fontWeight: '500',
  _hover: { bg: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.16)' },
} as const;

export default function Canvas({ userTier, userHandle }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const currentSeqRef = useRef<number>(0);
  const isLoadedRef = useRef<boolean>(false);
  const messageQueueRef = useRef<ArrayBuffer[]>([]);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    moved: boolean;
  } | null>(null);

  const toast = useToast();

  // Board state
  const [selectedColorId, setSelectedColorId] = useState<number>(2); // Default to Red
  const [cooldown, setCooldown] = useState<number>(0);
  const [remainingPixels, setRemainingPixels] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  // Viewport transforms: 1.0 (100%) fills the frame completely edge-to-edge
  const DEFAULT_ZOOM = 1.0;
  const MIN_ZOOM = 1.0;
  const MAX_ZOOM = 40.0;

  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Clamp pan so the user cannot drag the canvas edges inside the frame
  const clampPan = useCallback(
    (nextPanX: number, nextPanY: number, currentZoom: number) => {
      if (!viewportRef.current || currentZoom <= 1) {
        return { x: 0, y: 0 };
      }
      const { clientWidth, clientHeight } = viewportRef.current;
      const maxPanX = ((currentZoom - 1) * clientWidth) / 2;
      const maxPanY = ((currentZoom - 1) * clientHeight) / 2;

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, nextPanX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, nextPanY)),
      };
    },
    []
  );

  // Set initial remaining pixels when userTier changes
  useEffect(() => {
    if (userTier && remainingPixels === null) {
      setRemainingPixels(userTier.maxPixels);
    }
  }, [userTier, remainingPixels]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Helper to process 9-byte binary updates: [x: u16, y: u16, colorId: u8, sequence: u32]
  const processBinaryUpdate = useCallback(
    (buffer: ArrayBuffer, ctx: CanvasRenderingContext2D) => {
      const view = new DataView(buffer);
      for (let offset = 0; offset + 9 <= buffer.byteLength; offset += 9) {
        const x = view.getUint16(offset, true);
        const y = view.getUint16(offset + 2, true);
        const colorId = view.getUint8(offset + 4);
        const sequence = view.getUint32(offset + 5, true);

        if (sequence <= currentSeqRef.current) continue;

        currentSeqRef.current = sequence;
        drawPixel(ctx, x, y, colorId);
      }
    },
    []
  );

  // Fetch initial board snapshot with timeout and multi-route fallback
  const fetchBoardSnapshot = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    const fetchBufferWithTimeout = async (url: string, timeoutMs: number = 8000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const buffer = await res.arrayBuffer();
        const sequence = res.headers.get('X-Canvas-Sequence');
        return { buffer, sequence };
      } finally {
        clearTimeout(timeoutId);
      }
    };

    try {
      let result: { buffer: ArrayBuffer; sequence: string | null } | null = null;

      // 1. Try Vercel edge proxy (/api/rplace/board) first: same-origin, edge-cached, immune to proxy stream drops
      try {
        result = await fetchBufferWithTimeout('/api/rplace/board', 8000);
      } catch (proxyErr) {
        console.warn('Vercel edge proxy snapshot failed, attempting direct backend:', proxyErr);
        // 2. Fall back to direct backend URL if proxy failed
        const backendBase = process.env.NEXT_PUBLIC_RPLACE_API_URL;
        if (backendBase) {
          result = await fetchBufferWithTimeout(`${backendBase}/api/board`, 10000);
        } else {
          throw proxyErr;
        }
      }

      if (!result || !result.buffer) {
        throw new Error('Received empty board snapshot buffer');
      }

      if (result.sequence) {
        currentSeqRef.current = Number(result.sequence);
      }

      if (canvasRef.current) {
        renderSnapshotToCanvas(canvasRef.current, result.buffer);
      }

      isLoadedRef.current = true;
      setLastSyncedAt(Date.now());

      // Process any updates queued while the HTTP snapshot was loading
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx && messageQueueRef.current.length > 0) {
          const queued = messageQueueRef.current;
          messageQueueRef.current = [];
          for (const msg of queued) {
            processBinaryUpdate(msg, ctx);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load board snapshot:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [processBinaryUpdate]);

  // Connect to R/Place WebSocket server
  const connectWebSocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const wsUrl =
      process.env.NEXT_PUBLIC_RPLACE_WS_URL ||
      process.env.NEXT_PUBLIC_WS_URL ||
      'ws://localhost:3001/ws';

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const fullUrl = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;
      const ws = new WebSocket(fullUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        setConnected(true);
      };

      ws.onerror = (e) => {
        console.warn('Canvas WebSocket error:', e);
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          setConnected(false);
          wsRef.current = null;
          reconnectTimerRef.current = setTimeout(connectWebSocket, 4000);
        }
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data) as {
              type?: string;
              error?: string;
              ttl?: number;
              remaining?: number;
              maxPixels?: number;
              cooldown?: number;
            };

            if (data.type === 'TIER_INFO') {
              const max = data.maxPixels;
              if (typeof max === 'number') {
                setRemainingPixels((prev) => (prev === null ? max : prev));
              }
              return;
            }

            if (data.type === 'PLACED') {
              if (typeof data.remaining === 'number') {
                setRemainingPixels(Math.max(0, data.remaining));
              }
              return;
            }

            if (data.type === 'ERROR') {
              if (data.error === 'RATE_LIMITED' && typeof data.ttl === 'number') {
                setCooldown(Math.max(0, data.ttl));
              } else {
                toast({
                  title: 'Placement Error',
                  description: data.error || 'Unable to place pixel',
                  status: 'error',
                  duration: 2500,
                  isClosable: true,
                });
              }
            }
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError);
          }
          return;
        }

        let buffer: ArrayBuffer | null = null;
        if (event.data instanceof ArrayBuffer) {
          buffer = event.data;
        } else if (event.data instanceof Blob) {
          buffer = await event.data.arrayBuffer();
        }

        if (!buffer || buffer.byteLength === 0 || buffer.byteLength % 9 !== 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!isLoadedRef.current || !ctx) {
          messageQueueRef.current.push(buffer);
          return;
        }

        processBinaryUpdate(buffer, ctx);
      };
    } catch (err) {
      console.error('Could not create WebSocket:', err);
      setConnected(false);
    }
  }, [processBinaryUpdate, toast]);

  // Initial load
  useEffect(() => {
    void fetchBoardSnapshot();
    connectWebSocket();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [fetchBoardSnapshot, connectWebSocket]);

  // Wheel zoom handler with pan clamping so edges stay flush with frame
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => {
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        const next = Math.min(Math.max(Math.round((prev + delta) * 100) / 100, MIN_ZOOM), MAX_ZOOM);
        setPan((currentPan) => clampPan(currentPan.x, currentPan.y, next));
        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clampPan]);

  // Listen to fullscreen exit via Esc
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setZoom(DEFAULT_ZOOM);
      setPan({ x: 0, y: 0 });
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Send 9-byte pixel placement packet
  const placePixel = useCallback(
    (x: number, y: number) => {
      const socket = wsRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        toast({
          title: 'Not Connected',
          description: 'Waiting for canvas server connection...',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      if (cooldown > 0) {
        toast({
          title: 'Cooldown Active',
          description: `Wait ${cooldown}s before placing another pixel.`,
          status: 'info',
          duration: 1500,
          isClosable: true,
        });
        return;
      }

      const payload = new ArrayBuffer(9);
      const view = new DataView(payload);
      view.setUint16(0, x, true);
      view.setUint16(2, y, true);
      view.setUint8(4, selectedColorId);
      view.setUint32(5, crypto.getRandomValues(new Uint32Array(1))[0], true);

      socket.send(payload);

      // Optimistic local draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          drawPixel(ctx, x, y, selectedColorId);
        }
      }

      setRemainingPixels((prev) => (prev && prev > 0 ? prev - 1 : 0));
    },
    [cooldown, selectedColorId, toast]
  );

  // Mouse pan & click calculations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
      moved: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      if (Math.hypot(dx, dy) > 4) {
        dragStartRef.current.moved = true;
        setIsDragging(true);
        setPan(
          clampPan(
            dragStartRef.current.initialPanX + dx,
            dragStartRef.current.initialPanY + dy,
            zoom
          )
        );
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (
        rect.width > 0 &&
        rect.height > 0 &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        const normX = (clientX - rect.left) / rect.width;
        const normY = (clientY - rect.top) / rect.height;
        const x = Math.max(0, Math.min(CANVAS_WIDTH - 1, Math.floor(normX * CANVAS_WIDTH)));
        const y = Math.max(0, Math.min(CANVAS_HEIGHT - 1, Math.floor(normY * CANVAS_HEIGHT)));
        setHoverCoords({ x, y });
      } else {
        setHoverCoords(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (dragStartRef.current && !dragStartRef.current.moved && hoverCoords) {
      placePixel(hoverCoords.x, hoverCoords.y);
    }
    dragStartRef.current = null;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    dragStartRef.current = null;
    setIsDragging(false);
    setHoverCoords(null);
  };

  const handleDoubleClick = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setPan({ x: 0, y: 0 });
  }, []);

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

  // Save current canvas state as PNG
  const handleDownloadSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `opencode-rplace-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({
        title: 'Snapshot Downloaded',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Download Failed',
        description: 'Could not export canvas to image.',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    }
  }, [toast]);

  // Relative synced time text
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const relativeSyncText = useMemo(() => {
    if (!lastSyncedAt) return 'Syncing...';
    const diffSec = Math.max(0, Math.floor((Date.now() - lastSyncedAt) / 1000));
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSyncedAt, tick]);

  const activeColor = PALETTE[selectedColorId] || PALETTE[2];

  return (
    <Box
      ref={containerRef}
      className="glass-panel"
      p={{ base: '10px', sm: '14px', md: '18px' }}
      borderRadius={isFullscreen ? '0 !important' : undefined}
      position={isFullscreen ? 'fixed' : 'relative'}
      inset={isFullscreen ? 0 : 'auto'}
      zIndex={isFullscreen ? 9999 : 1}
      h={isFullscreen ? '100vh' : 'auto'}
      display="flex"
      flexDirection="column"
      gap="16px"
      overflow="hidden"
      sx={isFullscreen ? { background: 'var(--bg) !important' } : undefined}
    >
      {/* ─── 1. TOOLBAR: Connection & Quick Controls ─── */}
      <Flex
        w="100%"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap={{ base: '10px', md: '14px' }}
      >
        {/* Status badges */}
        <HStack spacing="8px" flexWrap="wrap" rowGap="6px">
          <HStack
            {...pillStyle}
            spacing="7px"
            bg={connected ? 'rgba(127, 207, 159, 0.1)' : 'rgba(237, 137, 54, 0.12)'}
            borderColor={connected ? 'rgba(127, 207, 159, 0.35)' : 'rgba(237, 137, 54, 0.35)'}
          >
            <Box
              w="7px"
              h="7px"
              borderRadius="full"
              bg={connected ? '#7fcf9f' : '#ED8936'}
              boxShadow={connected ? '0 0 6px #7fcf9f' : 'none'}
            />
            <Text
              fontSize="12px"
              fontWeight="600"
              color={connected ? '#7fcf9f' : '#F6AD55'}
            >
              {connected ? 'Live WS' : 'Reconnecting...'}
            </Text>
            {!connected && (
              <Tooltip label="Reconnect to live canvas" hasArrow>
                <IconButton
                  aria-label="Reconnect"
                  icon={<RefreshCw size={11} />}
                  size="xs"
                  variant="ghost"
                  color="#F6AD55"
                  _hover={{ bg: 'rgba(237, 137, 54, 0.2)' }}
                  onClick={connectWebSocket}
                  h="18px"
                  minW="18px"
                />
              </Tooltip>
            )}
          </HStack>

          {cooldown > 0 ? (
            <HStack
              {...pillStyle}
              spacing="6px"
              bg="rgba(245, 158, 11, 0.12)"
              borderColor="rgba(245, 158, 11, 0.35)"
            >
              <Clock size={12} color="#F59E0B" />
              <Text fontSize="12px" fontWeight="700" color="#F59E0B">
                Cooldown: {cooldown}s
              </Text>
            </HStack>
          ) : (
            <HStack
              {...pillStyle}
              spacing="6px"
              bg="rgba(127, 207, 159, 0.1)"
              borderColor="rgba(127, 207, 159, 0.3)"
            >
              <Sparkles size={12} color="#7fcf9f" />
              <Text fontSize="12px" fontWeight="600" color="#7fcf9f">
                Ready to drop
              </Text>
            </HStack>
          )}

          <HStack {...pillStyle} spacing="6px">
            <PaletteIcon size={12} color="var(--accent)" />
            <Text fontSize="12px" color="var(--subtle)">
              Pixels:
            </Text>
            <Text fontSize="12px" fontWeight="700" color="var(--text)">
              {remainingPixels ?? userTier?.maxPixels ?? 1}
            </Text>
          </HStack>

          <HStack {...pillStyle} spacing="6px" display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="12px" color="var(--subtle)">
              Synced:
            </Text>
            <Text fontSize="12px" fontWeight="600" color="var(--muted)">
              {relativeSyncText}
            </Text>
          </HStack>
        </HStack>

        {/* Viewport Action Controls */}
        <HStack spacing="8px" flexWrap="wrap" rowGap="6px">
          <HStack
            bg="rgba(255,255,255,0.04)"
            p="3px 8px"
            borderRadius="12px"
            border="1px solid rgba(255,255,255,0.08)"
            spacing="2px"
          >
            <Tooltip label="Zoom out" hasArrow>
              <IconButton
                aria-label="Zoom out"
                icon={<ZoomOut size={14} />}
                size="sm"
                variant="ghost"
                color="var(--text)"
                _hover={{ bg: 'var(--accent-soft)' }}
                onClick={() =>
                  setZoom((z) => {
                    const next = Math.max(MIN_ZOOM, Math.round((z - 0.25) * 100) / 100);
                    setPan((p) => clampPan(p.x, p.y, next));
                    return next;
                  })
                }
                isDisabled={zoom <= MIN_ZOOM}
                h="28px"
                minW="28px"
              />
            </Tooltip>
            <Text fontSize="12px" fontWeight="700" minW="48px" textAlign="center" color="var(--text)">
              {Math.round(zoom * 100)}%
            </Text>
            <Tooltip label="Zoom in" hasArrow>
              <IconButton
                aria-label="Zoom in"
                icon={<ZoomIn size={14} />}
                size="sm"
                variant="ghost"
                color="var(--text)"
                _hover={{ bg: 'var(--accent-soft)' }}
                onClick={() =>
                  setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.25) * 100) / 100))
                }
                isDisabled={zoom >= MAX_ZOOM}
                h="28px"
                minW="28px"
              />
            </Tooltip>
            <Tooltip label="Reset zoom (100%)" hasArrow>
              <IconButton
                aria-label="Reset zoom"
                icon={<RotateCcw size={13} />}
                size="sm"
                variant="ghost"
                color="var(--muted)"
                _hover={{ bg: 'var(--accent-soft)', color: 'var(--text)' }}
                onClick={handleDoubleClick}
                h="28px"
                minW="28px"
              />
            </Tooltip>
          </HStack>

          <Tooltip label={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen canvas'} hasArrow>
            <IconButton
              aria-label="Toggle fullscreen"
              icon={isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              onClick={toggleFullscreen}
              {...controlBtnStyle}
              h="32px"
              minW="32px"
            />
          </Tooltip>

          <Tooltip label="Save canvas snapshot as PNG" hasArrow>
            <Button
              aria-label="Save snapshot"
              leftIcon={<Download size={13} />}
              onClick={handleDownloadSnapshot}
              {...controlBtnStyle}
              h="32px"
              px="12px"
              fontSize="12px"
            >
              Save PNG
            </Button>
          </Tooltip>

          <Tooltip label="Fetch latest board snapshot" hasArrow>
            <IconButton
              aria-label="Sync board"
              icon={<RefreshCw size={13} />}
              isLoading={isLoading}
              onClick={fetchBoardSnapshot}
              {...controlBtnStyle}
              h="32px"
              minW="32px"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* ─── 2. INTERACTIVE CANVAS VIEWPORT (Exact Frame Fit) ─── */}
      <Box
        ref={viewportRef}
        w="100%"
        maxH={isFullscreen ? 'calc(100vh - 140px)' : '75vh'}
        aspectRatio={`${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`}
        mx="auto"
        borderRadius="16px"
        border="1px solid rgba(255,255,255,0.1)"
        bg="var(--card-strong)"
        position="relative"
        overflow="hidden"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="0"
        userSelect="none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        cursor={isDragging ? 'grabbing' : cooldown > 0 ? 'not-allowed' : 'crosshair'}
      >
        {/* Loading state */}
        {isLoading && !isLoadedRef.current && (
          <Flex direction="column" align="center" justify="center" w="100%" h="100%">
            <VStack spacing="14px">
              <Spinner size="lg" color="var(--accent)" thickness="3px" />
              <Text fontSize="13px" fontWeight="500" color="var(--muted)">
                Loading community canvas snapshot...
              </Text>
            </VStack>
          </Flex>
        )}

        {/* Error state */}
        {isError && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            w="100%"
            h="100%"
            gap="14px"
            textAlign="center"
            p="20px"
          >
            <Box p="14px" borderRadius="full" bg="rgba(245, 101, 101, 0.15)" color="#FC8181">
              <ShieldAlert size={32} />
            </Box>
            <Text fontSize="20px" fontWeight="600" color="var(--text)">
              Unable to load canvas snapshot
            </Text>
            <Text fontSize="13px" color="var(--muted)" maxW="440px">
              Could not reach the R/Place server. Check your connection or verify that the canvas service is running.
            </Text>
            <Button className="oc-button" onClick={fetchBoardSnapshot} size="sm" mt="6px">
              Retry Connection
            </Button>
          </Flex>
        )}

        {/* The Canvas Element — fills 100% of the frame at zoom = 1.0 */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            display: isError || (isLoading && !isLoadedRef.current) ? 'none' : 'block',
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            willChange: 'transform',
          }}
        />

        {/* Live Coordinate Pill (Bottom-left) */}
        {!isError && (
          <HStack
            spacing="6px"
            bg="rgba(0,0,0,0.65)"
            backdropFilter="blur(16px)"
            border="1px solid rgba(255,255,255,0.12)"
            borderRadius="full"
            px="14px"
            py="6px"
            position="absolute"
            bottom="16px"
            left="16px"
            pointerEvents="none"
            zIndex={10}
          >
            <Crosshair size={12} color="var(--accent)" />
            <Text fontSize="12px" fontWeight="600" fontFamily="mono" color="#FFFFFF">
              {hoverCoords !== null ? `X: ${hoverCoords.x} · Y: ${hoverCoords.y}` : 'Hover canvas'}
            </Text>
            {hoverCoords !== null && (
              <Box
                w="9px"
                h="9px"
                borderRadius="full"
                bg={activeColor.hex}
                border="1px solid rgba(255,255,255,0.4)"
                ml="2px"
              />
            )}
          </HStack>
        )}

        {/* Usage Hints (Bottom-right) */}
        {!isError && (
          <HStack
            spacing="6px"
            bg="rgba(0,0,0,0.65)"
            backdropFilter="blur(16px)"
            border="1px solid rgba(255,255,255,0.12)"
            borderRadius="full"
            px="12px"
            py="5px"
            position="absolute"
            bottom="16px"
            right="16px"
            pointerEvents="none"
            display={{ base: 'none', md: 'flex' }}
            zIndex={10}
          >
            <Text fontSize="11px" color="rgba(255,255,255,0.8)">
              Click to place · Drag to pan · Scroll to zoom · Double-click to reset
            </Text>
          </HStack>
        )}
      </Box>

      {/* ─── 3. PALETTE DOCK: 16-Color Swatches & Drop Status ─── */}
      <Box
        p={{ base: '14px 16px', sm: '16px 22px' }}
        borderRadius="16px"
        bg="rgba(255,255,255,0.03)"
        border="1px solid rgba(255,255,255,0.08)"
        backdropFilter="blur(12px)"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          gap="12px"
        >
          <HStack spacing="12px" minW={{ md: '180px' }}>
            <Box
              w="32px"
              h="32px"
              borderRadius="10px"
              bg={activeColor.hex}
              border="2px solid rgba(255,255,255,0.15)"
              boxShadow={`0 0 20px ${activeColor.hex}55, 0 0 40px ${activeColor.hex}22`}
              flexShrink={0}
            />
            <VStack align="start" spacing="0">
              <Text
                fontSize="11px"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.08em"
                color="var(--subtle)"
              >
                Selected
              </Text>
              <Text fontSize="13px" fontWeight="600" color="var(--text)">
                {activeColor.name}
              </Text>
            </VStack>
          </HStack>

          <Flex
            align="center"
            justify={{ base: 'flex-start', md: 'center' }}
            gap="6px"
            flexWrap="wrap"
            overflowX="auto"
            py="2px"
          >
            {PALETTE.map((color) => {
              const isSelected = selectedColorId === color.id;
              return (
                <Tooltip key={color.id} label={`${color.name} (#${color.id})`} hasArrow>
                  <Box
                    as="button"
                    type="button"
                    aria-label={`Select ${color.name}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedColorId(color.id)}
                    w={{ base: '30px', sm: '34px' }}
                    h={{ base: '30px', sm: '34px' }}
                    borderRadius="9px"
                    bg={color.hex}
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    transition="all 0.15s ease"
                    border={
                      color.id === 0 ? '1px solid var(--border-strong)' : '1px solid rgba(0,0,0,0.2)'
                    }
                    boxShadow={
                      isSelected
                        ? `0 0 0 2px var(--bg), 0 0 0 4px var(--accent)`
                        : '0 2px 5px rgba(0,0,0,0.2)'
                    }
                    transform={isSelected ? 'scale(1.15)' : 'none'}
                    _hover={{
                      transform: isSelected ? 'scale(1.15)' : 'translateY(-2px) scale(1.06)',
                      boxShadow: `0 0 0 2px var(--bg), 0 0 0 3px ${color.hex}`,
                    }}
                    _active={{
                      transform: 'scale(0.95)',
                    }}
                  >
                    {isSelected && (
                      <Check
                        size={14}
                        color={color.isDark ? '#FFFFFF' : '#000000'}
                        strokeWidth={3}
                      />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Flex>

          <Box minW={{ md: '170px' }} textAlign={{ base: 'left', md: 'right' }}>
            <Text fontSize="12px" color="var(--subtle)">
              {cooldown > 0 ? (
                <Text as="span" color="#F59E0B" fontWeight="600">
                  Cooldown active ({cooldown}s)
                </Text>
              ) : (
                <Text as="span" color="var(--muted)">
                  Click canvas to place pixel
                </Text>
              )}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}