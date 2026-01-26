import React, { useState, useEffect, useRef } from 'react';
import { SalaryInputs } from '../types';
import InputGroup from './InputGroup';
import { GoogleGenAI } from "@google/genai";

interface TimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: SalaryInputs;
  onApply: (data: Partial<SalaryInputs>) => void;
}

const TimesheetModal: React.FC<TimesheetModalProps> = ({ isOpen, onClose, currentData, onApply }) => {
  const [localData, setLocalData] = useState<SalaryInputs>(currentData);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalData(currentData);
    }
  }, [isOpen, currentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLocalData(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };

  const handleApply = () => {
    onApply({
      ngay_di_lam: localData.ngay_di_lam,
      tc_thuong: localData.tc_thuong,
      tc_nghi: localData.tc_nghi,
      tc_le: localData.tc_le,
      cd_30: localData.cd_30,
      cd_50: localData.cd_50,
      cd_70: localData.cd_70,
      cd_90: localData.cd_90,
    });
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // 1. Convert File to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(',')[1];
        if (!base64Data) {
            alert("Lỗi đọc file ảnh");
            setIsScanning(false);
            return;
        }

        // 2. Call Gemini API
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
          Bạn là chuyên gia OCR. Hãy trích xuất số liệu từ bảng công Hyosung.
          
          CẤU TRÚC BẢNG (Từ trái sang phải):
          ... | Overtime HT | Night time 30% | Night time 50% | Night time 60% | Night time 70% | Night time 90% | Gongsoo | ...

          NHIỆM VỤ CỤ THỂ:
          1. Tìm dòng dữ liệu số (thường ở dưới tiêu đề).
          2. Xác định chính xác nhóm 5 cột Night time liền kề nhau: 30 -> 50 -> 60 -> 70 -> 90.
          3. Cột "Night time 60%" thường RỖNG hoặc có gạch nối (-). Đừng nhầm số của cột bên cạnh vào đây.
          4. Cột "Night time 70%" là cột thứ 4 trong nhóm Night time. Nếu thấy số 16, nó thường nằm ở đây.
          5. Cột "Night time 90%" là cột thứ 5 trong nhóm Night time, nằm ngay trước cột "Gongsoo". Thường là 0 hoặc trống.

          TRẢ VỀ JSON DUY NHẤT:
          {
            "wd_total": number, // WD Total
            "al": number,       // AL
            "ot_15": number,    // Overtime 1.5
            "ot_2": number,     // Overtime 2
            "ot_ht": number,    // Overtime HT
            "nt_30": number,    // Night time 30%
            "nt_50": number,    // Night time 50%
            "nt_70": number,    // Night time 70% (Cột thứ 4 của nhóm NT)
            "nt_90": number     // Night time 90% (Cột thứ 5 của nhóm NT)
          }
          
          Lưu ý: Nếu ô trống trả về 0. Chỉ trả về JSON.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
                { inlineData: { mimeType: file.type, data: base64Data } },
                { text: prompt }
            ]
          }
        });

        const text = response.text || "{}";
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // 3. Update State Logic
        const totalWorkDays = (parseFloat(data.wd_total) || 0) + (parseFloat(data.al) || 0);

        setLocalData(prev => ({
            ...prev,
            ngay_di_lam: totalWorkDays,
            tc_thuong: parseFloat(data.ot_15) || 0,
            tc_nghi: parseFloat(data.ot_2) || 0,
            tc_le: parseFloat(data.ot_ht) || 0,
            cd_30: parseFloat(data.nt_30) || 0,
            cd_50: parseFloat(data.nt_50) || 0,
            cd_70: parseFloat(data.nt_70) || 0,
            cd_90: parseFloat(data.nt_90) || 0,
        }));
        
        setIsScanning(false);
      };

    } catch (error) {
      console.error("Gemini Error:", error);
      alert("Không thể đọc được ảnh. Vui lòng thử lại ảnh rõ nét hơn.");
      setIsScanning(false);
    }
    
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white/90 border border-white/50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {isScanning && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-fade-in">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                <p className="text-indigo-600 font-bold text-sm animate-pulse">Đang phân tích bảng lương...</p>
            </div>
        )}

        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 via-white to-purple-50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nhập Số Liệu Công Chi Tiết</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-transform hover:rotate-90">&times;</button>
        </div>

        {/* Scan Button Area */}
        <div className="px-6 pt-4 pb-0">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
            <button 
                onClick={handleScanClick}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:from-violet-600 hover:to-fuchsia-600 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                 Quét Ảnh Bảng Công 
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">Hỗ trợ ảnh chụp màn hình bảng lương Hyosung</p>
        </div>

        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          <InputGroup 
            id="ngay_di_lam" 
            label="Số Ngày Đi Làm (WD Total + AL)" 
            value={localData.ngay_di_lam} 
            onChange={handleChange} 
            highlight
          />

          <div>
            <h4 className="text-pink-600 font-bold mb-3 border-b border-slate-100 pb-1">Giờ Tăng Ca (Theo Bảng Công)</h4>
            <div className="grid grid-cols-3 gap-3">
              <InputGroup id="tc_thuong" label="TC Thường (1.5)" value={localData.tc_thuong} onChange={handleChange} />
              <InputGroup id="tc_nghi" label="TC Ngày Nghỉ (2)" value={localData.tc_nghi} onChange={handleChange} />
              <InputGroup id="tc_le" label="TC Ngày Lễ (HT)" value={localData.tc_le} onChange={handleChange} />
            </div>
          </div>

          <div>
            <h4 className="text-red-500 font-bold mb-3 border-b border-slate-100 pb-1">Giờ Ca Đêm (Theo Phụ Cấp)</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputGroup id="cd_30" label="Ca Đêm 30%" value={localData.cd_30} onChange={handleChange} />
              <InputGroup id="cd_50" label="Ca Đêm 50%" value={localData.cd_50} onChange={handleChange} />
              <InputGroup id="cd_70" label="Ca Đêm 70%" value={localData.cd_70} onChange={handleChange} />
              <InputGroup id="cd_90" label="Ca Đêm 90%" value={localData.cd_90} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 hover:-translate-y-1"
          >
             Áp Dụng Dữ Liệu
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">Dữ liệu này sẽ được đồng bộ vào bảng chính</p>
        </div>
      </div>
    </div>
  );
};

export default TimesheetModal;