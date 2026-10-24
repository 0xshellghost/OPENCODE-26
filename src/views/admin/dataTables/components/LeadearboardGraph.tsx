'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import RingLoader from 'react-spinners/RingLoader';
import { FaCalendarAlt, FaClock, FaTrophy, FaEye, FaEyeSlash } from 'react-icons/fa';

export type ParticipantSeries = {
  participantId: string;
  name: string;
  avatarUrl?: string | null;
  officialPoints?: number;
  prmerged?: number;
  data: { date: string; points: number }[];
};

const PALETTE = [
  '#F5C542', // Warm Gold (Top 1)
  '#58B99A', // Emerald Mint
  '#38BDF8', // Sky Blue
  '#A855F7', // Violet Purple
  '#FB923C', // Amber Orange
  '#F472B6', // Rose Pink
  '#2DD4BF', // Bright Teal
  '#818CF8', // Indigo
  '#E2E8F0', // Platinum
  '#FBBF24', // Golden Amber
  '#34D399', // Mint Green
  '#60A5FA', // Marine Blue
];

async function fetchProgress(eventName: string, topN: number = 10): Promise<ParticipantSeries[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/leaderboard/progress?eventName=${encodeURIComponent(eventName)}&topN=${topN}`;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error('Failed to fetch leaderboard progress');
  const json = await r.json();

  if (json && Array.isArray(json.data)) return json.data as ParticipantSeries[];
  if (Array.isArray(json)) return json as ParticipantSeries[];
  return [];
}

const parseYMD = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatYMD = (d: Date) => d.toISOString().slice(0, 10);

const addDays = (iso: string, days: number) => {
  const dt = parseYMD(iso);
  dt.setDate(dt.getDate() + days);
  return formatYMD(dt);
};

const genDates = (start: string, end: string) => {
  const res: string[] = [];
  let cur = parseYMD(start);
  const endD = parseYMD(end);
  while (cur <= endD) {
    res.push(formatYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return res;
};

const genTenMinSlots = (dayIso: string) => {
  const slots: string[] = [];
  const dayStart = new Date(`${dayIso}T00:00:00.000Z`);
  for (let mins = 0; mins < 24 * 60; mins += 15) {
    const d = new Date(dayStart.getTime() + mins * 60 * 1000);
    slots.push(d.toISOString());
  }
  return slots;
};

/* -------------------------------------------------------------
 * Custom Rich Tooltip
 * ------------------------------------------------------------- */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  // Filter valid positive points and sort descending by score
  const validEntries = payload
    .filter((entry: any) => typeof entry.value === 'number' && entry.value > 0)
    .sort((a: any, b: any) => (b.value as number) - (a.value as number));

  const rawDate = payload[0]?.payload?.rawDate;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div
      style={{
        background: 'rgba(8, 20, 32, 0.95)',
        border: '1px solid rgba(88, 185, 154, 0.35)',
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
        minWidth: '240px',
        maxWidth: '320px',
        color: '#F4F1E8',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#58B99A', fontFamily: 'monospace' }}>
          {label}
        </span>
        {formattedDate && (
          <span style={{ fontSize: '11px', color: '#AEBCC7' }}>
            {formattedDate}
          </span>
        )}
      </div>

      {validEntries.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#AEBCC7', padding: '6px 0' }}>
          No recorded points at this milestone
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
          {validEntries.map((entry: any, idx: number) => {
            const isLeader = idx === 0;
            return (
              <div
                key={entry.dataKey}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  {isLeader ? (
                    <FaTrophy size={11} color="#F5C542" style={{ flexShrink: 0 }} />
                  ) : (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: entry.stroke || entry.color,
                        boxShadow: `0 0 8px ${entry.stroke || entry.color}`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: isLeader ? 700 : 500,
                      color: isLeader ? '#F5C542' : '#E2E8F0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {entry.name}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: entry.stroke || entry.color,
                    flexShrink: 0,
                  }}
                >
                  {Number(entry.value).toLocaleString()} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
 * Main Leaderboard Graph Component
 * ------------------------------------------------------------- */
export default function LeaderboardGraph({
  eventName,
  topN = 10,
  startDate,
  endDate,
}: {
  eventName: string;
  topN?: number;
  startDate?: string;
  endDate?: string;
}) {
  const defaultStartDate = process.env.NEXT_PUBLIC_EVENT_START_DATE || '2025-12-14';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leaderboardProgress', eventName, topN],
    queryFn: () => fetchProgress(eventName, topN),
  });

  const { effectiveStartDate, effectiveEndDate } = useMemo(() => {
    let minD = startDate || defaultStartDate;
    let maxD = endDate || '';

    if (data && Array.isArray(data)) {
      for (const p of data) {
        for (const entry of p.data || []) {
          if (!entry?.date) continue;
          const d = entry.date.slice(0, 10);
          if (!minD || d < minD) minD = d;
          if (!maxD || d > maxD) maxD = d;
        }
      }
    }

    if (!maxD) {
      maxD = addDays(minD, 48);
    }

    return { effectiveStartDate: minD, effectiveEndDate: maxD };
  }, [startDate, endDate, data, defaultStartDate]);

  const [mode, setMode] = useState<'daily' | 'tenMin'>('daily');
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [contributorLimit, setContributorLimit] = useState<number>(5);


  // Sort participants by official total points from database
  const sortedParticipants = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...data]
      .map((p) => {
        const lastEntry = p.data && p.data.length ? p.data[p.data.length - 1] : null;
        const maxPoints = p.data?.reduce((m, d) => Math.max(m, d.points || 0), 0) || 0;
        const officialPts = p.officialPoints ?? lastEntry?.points ?? maxPoints;
        return {
          ...p,
          latestPoints: officialPts,
        };
      })
      .sort((a, b) => b.latestPoints - a.latestPoints);
  }, [data]);

  // Display subset based on contributor limit filter (Top 5 / All)
  const activeParticipants = useMemo(() => {
    if (contributorLimit === 0) return sortedParticipants;
    return sortedParticipants.slice(0, contributorLimit);
  }, [sortedParticipants, contributorLimit]);

  // Assign distinct colors to participants
  const participantColorMap = useMemo(() => {
    const map = new Map<string, string>();
    sortedParticipants.forEach((p, idx) => {
      map.set(p.participantId, PALETTE[idx % PALETTE.length]);
    });
    return map;
  }, [sortedParticipants]);

  // Process data for Recharts LineChart
  const { chartData, dates } = useMemo(() => {
    if (!activeParticipants.length) return { chartData: [], dates: [] };

    if (mode === 'daily') {
      const allDates = genDates(effectiveStartDate, effectiveEndDate);

      // Pre-process date maps for each participant
      const pMaps = activeParticipants.map((p) => {
        const dmap = new Map<string, number>();
        for (const entry of p.data || []) {
          if (!entry || typeof entry.date !== 'string') continue;
          const ymd = new Date(entry.date).toISOString().slice(0, 10);
          if (entry.points > 0) {
            dmap.set(ymd, Math.max(dmap.get(ymd) || 0, entry.points));
          }
        }
        return { participantId: p.participantId, dmap, officialPoints: p.officialPoints };
      });

      // Construct chart rows with cumulative progression
      const runningPoints = new Map<string, number | null>();
      pMaps.forEach((p) => runningPoints.set(p.participantId, null));

      const rows = allDates.map((dateStr, idx) => {
        const row: any = {
          day: `Day ${idx + 1}`,
          rawDate: dateStr,
        };

        const isLastDay = idx === allDates.length - 1;
        pMaps.forEach((p) => {
          if (p.dmap.has(dateStr)) {
            runningPoints.set(p.participantId, p.dmap.get(dateStr)!);
          }
          if (isLastDay && (p as any).officialPoints !== undefined) {
            runningPoints.set(p.participantId, (p as any).officialPoints);
          }
          row[p.participantId] = runningPoints.get(p.participantId);
        });

        return row;
      });

      return { chartData: rows, dates: allDates };
    } else {
      // Single Day 15-minute slot view
      const slots = genTenMinSlots(selectedDay);
      const slotTimes = slots.map((s) => new Date(s).getTime());
      const dayStartMs = slotTimes[0];
      const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

      const pMaps = activeParticipants.map((p) => {
        const slotMap = new Map<number, number>();
        for (const entry of p.data || []) {
          if (!entry || entry.points <= 0) continue;
          const ts = new Date(entry.date).getTime();
          if (ts < dayStartMs || ts >= dayEndMs) continue;
          const mins = Math.floor((ts - dayStartMs) / 60000);
          const idx = Math.floor(mins / 15);
          const clamped = Math.max(0, Math.min(idx, slotTimes.length - 1));
          slotMap.set(clamped, Math.max(slotMap.get(clamped) || 0, entry.points));
        }
        return { participantId: p.participantId, slotMap };
      });

      const runningPoints = new Map<string, number | null>();
      pMaps.forEach((p) => runningPoints.set(p.participantId, null));

      const rows = slots.map((slotIso, idx) => {
        let label = '';
        try {
          label = new Date(slotIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
          label = `T${idx}`;
        }

        const row: any = {
          day: label,
          rawDate: slotIso,
        };

        pMaps.forEach((p) => {
          if (p.slotMap.has(idx)) {
            runningPoints.set(p.participantId, p.slotMap.get(idx)!);
          }
          row[p.participantId] = runningPoints.get(p.participantId);
        });

        return row;
      });

      return { chartData: rows, dates: slots };
    }
  }, [activeParticipants, mode, effectiveStartDate, effectiveEndDate, selectedDay]);

  const toggleHideParticipant = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '380px', gap: '16px' }}>
        <RingLoader color="#58B99A" size={48} />
        <span style={{ fontSize: '13px', color: '#AEBCC7', fontFamily: 'monospace' }}>
          Loading Points Telemetry...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ color: '#FC8181', padding: '32px 0', textAlign: 'center', fontSize: '14px' }}>
        Failed to load telemetry: {(error as Error).message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ color: '#AEBCC7', padding: '40px 0', textAlign: 'center', fontSize: '14px' }}>
        No points telemetry recorded yet for this event.
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        userSelect: 'none',
      }}
    >
      {/* ─── TOOLBAR CONTROLS ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: View Mode + Contributor Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Daily vs Single Day Switcher */}
          <div
            style={{
              display: 'flex',
              padding: '3px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '9999px',
              border: '1px solid rgba(88, 185, 154, 0.22)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('daily')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                background: mode === 'daily' ? 'linear-gradient(135deg, #58B99A 0%, #389578 100%)' : 'transparent',
                color: mode === 'daily' ? '#0C1C2C' : '#AEBCC7',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: mode === 'daily' ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: mode === 'daily' ? '0 2px 10px rgba(88, 185, 154, 0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <FaCalendarAlt size={12} />
              30 Days
            </button>

            <button
              type="button"
              onClick={() => setMode('tenMin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                background: mode === 'tenMin' ? 'linear-gradient(135deg, #58B99A 0%, #389578 100%)' : 'transparent',
                color: mode === 'tenMin' ? '#0C1C2C' : '#AEBCC7',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: mode === 'tenMin' ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: mode === 'tenMin' ? '0 2px 10px rgba(88, 185, 154, 0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <FaClock size={12} />
              Single Day
            </button>
          </div>

          {/* Top 5 vs All Filter */}
          <div
            style={{
              display: 'flex',
              padding: '3px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '9999px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => setContributorLimit(5)}
              style={{
                padding: '5px 12px',
                background: contributorLimit === 5 ? 'rgba(88, 185, 154, 0.15)' : 'transparent',
                color: contributorLimit === 5 ? '#58B99A' : '#AEBCC7',
                border: contributorLimit === 5 ? '1px solid rgba(88, 185, 154, 0.4)' : '1px solid transparent',
                borderRadius: '9999px',
                fontWeight: contributorLimit === 5 ? 700 : 500,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Top 5
            </button>
            <button
              type="button"
              onClick={() => setContributorLimit(0)}
              style={{
                padding: '5px 12px',
                background: contributorLimit === 0 ? 'rgba(88, 185, 154, 0.15)' : 'transparent',
                color: contributorLimit === 0 ? '#58B99A' : '#AEBCC7',
                border: contributorLimit === 0 ? '1px solid rgba(88, 185, 154, 0.4)' : '1px solid transparent',
                borderRadius: '9999px',
                fontWeight: contributorLimit === 0 ? 700 : 500,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              All ({sortedParticipants.length})
            </button>
          </div>
        </div>

        {/* Right: Date Picker when in Single Day mode */}
        {mode === 'tenMin' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#AEBCC7', fontWeight: 600 }}>Date:</span>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{
                background: 'rgba(10, 24, 38, 0.8)',
                color: '#F4F1E8',
                border: '1px solid rgba(88, 185, 154, 0.35)',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12.5px',
                outline: 'none',
                colorScheme: 'dark',
              }}
            />
          </div>
        )}
      </div>

      {/* ─── INTERACTIVE LEGEND CHIPS ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          padding: '8px 4px',
        }}
      >
        {activeParticipants.map((p, idx) => {
          const color = participantColorMap.get(p.participantId) || '#58B99A';
          const isHidden = hiddenIds.has(p.participantId);
          const isHovered = hoveredParticipantId === p.participantId;

          return (
            <div
              key={p.participantId}
              onMouseEnter={() => setHoveredParticipantId(p.participantId)}
              onMouseLeave={() => setHoveredParticipantId(null)}
              onClick={() => toggleHideParticipant(p.participantId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '9999px',
                background: isHovered
                  ? 'rgba(255, 255, 255, 0.08)'
                  : isHidden
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isHovered
                  ? `1.5px solid ${color}`
                  : `1px solid ${isHidden ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'}`,
                cursor: 'pointer',
                opacity: isHidden ? 0.4 : isHovered ? 1 : 0.85,
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered ? `0 4px 14px ${color}33` : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              title={isHidden ? `Click to show ${p.name}` : `Click to hide ${p.name}`}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isHidden ? '#718096' : '#F4F1E8',
                  maxWidth: '140px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.name}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: color,
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1px 6px',
                  borderRadius: '6px',
                }}
              >
                {Number(p.latestPoints).toLocaleString()}
              </span>
              {isHidden ? (
                <FaEyeSlash size={10} color="#718096" />
              ) : (
                <FaEye size={10} color="#A0AEC0" opacity={0.5} />
              )}
            </div>
          );
        })}
      </div>

      {/* ─── RECHARTS LINE CHART ─── */}
      <div
        style={{
          width: '100%',
          height: '460px',
          background: 'radial-gradient(ellipse at 50% 10%, rgba(88, 185, 154, 0.05) 0%, transparent 80%)',
          borderRadius: '16px',
          padding: '12px 6px 0 0',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
            <defs>
              {activeParticipants.map((p) => {
                const color = participantColorMap.get(p.participantId) || '#58B99A';
                return (
                  <linearGradient key={`grad-${p.participantId}`} id={`grad-${p.participantId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                );
              })}
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(88, 185, 154, 0.09)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#718096"
              tick={{ fill: '#AEBCC7', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              interval={mode === 'daily' ? 1 : 3}
              angle={-25}
              textAnchor="end"
              dy={6}
            />

            <YAxis
              stroke="#718096"
              tick={{ fill: '#AEBCC7', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            {activeParticipants.map((p) => {
              if (hiddenIds.has(p.participantId)) return null;

              const color = participantColorMap.get(p.participantId) || '#58B99A';
              const isHovered = hoveredParticipantId === p.participantId;
              const hasActiveHover = hoveredParticipantId !== null;

              const strokeWidth = isHovered ? 3.5 : hasActiveHover ? 1.5 : 2.4;
              const strokeOpacity = isHovered ? 1 : hasActiveHover ? 0.2 : 0.95;

              return (
                <Line
                  key={p.participantId}
                  type="monotone"
                  dataKey={p.participantId}
                  name={p.name}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                    fill: color,
                    filter: `drop-shadow(0 0 8px ${color})`,
                  }}
                  connectNulls
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ─── FOOTER TELEMETRY BADGE ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#AEBCC7',
          padding: '6px 0',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#58B99A',
            boxShadow: '0 0 6px #58B99A',
          }}
          className="pulse-live-dot"
        />
        <span>Progression Telemetry · Auto-updated every 8 hours</span>
      </div>
    </div>
  );
}
