import React from 'react';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  highlight?: boolean;
  currency?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, id, highlight = false, currency = false, className, value, onChange, ...props }) => {
  
  // Hàm format số thành chuỗi có dấu chấm (ví dụ: 1000 -> 1.000)
  const formatValue = (val: string | number | readonly string[] | undefined) => {
    if (val === undefined || val === null) return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Lấy giá trị thô bằng cách xóa dấu chấm
    const rawValue = e.target.value.replace(/\./g, '');
    
    // 2. Chỉ cho phép nhập số
    if (rawValue && !/^\d+$/.test(rawValue)) return;

    // 3. Tạo event giả lập để gửi giá trị thô (số nguyên) về cho App.tsx
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: rawValue,
        id: id
      }
    };
    
    onChange?.(syntheticEvent as any);
  };

  // Xác định giá trị hiển thị: nếu là currency thì format, không thì để nguyên
  const displayValue = currency ? formatValue(value) : value;

  return (
    <div className={`flex flex-col space-y-2 mb-2 ${className}`}>
      <label htmlFor={id} className={`text-xs uppercase tracking-wider font-bold ml-1 ${highlight ? 'text-indigo-600' : 'text-slate-500'}`}>
        {label}
      </label>
      
      {/* 
         WRAPPER TẠO VIỀN:
         - Thay đổi từ Gradient cầu vồng sang màu Xanh da trời nhạt (Sky Blue).
         - focus-within:bg-sky-400: Viền màu xanh da trời khi focus.
         - focus-within:shadow-sky-200: Đổ bóng màu xanh nhạt tiệp màu.
      */}
      <div className={`
        relative group rounded-xl p-[2px] transition-all duration-300
        ${props.disabled 
            ? 'bg-slate-200' 
            : 'bg-slate-200 hover:bg-slate-300 focus-within:bg-sky-400 focus-within:shadow-[0_0_10px_rgba(56,189,248,0.5)]'
        }
      `}>
        <input
          id={id}
          type={currency ? "tel" : "number"}
          inputMode={currency ? "numeric" : undefined}
          min="0"
          onFocus={(e) => e.target.select()}
          /* 
             Thêm các class để ẩn nút tăng giảm (spin buttons):
             [appearance:textfield] -> cho Firefox
             [&::-webkit-outer-spin-button]:appearance-none -> cho Chrome/Safari/Edge
             [&::-webkit-inner-spin-button]:appearance-none -> cho Chrome/Safari/Edge
          */
          className={`
            w-full px-4 py-3 text-[15px] font-bold rounded-[10px] outline-none transition-all duration-200
            bg-white text-slate-700 placeholder-slate-300
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${props.disabled 
              ? 'opacity-60 bg-slate-50 cursor-not-allowed text-slate-400' 
              : 'focus:bg-white'
            }
          `}
          value={displayValue}
          onChange={currency ? handleCurrencyChange : onChange}
          {...props}
        />
        
        {/* Icon trang trí */}
        {highlight && !props.disabled && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sky-400 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputGroup;