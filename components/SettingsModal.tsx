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

type SettingsTab = 'basic' | 'insurance' | 'fixed';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<SalaryConfig>(config);
  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setActiveTab('basic'); // Reset to first tab on open
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
        <div className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l-.527-.738c.32.447.27 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.205.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </span>
                Cấu Hình Lương
            </h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Tab Switcher (Segmented Control) */}
        <div className="px-5 pt-2 pb-0">
            <div className="flex p-1 bg-slate-100 rounded-xl">
                <button 
                    onClick={() => setActiveTab('basic')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'basic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Cơ Bản
                </button>
                <button 
                    onClick={() => setActiveTab('insurance')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'insurance' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Bảo Hiểm
                </button>
                <button 
                    onClick={() => setActiveTab('fixed')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'fixed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Định Mức
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto min-h-[250px] custom-scrollbar">
            
            {/* TAB: CƠ BẢN */}
            {activeTab === 'basic' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
                        <p className="text-xs text-indigo-800 mb-3 font-medium leading-relaxed">
                            Cài đặt các thông số cơ bản dùng để tính đơn giá một giờ làm việc.
                        </p>
                        <div className="space-y-4">
                            <InputGroup 
                                id="ngay_chuan" 
                                label="Ngày Công Chuẩn" 
                                value={localConfig.ngay_chuan} 
                                onChange={handleChange} 
                            />
                            {/* Đã bỏ prop currency để cho phép nhập số lẻ */}
                            <div>
                                <InputGroup 
                                    id="pc_he_so_trinh_do" 
                                    label="Hệ Số Trình Độ (VNĐ/Ngày)" 
                                    value={localConfig.pc_he_so_trinh_do} 
                                    onChange={handleChange}
                                />
                                <p className="text-[10px] text-slate-400 italic text-right mt-1">
                                    * Cho phép nhập số thập phân (VD: 5769.22)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: BẢO HIỂM */}
            {activeTab === 'insurance' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold text-amber-700 uppercase">Tỷ Lệ Trừ Lương</label>
                            <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">Đơn vị: %</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <InputGroup 
                                id="kh_bhxh_rate" 
                                label="BHXH" 
                                value={parseFloat((localConfig.kh_bhxh_rate * 100).toFixed(2))} 
                                onChange={handlePercentChange} 
                                className="mb-0"
                            />
                            <InputGroup 
                                id="kh_bhyt_rate" 
                                label="BHYT" 
                                value={parseFloat((localConfig.kh_bhyt_rate * 100).toFixed(2))} 
                                onChange={handlePercentChange} 
                                className="mb-0"
                            />
                            <InputGroup 
                                id="kh_bhtn_rate" 
                                label="BHTN" 
                                value={parseFloat((localConfig.kh_bhtn_rate * 100).toFixed(2))} 
                                onChange={handlePercentChange} 
                                className="mb-0"
                            />
                        </div>
                        <p className="text-[10px] text-amber-500/70 mt-3 italic text-center">
                            Ví dụ: Nhập 8.0 để tính 8% lương
                        </p>
                    </div>
                </div>
            )}

            {/* TAB: ĐỊNH MỨC */}
            {activeTab === 'fixed' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Allowances */}
                    <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100">
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2">Cộng thêm cố định (VNĐ)</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <InputGroup id="pc_ho_tro_di_lai" label="Hỗ Trợ Đi Lại" value={localConfig.pc_ho_tro_di_lai} onChange={handleChange} currency className="mb-0" />
                            <InputGroup id="pc_tien_thuong" label="Tiền Thưởng" value={localConfig.pc_tien_thuong} onChange={handleChange} currency className="mb-0" />
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100">
                        <h4 className="text-[10px] font-bold text-rose-600 uppercase mb-2">Trừ cố định (VNĐ)</h4>
                        <div className="space-y-2">
                            <InputGroup id="kh_phi_cong_doan" label="Phí Công Đoàn" value={localConfig.kh_phi_cong_doan} onChange={handleChange} currency className="mb-0" />
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup id="kh_tien_tiet_kiem" label="Tiết Kiệm" value={localConfig.kh_tien_tiet_kiem} onChange={handleChange} currency className="mb-0" />
                                <InputGroup id="kh_tien_tu_thien" label="Từ Thiện" value={localConfig.kh_tien_tu_thien} onChange={handleChange} currency className="mb-0" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
            <button 
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-white hover:border-gray-300 transition-all text-sm whitespace-nowrap"
            >
                Mặc định
            </button>
            <button 
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all text-sm"
            >
                Lưu Cấu Hình
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;