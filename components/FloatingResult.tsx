import React from 'react';
import { formatVND } from '../utils/format';

interface FloatingResultProps {
  value: number;
}

const FloatingResult: React.FC<FloatingResultProps> = ({ value }) => {
  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-40 group">
      <div className="absolute inset-0 bg-red-600 blur-lg opacity-40 rounded-full animate-pulse group-hover:opacity-60 transition-opacity"></div>
      <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 text-white p-4 rounded-2xl shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:-translate-y-2 border border-white/20 hover:from-rose-400 hover:to-pink-500">
        <p className="text-[10px] uppercase font-bold tracking-widest text-white/90 mb-1 text-center">Thực Lãnh</p>
        <p className="text-xl font-black drop-shadow-md whitespace-nowrap">
          {formatVND(value)}
        </p>
      </div>
    </div>
  );
};

export default FloatingResult;