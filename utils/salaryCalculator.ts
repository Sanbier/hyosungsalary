import { SalaryInputs, CalculationResult } from '../types';
import {
  NGAY_CHUAN,
  GIO_CHUAN_NGAY,
  PC_HE_SO_TRINH_DO,
  PC_HO_TRO_DI_LAI,
  PC_TIEN_THUONG,
  KH_BHYT_RATE,
  KH_BHTN_RATE,
  KH_BHXH_RATE,
  KH_PHI_CONG_DOAN,
  KH_TIEN_TIET_KIEM,
  KH_TIEN_TU_THIEN
} from '../constants';

export const calculateSalary = (inputs: SalaryInputs): CalculationResult => {
  const {
    luong_co_ban,
    // luong_tinh_tang_ca input is ignored here, we recalculate it below
    ngay_di_lam,
    tc_thuong,
    tc_nghi,
    tc_le,
    cd_30,
    cd_50,
    cd_70,
    cd_90,
    pc_chuyen_can,
    pc_trach_nhiem,
    pc_tham_nien,
    pc_tay_nghe
  } = inputs;

  const ngayDiLamThucTe = Math.max(0, ngay_di_lam);

  // 0. Tính Lương Tính Tăng Ca & Bảo Hiểm (Công thức mới)
  // Formula: Lương CB + Thâm Niên + Trách Nhiệm + PC Trình Độ (Chuẩn 26 ngày)
  const pcTrinhDoChuan = PC_HE_SO_TRINH_DO * NGAY_CHUAN; 
  const luong_tinh_tang_ca = Math.round(luong_co_ban + pc_tham_nien + pc_trach_nhiem + pcTrinhDoChuan);

  // 2. Thông Tin Cơ Bản
  const tien1GioLam = luong_co_ban > 0 ? luong_co_ban / NGAY_CHUAN / GIO_CHUAN_NGAY : 0;
  const tien1NgayLam = luong_co_ban > 0 ? luong_co_ban / NGAY_CHUAN : 0;
  const soGioLamViec = ngayDiLamThucTe * GIO_CHUAN_NGAY;
  const luongThucTe = tien1GioLam * soGioLamViec;

  // 3. Tính Giờ Tăng Ca
  const tien1GioTCBase = luong_tinh_tang_ca > 0 ? luong_tinh_tang_ca / NGAY_CHUAN / GIO_CHUAN_NGAY : 0;
  
  const tienTCThuong = tien1GioTCBase * tc_thuong * 1.5;
  const tienTCNghi = tien1GioTCBase * tc_nghi * 2.0;
  const tienTCLe = tien1GioTCBase * tc_le * 3.0;
  const tienCD30 = tien1GioTCBase * cd_30 * 0.3;
  const tienCD50 = tien1GioTCBase * cd_50 * 0.5;
  const tienCD70 = tien1GioTCBase * cd_70 * 0.7;
  const tienCD90 = tien1GioTCBase * cd_90 * 0.9;

  const tongTienTangCa = tienTCThuong + tienTCNghi + tienTCLe + tienCD30 + tienCD50 + tienCD70 + tienCD90;

  // 4. Các Khoản Phụ Cấp
  // Công thức cũ từ code gốc: Phụ cấp trình độ/tay nghề tính theo ngày công thực tế
  const pcTrinhDoCongThuc = PC_HE_SO_TRINH_DO * ngayDiLamThucTe;
  
  const tongPhuCap = pcTrinhDoCongThuc + pc_trach_nhiem + pc_tham_nien + pc_tay_nghe + pc_chuyen_can + PC_HO_TRO_DI_LAI + PC_TIEN_THUONG;

  // 5. Các Khoản Khấu Trừ
  const luongTinhBH = luong_tinh_tang_ca;
  const bhyt = luongTinhBH * KH_BHYT_RATE;
  const bhtn = luongTinhBH * KH_BHTN_RATE;
  const bhxh = luongTinhBH * KH_BHXH_RATE;

  const tongKhauTru = bhyt + bhtn + bhxh + KH_PHI_CONG_DOAN + KH_TIEN_TIET_KIEM + KH_TIEN_TU_THIEN;

  // 6. Tổng Kết
  const tongThuNhap = luongThucTe + tongTienTangCa + tongPhuCap;
  const thucLanh = tongThuNhap - tongKhauTru;

  return {
    ttcb: {
      luongCoBan: luong_co_ban,
      ngayLamThucTe: ngayDiLamThucTe,
      tien1GioLam,
      tien1NgayLam,
      soGioLamViec,
      luongThucTe
    },
    tc: {
      luongTinhTangCa: luong_tinh_tang_ca,
      tien1GioTCBase,
      tienTCThuong,
      tienTCNghi,
      tienTCLe,
      tienCD30,
      tienCD50,
      tienCD70,
      tienCD90,
      tongTienTangCa
    },
    pc: {
      pcTrinhDoCongThuc,
      pcTrachNhiem: pc_trach_nhiem,
      pcThamNien: pc_tham_nien,
      pcTayNghe: pc_tay_nghe,
      pcChuyenCan: pc_chuyen_can,
      pcDiLai: PC_HO_TRO_DI_LAI,
      pcThuong: PC_TIEN_THUONG,
      tongPhuCap
    },
    kt: {
      luongTinhBH,
      bhyt,
      bhtn,
      bhxh,
      phiCongDoan: KH_PHI_CONG_DOAN,
      tienTietKiem: KH_TIEN_TIET_KIEM,
      tienTuThien: KH_TIEN_TU_THIEN,
      tongKhauTru
    },
    tongThuNhap,
    thucLanh
  };
};