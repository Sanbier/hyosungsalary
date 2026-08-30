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

type SettingsTab = 'basic' | 'insurance' | 'fixed' | 'thue';

// Helper to convert entire config object to string values for form handling
const configToStrings = (conf: SalaryConfig): Record<keyof SalaryConfig, string> => {
  return Object.entries(conf).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: value.toString()
  }), {} as Record<keyof SalaryConfig, string>);
};

// Helper to parse strings back to numbers
const stringsToConfig = (form: Record<keyof SalaryConfig, string>): SalaryConfig => {
  return Object.entries(form).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: parseFloat(value) || 0
  }), {} as SalaryConfig);
};

// Boolean config keys that must NOT go through parseFloat
const BOOLEAN_CONFIG_KEYS = ['ap_dung_thue_tncn'];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  // Form state stores strings to allow intermediate typing (e.g., "5.")
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');

  useEffect(() => {
    if (isOpen) {
      setFormState(configToStrings(config));
      setActiveTab('basic');
    }
  }, [isOpen, config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Special handler for Percentage inputs (displayed as 0-100, stored as 0-1)
  // But since we use string state, we just store what user types, and convert on Save?
  // Actually, to keep it simple and consistent with previous logic: 
  // We'll let user edit the RATE directly? No, user prefers "8" for 8%.
  // Let's handle percentage UI transformation here.
  
  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // We store the raw input string in state (e.g. "8")
    // When saving, we'll divide by 100
    setFormState(prev => ({
        ...prev,
        [id]: value
    }));
  };

  const getPercentValue = (key: keyof SalaryConfig) => {
    // If we are editing, formState has the string. 
    // Wait, formState initialized from config (0.08). We want to show 8.
    // So initialization needs to handle this or we handle it on render.
    // Let's adjust initialization strategy slightly.
    return formState[key];
  };

  // Improved Initialization for Percentages: 
  // We should multiply by 100 when loading into formState for specific keys
  useEffect(() => {
    if (isOpen) {
        const strState = configToStrings(config);
        // Adjust percentages to be human readable (0.08 -> 8)
        const percentKeys = ['kh_bhxh_rate', 'kh_bhyt_rate', 'kh_bhtn_rate'];
        percentKeys.forEach(key => {
            strState[key as keyof SalaryConfig] = (config[key as keyof SalaryConfig] * 100).toString();
        });
        setFormState(strState);
        setActiveTab('basic');
    }
  }, [isOpen, config]);

  const handleReset = () => {
    if (window.confirm('Khôi phục toàn bộ cài đặt về mặc định?')) {
        const strState: Record<string, string> = configToStrings(DEFAULT_CONFIG);
        const percentKeys = ['kh_bhxh_rate', 'kh_bhyt_rate', 'kh_bhtn_rate'];
        percentKeys.forEach(key => {
            const rawVal = DEFAULT_CONFIG[key as keyof SalaryConfig];
            strState[key] = ((typeof rawVal === 'number' ? rawVal : 0) * 100).toString();
        });
        // boolean keys
        BOOLEAN_CONFIG_KEYS.forEach(key => {
            strState[key] = (DEFAULT_CONFIG as any)[key] ? 'true' : 'false';
        });
        setFormState(strState);
    }
  };

  const handleSave = () => {
    // Convert back to numbers
    const newConfig: any = stringsToConfig(formState as Record<keyof SalaryConfig, string>);

    // Fix percentages (divide by 100)
    const percentKeys = ['kh_bhxh_rate', 'kh_bhyt_rate', 'kh_bhtn_rate'];
    percentKeys.forEach(key => {
        const val = parseFloat(formState[key]) || 0;
        newConfig[key] = val / 100;
    });

    // Restore boolean keys (parseFloat would have destroyed them)
    BOOLEAN_CONFIG_KEYS.forEach(key => {
        const raw = formState[key];
        newConfig[key] = (raw === 'true' || raw === true);
    });

    onSave(newConfig as SalaryConfig);
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l-.527-.738c.32.447.27 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.205.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
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
                <button 
                    onClick={() => setActiveTab('thue')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'thue' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Thuế
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
                                value={formState.ngay_chuan || ''} 
                                onChange={handleChange} 
                            />
                            {/* Decimal Field: currency=false to allow decimal input */}
                            <div>
                                <InputGroup 
                                    id="pc_he_so_trinh_do" 
                                    label="Hệ Số Trình Độ (VNĐ/Ngày)" 
                                    value={formState.pc_he_so_trinh_do || ''} 
                                    onChange={handleChange}
                                />
                                <p className="text-[10px] text-slate-400 italic text-right mt-1">
                                    * Cho phép nhập số lẻ (VD: 5769.22)
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
                                value={formState.kh_bhxh_rate || ''} 
                                onChange={handlePercentChange} 
                                className="mb-0"
                            />
                            <InputGroup 
                                id="kh_bhyt_rate" 
                                label="BHYT" 
                                value={formState.kh_bhyt_rate || ''} 
                                onChange={handlePercentChange} 
                                className="mb-0"
                            />
                            <InputGroup 
                                id="kh_bhtn_rate" 
                                label="BHTN" 
                                value={formState.kh_bhtn_rate || ''} 
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
                            <InputGroup 
                                id="pc_ho_tro_di_lai" 
                                label="Hỗ Trợ Đi Lại" 
                                value={formState.pc_ho_tro_di_lai || ''} 
                                onChange={handleChange} 
                                currency 
                                className="mb-0" 
                            />
                            <InputGroup 
                                id="pc_tien_thuong" 
                                label="Tiền Thưởng" 
                                value={formState.pc_tien_thuong || ''} 
                                onChange={handleChange} 
                                currency 
                                className="mb-0" 
                            />
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100">
                        <h4 className="text-[10px] font-bold text-rose-600 uppercase mb-2">Trừ cố định (VNĐ)</h4>
                        <div className="space-y-2">
                            <InputGroup 
                                id="kh_phi_cong_doan" 
                                label="Phí Công Đoàn" 
                                value={formState.kh_phi_cong_doan || ''} 
                                onChange={handleChange} 
                                currency 
                                className="mb-0" 
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup 
                                    id="kh_tien_tiet_kiem" 
                                    label="Tiết Kiệm" 
                                    value={formState.kh_tien_tiet_kiem || ''} 
                                    onChange={handleChange} 
                                    currency 
                                    className="mb-0" 
                                />
                                <InputGroup 
                                    id="kh_tien_tu_thien" 
                                    label="Từ Thiện" 
                                    value={formState.kh_tien_tu_thien || ''} 
                                    onChange={handleChange} 
                                    currency 
                                    className="mb-0" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: THUẾ TNCN */}
            {activeTab === 'thue' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-violet-50/30 p-4 rounded-xl border border-violet-100">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold text-violet-700 uppercase">Giảm Trừ Gia Cảnh</label>
                            <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-bold">VNĐ/tháng</span>
                        </div>
                        <div className="space-y-3">
                            <InputGroup 
                                id="thue_mien_thue_ban_than" 
                                label="Miễn Trừ Bản Thân" 
                                value={formState.thue_mien_thue_ban_than || ''} 
                                onChange={handleChange} 
                                currency 
                                className="mb-0" 
                            />
                            <InputGroup
                                id="thue_giam_tru_moi_npt"
                                label="Giảm Trừ Mỗi NPT"
                                value={formState.thue_giam_tru_moi_npt || ''}
                                onChange={handleChange}
                                currency
                                className="mb-0"
                            />
                        </div>
                        <p className="text-[10px] text-violet-500/70 mt-3 italic text-center">
                            Theo Nghị quyết 954/2020: Bản thân 11,000,000 & NPT 4,400,000 VNĐ/tháng.
                            <br />
                            (Phiếu công ty đang dùng 6,200,000 — giữ theo phiếu)
                        </p>
                    </div>

                    {/* Toggle Bật/Tắt thuế TNCN */}
                    <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-xs font-bold text-rose-700 uppercase block">Tính Thuế TNCN</label>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Tắt nếu công ty chưa/không tính thuế TNCN (giống WePayroll Aug 2026).
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormState(prev => ({ ...prev, ap_dung_thue_tncn: prev.ap_dung_thue_tncn === 'true' ? 'false' : 'true' }))}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                    formState.ap_dung_thue_tncn === 'true' ? 'bg-rose-500' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        formState.ap_dung_thue_tncn === 'true' ? 'translate-x-6' : 'translate-x-0.5'
                                    }`}
                                />
                            </button>
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