
export interface SalaryInputs {
  luong_co_ban: number;
  luong_tinh_tang_ca: number;
  ngay_di_lam: number;
  pc_chuyen_can: number;
  pc_trach_nhiem: number;
  pc_tham_nien: number;
  pc_tay_nghe: number;
  pc_mo_truong: number;        // Hỗ trợ môi trường / TN PCCC
  pc_nuoi_con_nho: number;     // Phụ cấp nuôi con nhỏ
  so_nguoi_phu_thuoc: number;  // Số người phụ thuộc (cho thuế TNCN)

  // Overtime Hours
  tc_thuong: number;
  tc_nghi: number;   // TC Chủ nhật ×200%
  tc_le: number;    // TC Ngày lễ ×300%

  // Night Shift Hours
  cd_30: number;
  cd_50: number;
  cd_70: number;
  cd_90: number;
}

export interface SalaryConfig {
  ngay_chuan: number;
  pc_he_so_trinh_do: number;
  pc_ho_tro_di_lai: number;
  pc_tien_thuong: number;
  kh_bhyt_rate: number;
  kh_bhtn_rate: number;
  kh_bhxh_rate: number;
  kh_phi_cong_doan: number;
  kh_tien_tiet_kiem: number;
  kh_tien_tu_thien: number;
  thue_mien_thue_ban_than: number;  // Miễn trừ gia cảnh bản thân
  thue_giam_tru_moi_npt: number;    // Giảm trừ mỗi NPT
}

export interface CalculationResult {
  ttcb: {
    luongCoBan: number;
    ngayLamThucTe: number;
    tien1GioLam: number;
    tien1NgayLam: number;
    soGioLamViec: number;
    luongThucTe: number;
  };
  tc: {
    luongTinhTangCa: number;
    tien1GioTCBase: number;
    tienTCThuong: number;
    tienTCNghi: number;
    tienTCLe: number;
    tienCD30: number;
    tienCD50: number;
    tienCD70: number;
    tienCD90: number;
    tongTienTangCa: number;
  };
  pc: {
    pcTrinhDoCongThuc: number;
    pcTrachNhiem: number;
    pcThamNien: number;
    pcTayNghe: number;
    pcChuyenCan: number;
    pcDiLai: number;
    pcThuong: number;
    pcMoiTruong: number;        // NEW
    pcNuoiConNho: number;       // NEW
    tongPhuCap: number;
  };
  kt: {
    luongTinhBH: number;
    bhyt: number;
    bhtn: number;
    bhxh: number;
    phiCongDoan: number;
    tienTietKiem: number;
    tienTuThien: number;
    tongKhauTru: number;
  };
  thue: {                        // NEW: nhóm thuế TNCN
    tongThuNhapChiuThue: number;  // Tổng TN chịu thuế (trước khi miễn giảm)
    giamTruBanThan: number;       // Miễn trừ bản thân
    giamTruNguoiPhuThuoc: number; // Giảm trừ NPT
    thuNhapTinhThue: number;      // TN tính thuế (sau miễn giảm)
    thueTNCN: number;             // Thuế TNCN phải nộp
  };
  tongThuNhap: number;
  thucLanh: number;
}

export type Preset = SalaryInputs;

export interface PresetsMap {
  [key: string]: Preset;
}
