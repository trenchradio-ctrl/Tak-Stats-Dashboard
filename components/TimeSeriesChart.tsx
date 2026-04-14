'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TransformedGame } from '@/lib/dataTransform';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TimeSeriesChartProps {
  games: TransformedGame[];
}

export default function TimeSeriesChart({ games }: TimeSeriesChartProps) {
  const chartData = useMemo(() => {
    if (games.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Games',
            data: [],
            backgroundColor: '#0ea5e9',
            borderColor: '#0ea5e9',
            borderWidth: 1,
          },
        ],
      };
    }

    // Group games by date (day)
    const gamesByDate: { [key: string]: number } = {};

    games.forEach((game) => {
      const date = game.date_formatted.split(' ')[0]; // Extract date part
      gamesByDate[date] = (gamesByDate[date] || 0) + 1;
    });

    // Sort by date and get last 60 days
    const sortedDates = Object.keys(gamesByDate).sort().slice(-60);
    const counts = sortedDates.map((date) => gamesByDate[date]);

    return {
      labels: sortedDates.map((date) => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [
        {
          label: 'Games',
          data: counts,
          backgroundColor: '#0ea5e9',
          borderColor: '#0ea5e9',
          borderWidth: 0,
          borderRadius: 2,
        },
      ],
    };
  }, [games]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#666',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
      },
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
          maxTicksLimit: 12,
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
    <div className="h-96">
      <Bar data={chartData} options={options as any} />
    </div>
  );
}
