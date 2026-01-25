import { SalaryInputs, CalculationResult, SalaryConfig } from '../types';
import { GIO_CHUAN_NGAY } from '../constants';

export const calculateSalary = (inputs: SalaryInputs, config: SalaryConfig): CalculationResult => {
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

  const {
    ngay_chuan,
    pc_he_so_trinh_do,
    pc_ho_tro_di_lai,
    pc_tien_thuong,
    kh_bhyt_rate,
    kh_bhtn_rate,
    kh_bhxh_rate,
    kh_phi_cong_doan,
    kh_tien_tiet_kiem,
    kh_tien_tu_thien
  } = config;

  const ngayDiLamThucTe = Math.max(0, ngay_di_lam);

  // 0. Tính Lương Tính Tăng Ca & Bảo Hiểm (Công thức mới)
  // Formula: Lương CB + Thâm Niên + Trách Nhiệm + PC Trình Độ (Chuẩn 26 ngày)
  const pcTrinhDoChuan = pc_he_so_trinh_do * ngay_chuan; 
  const luong_tinh_tang_ca = Math.round(luong_co_ban + pc_tham_nien + pc_trach_nhiem + pcTrinhDoChuan);

  // 2. Thông Tin Cơ Bản
  const tien1GioLam = luong_co_ban > 0 ? luong_co_ban / ngay_chuan / GIO_CHUAN_NGAY : 0;
  const tien1NgayLam = luong_co_ban > 0 ? luong_co_ban / ngay_chuan : 0;
  const soGioLamViec = ngayDiLamThucTe * GIO_CHUAN_NGAY;
  const luongThucTe = tien1GioLam * soGioLamViec;

  // 3. Tính Giờ Tăng Ca
  const tien1GioTCBase = luong_tinh_tang_ca > 0 ? luong_tinh_tang_ca / ngay_chuan / GIO_CHUAN_NGAY : 0;
  
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
  const pcTrinhDoCongThuc = pc_he_so_trinh_do * ngayDiLamThucTe;
  
  const tongPhuCap = pcTrinhDoCongThuc + pc_trach_nhiem + pc_tham_nien + pc_tay_nghe + pc_chuyen_can + pc_ho_tro_di_lai + pc_tien_thuong;

  // 5. Các Khoản Khấu Trừ
  const luongTinhBH = luong_tinh_tang_ca;
  const bhyt = luongTinhBH * kh_bhyt_rate;
  const bhtn = luongTinhBH * kh_bhtn_rate;
  const bhxh = luongTinhBH * kh_bhxh_rate;

  const tongKhauTru = bhyt + bhtn + bhxh + kh_phi_cong_doan + kh_tien_tiet_kiem + kh_tien_tu_thien;

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
      pcDiLai: pc_ho_tro_di_lai,
      pcThuong: pc_tien_thuong,
      tongPhuCap
    },
    kt: {
      luongTinhBH,
      bhyt,
      bhtn,
      bhxh,
      phiCongDoan: kh_phi_cong_doan,
      tienTietKiem: kh_tien_tiet_kiem,
      tienTuThien: kh_tien_tu_thien,
      tongKhauTru
    },
    tongThuNhap,
    thucLanh
  };
};
