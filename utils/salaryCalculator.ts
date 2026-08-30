import { SalaryInputs, CalculationResult, SalaryConfig } from '../types';
import { GIO_CHUAN_NGAY } from '../constants';

/**
 * Tính thuế TNCN theo bậc thang lũy tiến (Việt Nam, áp dụng từ 2020+).
 */
const tinhThueTNCNTheoBacThang = (thuNhapTinhThueThang: number): number => {
  if (thuNhapTinhThueThang <= 0) return 0;
  const thuNhapNam = thuNhapTinhThueThang * 12;
  const bacThangNam: Array<{ trần: number; rate: number }> = [
    { trần: 60_000_000,         rate: 0.05 },
    { trần: 120_000_000,        rate: 0.10 },
    { trần: 216_000_000,        rate: 0.15 },
    { trần: 384_000_000,        rate: 0.20 },
    { trần: 624_000_000,        rate: 0.25 },
    { trần: 960_000_000,        rate: 0.30 },
    { trần: Infinity,           rate: 0.35 },
  ];
  let thueNam = 0;
  let conLai = thuNhapNam;
  let mucTruoc = 0;
  for (const { trần, rate } of bacThangNam) {
    const doan = Math.min(conLai, trần - mucTruoc);
    if (doan <= 0) break;
    thueNam += doan * rate;
    conLai -= doan;
    mucTruoc = trần;
    if (conLai <= 0) break;
  }
  return Math.round(thueNam / 12);
};

export const calculateSalary = (inputs: SalaryInputs, config: SalaryConfig): CalculationResult => {
  const {
    luong_co_ban,
    ngay_di_lam,
    so_ngay_phep,
    tc_thuong, tc_nghi, tc_le,
    cd_30, cd_50, cd_70, cd_90,
    pc_chuyen_can, pc_trach_nhiem, pc_tham_nien, pc_tay_nghe,
    pc_nuoi_con_nho, so_nguoi_phu_thuoc,
  } = inputs;

  const {
    ngay_chuan, pc_he_so_trinh_do, pc_ho_tro_di_lai, pc_tien_thuong,
    kh_bhyt_rate, kh_bhtn_rate, kh_bhxh_rate,
    kh_phi_cong_doan, kh_tien_tiet_kiem, kh_tien_tu_thien,
    thue_mien_thue_ban_than, thue_giam_tru_moi_npt, ap_dung_thue_tncn,
  } = config;

  const ngayDiLamThucTe = Math.max(0, ngay_di_lam);
  const soNgayPhep = Math.max(0, so_ngay_phep);
  // Tính lương theo tổng ngày công thực tế (kể cả phép năm)
  const ngayCongTinhLuong = ngayDiLamThucTe + soNgayPhep;

  // ============================================================
  // 1. LƯƠNG TÍNH TĂNG CA (base để tính BH + OT)
  //    Công thức WePayroll:
  //    LTTC = LCB + PC Trách Nhiệm/Chức danh + PC Thâm Niên + (Hệ số TĐ × 26)
  // ============================================================
  const pcTrinhDoChuan = pc_he_so_trinh_do * ngay_chuan;
  const luong_tinh_tang_ca = Math.round(
    luong_co_ban + pc_trach_nhiem + pc_tham_nien + pcTrinhDoChuan
  );

  // ============================================================
  // 2. LƯƠNG THỰC TẾ (lương theo ngày công)
  //    Công thức WePayroll:
  //    Lương = LCB / 26 × (ngày_công_thực_tế + ngày_phép)
  // ============================================================
  const tien1GioLam = luong_co_ban > 0 ? luong_co_ban / ngay_chuan / GIO_CHUAN_NGAY : 0;
  const tien1NgayLam = luong_co_ban > 0 ? luong_co_ban / ngay_chuan : 0;
  const soGioLamViec = ngayDiLamThucTe * GIO_CHUAN_NGAY;
  const luongThucTe = tien1NgayLam * ngayCongTinhLuong;

  // ============================================================
  // 3. TĂNG CA & CA ĐÊM
  // ============================================================
  const tien1GioTCBase = luong_tinh_tang_ca > 0 ? luong_tinh_tang_ca / ngay_chuan / GIO_CHUAN_NGAY : 0;

  const tienTCThuong = tien1GioTCBase * tc_thuong * 1.5;
  const tienTCNghi  = tien1GioTCBase * tc_nghi   * 2.0;
  const tienTCLe    = tien1GioTCBase * tc_le     * 3.0;
  const tienCD30    = tien1GioTCBase * cd_30     * 0.30;
  const tienCD50    = tien1GioTCBase * cd_50     * 0.50;
  const tienCD70    = tien1GioTCBase * cd_70     * 0.70;
  const tienCD90    = tien1GioTCBase * cd_90     * 0.90;

  const tongTienTangCa = tienTCThuong + tienTCNghi + tienTCLe + tienCD30 + tienCD50 + tienCD70 + tienCD90;

  // WePayroll: PC Trình độ = hệ_số × (ngày_công_thực_tế + ngày_phép_năm)
  // Công thức: 5,769.22 × (25.181 + 1) = 5,769.22 × 26.181 ≈ 151,044
  const pcTrinhDoCongThuc = pc_he_so_trinh_do * ngayCongTinhLuong;

  const tongPhuCap =
    pcTrinhDoCongThuc +
    pc_trach_nhiem +
    pc_tham_nien +
    pc_tay_nghe +
    pc_chuyen_can +
    pc_ho_tro_di_lai +
    pc_tien_thuong +
    pc_nuoi_con_nho;

  // ============================================================
  // 5. BẢO HIỂM (tính trên Lương Tính Tăng Ca)
  // ============================================================
  const luongTinhBH = luong_tinh_tang_ca;
  const bhyt = luongTinhBH * kh_bhyt_rate;
  const bhtn = luongTinhBH * kh_bhtn_rate;
  const bhxh = luongTinhBH * kh_bhxh_rate;

  const tongKhauTru = bhyt + bhtn + bhxh + kh_phi_cong_doan + kh_tien_tiet_kiem + kh_tien_tu_thien;

  // ============================================================
  // 6. THUẾ TNCN
  //    TN chịu thuế = Tổng TN - BHXH - BHYT - BHTN
  //    TN tính thuế = TN chịu thuế - Miễn trừ BT - (NPT × giảm trừ mỗi NPT)
  // ============================================================
  const tongThuNhap = luongThucTe + tongTienTangCa + tongPhuCap;
  const tongThuNhapChiuThue = Math.max(0, tongThuNhap - bhxh - bhyt - bhtn);
  const giamTruBanThan = thue_mien_thue_ban_than;
  const giamTruNguoiPhuThuoc = Math.max(0, so_nguoi_phu_thuoc) * thue_giam_tru_moi_npt;
  const thuNhapTinhThue = Math.max(0, tongThuNhapChiuThue - giamTruBanThan - giamTruNguoiPhuThuoc);
  const thueTNCN = ap_dung_thue_tncn ? tinhThueTNCNTheoBacThang(thuNhapTinhThue) : 0;

  // ============================================================
  // 7. THỰC LÃNH
  // ============================================================
  const thucLanh = tongThuNhap - tongKhauTru - thueTNCN;

  return {
    ttcb: {
      luongCoBan: luong_co_ban,
      ngayLamThucTe: ngayDiLamThucTe,
      ngayCongTinhLuong,
      tien1GioLam,
      tien1NgayLam,
      soGioLamViec,
      luongThucTe,
    },
    tc: {
      luongTinhTangCa: luong_tinh_tang_ca,
      tien1GioTCBase,
      tienTCThuong, tienTCNghi, tienTCLe,
      tienCD30, tienCD50, tienCD70, tienCD90,
      tongTienTangCa,
    },
    pc: {
      pcTrinhDoCongThuc,
      pcTrachNhiem: pc_trach_nhiem,
      pcThamNien: pc_tham_nien,
      pcTayNghe: pc_tay_nghe,
      pcChuyenCan: pc_chuyen_can,
      pcDiLai: pc_ho_tro_di_lai,
      pcThuong: pc_tien_thuong,
      pcNuoiConNho: pc_nuoi_con_nho,
      tongPhuCap,
    },
    kt: {
      luongTinhBH,
      bhyt, bhtn, bhxh,
      phiCongDoan: kh_phi_cong_doan,
      tienTietKiem: kh_tien_tiet_kiem,
      tienTuThien: kh_tien_tu_thien,
      tongKhauTru,
    },
    thue: {
      tongThuNhapChiuThue,
      giamTruBanThan,
      giamTruNguoiPhuThuoc,
      thuNhapTinhThue,
      thueTNCN,
    },
    tongThuNhap,
    thucLanh,
  };
};
