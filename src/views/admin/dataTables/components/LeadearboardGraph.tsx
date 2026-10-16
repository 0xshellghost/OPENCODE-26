import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import RingLoader from 'react-spinners/RingLoader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, ChartLegend, Filler);

type ParticipantSeries = {
  participantId: string;
  name: string;
  avatarUrl?: string | null;
  data: { date: string; points: number }[];
};

async function fetchProgress(eventName: string) {
  const token = localStorage.getItem('token');
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/leaderboard/progress?eventName=${encodeURIComponent(eventName)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error('Failed to fetch leaderboard progress');
  const json = await r.json();
  // console.log('Res: ', json)

  
  if (json && Array.isArray(json.data)) return json.data as ParticipantSeries[];
  return json as ParticipantSeries[];
}




const timeframe = 10; // minutes per slot for Single Day view

const genDates = (start: string, end: string) => {
  const res: string[] = [];
  let cur = new Date(start);
  const endD = new Date(end);
  while (cur <= endD) {
    res.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return res;
};

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

const genTenMinSlots = (dayIso: string) => {
  const slots: string[] = [];
  const dayStart = new Date(`${dayIso}T00:00:00.000Z`);
  for (let mins = 0; mins < 24 * 60; mins += timeframe) {
    const d = new Date(dayStart.getTime() + mins * 60 * 1000);
    slots.push(d.toISOString());
  }
  return slots;
};

const pivotParticipants = (participants: ParticipantSeries[], startDate: string, endDate: string, mode: 'daily' | 'tenMin' = 'daily') => {
  const dates = mode === 'daily' ? genDates(startDate, endDate) : genTenMinSlots(startDate);
  // console.log('[pivotParticipants] Date range:', { startDate, endDate, dates: dates.slice(0, 5) });
  
  const map = participants.map((p) => {
    if (mode === 'daily') {
      const dmap = new Map<string, number>();
      // console.log(`[${p.participantId}] Processing ${p.data.length} data entries`);
      
      for (const entry of p.data) {
        if (!entry || typeof entry.date !== 'string') continue;
        const ymd = new Date(entry.date).toISOString().slice(0, 10);
        // console.log(`  Entry date: ${entry.date} -> ymd: ${ymd}, points: ${entry.points}`);
        if (entry.points > 0) dmap.set(ymd, entry.points);
      }
      
      // console.log(`  Map keys:`, Array.from(dmap.keys()));
      const rowPoints = dates.map((date) => (dmap.has(date) ? dmap.get(date)! : null));
      // console.log(`  ${p.participantId} rowPoints non-null count:`, rowPoints.filter(p => p !== null).length);
      
      return { participantId: p.participantId, name: p.name, pointsByDate: rowPoints as (number | null)[] };
    }

    const slotTimes = dates.map((s) => new Date(s).getTime());
    const slotMap = new Map<number, number>();
    const dayStartMs = slotTimes[0];
    const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;
    for (const entry of p.data) {
      if (!entry || entry.points <= 0) continue;
      const ts = new Date(entry.date).getTime();
      if (ts < dayStartMs || ts >= dayEndMs) continue;
      const minutesSinceStart = Math.floor((ts - dayStartMs) / 60000);
      const idx = Math.floor(minutesSinceStart / timeframe);
      const clamped = Math.max(0, Math.min(idx, slotTimes.length - 1));
      slotMap.set(clamped, entry.points);
    }

    const rowPoints = dates.map((_, idx) => (slotMap.has(idx) ? slotMap.get(idx)! : null));
    return { participantId: p.participantId, name: p.name, pointsByDate: rowPoints as (number | null)[] };
  });

  return {
    chartData: dates.map((_, idx) => {
      const row: any = { day: `Day ${idx + 1}`, date: dates[idx] };
      for (const p of map) row[p.participantId] = p.pointsByDate[idx];
      return row;
    }),
    participants: map.map((p) => {
      const firstIdx = p.pointsByDate.findIndex((v) => typeof v === 'number' && v > 0);
      const startIndex = firstIdx === -1 ? null : firstIdx;
      const startDateForParticipant = startIndex !== null ? dates[startIndex] : null;
      return { participantId: p.participantId, name: p.name, startIndex, startDate: startDateForParticipant };
    }),
    dates
  };
};

const COLORS = [
  '#f0a8b8', '#FFB547', '#48BB78', '#63B3ED', '#B794F4', '#F687B3', '#4FD1C5', '#F6AD55', '#E2E8F0', '#FC8181',
  '#F6E05E', '#9F7AEA', '#ED8936', '#38B2AC', '#68D391'
];

function ThirtyDayGraph({ data, startDate, endDate }:{ data: ParticipantSeries[]; startDate: string; endDate: string; }) {
  const transformed = useMemo(() => pivotParticipants(data, startDate, endDate, 'daily'), [data, startDate, endDate]);
  if (!transformed.dates.length) return <div style={{ color: '#dfced5', textAlign: 'center', padding: '40px 0' }}>No data available</div>;

  const labels = transformed.dates.map((_, i) => `Day ${i + 1}`);

  const datasets = transformed.participants.map((p, i) => {
    const rawPoints: (number | null)[] = transformed.chartData.map((row: any) => (row[p.participantId] ?? null));
    const firstPos = rawPoints.findIndex((v) => v !== null && v > 0);
    const lastPos = rawPoints.length - 1 - rawPoints.slice().reverse().findIndex((v) => v !== null && v > 0);
    const hasPos = firstPos !== -1 && lastPos >= firstPos;

    const dataPoints = rawPoints.map((v, idx) => (hasPos && (idx < firstPos || idx > lastPos) ? null : v));
    const pointRadiusArr = dataPoints.map((val, idx) => (val !== null && val > 0 ? (p.startIndex === idx ? 6 : 3) : 0));
    const pointStyleArr = dataPoints.map((_, idx) => (p.startIndex === idx ? 'triangle' : 'circle'));

    return {
      label: p.name,
      data: dataPoints,
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length],
      tension: 0.2,
      fill: false,
      pointRadius: pointRadiusArr,
      pointStyle: pointStyleArr,
      pointHoverRadius: 6,
      borderWidth: 2,
      spanGaps: true
    } as any;
  });

  const chartData = { labels, datasets };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#dfced5',
          font: { size: 12 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(28, 16, 34, 0.95)',
        titleColor: '#fff1ec',
        bodyColor: '#dfced5',
        borderColor: 'rgba(240, 168, 184, 0.3)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: (items: any[]) => transformed.dates[items[0]?.dataIndex] ?? '',
          label: (context: any) => `${context.dataset.label}: ${context.formattedValue} pts`
        }
      }
    },
    scales: {
      x: {
        title: { display: false },
        ticks: { color: '#dfced5' },
        grid: { color: 'rgba(240, 168, 184, 0.08)' }
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: '#dfced5' },
        grid: { color: 'rgba(240, 168, 184, 0.08)' }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

function SingleDayGraph({ data, dayIso }:{ data: ParticipantSeries[]; dayIso: string; }) {
  const transformed = useMemo(() => pivotParticipants(data, dayIso, dayIso, 'tenMin'), [data, dayIso]);
  if (!transformed.dates.length) return <div style={{ color: '#dfced5', textAlign: 'center', padding: '40px 0' }}>No data available</div>;

  const labels = transformed.dates.map((d, i) => {
    try {
      return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return `T${i}`;
    }
  });

  const datasets = transformed.participants.map((p, i) => {
    const dataPoints: (number | null)[] = transformed.chartData.map((row: any) => (row[p.participantId] ?? null));
    const firstPos = dataPoints.findIndex((v) => v !== null && v > 0);
    const lastPos = dataPoints.length - 1 - dataPoints.slice().reverse().findIndex((v) => v !== null && v > 0);
    const hasPos = firstPos !== -1 && lastPos >= firstPos;
    const trimmed = dataPoints.map((v, idx) => (hasPos && (idx < firstPos || idx > lastPos) ? null : v));
    const pointRadiusArr = trimmed.map((val) => (val !== null && val > 0 ? 3 : 0));

    return {
      label: p.name,
      data: trimmed,
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length],
      tension: 0.2,
      fill: false,
      pointRadius: pointRadiusArr,
      pointHoverRadius: 6,
      borderWidth: 2,
      spanGaps: true
    } as any;
  });

  const chartData = { labels, datasets };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#dfced5',
          font: { size: 12 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(28, 16, 34, 0.95)',
        titleColor: '#fff1ec',
        bodyColor: '#dfced5',
        borderColor: 'rgba(240, 168, 184, 0.3)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: (items: any[]) => {
            const raw = transformed.dates[items[0]?.dataIndex] ?? '';
            try {
              return new Date(raw).toLocaleString();
            } catch {
              return raw;
            }
          },
          label: (context: any) => `${context.dataset.label}: ${context.formattedValue} pts`
        }
      }
    },
    scales: {
      x: {
        title: { display: false },
        ticks: { color: '#dfced5' },
        grid: { color: 'rgba(240, 168, 184, 0.08)' }
      },
      y: {
        beginAtZero: false,
        ticks: { precision: 0, color: '#dfced5' },
        grid: { color: 'rgba(240, 168, 184, 0.08)' }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

export default function LeaderboardGraph({ eventName, topN = 10, startDate, endDate }:{
  eventName: string;
  topN?: number;
  startDate?: string;
  endDate?: string;
}) {
  const defaultStartDate = process.env.NEXT_PUBLIC_EVENT_START_DATE || '2025-12-15';
  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || addDays(effectiveStartDate, 34); // 30 days inclusive

  const [mode, setMode] = useState<'daily' | 'tenMin'>('daily');
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leaderboardProgress', eventName, topN],
    queryFn: () => fetchProgress(eventName)
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><RingLoader color="#f0a8b8" /></div>;
  if (isError) return <div style={{ color: '#f0a8b8', padding: '24px 0', textAlign: 'center' }}>Error: {(error as Error).message}</div>;

  if (!data || data.length === 0) return <div style={{ color: '#dfced5', padding: '24px 0', textAlign: 'center' }}>No data available</div>;

  return (
    <div style={{ width: '100%', height: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, background: 'rgba(20, 12, 24, 0.75)', padding: '3px', borderRadius: 9999, border: '1px solid rgba(240, 168, 184, 0.22)' }}>
          <button
            onClick={() => setMode('daily')}
            style={{
              padding: '6px 16px',
              background: mode === 'daily' ? 'linear-gradient(135deg, #f0a8b8 0%, #ea8ea2 100%)' : 'transparent',
              color: mode === 'daily' ? '#1a0c16' : '#dfced5',
              border: 'none',
              borderRadius: 9999,
              fontWeight: mode === 'daily' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: mode === 'daily' ? '0 2px 10px rgba(240, 168, 184, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            30 Days
          </button>
          <button
            onClick={() => setMode('tenMin')}
            style={{
              padding: '6px 16px',
              background: mode === 'tenMin' ? 'linear-gradient(135deg, #f0a8b8 0%, #ea8ea2 100%)' : 'transparent',
              color: mode === 'tenMin' ? '#1a0c16' : '#dfced5',
              border: 'none',
              borderRadius: 9999,
              fontWeight: mode === 'tenMin' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: mode === 'tenMin' ? '0 2px 10px rgba(240, 168, 184, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Single Day
          </button>
        </div>
        {mode === 'tenMin' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: '#dfced5', fontWeight: 600 }}>Day:</label>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{
                background: 'rgba(20, 12, 24, 0.75)',
                color: '#fff1ec',
                border: '1px solid rgba(240, 168, 184, 0.3)',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      <div style={{ height: '400px' }}>
        {mode === 'daily' ? (
          <ThirtyDayGraph data={data} startDate={effectiveStartDate} endDate={effectiveEndDate} />
        ) : (
          <SingleDayGraph data={data} dayIso={selectedDay} />
        )}
      </div>

      <label style={{ display: 'block', textAlign: 'center', fontSize: '13px', marginTop: '12px', color: '#dfced5', opacity: 0.8 }}>
        The graph is updated automatically every 8 hours.
      </label>
    </div>
  );
}

