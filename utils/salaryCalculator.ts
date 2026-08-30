import { SalaryInputs, CalculationResult, SalaryConfig } from '../types';
import { GIO_CHUAN_NGAY } from '../constants';

/**
 * Tính thuế TNCN theo bậc thang lũy tiến (Việt Nam, áp dụng từ 2020+).
 * Quy đổi thu nhập tháng sang năm, áp dụng bảng thuế lũy tiến từng phần.
 *
 * @param thuNhapTinhThueThang  Thu nhập tính thuế / tháng (>= 0)
 * @returns                     Số thuế TNCN phải nộp / tháng
 */
const tinhThueTNCNTheoBacThang = (thuNhapTinhThueThang: number): number => {
  if (thuNhapTinhThueThang <= 0) return 0;

  // Quy đổi thu nhập tháng sang năm
  const thuNhapNam = thuNhapTinhThueThang * 12;

  // Bậc thang thuế lũy tiến theo năm (VN, 2020+)
  // [trần, rate]
  const bacThangNam: Array<{ trần: number; rate: number }> = [
    { trần: 60_000_000,         rate: 0.05 },
    { trần: 120_000_000,        rate: 0.10 },
    { trần: 216_000_000,        rate: 0.15 },
    { trần: 384_000_000,        rate: 0.20 },
    { trần: 624_000_000,        rate: 0.25 },
    { trần: 960_000_000,        rate: 0.30 },
    { trần: Infinity,           rate: 0.35 },
  ];

  // Cách tính nhanh: quy đổi số thuế cả năm, chia 12
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
    pc_tay_nghe,
    pc_mo_truong,
    pc_nuoi_con_nho,
    so_nguoi_phu_thuoc,
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
    kh_tien_tu_thien,
    thue_mien_thue_ban_than,
    thue_giam_tru_moi_npt,
  } = config;

  const ngayDiLamThucTe = Math.max(0, ngay_di_lam);

  // 0. Lương Tính Tăng Ca (chỉ tính 1 nơi duy nhất)
  //    Công thức: LCB + PC Thâm Niên + PC Trách Nhiệm + (Hệ số TĐ × 26)
  const pcTrinhDoChuan = pc_he_so_trinh_do * ngay_chuan;
  const luong_tinh_tang_ca = Math.round(luong_co_ban + pc_tham_nien + pc_trach_nhiem + pcTrinhDoChuan);

  // 1. Thông Tin Cơ Bản (lương thực tế theo ngày công)
  const tien1GioLam = luong_co_ban > 0 ? luong_co_ban / ngay_chuan / GIO_CHUAN_NGAY : 0;
  const tien1NgayLam = luong_co_ban > 0 ? luong_co_ban / ngay_chuan : 0;
  const soGioLamViec = ngayDiLamThucTe * GIO_CHUAN_NGAY;
  const luongThucTe = tien1GioLam * soGioLamViec;

  // 2. Tăng ca & Ca đêm
  const tien1GioTCBase = luong_tinh_tang_ca > 0 ? luong_tinh_tang_ca / ngay_chuan / GIO_CHUAN_NGAY : 0;

  const tienTCThuong = tien1GioTCBase * tc_thuong * 1.5;
  const tienTCNghi  = tien1GioTCBase * tc_nghi   * 2.0;
  const tienTCLe    = tien1GioTCBase * tc_le     * 3.0;
  const tienCD30    = tien1GioTCBase * cd_30     * 0.30;
  const tienCD50    = tien1GioTCBase * cd_50     * 0.50;
  const tienCD70    = tien1GioTCBase * cd_70     * 0.70;
  const tienCD90    = tien1GioTCBase * cd_90     * 0.90;

  const tongTienTangCa = tienTCThuong + tienTCNghi + tienTCLe + tienCD30 + tienCD50 + tienCD70 + tienCD90;

  // 3. Phụ cấp
  const pcTrinhDoCongThuc = pc_he_so_trinh_do * ngayDiLamThucTe;

  const tongPhuCap =
    pcTrinhDoCongThuc +
    pc_trach_nhiem +
    pc_tham_nien +
    pc_tay_nghe +
    pc_chuyen_can +
    pc_ho_tro_di_lai +
    pc_tien_thuong +
    pc_mo_truong +
    pc_nuoi_con_nho;

  // 4. Khấu trừ bảo hiểm (tính trên Lương Tính Tăng Ca)
  const luongTinhBH = luong_tinh_tang_ca;
  const bhyt = luongTinhBH * kh_bhyt_rate;
  const bhtn = luongTinhBH * kh_bhtn_rate;
  const bhxh = luongTinhBH * kh_bhxh_rate;

  const tongKhauTru = bhyt + bhtn + bhxh + kh_phi_cong_doan + kh_tien_tiet_kiem + kh_tien_tu_thien;

  // 5. Tổng thu nhập (trước thuế)
  const tongThuNhap = luongThucTe + tongTienTangCa + tongPhuCap;

  // 6. Thuế TNCN
  //    Thu nhập chịu thuế = Tổng TN - BHXH - BHYT - BHTN
  //    Thu nhập tính thuế  = TN chịu thuế - Miễn trừ bản thân - (Số NPT × giảm trừ mỗi NPT)
  //    Thuế TNCN          = áp dụng bảng lũy tiến
  const tongThuNhapChiuThue = Math.max(0, tongThuNhap - bhxh - bhyt - bhtn);
  const giamTruBanThan = thue_mien_thue_ban_than;
  const giamTruNguoiPhuThuoc = Math.max(0, so_nguoi_phu_thuoc) * thue_giam_tru_moi_npt;
  const thuNhapTinhThue = Math.max(0, tongThuNhapChiuThue - giamTruBanThan - giamTruNguoiPhuThuoc);
  const thueTNCN = tinhThueTNCNTheoBacThang(thuNhapTinhThue);

  // 7. Thực lãnh
  const thucLanh = tongThuNhap - tongKhauTru - thueTNCN;

  return {
    ttcb: {
      luongCoBan: luong_co_ban,
      ngayLamThucTe: ngayDiLamThucTe,
      tien1GioLam,
      tien1NgayLam,
      soGioLamViec,
      luongThucTe,
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
      pcMoiTruong: pc_mo_truong,
      pcNuoiConNho: pc_nuoi_con_nho,
      tongPhuCap,
    },
    kt: {
      luongTinhBH,
      bhyt,
      bhtn,
      bhxh,
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
