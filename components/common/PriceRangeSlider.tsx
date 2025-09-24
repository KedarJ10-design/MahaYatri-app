import React from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ min, max, step, value, onChange, label }) => {
  if (min >= max) {
    return (
        <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <p className="text-sm text-gray-500">Price filter unavailable.</p>
        </div>
    );
  }

  return (
    <div>
      <label htmlFor="price-range-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
        <span>{label}</span>
        <span className="font-bold text-primary">Up to ₹{value.toLocaleString()}</span>
      </label>
      <input
        id="price-range-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>₹{min.toLocaleString()}</span>
        <span>₹{max.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
