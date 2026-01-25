import React, { useState, useEffect } from 'react';
import { SalaryConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import InputGroup from './InputGroup';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SalaryConfig;
  onSave: (newConfig: SalaryConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<SalaryConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLocalConfig(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục toàn bộ cài đặt về mặc định?')) {
      setLocalConfig(DEFAULT_CONFIG);
    }
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" aria-hidden="true"></div>

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Cài Đặt Thông Số</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6">
            
            {/* General Settings */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Cài Đặt Chung
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <InputGroup id="ngay_chuan" label="Ngày Chuẩn" value={localConfig.ngay_chuan} onChange={handleChange} />
                    <InputGroup id="pc_he_so_trinh_do" label="Hệ Số Trình Độ (ngày)" value={localConfig.pc_he_so_trinh_do} onChange={handleChange} />
                </div>
            </div>

            {/* Fixed Allowances */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Phụ Cấp Cố Định (VNĐ)
                </h4>
                <div className="space-y-3">
                    <InputGroup id="pc_ho_tro_di_lai" label="Hỗ Trợ Đi Lại" value={localConfig.pc_ho_tro_di_lai} onChange={handleChange} currency />
                    <InputGroup id="pc_tien_thuong" label="Tiền Thưởng" value={localConfig.pc_tien_thuong} onChange={handleChange} currency />
                </div>
            </div>

            {/* Fixed Deductions */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Khấu Trừ Cố Định (VNĐ)
                </h4>
                <div className="space-y-3">
                    <InputGroup id="kh_phi_cong_doan" label="Phí Công Đoàn" value={localConfig.kh_phi_cong_doan} onChange={handleChange} currency />
                    <InputGroup id="kh_tien_tiet_kiem" label="Tiền Tiết Kiệm" value={localConfig.kh_tien_tiet_kiem} onChange={handleChange} currency />
                    <InputGroup id="kh_tien_tu_thien" label="Tiền Từ Thiện" value={localConfig.kh_tien_tu_thien} onChange={handleChange} currency />
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button 
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-white hover:border-gray-300 transition-all text-sm"
            >
                Mặc định
            </button>
            <button 
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all text-sm"
            >
                Lưu Thay Đổi
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
