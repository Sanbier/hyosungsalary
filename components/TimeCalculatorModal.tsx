import React, { useState, useRef, useEffect } from 'react';

interface TimeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScheduleRow {
  roll: number;
  start: string;
  end: string;
  setupEnd?: string;
  startMinTotal: number;
  endMinTotal: number;
  setupEndMinTotal: number;
  startDayOffset: number;
  endDayOffset: number;
}

const TimeCalculatorModal: React.FC<TimeCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [startTime, setStartTime] = useState('');
  const [runTime, setRunTime] = useState('');
  const [setupTime, setSetupTime] = useState('');
  const [numRolls, setNumRolls] = useState<number | ''>('');
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // Ref for auto-scrolling to results
  const resultRef = useRef<HTMLDivElement>(null);

  // Live timer update
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (schedule.length > 0 && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [schedule]);

  if (!isOpen) return null;

  const parseTime = (input: string) => {
    if (!input) return 0;
    input = input.trim().toLowerCase().replace(/[h\s]/g, ':');
    if (/^\d{1,2}:\d{1,2}$/.test(input)) {
      let [h, m] = input.split(':').map(Number);
      return (h % 24) * 60 + (m || 0);
    }
    if (/^\d{3,4}$/.test(input)) {
      let h = Math.floor(parseInt(input) / 100);
      let m = parseInt(input) % 100;
      return (h % 24) * 60 + m;
    }
    let n = parseInt(input);
    return isNaN(n) ? 0 : n;
  };

  const formatMinutesToTime = (totalMin: number) => {
    const dayOffset = Math.floor(totalMin / (24 * 60));
    const t = ((totalMin % (24 * 60)) + (24 * 60)) % (24 * 60);
    const h = Math.floor(t / 60);
    const m = t % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return { timeStr, dayOffset };
  };

  const handleSetNow = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    setStartTime(`${h}:${m}`);
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setError('');
    setSchedule([]);

    setTimeout(() => {
      const startMin = parseTime(startTime);
      const runMin = parseTime(runTime);
      const setupMin = parseTime(setupTime);
      const rolls = typeof numRolls === 'number' ? numRolls : 0;

      if (!startTime || rolls <= 0 || runMin <= 0) {
        setError('Nhập đủ Giờ Bắt Đầu, Phút/Roll & Số Roll.');
        setIsCalculating(false);
        return;
      }

      let currentTotal = startMin;
      const newSchedule: ScheduleRow[] = [];

      for (let i = 1; i <= rolls; i++) {
        const startMinTotal = currentTotal;
        const endMinTotal = startMinTotal + runMin;
        const setupEndMinTotal = endMinTotal + setupMin;

        const { timeStr: start, dayOffset: startDayOffset } = formatMinutesToTime(startMinTotal);
        const { timeStr: end, dayOffset: endDayOffset } = formatMinutesToTime(endMinTotal);
        const { timeStr: setupEnd } = formatMinutesToTime(setupEndMinTotal);

        newSchedule.push({
          roll: i,
          start,
          end,
          setupEnd: setupMin > 0 ? setupEnd : undefined,
          startMinTotal,
          endMinTotal,
          setupEndMinTotal,
          startDayOffset,
          endDayOffset,
        });

        currentTotal = setupEndMinTotal;
      }

      setSchedule(newSchedule);
      setIsCalculating(false);
    }, 150);
  };

  const handleReset = () => {
    setStartTime('');
    setRunTime('');
    setSetupTime('');
    setNumRolls('');
    setSchedule([]);
    setError('');
  };

  const handleCopySchedule = () => {
    if (schedule.length === 0) return;
    const last = schedule[schedule.length - 1];
    let text = `⏱️ LỊCH CHẠY ROLL (${startTime} | ${runTime}p/roll${setupTime ? ` | thay cuộn ${setupTime}p` : ''})\n`;
    schedule.forEach(r => {
      const daySuffix = r.endDayOffset > 0 ? ` (+${r.endDayOffset} ngày)` : '';
      const setupText = r.setupEnd ? ` ➔ [Thay cuộn đến ${r.setupEnd}]` : '';
      text += `Roll ${r.roll}: ${r.start} ➔ ${r.end}${daySuffix}${setupText}\n`;
    });
    text += `🏁 Kết thúc ca: ${last.end}${last.endDayOffset > 0 ? ` (+${last.endDayOffset} ngày)` : ''}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Live status badge calculation
  let liveStatusText = '';
  if (schedule.length > 0) {
    const currentRoll = schedule.find(
      r => nowMinutes >= (r.startMinTotal % 1440) && nowMinutes < (r.endMinTotal % 1440)
    );
    if (currentRoll) {
      const remain = (currentRoll.endMinTotal % 1440) - nowMinutes;
      liveStatusText = `⚡ Đang chạy Roll ${currentRoll.roll} (Còn ${remain} phút ➔ Xong ${currentRoll.end})`;
    } else {
      const setupRoll = schedule.find(
        r => r.setupEndMinTotal && nowMinutes >= (r.endMinTotal % 1440) && nowMinutes < (r.setupEndMinTotal % 1440)
      );
      if (setupRoll) {
        const remain = (setupRoll.setupEndMinTotal % 1440) - nowMinutes;
        liveStatusText = `🔄 Đang thay cuộn ${setupRoll.roll} ➔ ${setupRoll.roll + 1} (Còn ${remain} phút)`;
      }
    }
  }

  // Summary stats
  const totalRunMinutes = schedule.length * parseTime(runTime);
  const totalSetupMinutes = schedule.length * parseTime(setupTime);
  const totalShiftMinutes = totalRunMinutes + totalSetupMinutes;
  const totalHours = Math.floor(totalShiftMinutes / 60);
  const remainMins = totalShiftMinutes % 60;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] transition-opacity" aria-hidden="true"></div>

      {/* Main Card */}
      <div 
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-fade-in-scale transform-gpu"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 flex justify-between items-center shrink-0 z-10 relative shadow-lg shadow-indigo-500/20">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs shadow-inner">⏱️</span> 
            Tính Giờ Vận Hành Roll
          </h2>
          <div className="flex items-center gap-1.5">
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
          
          {/* Preset Buttons */}
          <div className="flex items-center justify-between gap-1 mb-2.5">
            <button
              type="button"
              onClick={handleSetNow}
              className="flex-1 py-1 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
            >
              <span>🕒 Bắt đầu bây giờ</span>
            </button>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setStartTime('07:30')}
                className="py-1 px-2 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-lg text-[10px] font-bold transition-all"
              >
                07:30
              </button>
              <button
                type="button"
                onClick={() => setStartTime('15:30')}
                className="py-1 px-2 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-lg text-[10px] font-bold transition-all"
              >
                15:30
              </button>
              <button
                type="button"
                onClick={() => setStartTime('23:30')}
                className="py-1 px-2 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-lg text-[10px] font-bold transition-all"
              >
                23:30
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-50 p-3 mb-3 relative overflow-hidden">
            <div className="grid grid-cols-4 gap-2 mb-2.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-indigo-500 block text-center">Bắt Đầu</label>
                <input 
                  type="text" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="07:30"
                  className="w-full text-center py-1.5 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-indigo-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-indigo-500 block text-center">Phút/Roll</label>
                <input 
                  type="tel" 
                  value={runTime}
                  onChange={(e) => setRunTime(e.target.value)}
                  placeholder="75"
                  className="w-full text-center py-1.5 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-indigo-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-indigo-500 block text-center">Thay Cuộn</label>
                <input 
                  type="tel" 
                  value={setupTime}
                  onChange={(e) => setSetupTime(e.target.value)}
                  placeholder="0p"
                  className="w-full text-center py-1.5 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-indigo-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-indigo-500 block text-center">Số Roll</label>
                <input 
                  type="tel" 
                  value={numRolls}
                  onChange={(e) => setNumRolls(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="SL"
                  className="w-full text-center py-1.5 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-indigo-200"
                />
              </div>
            </div>

            {/* Quick RunTime options */}
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Nhanh:</span>
              {[45, 60, 75, 90, 120].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRunTime(m.toString())}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    runTime === m.toString()
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-indigo-50'
                  }`}
                >
                  {m}p
                </button>
              ))}
            </div>

            {error && (
              <p className="text-center text-rose-500 text-[10px] font-bold mb-2 bg-rose-50 py-1 rounded-md border border-rose-100">
                {error}
              </p>
            )}

            <button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white text-xs font-bold py-2.5 rounded-lg shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 relative overflow-hidden"
            >
              {isCalculating ? (
                'Đang tính...'
              ) : (
                <>
                  <span>XEM LỊCH TRÌNH ROLL</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Live Status Badge */}
          {liveStatusText && (
            <div className="mb-3 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-bold animate-pulse">
              <span>{liveStatusText}</span>
            </div>
          )}

          {/* RESULTS Section */}
          <div ref={resultRef}>
            {schedule.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
                {/* Header Row */}
                <div className="bg-slate-50/90 backdrop-blur px-3 py-2 border-b border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                  <div className="w-8 text-center">Roll</div>
                  <div className="flex-1 text-center">Bắt đầu ➔ Kết thúc</div>
                  <div className="w-16 text-right">Ghi chú</div>
                </div>
                
                {/* Data Rows */}
                <div className="divide-y divide-slate-100">
                  {schedule.map((row, idx) => (
                    <div 
                      key={row.roll} 
                      className={`px-3 py-2.5 flex items-center justify-between transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      {/* Badge Roll */}
                      <div className="w-8 flex justify-center">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm shadow-indigo-200 border border-white">
                          {row.roll}
                        </span>
                      </div>

                      {/* Time Range */}
                      <div className="flex-1 text-center font-bold text-slate-800 text-sm tabular-nums flex items-center justify-center gap-1.5">
                        <span className="text-slate-600">{row.start}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-indigo-400">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-indigo-600 font-extrabold">{row.end}</span>
                        {row.endDayOffset > 0 && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-bold">
                            +{row.endDayOffset}d
                          </span>
                        )}
                      </div>

                      {/* Setup Info */}
                      <div className="w-16 text-right text-[10px] font-semibold text-slate-400">
                        {row.setupEnd ? (
                          <span className="text-amber-600 font-bold block" title={`Thay cuộn đến ${row.setupEnd}`}>
                            🔄 {row.setupEnd}
                          </span>
                        ) : (
                          <span className="text-emerald-500">Chạy liên tục</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Footer */}
                <div className="px-3 py-2.5 bg-indigo-50/50 border-t border-indigo-100 flex items-center justify-between">
                  <div className="text-[10px] text-indigo-700 font-medium">
                    Tổng: <strong className="font-bold">{totalHours > 0 ? `${totalHours}h ` : ''}${remainMins}p</strong>
                    {' '}| K.Thúc: <strong className="text-indigo-900 font-bold">{schedule[schedule.length - 1].end}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySchedule}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
                  >
                    {copied ? (
                      <><span>✓ Đã chép</span></>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25c0-.621.504-1.125 1.125-1.125h6.75c.621 0 1.125.504 1.125 1.125v9.25c0 .621-.504 1.125-1.125 1.125Z" />
                        </svg>
                        <span>Sao Chép Lịch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              !isCalculating && !error && (
                <div className="text-center py-6 opacity-60 flex flex-col items-center">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-1.5">
                    <span className="text-lg">⏱️</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500">Nhập giờ để xem lịch trình các roll</p>
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