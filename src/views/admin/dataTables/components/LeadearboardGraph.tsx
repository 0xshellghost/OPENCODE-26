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
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/leaderboard/progress?eventName=${encodeURIComponent(eventName)}`;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(url, { headers });
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
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173'
];

function ThirtyDayGraph({ data, startDate, endDate }:{ data: ParticipantSeries[]; startDate: string; endDate: string; }) {
  const transformed = useMemo(() => pivotParticipants(data, startDate, endDate, 'daily'), [data, startDate, endDate]);
  // console.log('Transformed 30: ', transformed);
  if (!transformed.dates.length) return <div>No data available</div>;

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
      tension: 0,
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
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          title: (items: any[]) => transformed.dates[items[0]?.dataIndex] ?? '',
          label: (context: any) => `${context.dataset.label}: ${context.formattedValue}`
        }
      }
    },
    scales: {
      x: { title: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return <Line data={chartData} options={options} />;
}

function SingleDayGraph({ data, dayIso }:{ data: ParticipantSeries[]; dayIso: string; }) {
  const transformed = useMemo(() => pivotParticipants(data, dayIso, dayIso, 'tenMin'), [data, dayIso]);
  if (!transformed.dates.length) return <div>No data available</div>;

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
      tension: 0,
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
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          title: (items: any[]) => {
            const raw = transformed.dates[items[0]?.dataIndex] ?? '';
            try {
              return new Date(raw).toLocaleString();
            } catch {
              return raw;
            }
          },
          label: (context: any) => `${context.dataset.label}: ${context.formattedValue}`
        }
      }
    },
    scales: {
      x: { title: { display: false } },
      y: { beginAtZero: false, ticks: { precision: 0 } }
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

  if (isLoading) return <div className="flex justify-center items-center h-64"><RingLoader color="#36d7b7" /></div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  // console.log(data) 
  if (!data || data.length === 0) return <div>No data available</div>;

  return (
    <div style={{ width: '100%', height: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <button onClick={() => setMode('daily')} style={{ marginRight: 8, padding: '6px 10px', background: mode === 'daily' ? '#7551ff' : '#e5e7eb', color: mode === 'daily' ? '#fff' : '#111', border: 'none', borderRadius: 6 }}>30 Days</button>
          <button onClick={() => setMode('tenMin')} style={{ padding: '6px 10px', background: mode === 'tenMin' ? '#8551ff' : '#e5e7eb', color: mode === 'tenMin' ? '#fff' : '#111', border: 'none', borderRadius: 6 }}>Single Day</button>
        </div>
        {mode === 'tenMin' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12 }}>Day:</label>
            <input type="date" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} />
          </div>
        )}
      </div>

      <div style={{ height: '420px' }}>
        {mode === 'daily' ? (
          <ThirtyDayGraph data={data} startDate={effectiveStartDate} endDate={effectiveEndDate} />
        ) : (
          <SingleDayGraph data={data} dayIso={selectedDay} />
        )}
      </div>

      <label style={{ display: 'block', textAlign: 'center', fontSize: '14px', marginTop: '12px', color: '#bfc4ceff' }}>
        The graph is updated automatically every 8 hours.
      </label>
    </div>
  );
}

