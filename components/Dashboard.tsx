'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchGames } from '@/lib/api';
import { transformGamesData, calculateStats, TransformedGame, GameStats } from '@/lib/dataTransform';
import StatCard from './StatCard';
import Filters from './Filters';
import TimeSeriesChart from './TimeSeriesChart';

export default function Dashboard() {
  const [games, setGames] = useState<TransformedGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<TransformedGame[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateBounds, setDateBounds] = useState<[number, number] | null>(null);

  const [filters, setFilters] = useState({
    sizes: [] as number[],
    komis: [] as number[],
    gameTypes: [] as string[],
    tournament: [] as string[],
    dateRange: [0, Number.MAX_SAFE_INTEGER] as [number, number],
    ratingDiffRange: [0, 3000] as [number, number],
    whiteRatingRange: [0, 3000] as [number, number],
    blackRatingRange: [0, 3000] as [number, number],
    timeControlMin: 0,
    timeControlMax: 60000,
  });

  const availableKomis = useMemo(() => {
    return [...new Set(games.map((game) => game.komi))]
      .filter((komi) => Number.isFinite(komi))
      .sort((a, b) => a - b);
  }, [games]);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all games from the slim database. The API response is cached for one day.
        const rawGames = await fetchGames(0, 0);

        if (rawGames.length === 0) {
          setGames([]);
          setFilteredGames([]);
          setStats(null);
          setError('No games were returned from the slim database.');
          return;
        }

        const transformed = transformGamesData(rawGames);

        if (transformed.length === 0) {
          setError('Games loaded but were filtered out. Check the data transformation rules.');
          setGames([]);
          setFilteredGames([]);
          setStats(null);
        } else {
          let minDate = Number.POSITIVE_INFINITY;
          let maxDate = Number.NEGATIVE_INFINITY;

          for (const game of transformed) {
            if (!Number.isFinite(game.date)) continue;
            if (game.date < minDate) minDate = game.date;
            if (game.date > maxDate) maxDate = game.date;
          }

          const nextDateBounds: [number, number] = [minDate, maxDate];

          setDateBounds(nextDateBounds);
          setFilters((prev) => ({
            ...prev,
            dateRange: nextDateBounds,
          }));
          setGames(transformed);
          setFilteredGames(transformed);
          setStats(calculateStats(transformed));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load games';
        console.error('Error loading games:', err);

        setGames([]);
        setFilteredGames([]);
        setStats(null);
        setError(`Could not connect to slim database data: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  useEffect(() => {
    let filtered = games;

    filtered = filtered.filter(
      (g) =>
        g.date >= filters.dateRange[0] &&
        g.date <= filters.dateRange[1]
    );

    if (filters.sizes.length > 0) {
      filtered = filtered.filter((g) => filters.sizes.includes(g.size));
    }

    if (filters.komis.length > 0) {
      filtered = filtered.filter((g) => filters.komis.includes(g.komi));
    }

    if (filters.gameTypes.length > 0) {
      filtered = filtered.filter((g) => filters.gameTypes.includes(g.BotGame));
    }

    if (filters.tournament.length > 0) {
      filtered = filtered.filter((g) => filters.tournament.includes(g.tournament));
    }

    filtered = filtered.filter(
      (g) =>
        g.rating_difference >= filters.ratingDiffRange[0] &&
        g.rating_difference <= filters.ratingDiffRange[1]
    );

    filtered = filtered.filter(
      (g) =>
        g.rating_white >= filters.whiteRatingRange[0] &&
        g.rating_white <= filters.whiteRatingRange[1]
    );

    filtered = filtered.filter(
      (g) =>
        g.rating_black >= filters.blackRatingRange[0] &&
        g.rating_black <= filters.blackRatingRange[1]
    );

    filtered = filtered.filter(
      (g) =>
        g.time_control >= filters.timeControlMin && g.time_control <= filters.timeControlMax
    );

    setFilteredGames(filtered);
    setStats(calculateStats(filtered));
  }, [filters, games]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold">{error}</h2>
          <p className="mt-2 text-sm text-gray-300">
            Check <code className="bg-gray-800 px-2 py-1 rounded">DATA_SOURCES.md</code> for setup instructions.
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-75"></div>
          <div className="relative flex items-center justify-center h-screen">
            <p className="text-2xl text-gray-400">Unable to load dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {games.length > 0 && (
        <div className="bg-green-900 border-b border-green-700 p-4 flex-shrink-0">
          <p className="text-white text-sm">
            Loaded {games.length.toLocaleString()} games from the slim database (after filtering)
          </p>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0">
          <Filters
            filters={filters}
            dateBounds={dateBounds}
            availableKomis={availableKomis}
            setFilters={setFilters}
          />
        </div>

        <div className="flex-1 p-8 overflow-y-auto pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="mt-4 text-gray-400">Loading games data from slim database...</p>
                <p className="mt-2 text-gray-500 text-sm">(This may take a moment for large datasets)</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 mb-8">
                <StatCard
                  label="# of Games"
                  value={stats?.totalGames.toLocaleString() || '0'}
                  color="text-gray-300"
                />
                <StatCard
                  label="White Win %"
                  value={`${stats?.whiteWinPercentage}%` || '0%'}
                  color="text-blue-300"
                />
                <StatCard
                  label="Draw %"
                  value={`${stats?.drawPercentage}%` || '0%'}
                  color="text-gray-400"
                />
                <StatCard
                  label="Black Win %"
                  value={`${stats?.blackWinPercentage}%` || '0%'}
                  color="text-gray-300"
                />
                <div className="flex items-center justify-center">
                  <img
                    src="/playtak-logo.png"
                    alt="PlayTak Logo"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                    className="h-20 w-full max-w-40 object-contain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <StatCard
                  label="Road Win %"
                  value={`${stats?.roadWinPercentage}%` || '0%'}
                  color="text-yellow-300"
                  size="sm"
                />
                <StatCard
                  label="Flat Win %"
                  value={`${stats?.flatWinPercentage}%` || '0%'}
                  color="text-purple-300"
                  size="sm"
                />
                <StatCard
                  label="Mean Moves"
                  value={stats?.avgMoves.toString() || '0'}
                  color="text-green-300"
                  size="sm"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Games Over Time</h2>
                <TimeSeriesChart games={filteredGames} dateRange={filters.dateRange} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
