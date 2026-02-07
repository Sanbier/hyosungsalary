import React, { useState, useEffect, useMemo } from 'react';
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
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [isTimesheetModalOpen, setTimesheetModalOpen] = useState(false);
  const [isTimeModalOpen, setTimeModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Calculate salary whenever inputs or config change
  const result: CalculationResult = useMemo(() => calculateSalary(inputs, config), [inputs, config]);

  // Effect: Auto-calculate "Lương Tính Tăng Ca"
  useEffect(() => {
    const pcTrinhDoChuan = config.pc_he_so_trinh_do * config.ngay_chuan;
    const newLuongTinhTangCa = Math.round(inputs.luong_co_ban + inputs.pc_tham_nien + inputs.pc_trach_nhiem + pcTrinhDoChuan);
    
    if (newLuongTinhTangCa !== inputs.luong_tinh_tang_ca) {
        setInputs(prev => ({
            ...prev,
            luong_tinh_tang_ca: newLuongTinhTangCa
        }));
    }
  }, [inputs.luong_co_ban, inputs.pc_tham_nien, inputs.pc_trach_nhiem, inputs.luong_tinh_tang_ca, config]);

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
    <div className="relative min-h-[100dvh] w-full px-3 md:px-6 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+1.25rem)] md:pt-8 font-sans">
      
      <div className="max-w-5xl mx-auto space-y-3 md:space-y-6">
        
        {/* Compact Header */}
        <div className="flex flex-row items-center justify-between gap-2 py-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-lobster text-indigo-900 drop-shadow-sm tracking-wide">
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

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6">
          
          {/* LEFT COLUMN: INPUTS (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
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
              {/* Compact Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <InputGroup id="luong_co_ban" label="Lương Cơ Bản" value={inputs.luong_co_ban} onChange={handleInputChange} currency className="mb-0" />
                
                <InputGroup 
                    id="luong_tinh_tang_ca" 
                    label="Lương T.Tăng Ca" 
                    value={inputs.luong_tinh_tang_ca} 
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
                
                <InputGroup id="pc_trach_nhiem" label="Trách Nhiệm" value={inputs.pc_trach_nhiem} onChange={handleInputChange} currency className="mb-0" />
                <InputGroup id="pc_tham_nien" label="Thâm Niên" value={inputs.pc_tham_nien} onChange={handleInputChange} currency className="mb-0" />
                
                <InputGroup id="pc_tay_nghe" label="Tay Nghề" value={inputs.pc_tay_nghe} onChange={handleInputChange} currency className="mb-0" />
              </div>

               {/* Mini Data Display for Timesheet - Extra Compact Version */}
               <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {/* TC Thường */}
                    <div className="flex-shrink-0 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100 min-w-[50px] text-center">
                      <p className="text-[8px] text-blue-500 font-bold uppercase leading-none mb-0.5">Thường</p>
                      <p className="text-[10px] font-bold text-blue-900">{inputs.tc_thuong}</p>
                    </div>
                    
                    {/* TC Nghỉ */}
                    <div className="flex-shrink-0 bg-indigo-50/50 px-2 py-1 rounded-md border border-indigo-100 min-w-[50px] text-center">
                      <p className="text-[8px] text-indigo-500 font-bold uppercase leading-none mb-0.5">Nghỉ</p>
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

          {/* RIGHT COLUMN: RESULTS & DETAILS (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            
            {/* Desktop Sticky Summary */}
            <div className="hidden lg:block sticky top-6 z-20">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-3xl p-8 text-white shadow-2xl shadow-indigo-900/20">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                       <div>
                         <p className="text-indigo-200 text-sm font-medium">Lương Thực Lãnh</p>
                         <h2 className="text-4xl font-black mt-2 tracking-tight">{formatVND(result.thucLanh)}</h2>
                       </div>
                       <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-xl">💰</span>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                        <span className="text-indigo-200">Tổng Thu Nhập</span>
                        <span className="font-semibold">{formatVND(result.tongThuNhap)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-indigo-200">Tổng Khấu Trừ</span>
                        <span className="font-semibold text-red-300">-{formatVND(result.kt.tongKhauTru)}</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <SalaryDetails result={result} />
          </div>
        </div>
      </div>

      {/* Floating Result Bubble (Mobile Only) */}
      <div className="lg:hidden">
        <FloatingResult value={result.thucLanh} />
      </div>

      {/* Modals */}
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
  );
}

export default App;