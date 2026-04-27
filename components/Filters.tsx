'use client';

import React from 'react';

interface FilterProps {
  filters: {
    sizes: number[];
    komis: number[];
    gameTypes: string[];
    tournament: string[];
    dateRange: [number, number];
    ratingDiffRange: [number, number];
    whiteRatingRange: [number, number];
    blackRatingRange: [number, number];
    timeControlMin: number;
    timeControlMax: number;
  };
  dateBounds: [number, number] | null;
  availableKomis: number[];
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

function toDateInputValue(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '';

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string, endOfDay = false): number {
  if (!value) return 0;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  return date.getTime();
}

function clampRange(min: number, max: number, lowerBound: number, upperBound: number): [number, number] {
  const safeMin = Number.isFinite(min) ? min : lowerBound;
  const safeMax = Number.isFinite(max) ? max : upperBound;
  const nextMin = Math.max(lowerBound, Math.min(safeMin, upperBound));
  const nextMax = Math.max(nextMin, Math.min(safeMax, upperBound));
  return [nextMin, nextMax];
}

function RangeNumberInputs({
  min,
  max,
  step = 1,
  bounds,
  value,
  onChange,
}: {
  min: string;
  max: string;
  step?: number;
  bounds: [number, number];
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Min</span>
        <input
          type="number"
          min={bounds[0]}
          max={value[1]}
          step={step}
          value={value[0]}
          onChange={(e) => onChange(clampRange(Number(e.target.value), value[1], bounds[0], bounds[1]))}
          className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1 text-sm text-gray-200"
          aria-label={min}
        />
      </label>
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Max</span>
        <input
          type="number"
          min={value[0]}
          max={bounds[1]}
          step={step}
          value={value[1]}
          onChange={(e) => onChange(clampRange(value[0], Number(e.target.value), bounds[0], bounds[1]))}
          className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1 text-sm text-gray-200"
          aria-label={max}
        />
      </label>
    </div>
  );
}

export default function Filters({ filters, dateBounds, availableKomis, setFilters }: FilterProps) {
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

  const handleKomiToggle = (komi: number) => {
    setFilters((prev: any) => ({
      ...prev,
      komis: prev.komis.includes(komi)
        ? prev.komis.filter((value: number) => value !== komi)
        : [...prev.komis, komi],
    }));
  };

  const handleRatingDiffChange = (min: number, max: number) => {
    setFilters((prev: any) => ({
      ...prev,
      ratingDiffRange: [min, max],
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
    <div className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3 md:block md:space-y-6">
      {dateBounds && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Date Range</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="block text-xs text-gray-500 mb-1">From</span>
              <input
                type="date"
                min={toDateInputValue(dateBounds[0])}
                max={toDateInputValue(filters.dateRange[1])}
                value={toDateInputValue(filters.dateRange[0])}
                onChange={(e) => {
                  const nextStart = fromDateInputValue(e.target.value);
                  setFilters((prev: any) => ({
                    ...prev,
                    dateRange: [Math.min(nextStart, prev.dateRange[1]), prev.dateRange[1]],
                  }));
                }}
                className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1 text-sm text-gray-200"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-gray-500 mb-1">To</span>
              <input
                type="date"
                min={toDateInputValue(filters.dateRange[0])}
                max={toDateInputValue(dateBounds[1])}
                value={toDateInputValue(filters.dateRange[1])}
                onChange={(e) => {
                  const nextEnd = fromDateInputValue(e.target.value, true);
                  setFilters((prev: any) => ({
                    ...prev,
                    dateRange: [prev.dateRange[0], Math.max(nextEnd, prev.dateRange[0])],
                  }));
                }}
                className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1 text-sm text-gray-200"
              />
            </label>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Size</h3>
        <div className="grid grid-cols-3 gap-2 md:block md:space-y-2">
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
        <div className="grid grid-cols-2 gap-2 md:block md:space-y-2">
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

      {availableKomis.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Komi</h3>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-2">
            {availableKomis.map((komi) => (
              <label key={komi} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.komis.includes(komi)}
                  onChange={() => handleKomiToggle(komi)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-300">{komi}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Rating Difference</h3>
        <RangeNumberInputs
          min="Minimum rating difference"
          max="Maximum rating difference"
          bounds={[0, 3000]}
          value={filters.ratingDiffRange}
          onChange={([min, max]) => handleRatingDiffChange(min, max)}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">White Player ELO</h3>
        <RangeNumberInputs
          min="Minimum white player ELO"
          max="Maximum white player ELO"
          bounds={[0, 3000]}
          value={filters.whiteRatingRange}
          onChange={([min, max]) => handleWhiteRatingChange(min, max)}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Black Player ELO</h3>
        <RangeNumberInputs
          min="Minimum black player ELO"
          max="Maximum black player ELO"
          bounds={[0, 3000]}
          value={filters.blackRatingRange}
          onChange={([min, max]) => handleBlackRatingChange(min, max)}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Time Controls</h3>
        <RangeNumberInputs
          min="Minimum time control"
          max="Maximum time control"
          bounds={[0, 60000]}
          value={[filters.timeControlMin, filters.timeControlMax]}
          onChange={([min, max]) => handleTimeControlChange(min, max)}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Games</h3>
        <div className="grid grid-cols-2 gap-2 md:block md:space-y-2">
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
