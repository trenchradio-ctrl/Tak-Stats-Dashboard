'use client';

import React from 'react';

interface FilterProps {
  filters: {
    sizes: number[];
    komis: number[];
    gameTypes: string[];
    tournament: string[];
    ratingDiffRange: [number, number];
    whiteRatingRange: [number, number];
    blackRatingRange: [number, number];
    timeControlMin: number;
    timeControlMax: number;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export default function Filters({ filters, setFilters }: FilterProps) {
  const handleSizeToggle = (size: number) => {
    setFilters((prev: any) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s: number) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleGameTypeToggle = (type: string) => {
    setFilters((prev: any) => ({
      ...prev,
      gameTypes: prev.gameTypes.includes(type)
        ? prev.gameTypes.filter((t: string) => t !== type)
        : [...prev.gameTypes, type],
    }));
  };

  const handleTournamentToggle = (type: string) => {
    setFilters((prev: any) => ({
      ...prev,
      tournament: prev.tournament.includes(type)
        ? prev.tournament.filter((t: string) => t !== type)
        : [...prev.tournament, type],
    }));
  };

  const handleRatingDiffChange = (maxValue: number) => {
    setFilters((prev: any) => ({
      ...prev,
      ratingDiffRange: [0, maxValue],
    }));
  };

  const handleWhiteRatingChange = (min: number, max: number) => {
    setFilters((prev: any) => ({
      ...prev,
      whiteRatingRange: [min, max],
    }));
  };

  const handleBlackRatingChange = (min: number, max: number) => {
    setFilters((prev: any) => ({
      ...prev,
      blackRatingRange: [min, max],
    }));
  };

  const handleTimeControlChange = (min: number, max: number) => {
    setFilters((prev: any) => ({
      ...prev,
      timeControlMin: min,
      timeControlMax: max,
    }));
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Size</h3>
        <div className="space-y-2">
          {[3, 4, 5, 6, 7, 8].map((size) => (
            <label key={size} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.sizes.includes(size)}
                onChange={() => handleSizeToggle(size)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">{size}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">ONLY</div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Type</h3>
        <div className="space-y-2">
          {['Tournament', 'Normal'].map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.tournament.includes(type)}
                onChange={() => handleTournamentToggle(type)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Rating Difference</h3>
        <input
          type="range"
          min="0"
          max="2500"
          value={filters.ratingDiffRange[1]}
          onChange={(e) => handleRatingDiffChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0</span>
          <span>{filters.ratingDiffRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">White Player ELO</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{filters.whiteRatingRange[0]}</span>
            <span>{filters.whiteRatingRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="3000"
            value={filters.whiteRatingRange[1]}
            onChange={(e) => handleWhiteRatingChange(filters.whiteRatingRange[0], parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Black Player ELO</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{filters.blackRatingRange[0]}</span>
            <span>{filters.blackRatingRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="3000"
            value={filters.blackRatingRange[1]}
            onChange={(e) => handleBlackRatingChange(filters.blackRatingRange[0], parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Time Controls</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{filters.timeControlMin}</span>
            <span>{filters.timeControlMax}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            value={filters.timeControlMin}
            onChange={(e) => handleTimeControlChange(parseInt(e.target.value), filters.timeControlMax)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Games</h3>
        <div className="space-y-2">
          {['Human', 'Bot'].map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.gameTypes.includes(type)}
                onChange={() => handleGameTypeToggle(type)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
