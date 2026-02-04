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

  // Hàm riêng xử lý nhập % (VD: Nhập 8 -> Lưu 0.08)
  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const floatVal = parseFloat(value);
    setLocalConfig(prev => ({
        ...prev,
        [id]: isNaN(floatVal) ? 0 : floatVal / 100
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
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.205.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Cấu Hình Lương</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* General Settings */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Cơ Bản (Tính lương 1 giờ)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <InputGroup id="ngay_chuan" label="Ngày Chuẩn (Công)" value={localConfig.ngay_chuan} onChange={handleChange} />
                    <InputGroup id="pc_he_so_trinh_do" label="Hệ Số Trình Độ (VNĐ/Ngày)" value={localConfig.pc_he_so_trinh_do} onChange={handleChange} />
                </div>
            </div>

            {/* Insurance Rates - NEW SECTION */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Tỷ Lệ Bảo Hiểm (%)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    <InputGroup 
                        id="kh_bhxh_rate" 
                        label="BHXH" 
                        value={parseFloat((localConfig.kh_bhxh_rate * 100).toFixed(2))} 
                        onChange={handlePercentChange} 
                    />
                    <InputGroup 
                        id="kh_bhyt_rate" 
                        label="BHYT" 
                        value={parseFloat((localConfig.kh_bhyt_rate * 100).toFixed(2))} 
                        onChange={handlePercentChange} 
                    />
                    <InputGroup 
                        id="kh_bhtn_rate" 
                        label="BHTN" 
                        value={parseFloat((localConfig.kh_bhtn_rate * 100).toFixed(2))} 
                        onChange={handlePercentChange} 
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 italic">* Nhập số phần trăm (VD: 8 là 8%)</p>
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
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
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