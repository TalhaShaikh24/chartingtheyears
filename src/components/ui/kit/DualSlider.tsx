'use client';

import { useState, useEffect, useRef } from 'react';
import './DualSlider.css';

interface DualSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function DualSlider({ min, max, value, onChange }: DualSliderProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), value[1] - 1);
    onChange([val, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), value[0] + 1);
    onChange([value[0], val]);
  };

  const leftPercent = ((value[0] - min) / (max - min)) * 100;
  const rightPercent = 100 - ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="dual-slider-container">
      <div className="dual-slider-track">
        <div 
          className="dual-slider-range" 
          style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
        />
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value[0]} 
        onChange={handleMinChange} 
        className="dual-slider-thumb dual-slider-thumb-left" 
      />
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value[1]} 
        onChange={handleMaxChange} 
        className="dual-slider-thumb dual-slider-thumb-right" 
      />
    </div>
  );
}
