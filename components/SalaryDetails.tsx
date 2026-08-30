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

// DetailCard now renders as a block element (static position) to be stacked in the flex container
const DetailCard = ({ title, colorClass, children, onClose }: any) => (
    <div className="w-full mb-2 bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl animate-fade-in-up origin-bottom overflow-hidden pointer-events-auto ring-1 ring-black/5">
        <div className={`px-4 py-2.5 ${colorClass} bg-opacity-15 border-b border-gray-100 flex justify-between items-center`}>
            <h3 className={`font-bold text-xs ${colorClass.replace('bg-', 'text-').replace('50', '600')}`}>{title}</h3>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-gray-600 p-1 bg-white/50 rounded-full hover:bg-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-3 space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
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
        gradient: 'bg-gradient-to-br from-blue-500 to-cyan-400',
        shadow: 'shadow-blue-500/40',
        textColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        label: 'Cơ Bản',
        content: (
            <>
                <Row label="Lương Cơ Bản" value={formatVND(result.ttcb.luongCoBan)} highlight />
                <Row label="Ngày Làm Thực Tế" value={`${result.ttcb.ngayLamThucTe} ngày`} />
                <Row label="Ngày Phép Năm" value={`${result.ttcb.ngayCongTinhLuong - result.ttcb.ngayLamThucTe} ngày`} />
                <Row label="Ngày Công Tính Lương" value={`${result.ttcb.ngayCongTinhLuong} ngày`} />
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
        gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
        shadow: 'shadow-orange-500/40',
        textColor: 'text-amber-500',
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
        gradient: 'bg-gradient-to-br from-emerald-400 to-teal-500',
        shadow: 'shadow-emerald-500/40',
        textColor: 'text-emerald-500',
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
                <Row label="Nuôi Con Nhỏ" value={formatVND(result.pc.pcNuoiConNho)} />
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
        gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
        shadow: 'shadow-rose-500/40',
        textColor: 'text-rose-500',
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
                <div className="h-px bg-gray-200 my-2"></div>
                <Row label="Thuế TNCN" value={formatVND(result.thue.thueTNCN)} highlight />
                <Row label="└ TN chịu thuế" value={formatVND(result.thue.tongThuNhapChiuThue)} />
                <Row label="└ Miễn trừ bản thân" value={formatVND(result.thue.giamTruBanThan)} />
                <Row label="└ Giảm trừ NPT" value={formatVND(result.thue.giamTruNguoiPhuThuoc)} />
                <Row label="└ TN tính thuế" value={formatVND(result.thue.thuNhapTinhThue)} />
                <div className="mt-2 pt-2 bg-rose-50/50 rounded-lg p-2 text-center">
                    <span className="text-xs text-rose-500 font-bold uppercase block">Tổng Khấu Trừ</span>
                    <span className="text-rose-700 font-bold text-lg">{formatVND(result.kt.tongKhauTru + result.thue.thueTNCN)}</span>
                </div>
            </>
        )
    }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    // MAIN CONTAINER: 
    // - Fixed/Absolute relative to the phone frame.
    // - W-full & px-4 ensures it spans the full width of the phone but keeps padding.
    // - Flex-col-reverse: Buttons at bottom, Card stacks on top.
    <div className="absolute z-40 left-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] w-full px-4 flex flex-col justify-end items-start pointer-events-none gap-2">
        
        {/* 1. Detail Content Layer (Stacks above buttons) */}
        {activeTabData && (
            <DetailCard 
                title={activeTabData.label} 
                colorClass={activeTabData.bgColor} 
                onClose={() => setActiveTab(null)}
            >
                {activeTabData.content}
            </DetailCard>
        )}

        {/* 2. Buttons Layer */}
        {/* Changed gap-3 to gap-2 for closer spacing. Reduced button size for compactness. */}
        <div className="flex flex-row gap-2 pointer-events-auto">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <div key={tab.id} className="relative group">
                        <button
                            onClick={() => toggleTab(tab.id)}
                            className={`
                                relative w-10 h-10 p-2 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ease-out
                                ${isActive 
                                    ? `${tab.gradient} text-white scale-110 -translate-y-1 ${tab.shadow}` 
                                    : `bg-white/90 backdrop-blur-md ${tab.textColor} border border-white/60 hover:scale-105 hover:bg-white`
                                }
                            `}
                        >
                            {tab.icon}
                        </button>
                        
                        {/* Tooltip */}
                        {!isActive && !activeTab && (
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800/80 backdrop-blur text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {tab.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default SalaryDetails;