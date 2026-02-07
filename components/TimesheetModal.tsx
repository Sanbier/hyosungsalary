import React, { useState, useEffect } from 'react';
import { SalaryInputs } from '../types';
import InputGroup from './InputGroup';

interface TimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: SalaryInputs;
  onApply: (data: Partial<SalaryInputs>) => void;
}

const TimesheetModal: React.FC<TimesheetModalProps> = ({ isOpen, onClose, currentData, onApply }) => {
  const [localData, setLocalData] = useState<SalaryInputs>(currentData);

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalData(currentData);
    }
  }, [isOpen, currentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLocalData(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };

  const handleApply = () => {
    onApply({
      ngay_di_lam: localData.ngay_di_lam,
      tc_thuong: localData.tc_thuong,
      tc_nghi: localData.tc_nghi,
      tc_le: localData.tc_le,
      cd_30: localData.cd_30,
      cd_50: localData.cd_50,
      cd_70: localData.cd_70,
      cd_90: localData.cd_90,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop with stronger blur */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"></div>

      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* 1. HEADER: Solid Gradient */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 shrink-0 flex justify-between items-center relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/30 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
            </div>
            <div>
                <h3 className="text-lg font-bold text-white leading-tight">Nhập Bảng Công</h3>
                <p className="text-indigo-100 text-xs opacity-90">Điền số liệu tháng này</p>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 2. BODY: Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 custom-scrollbar">
            
            {/* SECTION: Ngày Công (Hero) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-full -mr-6 -mt-6 z-0"></div>
                <div className="relative z-10">
                    <InputGroup 
                        id="ngay_di_lam" 
                        label="Tổng Số Ngày Công" 
                        value={localData.ngay_di_lam} 
                        onChange={handleChange} 
                        highlight
                        className="mb-0" // override default margin
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 italic text-right">Bao gồm công thực tế + phép năm</p>
                </div>
            </div>

            {/* SECTION: Tăng Ca (Amber Theme) */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Giờ Tăng Ca</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <InputGroup id="tc_thuong" label="Thường (1.5)" value={localData.tc_thuong} onChange={handleChange} />
                    <InputGroup id="tc_nghi" label="Chủ Nhật (2.0)" value={localData.tc_nghi} onChange={handleChange} />
                    <InputGroup id="tc_le" label="Ngày Lễ (3.0)" value={localData.tc_le} onChange={handleChange} />
                </div>
            </div>

            {/* SECTION: Ca Đêm (Indigo Theme) */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">Phụ Cấp Ca Đêm</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <InputGroup id="cd_30" label="Đêm 30%" value={localData.cd_30} onChange={handleChange} />
                    <InputGroup id="cd_50" label="Đêm 50%" value={localData.cd_50} onChange={handleChange} />
                    <InputGroup id="cd_70" label="Đêm 70%" value={localData.cd_70} onChange={handleChange} />
                    <InputGroup id="cd_90" label="Đêm 90%" value={localData.cd_90} onChange={handleChange} />
                </div>
            </div>
        </div>

        {/* 3. FOOTER */}
        <div className="p-5 border-t border-slate-100 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
             <span>Áp Dụng Dữ Liệu</span>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
             </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimesheetModal;