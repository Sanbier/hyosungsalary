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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // GIẢM XUỐNG 1024px: Đảm bảo nhẹ nhất có thể để tránh timeout trên mạng di động
          const MAX_WIDTH = 1024; 
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Nền trắng
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          // Giảm chất lượng xuống 0.8 để file nhẹ hơn nữa
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl.split(',')[1]);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const extractJSON = (text: string): string => {
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return cleanText.substring(startIndex, endIndex + 1);
    }
    return cleanText.trim();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!process.env.API_KEY) {
        alert("LỖI: Chưa cấu hình API Key trong file .env hoặc Vercel Settings.");
        return;
    }

    setIsScanning(true);

    setTimeout(async () => {
      try {
        const base64Data = await compressImage(file);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
          Bạn là hệ thống OCR chuyên đọc bảng lương Hyosung.
          NHIỆM VỤ: Tìm các cột số liệu tính công.
          
          LƯU Ý: Ảnh có thể bị xoay ngang/dọc, hãy tự xoay trong đầu để đọc đúng.

          MAPPING CỘT (Từ Phải sang Trái, lấy cột "Gongsoo" làm mốc):
          1. Cột [Gongsoo] (Tổng công).
          2. Bên trái nó là [Night time 90%].
          3. Bên trái tiếp là [Night time 70%].
          4. Bên trái tiếp là [Night time 60%] (Bỏ).
          5. Bên trái tiếp là [Night time 50%].
          6. Bên trái tiếp là [Night time 30%].
          
          Về tăng ca (OT):
          Tìm các cột có tiêu đề 1.5, 2.0, HT (Holiday).

          OUTPUT JSON:
          {
            "wd_total": number,
            "al": number,
            "ot_15": number,
            "ot_2": number,
            "ot_ht": number,
            "nt_30": number,
            "nt_50": number,
            "nt_70": number,
            "nt_90": number
          }
          Trả về 0 nếu ô trống.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp', 
          contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                { text: prompt }
            ]
          },
          config: {
            temperature: 0,
            // XÓA safetySettings vì SDK mới có thể gây lỗi undefined import
          }
        });

        const rawText = response.text || "{}";
        const jsonStr = extractJSON(rawText);
        
        let data;
        try {
          data = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Parse JSON Error:", rawText);
          throw new Error("AI trả về dữ liệu không đúng định dạng JSON.");
        }

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

      } catch (error: any) {
        console.error("Gemini Details:", error);
        // Hiển thị lỗi chi tiết để debug
        let msg = error.message || "Lỗi không xác định";
        if (msg.includes("400")) msg += " (Bad Request - Có thể do ảnh lỗi hoặc Config sai)";
        if (msg.includes("403")) msg += " (Sai API Key hoặc bị chặn IP)";
        if (msg.includes("503")) msg += " (Server quá tải - Thử lại sau)";
        
        alert(`⚠️ LỖI: ${msg}\n\nHãy thử chụp ảnh gần hơn, rõ nét hơn (chỉ chụp phần bảng số liệu).`);
        setIsScanning(false);
      }
      
      if(fileInputRef.current) fileInputRef.current.value = "";
    }, 100);
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
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-[4px] flex flex-col items-center justify-center animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600">AI</div>
                </div>
                <p className="text-indigo-800 font-bold text-sm mt-4 animate-pulse">Đang đọc dữ liệu...</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] text-center">Gemini 2.0 Vision</p>
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
                 Quét Ảnh Bảng Công (Mới nhất)
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">Đã tối ưu hóa cho Mobile & Mạng chậm</p>
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