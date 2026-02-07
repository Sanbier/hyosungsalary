import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { formatVND } from '../utils/format';

interface SalaryDetailsProps {
  result: CalculationResult;
}

const Row = ({ label, value, highlight = false, isBold = false }: { label: string, value: string | number, highlight?: boolean, isBold?: boolean }) => (
  <div className="flex justify-between items-center py-1 border-b border-dashed border-gray-100 last:border-0">
    <span className="text-gray-500 font-medium text-xs">{label}</span>
    <span className={`text-sm ${highlight ? 'text-indigo-600' : 'text-gray-700'} ${isBold ? 'font-bold' : 'font-semibold'}`}>
      {value}
    </span>
  </div>
);

const DetailCard = ({ title, colorClass, children, onClose }: any) => (
    // Changed: Positioned above the tabs (bottom + padding), aligned left
    <div className="absolute bottom-[calc(100%+1rem)] left-0 w-[85vw] md:w-80 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl animate-fade-in-scale origin-bottom-left overflow-hidden z-50">
        <div className={`px-4 py-3 ${colorClass} bg-opacity-10 border-b border-gray-100 flex justify-between items-center`}>
            <h3 className={`font-bold text-sm ${colorClass.replace('bg-', 'text-')}`}>{title}</h3>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-4 space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {children}
        </div>
    </div>
);

const SalaryDetails: React.FC<SalaryDetailsProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const toggleTab = (id: string) => {
    setActiveTab(prev => prev === id ? null : id);
  };

  const tabs = [
    {
        id: 'basic',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" /></svg>,
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Cơ Bản',
        content: (
            <>
                <Row label="Lương Cơ Bản" value={formatVND(result.ttcb.luongCoBan)} highlight />
                <Row label="Ngày Làm Thực Tế" value={`${result.ttcb.ngayLamThucTe} ngày`} />
                <Row label="Số Giờ Làm Việc" value={`${result.ttcb.soGioLamViec} giờ`} />
                <div className="h-px bg-gray-200 my-2"></div>
                <Row label="Tiền 1 Giờ Làm" value={formatVND(result.ttcb.tien1GioLam)} />
                <Row label="Tiền 1 Ngày Làm" value={formatVND(result.ttcb.tien1NgayLam)} />
                <div className="mt-2 pt-2 bg-blue-50/50 rounded-lg p-2 text-center">
                    <span className="text-xs text-blue-400 font-bold uppercase block">Lương Thực Tế</span>
                    <span className="text-blue-700 font-bold text-lg">{formatVND(result.ttcb.luongThucTe)}</span>
                </div>
            </>
        )
    },
    {
        id: 'overtime',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
        color: 'bg-amber-500',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        label: 'Tăng Ca',
        content: (
            <>
                <Row label="Lương Tính Tăng Ca" value={formatVND(result.tc.luongTinhTangCa)} highlight />
                <Row label="Lương 1 Giờ (TC)" value={formatVND(result.tc.tien1GioTCBase)} />
                
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1">Theo hệ số</h4>
                <Row label="Thường (1.5)" value={formatVND(result.tc.tienTCThuong)} />
                <Row label="Ngày Nghỉ (2.0)" value={formatVND(result.tc.tienTCNghi)} />
                <Row label="Ngày Lễ (3.0)" value={formatVND(result.tc.tienTCLe)} />
                
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1">Phụ cấp Ca Đêm</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Row label="30%" value={formatVND(result.tc.tienCD30)} />
                  <Row label="50%" value={formatVND(result.tc.tienCD50)} />
                  <Row label="70%" value={formatVND(result.tc.tienCD70)} />
                  <Row label="90%" value={formatVND(result.tc.tienCD90)} />
                </div>
                 <div className="mt-2 pt-2 bg-amber-50/50 rounded-lg p-2 text-center">
                    <span className="text-xs text-amber-500 font-bold uppercase block">Tổng Tăng Ca</span>
                    <span className="text-amber-700 font-bold text-lg">{formatVND(result.tc.tongTienTangCa)}</span>
                </div>
            </>
        )
    },
    {
        id: 'allowance',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        label: 'Phụ Cấp',
        content: (
            <>
                <Row label="PC Trình Độ" value={formatVND(result.pc.pcTrinhDoCongThuc)} />
                <Row label="PC Trách Nhiệm" value={formatVND(result.pc.pcTrachNhiem)} />
                <Row label="PC Thâm Niên" value={formatVND(result.pc.pcThamNien)} />
                <Row label="PC Tay Nghề" value={formatVND(result.pc.pcTayNghe)} />
                <Row label="PC Chuyên Cần" value={formatVND(result.pc.pcChuyenCan)} highlight />
                <Row label="Hỗ Trợ Đi Lại" value={formatVND(result.pc.pcDiLai)} />
                <Row label="Tiền Thưởng" value={formatVND(result.pc.pcThuong)} />
                <div className="mt-2 pt-2 bg-emerald-50/50 rounded-lg p-2 text-center">
                    <span className="text-xs text-emerald-500 font-bold uppercase block">Tổng Phụ Cấp</span>
                    <span className="text-emerald-700 font-bold text-lg">{formatVND(result.pc.tongPhuCap)}</span>
                </div>
            </>
        )
    },
    {
        id: 'deduction',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
        color: 'bg-rose-500',
        textColor: 'text-rose-600',
        bgColor: 'bg-rose-50',
        label: 'Khấu Trừ',
        content: (
            <>
                <div className="text-[10px] text-gray-400 italic mb-1.5 text-center">BH tính trên: {formatVND(result.kt.luongTinhBH)}</div>
                <Row label="BHYT (1.5%)" value={formatVND(result.kt.bhyt)} />
                <Row label="BHTN (1%)" value={formatVND(result.kt.bhtn)} />
                <Row label="BHXH (8%)" value={formatVND(result.kt.bhxh)} />
                <div className="h-px bg-gray-200 my-2"></div>
                <Row label="Phí Công Đoàn" value={formatVND(result.kt.phiCongDoan)} />
                <Row label="Tiền Tiết Kiệm" value={formatVND(result.kt.tienTietKiem)} />
                <Row label="Tiền Từ Thiện" value={formatVND(result.kt.tienTuThien)} />
                <div className="mt-2 pt-2 bg-rose-50/50 rounded-lg p-2 text-center">
                    <span className="text-xs text-rose-500 font-bold uppercase block">Tổng Khấu Trừ</span>
                    <span className="text-rose-700 font-bold text-lg">{formatVND(result.kt.tongKhauTru)}</span>
                </div>
            </>
        )
    }
  ];

  return (
    // Changed: left-4 (or left-6), flex-row to layout horizontally
    <div className="fixed z-40 left-4 md:left-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-row gap-3 items-end pointer-events-none">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
                <div key={tab.id} className="relative pointer-events-auto flex flex-col items-center group">
                    
                    {/* Content Slide-up Card */}
                    {isActive && (
                        <DetailCard 
                            title={tab.label} 
                            colorClass={tab.bgColor} 
                            onClose={() => setActiveTab(null)}
                        >
                            {tab.content}
                        </DetailCard>
                    )}

                    {/* Tab Button */}
                    <button
                        onClick={() => toggleTab(tab.id)}
                        className={`
                            relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                            ${isActive 
                                ? `${tab.color} text-white scale-110 shadow-${tab.color}/50` 
                                : 'bg-white/80 backdrop-blur-md text-gray-500 hover:bg-white border border-white/60 hover:scale-105'
                            }
                        `}
                    >
                        {tab.icon}
                    </button>

                    {/* Label tooltip (above button) - Only visible when NOT active */}
                    {!isActive && (
                        <span className="absolute bottom-full mb-2 bg-gray-800/80 backdrop-blur text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {tab.label}
                        </span>
                    )}
                </div>
            );
        })}
    </div>
  );
};

export default SalaryDetails;