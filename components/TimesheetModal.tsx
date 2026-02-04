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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white/90 border border-white/50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 via-white to-purple-50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nhập Số Liệu Công Chi Tiết</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-transform hover:rotate-90">×</button>
        </div>
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          <InputGroup
            id="ngay_di_lam"
            label="Số Ngày Đi Làm (Tổng Ngày Công + Phép Năm)"
            value={localData.ngay_di_lam}
            onChange={handleChange}
            highlight
          />
          <div>
            <h4 className="text-pink-600 font-bold mb-3 border-b border-slate-100 pb-1">Giờ Tăng Ca (Theo Bảng Công)</h4>
            <div className="grid grid-cols-3 gap-3">
              <InputGroup id="tc_thuong" label="TC Thường (1.5)" value={localData.tc_thuong} onChange={handleChange} />
              <InputGroup id="tc_nghi" label="TC Ngày Nghỉ (2)" value={localData.tc_nghi} onChange={handleChange} />
              <InputGroup id="tc_le" label="TC Ngày Lễ (HT)" value={localData.tc_le} onChange={handleChange} />
            </div>
          </div>
          <div>
            <h4 className="text-red-500 font-bold mb-3 border-b border-slate-100 pb-1">Giờ Ca Đêm (Theo Phụ Cấp)</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputGroup id="cd_30" label="Ca Đêm 30%" value={localData.cd_30} onChange={handleChange} />
              <InputGroup id="cd_50" label="Ca Đêm 50%" value={localData.cd_50} onChange={handleChange} />
              <InputGroup id="cd_70" label="Ca Đêm 70%" value={localData.cd_70} onChange={handleChange} />
              <InputGroup id="cd_90" label="Ca Đêm 90%" value={localData.cd_90} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 hover:-translate-y-1"
          >
             Áp Dụng Dữ Liệu
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">Dữ liệu này sẽ được đồng bộ vào bảng chính</p>
        </div>
      </div>
    </div>
  );
};
export default TimesheetModal;