import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  presetName: string;
  onConfirm: (isYes: boolean) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, presetName, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container: Compact & Liquid Glass */}
      <div 
        className="relative w-full max-w-xs sm:max-w-sm bg-gray-900/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="p-6 flex flex-col items-center text-center">
          
          {/* Icon Badge */}
          <div className="mb-4 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 animate-bounce-slight">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM15.375 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 10.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Title & Info */}
          <h3 className="text-white/80 text-sm font-medium mb-1">
            Đã tải dữ liệu <span className="text-blue-300 font-bold italic">"{presetName}"</span>
          </h3>
          
          <p className="text-white text-base leading-snug mb-6">
            Tháng này bạn có nhận được <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-400 font-bold text-lg uppercase tracking-wide drop-shadow-sm">
              Thưởng Chuyên Cần
            </span> không?
          </p>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => onConfirm(false)}
              className="py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all active:scale-95"
            >
              Không có
            </button>
            <button
              onClick={() => onConfirm(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 border border-white/20"
            >
              Có, xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;