import React, { useState } from 'react';
import { formatVND } from '../utils/format';

interface FloatingResultProps {
  value: number;
}

const FloatingResult: React.FC<FloatingResultProps> = ({ value }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Floating Bubble */}
      <div 
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-40 group"
        onClick={() => setShowConfirm(true)}
      >
        <div className="absolute inset-0 bg-red-600 blur-lg opacity-40 rounded-full animate-pulse group-hover:opacity-60 transition-opacity"></div>
        <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 text-white p-4 rounded-2xl shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:-translate-y-2 border border-white/20 hover:from-rose-400 hover:to-pink-500 active:scale-95">
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/90 mb-1 text-center">Thực Lãnh</p>
          <p className="text-xl font-black drop-shadow-md whitespace-nowrap">
            {formatVND(value)}
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"></div>
          
          {/* Dialog */}
          <div 
            className="relative w-full max-w-xs bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">Cập Nhật Phần Mềm</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Mọi thay đổi chưa lưu sẽ bị mất.<br/>Bạn có chắc chắn muốn cập nhật không?
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition-all active:scale-95"
              >
                Hủy
              </button>
              <button 
                onClick={handleReload}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                Đồng Ý
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingResult;