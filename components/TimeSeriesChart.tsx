'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TransformedGame } from '@/lib/dataTransform';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Title, Tooltip, Legend);

interface TimeSeriesChartProps {
  games: TransformedGame[];
  dateRange: [number, number];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(timestamp: number): Date {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek(timestamp: number): Date {
  const date = startOfDay(timestamp);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function startOfMonth(timestamp: number): Date {
  const date = new Date(timestamp);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getBucketEnd(date: Date, bucket: 'day' | 'week' | 'month'): Date {
  const end = addBucket(date, bucket);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return end;
}

function addBucket(date: Date, bucket: 'day' | 'week' | 'month'): Date {
  const next = new Date(date);

  if (bucket === 'day') {
    next.setDate(next.getDate() + 1);
  } else if (bucket === 'week') {
    next.setDate(next.getDate() + 7);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

function getBucketStart(timestamp: number, bucket: 'day' | 'week' | 'month'): Date {
  if (bucket === 'day') return startOfDay(timestamp);
  if (bucket === 'week') return startOfWeek(timestamp);
  return startOfMonth(timestamp);
}

function formatBucketLabel(date: Date, bucket: 'day' | 'week' | 'month', selectedEnd?: number): string {
  if (bucket === 'month') {
    if (selectedEnd && date.getTime() <= selectedEnd && selectedEnd <= getBucketEnd(date, bucket).getTime()) {
      return new Date(selectedEnd).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }

    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(bucket === 'week' ? { year: 'numeric' } : {}),
  });
}

export default function TimeSeriesChart({ games, dateRange }: TimeSeriesChartProps) {
  const chartData = useMemo(() => {
    const [start, end] = dateRange;

    if (games.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Games',
            data: [],
            backgroundColor: '#0ea5e9',
            borderColor: '#0ea5e9',
            borderWidth: 2,
            tension: 0.25,
            pointRadius: 2,
            pointHitRadius: 16,
            pointHoverRadius: 4,
            fill: true,
          },
        ],
      };
    }

    const rangeDays = Math.max(1, Math.ceil((end - start) / DAY_MS));
    const bucket = rangeDays > 730 ? 'month' : rangeDays > 180 ? 'week' : 'day';
    const firstBucket = getBucketStart(start, bucket);
    const lastBucket = getBucketStart(end, bucket);
    const gamesByBucket: Record<string, number> = {};
    const labels: string[] = [];
    const keys: string[] = [];

    for (let date = firstBucket; date <= lastBucket; date = addBucket(date, bucket)) {
      const key = date.toISOString();
      keys.push(key);
      labels.push(formatBucketLabel(date, bucket, end));
      gamesByBucket[key] = 0;
    }

    games.forEach((game) => {
      const key = getBucketStart(game.date, bucket).toISOString();
      gamesByBucket[key] = (gamesByBucket[key] || 0) + 1;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Games',
          data: keys.map((key) => gamesByBucket[key]),
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          borderColor: '#0ea5e9',
          borderWidth: 2,
          tension: 0.25,
          pointRadius: keys.length > 120 ? 0 : 2,
          pointHitRadius: 16,
          pointHoverRadius: 5,
          fill: true,
        },
      ],
    };
  }, [dateRange, games]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#666',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y.toLocaleString()} games`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#999',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 14,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#999',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-72 md:h-96">
      <Line data={chartData} options={options as any} />
    </div>
  );
}
