import React, { useState, useMemo } from 'react';
import { DEFAULT_INPUTS, DEFAULT_CONFIG } from './constants';
import { SalaryInputs, CalculationResult, SalaryConfig } from './types';
import { calculateSalary } from './utils/salaryCalculator';
import { formatVND } from './utils/format';
import GlassCard from './components/GlassCard';
import InputGroup from './components/InputGroup';
import TimesheetModal from './components/TimesheetModal';
import TimeCalculatorModal from './components/TimeCalculatorModal';
import SettingsModal from './components/SettingsModal';
import PresetManager from './components/PresetManager';
import FloatingResult from './components/FloatingResult';
import SalaryDetails from './components/SalaryDetails';

function App() {
  const [inputs, setInputs] = useState<SalaryInputs>(DEFAULT_INPUTS);

  // Config state initialized from localStorage or defaults
  const [config, setConfig] = useState<SalaryConfig>(() => {
    const saved = localStorage.getItem('salaryConfig');
    // Merge with defaults so new config keys (thuế TNCN) có giá trị mặc định
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...DEFAULT_CONFIG, ...parsed };
  });

  const [isTimesheetModalOpen, setTimesheetModalOpen] = useState(false);
  const [isTimeModalOpen, setTimeModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Calculate salary whenever inputs or config change
  const result: CalculationResult = useMemo(() => calculateSalary(inputs, config), [inputs, config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };

  const updateFromTimesheet = (data: Partial<SalaryInputs>) => {
    setInputs(prev => ({ ...prev, ...data }));
  };

  const handleLoadPreset = (data: SalaryInputs, name: string) => {
    setInputs(data);
  };

  const handleSaveConfig = (newConfig: SalaryConfig) => {
    setConfig(newConfig);
    localStorage.setItem('salaryConfig', JSON.stringify(newConfig));
  };

  return (
    // OUTER WRAPPER: Handles Desktop Centering & Background
    <div className="w-full min-h-[100dvh] md:flex md:items-center md:justify-center md:bg-gray-100 md:py-10">

      {/* PHONE SIMULATOR FRAME (iPhone 15 Pro Max: 430x932) */}
      <div className="relative w-full h-[100dvh] md:w-[430px] md:h-[932px] md:max-h-[95vh] md:bg-[#F3F4F6] md:rounded-[55px] md:border-[12px] md:border-[#1a1a1a] md:shadow-2xl overflow-hidden bg-transparent">

        {/* Dynamic Island (Desktop Only Decoration) */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[35px] bg-black rounded-b-[22px] z-[60] pointer-events-none"></div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative">
            <div className="relative min-h-full px-3 pb-[8rem] pt-[calc(env(safe-area-inset-top)+1.25rem)] md:pt-14 font-sans">
                <div className="space-y-3">

                    {/* Compact Header */}
                    <div className="flex flex-row items-center justify-between gap-2 py-1">
                    <div>
                        <h1 className="text-2xl font-lobster text-indigo-900 drop-shadow-sm tracking-wide">
                        Hyosung <span className="text-indigo-500">Salary</span>
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                        onClick={() => setTimeModalOpen(true)}
                        className="px-3 py-1.5 bg-white/60 hover:bg-white border border-white/50 text-indigo-600 rounded-full shadow-sm text-xs font-bold transition-all backdrop-blur-md hover:shadow-md flex items-center gap-1.5"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Tính Giờ
                        </button>
                        <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-1.5 bg-white/60 hover:bg-white border border-white/50 text-slate-500 hover:text-indigo-600 rounded-full shadow-sm transition-all backdrop-blur-md hover:shadow-md"
                        title="Cài đặt thông số"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        </button>
                    </div>
                    </div>

                    <PresetManager currentData={inputs} onLoadPreset={handleLoadPreset} />

                    {/* MAIN CONTENT */}
                    <div className="space-y-3">
                        <GlassCard
                        title="Thông Tin Đầu Vào"
                        action={
                            <button
                            onClick={() => setTimesheetModalOpen(true)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-1"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Nhập Công
                            </button>
                        }
                        >
                        {/* Compact Grid: 2 cols on mobile */}
                        <div className="grid grid-cols-2 gap-2">
                            <InputGroup id="luong_co_ban" label="Lương Cơ Bản" value={inputs.luong_co_ban} onChange={handleInputChange} currency className="mb-0" />

                            <InputGroup
                                id="luong_tinh_tang_ca"
                                label="Lương T.Tăng Ca"
                                value={result.tc.luongTinhTangCa}
                                onChange={handleInputChange}
                                currency
                                disabled
                                className="mb-0"
                            />

                            <InputGroup
                            id="ngay_di_lam"
                            label="Ngày Công"
                            value={inputs.ngay_di_lam}
                            onChange={handleInputChange}
                            disabled
                            className="mb-0"
                            />

                            <InputGroup id="pc_chuyen_can" label="Chuyên Cần" value={inputs.pc_chuyen_can} onChange={handleInputChange} currency className="mb-0" />

                            <InputGroup id="pc_trach_nhiem" label="Chức Danh" value={inputs.pc_trach_nhiem} onChange={handleInputChange} currency className="mb-0" />

                            <InputGroup id="pc_tham_nien" label="Thâm Niên" value={inputs.pc_tham_nien} onChange={handleInputChange} currency className="mb-0" />

                            <InputGroup id="pc_tay_nghe" label="Tay Nghề" value={inputs.pc_tay_nghe} onChange={handleInputChange} currency className="mb-0" />

                            <InputGroup id="pc_nuoi_con_nho" label="Nuôi Con Nhỏ" value={inputs.pc_nuoi_con_nho} onChange={handleInputChange} currency className="mb-0" />

                            <InputGroup id="so_nguoi_phu_thuoc" label="NPT" value={inputs.so_nguoi_phu_thuoc} onChange={handleInputChange} className="mb-0" />
                        </div>

                        {/* Mini Data Display */}
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                {/* TC Thường */}
                                <div className="flex-shrink-0 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100 min-w-[50px] text-center">
                                <p className="text-[8px] text-blue-500 font-bold uppercase leading-none mb-0.5">Thường</p>
                                <p className="text-[10px] font-bold text-blue-900">{inputs.tc_thuong}</p>
                                </div>

                                {/* TC CN (Chủ nhật) */}
                                <div className="flex-shrink-0 bg-indigo-50/50 px-2 py-1 rounded-md border border-indigo-100 min-w-[50px] text-center">
                                <p className="text-[8px] text-indigo-500 font-bold uppercase leading-none mb-0.5">CN</p>
                                <p className="text-[10px] font-bold text-indigo-900">{inputs.tc_nghi}</p>
                                </div>

                                {/* TC Lễ */}
                                <div className="flex-shrink-0 bg-purple-50/50 px-2 py-1 rounded-md border border-purple-100 min-w-[50px] text-center">
                                <p className="text-[8px] text-purple-500 font-bold uppercase leading-none mb-0.5">Lễ</p>
                                <p className="text-[10px] font-bold text-purple-900">{inputs.tc_le}</p>
                                </div>

                                {/* Tổng PC Ca Đêm */}
                                <div className="flex-shrink-0 bg-red-50/50 px-2 py-1 rounded-md border border-red-100 min-w-[60px] text-center">
                                <p className="text-[8px] text-red-500 font-bold uppercase leading-none mb-0.5">Ca Đêm</p>
                                <p className="text-[10px] font-bold text-red-900">{inputs.cd_30 + inputs.cd_50 + inputs.cd_70 + inputs.cd_90}</p>
                                </div>
                            </div>
                        </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>

        {/* FLOATING ELEMENTS (Absolute relative to the Frame) */}
        <FloatingResult value={result.thucLanh} />
        <SalaryDetails result={result} />

        {/* Modals - These can overlap the whole frame */}
        <TimesheetModal
            isOpen={isTimesheetModalOpen}
            onClose={() => setTimesheetModalOpen(false)}
            currentData={inputs}
            onApply={updateFromTimesheet}
        />

        <TimeCalculatorModal
            isOpen={isTimeModalOpen}
            onClose={() => setTimeModalOpen(false)}
        />

        <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setSettingsOpen(false)}
            config={config}
            onSave={handleSaveConfig}
        />

      </div>
    </div>
  );
}

export default App;