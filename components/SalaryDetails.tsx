import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { formatVND } from '../utils/format';

interface DetailSectionProps {
  title: string;
  icon: React.ReactNode;
  total?: string;
  totalLabel?: string;
  accentColor: string; 
  children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({ 
  title, 
  icon,
  total, 
  totalLabel, 
  accentColor, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const colors: Record<string, any> = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-500' },
  };

  const theme = colors[accentColor] || colors.blue;

  return (
    <div className="bg-white/40 border border-white/50 rounded-xl mb-2 overflow-hidden transition-all hover:bg-white/60">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-3 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center shadow-sm`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{title}</h3>
            {total && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                {totalLabel}: <span className={`font-bold ${theme.text}`}>{total}</span>
              </p>
            )}
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-gray-100 rotate-180' : 'bg-transparent text-gray-400 group-hover:bg-white'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-3 pb-3 pt-0">
          <div className={`p-3 rounded-lg ${theme.bg} bg-opacity-30 border border-white/40 space-y-1.5 text-xs md:text-sm`}>
             {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, highlight = false, isBold = false }: { label: string, value: string | number, highlight?: boolean, isBold?: boolean }) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className={`${highlight ? 'text-indigo-600' : 'text-gray-800'} ${isBold ? 'font-bold' : 'font-semibold'}`}>
      {value}
    </span>
  </div>
);

const Divider = () => <div className="h-px bg-gray-200/50 my-1.5"></div>;

interface SalaryDetailsProps {
  result: CalculationResult;
}

const SalaryDetails: React.FC<SalaryDetailsProps> = ({ result }) => {
  return (
    <div className="space-y-2">
      
      {/* SECTION 2: BASIC INFO */}
      <DetailSection 
        title="Thông Tin Cơ Bản"
        accentColor="blue"
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" /></svg>}
      >
        <Row label="Lương Cơ Bản" value={formatVND(result.ttcb.luongCoBan)} highlight />
        <Row label="Ngày Làm Thực Tế" value={`${result.ttcb.ngayLamThucTe} ngày`} />
        <Row label="Số Giờ Làm Việc" value={`${result.ttcb.soGioLamViec} giờ`} />
        <Divider />
        <Row label="Tiền 1 Giờ Làm" value={formatVND(result.ttcb.tien1GioLam)} />
        <Row label="Tiền 1 Ngày Làm" value={formatVND(result.ttcb.tien1NgayLam)} />
        <Divider />
        <Row label="Lương Thực Tế" value={formatVND(result.ttcb.luongThucTe)} highlight isBold />
      </DetailSection>

      {/* SECTION 3: OVERTIME */}
      <DetailSection 
        title="Lương Tăng Ca"
        accentColor="amber"
        total={formatVND(result.tc.tongTienTangCa)}
        totalLabel="Tổng"
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
      >
        <Row label="Lương Tính Tăng Ca" value={formatVND(result.tc.luongTinhTangCa)} highlight />
        <Row label="Đơn giá 1h (Gốc)" value={formatVND(result.tc.tien1GioTCBase)} />
        <Divider />
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Theo hệ số</h4>
        <Row label="Thường (150%)" value={formatVND(result.tc.tienTCThuong)} />
        <Row label="Ngày Nghỉ (200%)" value={formatVND(result.tc.tienTCNghi)} />
        <Row label="Ngày Lễ (300%)" value={formatVND(result.tc.tienTCLe)} />
        <Divider />
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phụ cấp Ca Đêm</h4>
        <div className="grid grid-cols-2 gap-x-2">
          <Row label="30%" value={formatVND(result.tc.tienCD30)} />
          <Row label="50%" value={formatVND(result.tc.tienCD50)} />
          <Row label="70%" value={formatVND(result.tc.tienCD70)} />
          <Row label="90%" value={formatVND(result.tc.tienCD90)} />
        </div>
      </DetailSection>

      {/* SECTION 4: ALLOWANCES */}
      <DetailSection 
        title="Các Khoản Phụ Cấp"
        accentColor="emerald"
        total={formatVND(result.pc.tongPhuCap)}
        totalLabel="Tổng"
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>}
      >
        <Row label="PC Trình Độ (Thực tế)" value={formatVND(result.pc.pcTrinhDoCongThuc)} />
        <Row label="PC Trách Nhiệm" value={formatVND(result.pc.pcTrachNhiem)} />
        <Row label="PC Thâm Niên" value={formatVND(result.pc.pcThamNien)} />
        <Row label="PC Tay Nghề" value={formatVND(result.pc.pcTayNghe)} />
        <Row label="PC Chuyên Cần" value={formatVND(result.pc.pcChuyenCan)} highlight />
        <Row label="Hỗ Trợ Đi Lại" value={formatVND(result.pc.pcDiLai)} />
        <Row label="Tiền Thưởng" value={formatVND(result.pc.pcThuong)} />
      </DetailSection>

      {/* SECTION 5: DEDUCTIONS */}
      <DetailSection 
        title="Các Khoản Khấu Trừ"
        accentColor="rose"
        total={formatVND(result.kt.tongKhauTru)}
        totalLabel="Tổng"
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
      >
        <div className="text-[10px] text-gray-400 italic mb-1.5 text-center">Bảo hiểm tính trên: {formatVND(result.kt.luongTinhBH)}</div>
        <Row label="BHYT (1.5%)" value={formatVND(result.kt.bhyt)} />
        <Row label="BHTN (1%)" value={formatVND(result.kt.bhtn)} />
        <Row label="BHXH (8%)" value={formatVND(result.kt.bhxh)} />
        <Divider />
        <Row label="Phí Công Đoàn" value={formatVND(result.kt.phiCongDoan)} />
        <Row label="Tiền Tiết Kiệm" value={formatVND(result.kt.tienTietKiem)} />
        <Row label="Tiền Từ Thiện" value={formatVND(result.kt.tienTuThien)} />
      </DetailSection>

    </div>
  );
};

export default SalaryDetails;