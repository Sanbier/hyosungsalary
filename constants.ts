import { SalaryConfig } from './types';

export const NGAY_CHUAN = 26;
export const GIO_CHUAN_NGAY = 8;

// Fixed Allowances
export const PC_HE_SO_TRINH_DO = 6159.14; // Hệ số trình độ thực tế từ phiếu lương (155,104 / 25.181 ngày)
export const PC_HO_TRO_DI_LAI = 250000;
export const PC_TIEN_THUONG = 50000;

// New allowances (theo phiếu lương Hyosung)
export const PC_MOI_TRUONG_PCCC = 150000; // Hỗ trợ môi trường / TN PCCC
export const PC_NUOI_CON_NHO = 200000;    // Phụ cấp nuôi con nhỏ

// Deduction Rates & Fixed Amounts
export const KH_BHYT_RATE = 0.015;
export const KH_BHTN_RATE = 0.01;
export const KH_BHXH_RATE = 0.08;
export const KH_PHI_CONG_DOAN = 50000; // Theo phiếu lương thật
export const KH_TIEN_TIET_KIEM = 200000;
export const KH_TIEN_TU_THIEN = 8000;

// Thuế TNCN
export const MIEN_THUE_BAN_THAN = 6200000; // Theo phiếu lương công ty
export const GIAM_TRU_MOI_NPT = 4400000;   // Giảm trừ mỗi người phụ thuộc (tháng)

export const DEFAULT_INPUTS = {
  luong_co_ban: 0,
  luong_tinh_tang_ca: 0,
  ngay_di_lam: 0,
  pc_chuyen_can: 0,
  pc_trach_nhiem: 0,
  pc_tham_nien: 0,
  pc_tay_nghe: 0,
  pc_mo_truong: PC_MOI_TRUONG_PCCC,
  pc_nuoi_con_nho: PC_NUOI_CON_NHO,
  so_nguoi_phu_thuoc: 0,
  tc_thuong: 0,
  tc_nghi: 0,
  tc_le: 0,
  cd_30: 0,
  cd_50: 0,
  cd_70: 0,
  cd_90: 0,
};

export const DEFAULT_CONFIG: SalaryConfig = {
  ngay_chuan: NGAY_CHUAN,
  pc_he_so_trinh_do: PC_HE_SO_TRINH_DO,
  pc_ho_tro_di_lai: PC_HO_TRO_DI_LAI,
  pc_tien_thuong: PC_TIEN_THUONG,
  kh_bhyt_rate: KH_BHYT_RATE,
  kh_bhtn_rate: KH_BHTN_RATE,
  kh_bhxh_rate: KH_BHXH_RATE,
  kh_phi_cong_doan: KH_PHI_CONG_DOAN,
  kh_tien_tiet_kiem: KH_TIEN_TIET_KIEM,
  kh_tien_tu_thien: KH_TIEN_TU_THIEN,
  thue_mien_thue_ban_than: MIEN_THUE_BAN_THAN,
  thue_giam_tru_moi_npt: GIAM_TRU_MOI_NPT,
};
