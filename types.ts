
export interface SalaryInputs {
  luong_co_ban: number;
  luong_tinh_tang_ca: number;
  ngay_di_lam: number;
  pc_chuyen_can: number;
  pc_trach_nhiem: number;
  pc_tham_nien: number;
  pc_tay_nghe: number;
  
  // Overtime Hours
  tc_thuong: number;
  tc_nghi: number;
  tc_le: number;
  
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
    pcTrinhDoCongThuc: number; // 5769.22 * days
    pcTrachNhiem: number;
    pcThamNien: number;
    pcTayNghe: number; // Input
    pcChuyenCan: number;
    pcDiLai: number; // Fixed 250k
    pcThuong: number; // Fixed 50k
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
  tongThuNhap: number;
  thucLanh: number;
}

export type Preset = SalaryInputs;

export interface PresetsMap {
  [key: string]: Preset;
}
