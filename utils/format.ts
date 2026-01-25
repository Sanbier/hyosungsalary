export const formatVND = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 VNĐ';
  
  // Làm tròn số
  const roundedAmount = Math.round(amount);
  
  // Sử dụng Regex để chèn dấu chấm vào mỗi 3 chữ số
  // \B: Không phải biên từ
  // (?=(\d{3})+(?!\d)): Lookahead tìm nhóm 3 chữ số
  const formattedNumber = roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return formattedNumber + ' VNĐ';
};