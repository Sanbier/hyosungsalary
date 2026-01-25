import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_INPUTS, PC_HE_SO_TRINH_DO, NGAY_CHUAN } from './constants';
import { SalaryInputs, CalculationResult } from './types';
import { calculateSalary } from './utils/salaryCalculator';
import { formatVND } from './utils/format';
import GlassCard from './components/GlassCard';
import InputGroup from './components/InputGroup';
import TimesheetModal from './components/TimesheetModal';
import TimeCalculatorModal from './components/TimeCalculatorModal';
import PresetManager from './components/PresetManager';
import FloatingResult from './components/FloatingResult';
import SalaryDetails from './components/SalaryDetails';

function App() {
  const [inputs, setInputs] = useState<SalaryInputs>(DEFAULT_INPUTS);
  const [isTimesheetModalOpen, setTimesheetModalOpen] = useState(false);
  const [isTimeModalOpen, setTimeModalOpen] = useState(false);

  // Calculate salary whenever inputs change
  const result: CalculationResult = useMemo(() => calculateSalary(inputs), [inputs]);

  // Effect: Auto-calculate "Lương Tính Tăng Ca"
  useEffect(() => {
    const pcTrinhDoChuan = PC_HE_SO_TRINH_DO * NGAY_CHUAN;
    const newLuongTinhTangCa = Math.round(inputs.luong_co_ban + inputs.pc_tham_nien + inputs.pc_trach_nhiem + pcTrinhDoChuan);
    
    if (newLuongTinhTangCa !== inputs.luong_tinh_tang_ca) {
        setInputs(prev => ({
            ...prev,
            luong_tinh_tang_ca: newLuongTinhTangCa
        }));
    }
  }, [inputs.luong_co_ban, inputs.pc_tham_nien, inputs.pc_trach_nhiem, inputs.luong_tinh_tang_ca]);

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
              {/* Very Compact Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputGroup id="luong_co_ban" label="Lương Cơ Bản" value={inputs.luong_co_ban} onChange={handleInputChange} currency />
                
                <InputGroup 
                    id="luong_tinh_tang_ca" 
                    label="Lương T.Tăng Ca" 
                    value={inputs.luong_tinh_tang_ca} 
                    onChange={handleInputChange}
                    currency
                    disabled
                />
                
                <InputGroup 
                  id="ngay_di_lam" 
                  label="Ngày Công" 
                  value={inputs.ngay_di_lam} 
                  onChange={handleInputChange} 
                  disabled
                />
                
                <InputGroup id="pc_chuyen_can" label="Chuyên Cần" value={inputs.pc_chuyen_can} onChange={handleInputChange} currency />
                
                <InputGroup id="pc_trach_nhiem" label="Trách Nhiệm" value={inputs.pc_trach_nhiem} onChange={handleInputChange} currency />
                <InputGroup id="pc_tham_nien" label="Thâm Niên" value={inputs.pc_tham_nien} onChange={handleInputChange} currency />
                
                <InputGroup id="pc_tay_nghe" label="Tay Nghề" value={inputs.pc_tay_nghe} onChange={handleInputChange} currency />
              </div>

               {/* Mini Data Display for Timesheet - Compact Version */}
               <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {/* TC Thường */}
                    <div className="flex-shrink-0 bg-blue-50/50 px-2 py-1.5 rounded-md border border-blue-100 min-w-[60px]">
                      <p className="text-[9px] text-blue-500 font-bold uppercase leading-none mb-0.5">TC Thường</p>
                      <p className="text-xs font-semibold text-blue-900">{inputs.tc_thuong}h</p>
                    </div>
                    
                    {/* TC Nghỉ */}
                    <div className="flex-shrink-0 bg-indigo-50/50 px-2 py-1.5 rounded-md border border-indigo-100 min-w-[60px]">
                      <p className="text-[9px] text-indigo-500 font-bold uppercase leading-none mb-0.5">TC Nghỉ</p>
                      <p className="text-xs font-semibold text-indigo-900">{inputs.tc_nghi}h</p>
                    </div>

                    {/* TC Lễ */}
                     <div className="flex-shrink-0 bg-purple-50/50 px-2 py-1.5 rounded-md border border-purple-100 min-w-[60px]">
                      <p className="text-[9px] text-purple-500 font-bold uppercase leading-none mb-0.5">TC Lễ</p>
                      <p className="text-xs font-semibold text-purple-900">{inputs.tc_le}h</p>
                    </div>

                    {/* Tổng PC Ca Đêm */}
                    <div className="flex-shrink-0 bg-red-50/50 px-2 py-1.5 rounded-md border border-red-100 min-w-[70px]">
                      <p className="text-[9px] text-red-500 font-bold uppercase leading-none mb-0.5">Ca Đêm</p>
                      <p className="text-xs font-semibold text-red-900">{inputs.cd_30 + inputs.cd_50 + inputs.cd_70 + inputs.cd_90}h</p>
                    </div>
                  </div>
               </div>
            </GlassCard>

             {/* Compact Summary Cards Mobile */}
             <div className="grid grid-cols-2 gap-2 lg:hidden">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 text-white shadow-lg shadow-indigo-500/20">
                  <p className="text-[10px] font-medium text-indigo-100 uppercase tracking-wider">Thực Lãnh</p>
                  <p className="text-lg font-bold mt-0.5 truncate">{formatVND(result.thucLanh)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng Thu Nhập</p>
                  <p className="text-base font-bold text-gray-800 mt-0.5 truncate">{formatVND(result.tongThuNhap)}</p>
                </div>
             </div>
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

    </div>
  );
}

export default App;