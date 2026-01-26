import React, { useState, useEffect, useRef } from 'react';
import { SalaryInputs } from '../types';
import InputGroup from './InputGroup';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

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
          // Giữ độ phân giải cao để AI đọc số nhỏ
          const MAX_WIDTH = 1500; 
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
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(dataUrl.split(',')[1]);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!process.env.API_KEY) {
        alert("LỖI: Chưa cấu hình API Key.");
        return;
    }

    setIsScanning(true);

    setTimeout(async () => {
      try {
        const base64Data = await compressImage(file);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Prompt tối ưu cho Gemini 2.0 Flash
        const prompt = `
          Phân tích bảng lương/chấm công trong ảnh. Tìm và trích xuất chính xác các số liệu sau (trả về 0 nếu ô trống):
          
          1. **Gongsoo / Working Days (Tổng ngày công)**: Thường ở cột 'Gongsoo' hoặc 'Total Days'.
          2. **AL (Phép năm)**: Số ngày nghỉ phép có lương.
          3. **OT 1.5 (Tăng ca thường)**: Số giờ tăng ca ngày thường (hệ số 1.5).
          4. **OT 2.0 (Tăng ca ngày nghỉ)**: Số giờ làm chủ nhật/Off day (hệ số 2.0).
          5. **OT Holiday (Tăng ca lễ)**: Số giờ làm ngày lễ (hệ số 3.0).
          6. **Night Time (Phụ cấp đêm)**: Các cột 30%, 50%, 70%, 90%.

          LƯU Ý: Hãy nhìn kỹ các con số thập phân (ví dụ 0.5, 1.5). Trả về JSON.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash', // Model 2.0 Free Tier: Thông minh hơn 1.5 Flash, Nhanh hơn 1.5 Pro
          contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                { text: prompt }
            ]
          },
          config: {
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                wd_total: { type: Type.NUMBER, description: "Total Working Days / Gongsoo" },
                al: { type: Type.NUMBER, description: "Annual Leave (AL)" },
                ot_15: { type: Type.NUMBER, description: "Overtime 1.5 Hours" },
                ot_2: { type: Type.NUMBER, description: "Overtime 2.0 Hours" },
                ot_ht: { type: Type.NUMBER, description: "Overtime Holiday Hours" },
                nt_30: { type: Type.NUMBER, description: "Night 30%" },
                nt_50: { type: Type.NUMBER, description: "Night 50%" },
                nt_70: { type: Type.NUMBER, description: "Night 70%" },
                nt_90: { type: Type.NUMBER, description: "Night 90%" },
              },
              required: ["wd_total"],
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
          }
        });

        // Xử lý kết quả
        let jsonStr = response.text || "{}";
        // Clean markdown block if present
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
          data = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Parse JSON Error:", jsonStr);
          throw new Error("Không đọc được dữ liệu JSON từ ảnh.");
        }

        const totalWorkDays = (data.wd_total || 0) + (data.al || 0);

        setLocalData(prev => ({
            ...prev,
            ngay_di_lam: totalWorkDays,
            tc_thuong: data.ot_15 || 0,
            tc_nghi: data.ot_2 || 0,
            tc_le: data.ot_ht || 0,
            cd_30: data.nt_30 || 0,
            cd_50: data.nt_50 || 0,
            cd_70: data.nt_70 || 0,
            cd_90: data.nt_90 || 0,
        }));
        
        setIsScanning(false);

      } catch (error: any) {
        console.error("Gemini Error:", error);
        let msg = error.message || "Lỗi không xác định";
        
        if (msg.includes("404")) msg = "Model 'gemini-2.0-flash' chưa được kích hoạt hoặc sai API Key.";
        if (msg.includes("400")) msg = "Lỗi dữ liệu gửi đi (Bad Request).";
        if (msg.includes("503")) msg = "Server quá tải. Vui lòng thử lại.";
        
        alert(`⚠️ LỖI: ${msg}`);
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
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">2.0</div>
                </div>
                <p className="text-blue-800 font-bold text-sm mt-4 animate-pulse">Đang quét dữ liệu...</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] text-center">Gemini 2.0 Flash</p>
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
                 Quét Ảnh Bảng Công (AI 2.0)
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">Sử dụng Gemini 2.0 Flash - Nhanh & Chính xác</p>
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