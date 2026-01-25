import React, { useState, useRef, useEffect } from 'react';

interface TimeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScheduleRow {
  roll: number;
  start: string;
  end: string;
}

const TimeCalculatorModal: React.FC<TimeCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [startTime, setStartTime] = useState('');
  const [runTime, setRunTime] = useState('');
  const [numRolls, setNumRolls] = useState<number | ''>('');
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Ref for auto-scrolling to results
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (schedule.length > 0 && resultRef.current) {
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }
  }, [schedule]);

  if (!isOpen) return null;

  const parseTime = (input: string) => {
    input = input.trim().toLowerCase().replace(/[h\s]/g, ':');
    if (/^\d{1,2}:\d{1,2}$/.test(input)) {
      let [h, m] = input.split(':').map(Number);
      return h * 60 + (m || 0);
    }
    if (/^\d{3,4}$/.test(input)) {
      let h = Math.floor(parseInt(input) / 100), m = parseInt(input) % 100;
      return h * 60 + m;
    }
    let n = parseInt(input);
    return isNaN(n) ? 0 : n;
  };

  const formatMinutesToTime = (total: number) => {
    const t = total % (24 * 60); 
    const h = Math.floor(t / 60), m = t % 60; 
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setError('');
    setSchedule([]);

    setTimeout(() => {
        const startMin = parseTime(startTime);
        const runMin = parseTime(runTime);
        const rolls = typeof numRolls === 'number' ? numRolls : 0;

        if (!startTime || !runTime || rolls <= 0 || runMin <= 0) {
            setError('Thiếu thông tin.');
            setIsCalculating(false);
            return;
        }

        let total = startMin;
        const newSchedule: ScheduleRow[] = [];

        for (let i = 1; i <= rolls; i++) {
            const st = formatMinutesToTime(total);
            const et = formatMinutesToTime(total + runMin);
            newSchedule.push({ roll: i, start: st, end: et });
            total += runMin;
        }

        setSchedule(newSchedule);
        setIsCalculating(false);
    }, 200);
  };

  const handleReset = () => {
    setStartTime('');
    setRunTime('');
    setNumRolls('');
    setSchedule([]);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] transition-opacity" aria-hidden="true"></div>

      {/* Main Card - Centered & Rounded All Sides & GPU Accelerated */}
      <div 
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-scale transform-gpu"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 flex justify-between items-center shrink-0 z-10 relative shadow-lg shadow-indigo-500/20">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs shadow-inner">⏱️</span> 
                Tính Lịch Máy
            </h2>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleReset} 
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    title="Làm mới"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
                <button 
                    onClick={onClose} 
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    title="Đóng"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 bg-slate-50 custom-scrollbar">
            
            {/* Input Section - Gradient Borders */}
            <div className="bg-white rounded-xl shadow-sm border border-indigo-50 p-3 mb-3 relative overflow-hidden">
                {/* Decorative background blob */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                <div className="grid grid-cols-3 gap-2 mb-3 relative z-10">
                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-indigo-400 block text-center">Bắt đầu</label>
                        <input 
                            type="text" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="07:30"
                            className="w-full text-center py-1.5 bg-indigo-50/30 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-indigo-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-indigo-400 block text-center">Phút/Roll</label>
                        <input 
                            type="tel" 
                            value={runTime}
                            onChange={(e) => setRunTime(e.target.value)}
                            placeholder="75"
                            className="w-full text-center py-1.5 bg-indigo-50/30 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-indigo-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-indigo-400 block text-center">Số Roll</label>
                        <input 
                            type="tel" 
                            value={numRolls}
                            onChange={(e) => setNumRolls(e.target.value === '' ? '' : parseInt(e.target.value))}
                            placeholder="SL"
                            className="w-full text-center py-1.5 bg-indigo-50/30 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-indigo-200"
                        />
                    </div>
                </div>

                {error && <p className="text-center text-rose-500 text-[10px] font-bold mb-2 bg-rose-50 py-1 rounded-md border border-rose-100">{error}</p>}

                <button 
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white text-xs font-bold py-2.5 rounded-lg shadow-md shadow-indigo-500/30 transition-all flex items-center justify-center gap-1.5 relative overflow-hidden"
                >
                    {isCalculating ? (
                        'Đang tính...'
                    ) : (
                        <>
                            <span>XEM LỊCH TRÌNH</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            {/* RESULTS: Vertical Compact List */}
            <div ref={resultRef}>
            {schedule.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
                    {/* Header Row */}
                    <div className="bg-slate-50/80 backdrop-blur px-3 py-2 border-b border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                        <div className="w-8 text-center">Roll</div>
                        <div className="flex-1 text-center">Bắt đầu</div>
                        <div className="w-4"></div>
                        <div className="flex-1 text-center">Kết thúc</div>
                    </div>
                    
                    {/* Data Rows */}
                    <div className="divide-y divide-slate-100/50">
                        {schedule.map((row, idx) => (
                            <div 
                                key={row.roll} 
                                className={`px-3 py-2 flex items-center justify-between transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                            >
                                {/* Index - Gradient Badge */}
                                <div className="w-8 flex justify-center">
                                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-indigo-200 border border-white">
                                        {row.roll}
                                    </span>
                                </div>
                                {/* Start Time */}
                                <div className="flex-1 text-center font-medium text-slate-500 text-sm tabular-nums">
                                    {row.start}
                                </div>
                                {/* Gradient Arrow */}
                                <div className="w-4 flex justify-center text-slate-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-indigo-300">
                                        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                {/* End Time - Gradient Text */}
                                <div className="flex-1 text-center font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-sm tabular-nums">
                                    {row.end}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Footer Row */}
                    <div className="px-3 py-2 bg-indigo-50/30 border-t border-indigo-100 text-center">
                         <span className="text-[10px] text-indigo-400">Kết thúc lúc <strong className="text-indigo-700">{schedule[schedule.length-1].end}</strong></span>
                    </div>
                </div>
            ) : (
                 !isCalculating && !error && (
                    <div className="text-center py-8 opacity-60 flex flex-col items-center">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                             <span className="text-xl">📅</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500">Nhập thời gian để xem lịch</p>
                    </div>
                 )
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCalculatorModal;