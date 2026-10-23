/**
 * ==============================================================================
 * H-DESIGN PROCESSHUB - GOOGLE APPS SCRIPT AUTOMATION TOOLKIT
 * ==============================================================================
 * Bộ công cụ tự động hóa dành riêng cho Google Sheets quản lý quy trình:
 * 1. Tự động khởi tạo 2 Tab chuẩn: "QuyTrinhHienHanh" và "LichSuPhienBan"
 * 2. Tự động định dạng màu sắc doanh nghiệp, kẻ bảng, đóng băng dòng tiêu đề
 * 3. Tạo danh sách chọn thả xuống (Dropdown) cho Phòng ban, Thể loại, Trạng thái
 * 4. TÍNH NĂNG ĐẶC BIỆT: "Nâng cấp phiên bản & Tự động lưu bản cũ sang Lịch Sử"
 * ==============================================================================
 */

// Danh sách phòng ban và thể loại chuẩn của H-Design
var DEPARTMENTS = [
  "Ban Quản Lý",
  "Bộ phận Kỹ Thuật",
  "Bộ phận Sản Xuất",
  "Bộ phận Kinh Doanh",
  "Hành Chính - Nhân Sự"
];

var CATEGORIES = [
  "Quy trình",
  "Tiêu chuẩn",
  "Hướng dẫn",
  "Biểu mẫu",
  "Bản vẽ",
  "Chính sách"
];

var DOC_STATUSES = [
  "Chính thức",
  "Dự thảo",
  "Tham khảo"
];

var STATUSES = [
  "Đang hiệu lực",
  "Đã thay thế",
  "Lưu trữ đối soát"
];

/**
 * Tạo Menu tùy chỉnh trên thanh công cụ của Google Sheets mỗi khi mở file
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 ProcessHub (H-Design)')
    .addItem('1. Khởi tạo cấu trúc 4 Tab chuẩn (Quy trình, Lịch sử, AI, Tài khoản & Phân quyền)', 'setupProcessHubSheets')
    .addSeparator()
    .addItem('2. Nâng cấp phiên bản (Tự động chuyển bản cũ sang Lịch Sử)', 'archiveAndUpgradeVersion')
    .addItem('3. Chuẩn hóa & Kiểm tra link Google Drive', 'cleanGoogleDriveLinks')
    .addToUi();
}

/**
 * 1. KHỞI TẠO CẤU TRÚC 4 TAB CHUẨN
 */
function setupProcessHubSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var confirm = ui.alert(
    'Xác nhận khởi tạo ProcessHub',
    'Hệ thống sẽ tạo 4 Tab chuẩn: "QuyTrinhHienHanh", "LichSuPhienBan", "CauHinhHeThong" (link AI) và "TaiKhoan" (quản lý ID, Mật khẩu & Phân quyền). Bạn có muốn tiếp tục?',
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) return;

  // --- TAB 1: QuyTrinhHienHanh ---
  var sheetMain = ss.getSheetByName('QuyTrinhHienHanh');
  if (!sheetMain) {
    sheetMain = ss.insertSheet('QuyTrinhHienHanh', 0);
  }

  var headersMain = [
    ["Mã tài liệu", "Tên tài liệu / Quy trình", "Phòng ban", "Phân loại", "Trạng thái", "Phiên bản", "Ngày ban hành", "Link Google Drive", "Mô tả tóm tắt", "Từ khóa tìm kiếm"]
  ];

  sheetMain.clear();
  sheetMain.getRange(1, 1, 1, headersMain[0].length).setValues(headersMain);
  
  // Format Header Tab 1 (Màu tím thương hiệu Indigo H-Design)
  var headerRangeMain = sheetMain.getRange(1, 1, 1, headersMain[0].length);
  headerRangeMain.setBackground('#4F46E5')
                 .setFontColor('#FFFFFF')
                 .setFontWeight('bold')
                 .setFontFamily('Plus Jakarta Sans')
                 .setHorizontalAlignment('center')
                 .setVerticalAlignment('middle')
                 .setWrap(true);
  sheetMain.setRowHeight(1, 38);
  sheetMain.setFrozenRows(1);

  // Thêm dữ liệu mẫu Tab 1
  var sampleDataMain = [
    ["QT-TK-01", "Quy trình thiết kế phương án kiến trúc & nội thất", "Bộ phận Kỹ Thuật", "Quy trình", "Chính thức", "v3.2", "2026-10-10", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Quy định các bước từ tiếp nhận brief khách hàng, lên concept 2D/3D, duyệt VR với CĐT.", "kiến trúc, concept, 3d, brief"],
    ["TC-BV-02", "Tiêu chuẩn thể hiện hồ sơ bản vẽ kỹ thuật thi công (CAD & Revit)", "Bộ phận Kỹ Thuật", "Tiêu chuẩn", "Chính thức", "v2.0", "2026-09-25", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Bộ tiêu chuẩn nét vẽ, tỷ lệ, Family Revit và tích hợp mã QR truy xuất bản vẽ.", "bản vẽ, cad, revit, ctb"],
    ["HD-SX-01", "Hướng dẫn vận hành máy CNC, máy dán cạnh & kiểm soát chất lượng xưởng", "Bộ phận Sản Xuất", "Hướng dẫn", "Chính thức", "v2.5", "2026-10-05", "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing", "Chỉ dẫn chi tiết cách vận hành máy móc xưởng gỗ, kiểm tra keo PUR và kiểm tra dao cắt CNC.", "sản xuất, xưởng, cnc, keo pur"],
    ["TC-AT-01", "Tiêu chuẩn an toàn lao động, vệ sinh công nghiệp & PCCC phân xưởng", "Bộ phận Sản Xuất", "Tiêu chuẩn", "Chính thức", "v3.0", "2026-07-20", "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing", "Tiêu chuẩn an toàn PCCC theo Nghị định 50/2024/NĐ-CP và hệ thống hút bụi trung tâm.", "an toàn, pccc, xưởng, bảo hộ"],
    ["CS-QL-01", "Chính sách bảo mật thông tin nội bộ, quản lý dữ liệu & phân quyền", "Ban Quản Lý", "Chính sách", "Chính thức", "v1.2", "2026-06-30", "https://drive.google.com/file/d/1J_Sample_BaoMatThongTin_DriveFile/view?usp=sharing", "Quy định phân quyền dữ liệu giữa các bộ phận và cam kết bảo mật NDA.", "bảo mật, chính sách, nda, ban quản lý"],
    ["QT-TK-02", "Quy trình ứng dụng Trí tuệ Nhân tạo (AI) trong phân tích & xuất phương án thiết kế", "Bộ phận Kỹ Thuật", "Quy trình", "Dự thảo", "v0.9", "2026-10-22", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Bản thảo thử nghiệm quy trình dùng AI tạo render sơ phác và kiểm tra đối soát quy chuẩn hồ sơ.", "ai, thiet ke, du thao, concept"],
    ["TK-VL-01", "Cẩm nang tra cứu thông số kỹ thuật gỗ công nghiệp & phụ kiện nội thất 2026", "Bộ phận Sản Xuất", "Hướng dẫn", "Tham khảo", "v1.0", "2026-10-15", "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing", "Tài liệu cẩm nang kỹ thuật tổng hợp quy cách ván MDF, HDF, MFC An Cường và catalog phụ kiện Hafele.", "cam nang, go, an cuong, tham khao"]
  ];

  sheetMain.getRange(2, 1, sampleDataMain.length, sampleDataMain[0].length).setValues(sampleDataMain);

  // Tạo Dropdown chọn Phòng ban, Phân loại & Trạng thái cho 500 dòng
  var ruleDept = SpreadsheetApp.newDataValidation().requireValueInList(DEPARTMENTS, true).build();
  sheetMain.getRange("C2:C500").setDataValidation(ruleDept);

  var ruleCat = SpreadsheetApp.newDataValidation().requireValueInList(CATEGORIES, true).build();
  sheetMain.getRange("D2:D500").setDataValidation(ruleCat);

  var ruleDocStatus = SpreadsheetApp.newDataValidation().requireValueInList(DOC_STATUSES, true).build();
  sheetMain.getRange("E2:E500").setDataValidation(ruleDocStatus);

  // Kẻ viền và căn chỉnh Tab 1
  var bodyRangeMain = sheetMain.getRange(2, 1, sampleDataMain.length, headersMain[0].length);
  bodyRangeMain.setFontFamily('Plus Jakarta Sans')
                .setVerticalAlignment('middle');
  sheetMain.getRange("A2:A500").setHorizontalAlignment('center');
  sheetMain.getRange("E2:G500").setHorizontalAlignment('center');

  sheetMain.setColumnWidth(1, 110); // Mã
  sheetMain.setColumnWidth(2, 320); // Tên
  sheetMain.setColumnWidth(3, 170); // Phòng ban
  sheetMain.setColumnWidth(4, 130); // Phân loại
  sheetMain.setColumnWidth(5, 115); // Trạng thái
  sheetMain.setColumnWidth(6, 95);  // Phiên bản
  sheetMain.setColumnWidth(7, 120); // Ngày ban hành
  sheetMain.setColumnWidth(8, 280); // Link Drive
  sheetMain.setColumnWidth(9, 300); // Mô tả
  sheetMain.setColumnWidth(10, 180); // Từ khóa

  // --- TAB 2: LichSuPhienBan ---
  var sheetHistory = ss.getSheetByName('LichSuPhienBan');
  if (!sheetHistory) {
    sheetHistory = ss.insertSheet('LichSuPhienBan', 1);
  }

  var headersHistory = [
    ["Mã tài liệu", "Phiên bản", "Ngày ban hành", "Ngày hết hiệu lực", "Trạng thái", "Người cập nhật / Phê duyệt", "Lý do thay đổi / Nội dung cập nhật", "Link Google Drive bản cũ", "Ghi chú"]
  ];

  sheetHistory.clear();
  sheetHistory.getRange(1, 1, 1, headersHistory[0].length).setValues(headersHistory);

  // Format Header Tab 2 (Màu xanh Teal/Emerald chuyên nghiệp)
  var headerRangeHist = sheetHistory.getRange(1, 1, 1, headersHistory[0].length);
  headerRangeHist.setBackground('#0D9488')
                 .setFontColor('#FFFFFF')
                 .setFontWeight('bold')
                 .setFontFamily('Plus Jakarta Sans')
                 .setHorizontalAlignment('center')
                 .setVerticalAlignment('middle')
                 .setWrap(true);
  sheetHistory.setRowHeight(1, 38);
  sheetHistory.setFrozenRows(1);

  // Thêm dữ liệu mẫu Tab 2
  var sampleDataHistory = [
    ["QT-TK-01", "v3.2", "2026-10-10", "Đang áp dụng", "Đang hiệu lực", "Ban Giám Đốc", "Cập nhật quy trình duyệt phối cảnh 3D bằng kính VR và chuẩn hóa các mốc nghiệm thu concept với Chủ đầu tư.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Áp dụng toàn diện từ Q4/2026"],
    ["QT-TK-01", "v3.1", "2026-05-15", "2026-10-10", "Đã thay thế", "Trưởng phòng Thiết Kế", "Bổ sung bước lập bảng Moodboard vật liệu & màu sắc thực tế trước khi lên 3D chi tiết để giảm thời gian chỉnh sửa.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Thay thế cho bản v3.0"],
    ["QT-TK-01", "v3.0", "2026-01-10", "2026-05-15", "Đã thay thế", "Ban Giám Đốc", "Nâng cấp toàn diện quy trình thiết kế tích hợp mô hình BIM/Revit đồng bộ hóa dữ liệu trực tiếp với xưởng sản xuất.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Chuyển từ CAD sang Revit"],
    ["QT-TK-01", "v2.0", "2025-06-20", "2026-01-10", "Đã thay thế", "P. Thiết Kế", "Chuẩn hóa quy trình thiết kế 2D/3D phân tách rõ 2 giai đoạn: Phương án sơ phác và Hồ sơ triển khai thi công chi tiết.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Lưu trữ đối soát hồ sơ 2025"],
    ["QT-TK-01", "v1.0", "2024-03-15", "2025-06-20", "Đã thay thế", "Giám Đốc Sáng Lập", "Ban hành lần đầu quy trình thiết kế cơ sở nội bộ cho H-Design.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Bản khởi tạo ban đầu"],
    ["QC-BV-02", "v2.0", "2026-09-25", "Đang áp dụng", "Đang hiệu lực", "P. Kỹ Thuật", "Chuẩn hóa hệ thống Family Revit, file mẫu in CTB theo tiêu chuẩn TCVN 2026 và tích hợp mã QR truy xuất bản vẽ hiện trường.", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Áp dụng cho KTS & Họa viên"],
    ["QC-BV-02", "v1.5", "2026-03-10", "2026-09-25", "Đã thay thế", "P. Thiết Kế", "Thống nhất quy cách đóng khung tên bản vẽ chuẩn khổ A3/A1 và quy tắc đánh số thứ tự chi tiết kiến trúc.", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Hết hiệu lực từ 25/09/2026"],
    ["HD-SX-01", "v2.5", "2026-10-05", "Đang áp dụng", "Đang hiệu lực", "Quản Đốc Phân Xưởng", "Bổ sung quy định kiểm tra độ bám keo PUR chịu nước và checklist kiểm tra độ mòn dao cắt CNC sau 80 giờ chạy liên tục.", "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing", "Bắt buộc tại xưởng gỗ"]
  ];

  sheetHistory.getRange(2, 1, sampleDataHistory.length, sampleDataHistory[0].length).setValues(sampleDataHistory);

  // Dropdown Trạng thái cho Tab 2
  var ruleStatus = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
  sheetHistory.getRange("E2:E500").setDataValidation(ruleStatus);

  sheetHistory.getRange("A2:A500").setHorizontalAlignment('center');
  sheetHistory.getRange("B2:E500").setHorizontalAlignment('center');

  sheetHistory.setColumnWidth(1, 110); // Mã
  sheetHistory.setColumnWidth(2, 95);  // Phiên bản
  sheetHistory.setColumnWidth(3, 110); // Ngày ban hành
  sheetHistory.setColumnWidth(4, 120); // Ngày hết hiệu lực
  sheetHistory.setColumnWidth(5, 120); // Trạng thái
  sheetHistory.setColumnWidth(6, 170); // Người duyệt
  sheetHistory.setColumnWidth(7, 340); // Lý do thay đổi
  sheetHistory.setColumnWidth(8, 280); // Link bản cũ
  sheetHistory.setColumnWidth(9, 200); // Ghi chú

  // --- TAB 3: CauHinhHeThong (Quản lý Link AI NotebookLM & Cài đặt hệ thống) ---
  var sheetConfig = ss.getSheetByName('CauHinhHeThong');
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet('CauHinhHeThong', 2);
  }

  var headersConfig = [
    ["Tên cấu hình / Tính năng", "Giá trị thiết lập (URL / Thông tin)", "Mô tả hướng dẫn sử dụng"]
  ];

  sheetConfig.clear();
  sheetConfig.getRange(1, 1, 1, headersConfig[0].length).setValues(headersConfig);

  // Format Header Tab 3 (Màu tím Violet cao cấp)
  var headerRangeConf = sheetConfig.getRange(1, 1, 1, headersConfig[0].length);
  headerRangeConf.setBackground('#7C3AED')
                 .setFontColor('#FFFFFF')
                 .setFontWeight('bold')
                 .setFontFamily('Plus Jakarta Sans')
                 .setHorizontalAlignment('center')
                 .setVerticalAlignment('middle')
                 .setWrap(true);
  sheetConfig.setRowHeight(1, 38);
  sheetConfig.setFrozenRows(1);

  var sampleConfigData = [
    ["Link Trợ lý AI NotebookLM", "https://notebooklm.google.com/notebook/238a94aa-0f51-468f-8e40-84d5628f3a4f", "Dán link sổ tay NotebookLM vào ô này. Toàn bộ web ProcessHub của nhân viên sẽ tự động mở link này."],
    ["Tên thương hiệu hệ thống", "H-Design ProcessHub", "Tên hiển thị trên thanh tiêu đề trang web"],
    ["Hotline hỗ trợ kỹ thuật", "0900.xxx.xxx", "Số điện thoại hỗ trợ kỹ thuật nội bộ"]
  ];

  sheetConfig.getRange(2, 1, sampleConfigData.length, sampleConfigData[0].length).setValues(sampleConfigData);
  sheetConfig.getRange("A2:A10").setFontFamily('Plus Jakarta Sans').setVerticalAlignment('middle').setFontWeight('bold');
  sheetConfig.getRange("B2:C10").setFontFamily('Plus Jakarta Sans').setVerticalAlignment('middle');
  sheetConfig.setColumnWidth(1, 240);
  sheetConfig.setColumnWidth(2, 480);
  sheetConfig.setColumnWidth(3, 400);

  // --- TAB 4: TaiKhoan (Quản lý Tài Khoản Đăng Nhập, Mật Khẩu & Phân Quyền) ---
  var sheetUsers = ss.getSheetByName('TaiKhoan');
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet('TaiKhoan', 3);
  }

  var headersUsers = [
    ["Tên đăng nhập (ID)", "Mật khẩu (Pass / PIN)", "Họ và tên hiển thị", "Phòng ban chính", "Vai trò (Role)", "Quyền xem bộ phận (Allowed)", "Ghi chú"]
  ];

  sheetUsers.clear();
  sheetUsers.getRange(1, 1, 1, headersUsers[0].length).setValues(headersUsers);

  // Format Header Tab 4 (Màu xanh Navy / Slate doanh nghiệp sang trọng)
  var headerRangeUsers = sheetUsers.getRange(1, 1, 1, headersUsers[0].length);
  headerRangeUsers.setBackground('#1E293B')
                  .setFontColor('#FFFFFF')
                  .setFontWeight('bold')
                  .setFontFamily('Plus Jakarta Sans')
                  .setHorizontalAlignment('center')
                  .setVerticalAlignment('middle')
                  .setWrap(true);
  sheetUsers.setRowHeight(1, 38);
  sheetUsers.setFrozenRows(1);

  var sampleUsersData = [
    ["admin", "1612", "Quản Trị Viên (Admin)", "Ban Quản Lý", "Admin", "*", "Toàn quyền quản trị & duyệt phát hành"],
    ["bql", "1612", "Ban Quản Lý", "Ban Quản Lý", "Ban Quản Lý", "*", "Xem tất cả 5 bộ phận (Chế độ Chỉ Xem - Read-only)"],
    ["kythuat", "1612", "Kỹ Sư Hoàng (Kỹ Thuật)", "Bộ phận Kỹ Thuật", "User", "Bộ phận Kỹ Thuật", "Chỉ xem phòng Kỹ Thuật (Read-only)"],
    ["sanxuat", "1612", "Quản Đốc Nam (Sản Xuất)", "Bộ phận Sản Xuất", "User", "Bộ phận Sản Xuất", "Chỉ xem phòng Sản Xuất (Read-only)"],
    ["kinhdoanh", "1612", "Sale Mai (Kinh Doanh)", "Bộ phận Kinh Doanh", "User", "Bộ phận Kinh Doanh", "Chỉ xem phòng Kinh Doanh (Read-only)"],
    ["hcns", "1612", "HR Lan (Hành Chính - NS)", "Hành Chính - Nhân Sự", "User", "Hành Chính - Nhân Sự", "Chỉ xem phòng Hành Chính - Nhân Sự (Read-only)"]
  ];

  sheetUsers.getRange(2, 1, sampleUsersData.length, sampleUsersData[0].length).setValues(sampleUsersData);
  sheetUsers.getRange(2, 1, 100, headersUsers[0].length).setFontFamily('Plus Jakarta Sans').setVerticalAlignment('middle');
  sheetUsers.getRange("A2:B100").setHorizontalAlignment('center');
  sheetUsers.getRange("E2:E100").setHorizontalAlignment('center');

  // Dropdown cho Cột Phòng ban chính và Vai trò
  var ruleDeptUsers = SpreadsheetApp.newDataValidation().requireValueInList(DEPARTMENTS, true).build();
  sheetUsers.getRange("D2:D100").setDataValidation(ruleDeptUsers);

  var ruleRoleUsers = SpreadsheetApp.newDataValidation().requireValueInList(["Admin", "Ban Quản Lý", "User"], true).build();
  sheetUsers.getRange("E2:E100").setDataValidation(ruleRoleUsers);

  sheetUsers.setColumnWidth(1, 150); // ID
  sheetUsers.setColumnWidth(2, 140); // Pass
  sheetUsers.setColumnWidth(3, 220); // Tên
  sheetUsers.setColumnWidth(4, 180); // Phòng ban
  sheetUsers.setColumnWidth(5, 110); // Vai trò
  sheetUsers.setColumnWidth(6, 290); // Quyền xem
  sheetUsers.setColumnWidth(7, 250); // Ghi chú

  ss.setActiveSheet(sheetMain);
  ui.alert('Thành công! 🎉', 'Đã khởi tạo xong cấu trúc 4 Tab chuẩn của ProcessHub:\n• QuyTrinhHienHanh (Danh mục quy trình)\n• LichSuPhienBan (Lưu trữ đối soát)\n• CauHinhHeThong (Quản lý đường link Trợ lý AI NotebookLM)\n• TaiKhoan (Quản lý ID, Mật khẩu & Phân quyền xem)', ui.ButtonSet.OK);
}

/**
 * 2. TỰ ĐỘNG LƯU TRỮ BẢN CŨ & NÂNG CẤP PHIÊN BẢN (AUTO-ARCHIVE)
 * Thao tác: Nhấp chuột vào 1 dòng tài liệu bất kỳ trên tab "QuyTrinhHienHanh" rồi chạy tính năng này
 */
function archiveAndUpgradeVersion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMain = ss.getSheetByName('QuyTrinhHienHanh');
  var sheetHistory = ss.getSheetByName('LichSuPhienBan');
  var ui = SpreadsheetApp.getUi();

  if (!sheetMain || !sheetHistory) {
    ui.alert('Lỗi', 'Vui lòng chạy tính năng "1. Khởi tạo cấu trúc 2 Tab chuẩn" trước!', ui.ButtonSet.OK);
    return;
  }

  var activeSheet = ss.getActiveSheet();
  if (activeSheet.getName() !== 'QuyTrinhHienHanh') {
    ui.alert('Thông báo', 'Vui lòng chọn trang tính "QuyTrinhHienHanh" và nhấp chuột vào dòng tài liệu cần nâng cấp phiên bản!', ui.ButtonSet.OK);
    return;
  }

  var row = activeSheet.getActiveRange().getRow();
  if (row <= 1) {
    ui.alert('Thông báo', 'Vui lòng chọn dòng chứa tài liệu (từ dòng 2 trở đi)!', ui.ButtonSet.OK);
    return;
  }

  // Đọc thông tin bản hiện tại
  var docCode = sheetMain.getRange(row, 1).getValue();
  var docTitle = sheetMain.getRange(row, 2).getValue();
  var oldVersion = sheetMain.getRange(row, 5).getValue();
  var oldReleaseDate = sheetMain.getRange(row, 6).getValue();
  var oldDriveUrl = sheetMain.getRange(row, 7).getValue();

  if (!docCode || !docTitle) {
    ui.alert('Lỗi', 'Dòng được chọn không có Mã tài liệu hoặc Tên quy trình hợp lệ!', ui.ButtonSet.OK);
    return;
  }

  // 1. Nhập Phiên bản mới
  var promptVer = ui.prompt(
    'Bước 1: Nâng cấp phiên bản cho ' + docCode,
    'Phiên bản hiện tại: [' + oldVersion + ']\nNhập số phiên bản MỚI (Ví dụ: v3.3, v2.1):',
    ui.ButtonSet.OK_CANCEL
  );
  if (promptVer.getSelectedButton() !== ui.Button.OK) return;
  var newVersion = promptVer.getResponseText().trim();
  if (!newVersion) {
    ui.alert('Lỗi: Phiên bản mới không được để trống!');
    return;
  }

  // 2. Nhập Lý do thay đổi
  var promptReason = ui.prompt(
    'Bước 2: Lý do thay đổi & Nội dung cập nhật',
    'Tại sao cần sửa đổi quy trình này? (Ví dụ: Cập nhật vật liệu mới, tối ưu bước nghiệm thu...):',
    ui.ButtonSet.OK_CANCEL
  );
  if (promptReason.getSelectedButton() !== ui.Button.OK) return;
  var reasonChange = promptReason.getResponseText().trim();

  // 3. Người phê duyệt
  var promptAuthor = ui.prompt(
    'Bước 3: Người lập / Phê duyệt',
    'Ai phê duyệt phiên bản mới này? (Ví dụ: Ban Giám Đốc, Trưởng phòng Kỹ Thuật...):',
    ui.ButtonSet.OK_CANCEL
  );
  if (promptAuthor.getSelectedButton() !== ui.Button.OK) return;
  var author = promptAuthor.getResponseText().trim() || "Ban Quản Trị";

  // 4. Link Google Drive bản mới
  var promptNewUrl = ui.prompt(
    'Bước 4: Link Google Drive file mới (Tùy chọn)',
    'Dán link Google Drive của file mới (Nếu dùng chung link cũ thì để trống):',
    ui.ButtonSet.OK_CANCEL
  );
  if (promptNewUrl.getSelectedButton() !== ui.Button.OK) return;
  var newDriveUrl = promptNewUrl.getResponseText().trim() || oldDriveUrl;

  var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  // Format ngày cũ
  var formattedOldDate = oldReleaseDate;
  if (oldReleaseDate instanceof Date) {
    formattedOldDate = Utilities.formatDate(oldReleaseDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  // LƯU BẢN CŨ SANG TAB LICHSUPHIENBAN
  var historyRow = [
    docCode,
    oldVersion,
    formattedOldDate,
    todayStr, // Ngày hết hiệu lực chính là hôm nay
    "Đã thay thế",
    author,
    reasonChange || "Cập nhật nâng cấp lên phiên bản " + newVersion,
    oldDriveUrl,
    "Tự động lưu trữ khi nâng cấp lên " + newVersion
  ];

  sheetHistory.appendRow(historyRow);

  // CẬP NHẬT LẠI DÒNG TRÊN TAB QUYTRINHIENHANH
  sheetMain.getRange(row, 5).setValue(newVersion);
  sheetMain.getRange(row, 6).setValue(todayStr);
  sheetMain.getRange(row, 7).setValue(newDriveUrl);

  ui.alert(
    'Nâng cấp thành công! 🚀',
    '• Tài liệu: ' + docCode + ' - ' + docTitle + '\n' +
    '• Bản cũ [' + oldVersion + '] đã được chuyển an toàn sang Tab "LichSuPhienBan".\n' +
    '• Bản mới [' + newVersion + '] hiện đang là bản áp dụng chính thức từ ngày ' + todayStr + '.\n\n' +
    'ProcessHub sẽ tự động hiển thị bản mới này ngay lập tức!',
    ui.ButtonSet.OK
  );
}

/**
 * 3. CHUẨN HÓA & KIỂM TRA LINK GOOGLE DRIVE
 */
function cleanGoogleDriveLinks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var ui = SpreadsheetApp.getUi();

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert('Trang tính chưa có dữ liệu để kiểm tra.');
    return;
  }

  var countChecked = 0;
  var countDriveFound = 0;

  var data = sheet.getDataRange().getValues();
  // Tìm cột link Google Drive
  var colDrive = -1;
  for (var c = 0; c < data[0].length; c++) {
    var h = data[0][c].toString().toLowerCase();
    if (h.indexOf('drive') >= 0 || h.indexOf('link') >= 0 || h.indexOf('url') >= 0) {
      colDrive = c + 1;
      break;
    }
  }

  if (colDrive === -1) {
    ui.alert('Không tìm thấy cột "Link Google Drive" trong trang tính này!');
    return;
  }

  for (var r = 2; r <= lastRow; r++) {
    var cell = sheet.getRange(r, colDrive);
    var val = (cell.getValue() || '').toString().trim();
    if (val) {
      countChecked++;
      if (val.indexOf('drive.google.com') >= 0) {
        countDriveFound++;
      }
    }
  }

  ui.alert(
    'Kết quả kiểm tra link Google Drive',
    '• Đã quét: ' + countChecked + ' link\n' +
    '• Link Google Drive hợp lệ: ' + countDriveFound + ' link\n\n' +
    'Lưu ý quan trọng: Nhớ đảm bảo trên Google Drive bạn đã đổi quyền chia sẻ file sang "Bất kỳ ai có đường liên kết đều có thể xem" để nhân viên có thể tải về!',
    ui.ButtonSet.OK
  );
}

/**
 * 4. WEB APP API ENDPOINT (Hỗ trợ truy cập đường link /exec từ trình duyệt hoặc ProcessHub)
 * Khi truy cập link Web App: https://script.google.com/macros/s/.../exec
 * Hệ thống sẽ tự động trả về toàn bộ dữ liệu Quy trình & Lịch sử phiên bản dạng JSON chuẩn.
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetMain = ss.getSheetByName('QuyTrinhHienHanh');
    var sheetHistory = ss.getSheetByName('LichSuPhienBan');

    // Nếu không tìm thấy tab 'QuyTrinhHienHanh' hoặc tab đó trống (< 2 dòng):
    if (!sheetMain || sheetMain.getLastRow() < 2) {
      var allSheets = ss.getSheets();
      for (var s = 0; s < allSheets.length; s++) {
        var sName = allSheets[s].getName().toLowerCase();
        if (sName !== 'lichsuphienban' && allSheets[s].getLastRow() >= 2) {
          sheetMain = allSheets[s];
          break;
        }
      }
    }

    var documents = [];
    if (sheetMain && sheetMain.getLastRow() >= 2) {
      var dataMain = sheetMain.getDataRange().getValues();
      var headers = (dataMain[0] || []).map(function(h) { return (h || '').toString().toLowerCase().trim(); });

      var colCode = -1, colTitle = -1, colDept = -1, colCat = -1, colStatus = -1, colVer = -1, colDate = -1, colDrive = -1, colDesc = -1, colTags = -1;
      for (var c = 0; c < headers.length; c++) {
        var h = headers[c];
        if (colCode === -1 && (h.indexOf('mã') >= 0 || h.indexOf('code') >= 0)) colCode = c;
        else if (colTitle === -1 && (h.indexOf('tên') >= 0 || h.indexOf('tiêu đề') >= 0 || h.indexOf('title') >= 0 || h.indexOf('quy trình') >= 0)) colTitle = c;
        else if (colDept === -1 && (h.indexOf('phòng') >= 0 || h.indexOf('bộ phận') >= 0 || h.indexOf('dept') >= 0)) colDept = c;
        else if (colCat === -1 && (h.indexOf('loại') >= 0 || h.indexOf('phân loại') >= 0 || h.indexOf('thể loại') >= 0 || h.indexOf('cat') >= 0)) colCat = c;
        else if (colStatus === -1 && (h.indexOf('trạng thái') >= 0 || h.indexOf('status') >= 0 || h.indexOf('tình trạng') >= 0)) colStatus = c;
        else if (colVer === -1 && (h.indexOf('phiên bản') >= 0 || h.indexOf('version') >= 0)) colVer = c;
        else if (colDate === -1 && (h.indexOf('ngày') >= 0 || h.indexOf('date') >= 0)) colDate = c;
        else if (colDrive === -1 && (h.indexOf('drive') >= 0 || h.indexOf('link') >= 0 || h.indexOf('url') >= 0)) colDrive = c;
        else if (colDesc === -1 && (h.indexOf('mô tả') >= 0 || h.indexOf('tóm tắt') >= 0 || h.indexOf('desc') >= 0)) colDesc = c;
        else if (colTags === -1 && (h.indexOf('từ khóa') >= 0 || h.indexOf('tag') >= 0)) colTags = c;
      }

      // Default index fallbacks nếu không nhận diện được qua header
      if (colCode === -1) colCode = 0;
      if (colTitle === -1) colTitle = 1;
      if (colDept === -1) colDept = 2;
      if (colCat === -1) colCat = 3;

      for (var i = 1; i < dataMain.length; i++) {
        var row = dataMain[i];
        var code = (row[colCode] || '').toString().trim();
        var title = (row[colTitle] || '').toString().trim();

        // Tự động hoán đổi nếu người dùng nhập tiêu đề dài vào cột Mã
        if (!title && code.length > 10) {
          title = code;
          code = 'DOC-' + i;
        } else if (!title && code) {
          title = code;
        }

        if (!title) continue;

        var rawDocStatus = (colStatus >= 0 && row[colStatus]) ? row[colStatus].toString().trim() : 'Chính thức';

        documents.push({
          id: 'sheet-' + i + '-' + (code || ('doc-' + i)).replace(/[^a-zA-Z0-9]/g, ''),
          code: code || ('DOC-' + i),
          title: title,
          department: (row[colDept] || 'Bộ phận Sản Xuất').toString().trim(),
          category: (row[colCat] || 'Hướng dẫn').toString().trim(),
          status: rawDocStatus || 'Chính thức',
          version: (colVer >= 0 && row[colVer] ? row[colVer] : 'v1.0').toString().trim(),
          updatedAt: colDate >= 0 ? formatDateIso(row[colDate]) : todayStr,
          driveUrl: (colDrive >= 0 && row[colDrive] ? row[colDrive] : '').toString().trim(),
          description: (colDesc >= 0 && row[colDesc] ? row[colDesc] : '').toString().trim(),
          tags: (colTags >= 0 && row[colTags] ? row[colTags] : '').toString().split(',').map(function(t) { return t.trim().toLowerCase(); }).filter(Boolean)
        });
      }
    }

    var history = [];
    if (sheetHistory && sheetHistory.getLastRow() >= 2) {
      var dataHist = sheetHistory.getDataRange().getValues();
      for (var j = 1; j < dataHist.length; j++) {
        var hRow = dataHist[j];
        var hCode = (hRow[0] || '').toString().trim();
        if (!hCode) continue;

        var rawStatus = (hRow[4] || '').toString().trim();
        var rawDep = (hRow[3] || '').toString().trim();
        var isActive = rawStatus.toLowerCase().indexOf('hieu luc') >= 0 || 
                       rawStatus.toLowerCase().indexOf('active') >= 0 || 
                       rawDep.toLowerCase().indexOf('dang ap dung') >= 0 || 
                       rawDep === '';

        history.push({
          code: hCode,
          version: (hRow[1] || 'v1.0').toString().trim(),
          releaseDate: formatDateIso(hRow[2]),
          deprecatedDate: rawDep || (isActive ? 'Đang áp dụng' : ''),
          status: isActive ? 'active' : 'archived',
          author: (hRow[5] || 'Ban Quản Trị').toString().trim(),
          reason: (hRow[6] || '').toString().trim(),
          driveUrl: (hRow[7] || '').toString().trim(),
          notes: (hRow[8] || '').toString().trim()
        });
      }
    }

    // ĐỌC CẤU HÌNH HỆ THỐNG & LINK TRỢ LÝ AI NOTEBOOKLM (Linh hoạt mọi tên tab và không dấu)
    var notebookLmUrl = '';
    var sheetConfig = null;
    var allSheets = ss.getSheets();
    for (var s = 0; s < allSheets.length; s++) {
      var sNorm = allSheets[s].getName().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
      if (sNorm.indexOf('cauhinh') >= 0 || sNorm.indexOf('caidat') >= 0 || sNorm.indexOf('setting') >= 0 || sNorm.indexOf('config') >= 0) {
        sheetConfig = allSheets[s];
        break;
      }
    }

    if (sheetConfig && sheetConfig.getLastRow() >= 1) {
      var configData = sheetConfig.getDataRange().getValues();
      for (var k = 0; k < configData.length; k++) {
        var rowKey = (configData[k][0] || '').toString().toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        var isAiRow = rowKey.indexOf('ai') >= 0 || rowKey.indexOf('notebook') >= 0 || rowKey.indexOf('troly') >= 0;

        for (var col = 0; col < configData[k].length; col++) {
          var cellVal = (configData[k][col] || '').toString().trim();
          if (cellVal.indexOf('http://') === 0 || cellVal.indexOf('https://') === 0) {
            if (isAiRow || cellVal.indexOf('notebooklm') >= 0 || cellVal.indexOf('notebook.google') >= 0) {
              notebookLmUrl = cellVal;
              break;
            }
          }
        }
        if (notebookLmUrl) break;
      }
    }

    // Fallback: Nếu không tìm thấy, quét Tab QuyTrinhHienHanh
    if (!notebookLmUrl && sheetMain && sheetMain.getLastRow() >= 2) {
      for (var d = 0; d < documents.length; d++) {
        var docItem = documents[d];
        var itemCode = (docItem.code || '').toUpperCase();
        var itemTitle = (docItem.title || '').toLowerCase();
        if (itemCode === 'AI-ASSISTANT' || itemCode === 'NOTEBOOKLM' || itemTitle.indexOf('trợ lý ai') >= 0 || itemTitle.indexOf('notebooklm') >= 0) {
          if (docItem.driveUrl) {
            notebookLmUrl = docItem.driveUrl;
            break;
          }
        }
      }
    }

    // ĐỌC DANH SÁCH TÀI KHOẢN & PHÂN QUYỀN (TAB TAIKHOAN / PHANQUYEN / USERS)
    var users = [];
    var sheetUsers = null;
    for (var su = 0; su < allSheets.length; su++) {
      var uNorm = allSheets[su].getName().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
      if (uNorm.indexOf('taikhoan') >= 0 || uNorm.indexOf('phanquyen') >= 0 || uNorm.indexOf('user') >= 0 || uNorm.indexOf('account') >= 0 || uNorm.indexOf('nguoidung') >= 0) {
        sheetUsers = allSheets[su];
        break;
      }
    }

    if (sheetUsers && sheetUsers.getLastRow() >= 2) {
      var usersData = sheetUsers.getDataRange().getValues();
      var uHeaders = (usersData[0] || []).map(function(h) { return (h || '').toString().toLowerCase().trim(); });
      
      var colUser = -1, colPass = -1, colName = -1, colUDept = -1, colRole = -1, colAllowed = -1;
      for (var cu = 0; cu < uHeaders.length; cu++) {
        var uh = uHeaders[cu];
        if (colUser === -1 && (uh.indexOf('user') >= 0 || uh.indexOf('đăng nhập') >= 0 || uh.indexOf('id') >= 0 || uh.indexOf('tên') >= 0)) colUser = cu;
        else if (colPass === -1 && (uh.indexOf('pass') >= 0 || uh.indexOf('mật khẩu') >= 0 || uh.indexOf('pin') >= 0)) colPass = cu;
        else if (colName === -1 && (uh.indexOf('họ') >= 0 || uh.indexOf('hiển thị') >= 0 || uh.indexOf('name') >= 0)) colName = cu;
        else if (colUDept === -1 && (uh.indexOf('phòng') >= 0 || uh.indexOf('bộ phận') >= 0 || uh.indexOf('dept') >= 0)) colUDept = cu;
        else if (colRole === -1 && (uh.indexOf('vai trò') >= 0 || uh.indexOf('role') >= 0 || uh.indexOf('quyền') >= 0)) colRole = cu;
        else if (colAllowed === -1 && (uh.indexOf('xem') >= 0 || uh.indexOf('allowed') >= 0 || uh.indexOf('truy cập') >= 0)) colAllowed = cu;
      }

      if (colUser === -1) colUser = 0;
      if (colPass === -1) colPass = 1;
      if (colName === -1) colName = 2;
      if (colUDept === -1) colUDept = 3;
      if (colRole === -1) colRole = 4;
      if (colAllowed === -1) colAllowed = 5;

      for (var uRow = 1; uRow < usersData.length; uRow++) {
        var uItem = usersData[uRow];
        var uUsername = (uItem[colUser] || '').toString().trim();
        var uPassword = (uItem[colPass] || '').toString().trim();
        if (!uUsername) continue;

        var uFullName = (uItem[colName] || uUsername).toString().trim();
        var uDept = (uItem[colUDept] || 'Bộ phận Sản Xuất').toString().trim();
        var uRole = (uItem[colRole] || 'User').toString().trim();
        var rawAllowed = (uItem[colAllowed] || '').toString().trim();

        var allowedList = [];
        if (!rawAllowed || rawAllowed.indexOf('*') >= 0 || uRole.toLowerCase() === 'admin' || uUsername.toLowerCase() === 'admin') {
          allowedList = ['*'];
        } else {
          allowedList = rawAllowed.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        }

        var icon = 'user-check';
        if (uRole.toLowerCase() === 'admin' || uUsername.toLowerCase() === 'admin') icon = 'shield-check';
        else if (uDept.indexOf('Kỹ Thuật') >= 0 || uDept.indexOf('Thiết Kế') >= 0) icon = 'pen-tool';
        else if (uDept.indexOf('Sản Xuất') >= 0) icon = 'hammer';
        else if (uDept.indexOf('Kinh Doanh') >= 0) icon = 'briefcase';
        else if (uDept.indexOf('Hành Chính') >= 0 || uDept.indexOf('Nhân Sự') >= 0) icon = 'users';

        users.push({
          id: 'user-' + uUsername.toLowerCase().replace(/[^a-z0-9]/g, ''),
          username: uUsername,
          password: uPassword,
          fullName: uFullName,
          department: uDept,
          role: (uRole.toLowerCase() === 'admin' || uUsername.toLowerCase() === 'admin') ? 'Admin' : 'User',
          allowedDepartments: allowedList,
          avatarIcon: icon
        });
      }
    }

    var responseData = {
      status: 'success',
      totalDocuments: documents.length,
      totalHistory: history.length,
      totalUsers: users.length,
      notebookLmUrl: notebookLmUrl || '',
      updatedAt: new Date().toISOString(),
      documents: documents,
      history: history,
      users: users
    };

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorResponse = {
      status: 'error',
      message: err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function formatDateIso(val) {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return val.toString().trim();
}

function setupProcessHubSheetsSilent() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMain = ss.getSheetByName('QuyTrinhHienHanh') || ss.insertSheet('QuyTrinhHienHanh', 0);
  var headersMain = [
    ["Mã tài liệu", "Tên tài liệu / Quy trình", "Phòng ban", "Phân loại", "Phiên bản", "Ngày ban hành", "Link Google Drive", "Mô tả tóm tắt", "Từ khóa tìm kiếm"]
  ];
  if (sheetMain.getLastRow() < 1) {
    sheetMain.getRange(1, 1, 1, headersMain[0].length).setValues(headersMain);
  }
  if (sheetMain.getLastRow() <= 1) {
    var sampleDataMain = [
      ["QT-TK-01", "Quy trình thiết kế phương án kiến trúc & nội thất", "Bộ phận Kỹ Thuật", "Quy trình", "v3.2", "2026-10-10", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Quy định các bước từ tiếp nhận brief khách hàng, lên concept 2D/3D, duyệt VR với CĐT.", "kiến trúc, concept, 3d, brief"],
      ["TC-BV-02", "Tiêu chuẩn thể hiện hồ sơ bản vẽ kỹ thuật thi công (CAD & Revit)", "Bộ phận Kỹ Thuật", "Tiêu chuẩn", "v2.0", "2026-09-25", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Bộ tiêu chuẩn nét vẽ, tỷ lệ, Family Revit và tích hợp mã QR truy xuất bản vẽ.", "bản vẽ, cad, revit, ctb"],
      ["HD-SX-01", "Hướng dẫn vận hành máy CNC, máy dán cạnh & kiểm soát chất lượng xưởng", "Bộ phận Sản Xuất", "Hướng dẫn", "v2.5", "2026-10-05", "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing", "Chỉ dẫn chi tiết cách vận hành máy móc xưởng gỗ, kiểm tra keo PUR và kiểm tra dao cắt CNC.", "sản xuất, xưởng, cnc, keo pur"],
      ["TC-AT-01", "Tiêu chuẩn an toàn lao động, vệ sinh công nghiệp & PCCC phân xưởng", "Bộ phận Sản Xuất", "Tiêu chuẩn", "v3.0", "2026-07-20", "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing", "Tiêu chuẩn an toàn PCCC theo Nghị định 50/2024/NĐ-CP và hệ thống hút bụi trung tâm.", "an toàn, pccc, xưởng, bảo hộ"],
      ["CS-GD-01", "Chính sách bảo mật thông tin nội bộ, quản lý dữ liệu & phân quyền", "Ban Giám Đốc", "Chính sách", "v1.2", "2026-06-30", "https://drive.google.com/file/d/1J_Sample_BaoMatThongTin_DriveFile/view?usp=sharing", "Quy định phân quyền dữ liệu giữa các bộ phận và cam kết bảo mật NDA.", "bảo mật, chính sách, nda, giám đốc"]
    ];
    sheetMain.getRange(2, 1, sampleDataMain.length, sampleDataMain[0].length).setValues(sampleDataMain);
  }

  var sheetHistory = ss.getSheetByName('LichSuPhienBan') || ss.insertSheet('LichSuPhienBan', 1);
  var headersHistory = [
    ["Mã tài liệu", "Phiên bản", "Ngày ban hành", "Ngày hết hiệu lực", "Trạng thái", "Người cập nhật / Phê duyệt", "Lý do thay đổi / Nội dung cập nhật", "Link Google Drive bản cũ", "Ghi chú"]
  ];
  if (sheetHistory.getLastRow() < 1) {
    sheetHistory.getRange(1, 1, 1, headersHistory[0].length).setValues(headersHistory);
  }
  if (sheetHistory.getLastRow() <= 1) {
    var sampleDataHistory = [
      ["QT-TK-01", "v3.2", "2026-10-10", "Đang áp dụng", "Đang hiệu lực", "Ban Giám Đốc", "Cập nhật quy trình duyệt phối cảnh 3D bằng kính VR và chuẩn hóa các mốc nghiệm thu concept với Chủ đầu tư.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Áp dụng toàn diện từ Q4/2026"],
      ["QT-TK-01", "v3.1", "2026-05-15", "2026-10-10", "Đã thay thế", "Trưởng phòng Thiết Kế", "Bổ sung bước lập bảng Moodboard vật liệu & màu sắc thực tế trước khi lên 3D chi tiết để giảm thời gian chỉnh sửa.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Thay thế cho bản v3.0"],
      ["QT-TK-01", "v3.0", "2026-01-10", "2026-05-15", "Đã thay thế", "Ban Giám Đốc", "Nâng cấp toàn diện quy trình thiết kế tích hợp mô hình BIM/Revit đồng bộ hóa dữ liệu trực tiếp với xưởng sản xuất.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Chuyển từ CAD sang Revit"],
      ["QT-TK-01", "v2.0", "2025-06-20", "2026-01-10", "Đã thay thế", "P. Thiết Kế", "Chuẩn hóa quy trình thiết kế 2D/3D phân tách rõ 2 giai đoạn: Phương án sơ phác và Hồ sơ triển khai thi công chi tiết.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Lưu trữ đối soát hồ sơ 2025"],
      ["QT-TK-01", "v1.0", "2024-03-15", "2025-06-20", "Đã thay thế", "Giám Đốc Sáng Lập", "Ban hành lần đầu quy trình thiết kế cơ sở nội bộ cho H-Design.", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Bản khởi tạo ban đầu"],
      ["QC-BV-02", "v2.0", "2026-09-25", "Đang áp dụng", "Đang hiệu lực", "P. Kỹ Thuật", "Chuẩn hóa hệ thống Family Revit, file mẫu in CTB theo tiêu chuẩn TCVN 2026 và tích hợp mã QR truy xuất bản vẽ hiện trường.", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Áp dụng cho KTS & Họa viên"],
      ["QC-BV-02", "v1.5", "2026-03-10", "2026-09-25", "Đã thay thế", "P. Thiết Kế", "Thống nhất quy cách đóng khung tên bản vẽ chuẩn khổ A3/A1 và quy tắc đánh số thứ tự chi tiết kiến trúc.", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Hết hiệu lực từ 25/09/2026"],
      ["HD-SX-01", "v2.5", "2026-10-05", "Đang áp dụng", "Đang hiệu lực", "Quản Đốc Phân Xưởng", "Bổ sung quy định kiểm tra độ bám keo PUR chịu nước và checklist kiểm tra độ mòn dao cắt CNC sau 80 giờ chạy liên tục.", "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing", "Bắt buộc tại xưởng gỗ"]
    ];
    sheetHistory.getRange(2, 1, sampleDataHistory.length, sampleDataHistory[0].length).setValues(sampleDataHistory);
  }
}

/**
 * 5. WEB APP POST API ENDPOINT (Hỗ trợ thêm mới quy trình trực tiếp từ Web App)
 */
function doPost(e) {
  try {
    var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    if (!contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Không có dữ liệu gửi lên' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(contents);
    var action = payload.action || 'addDocument';
    var doc = payload.document || payload;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetMain = ss.getSheetByName('QuyTrinhHienHanh');
    if (!sheetMain) {
      setupProcessHubSheetsSilent();
      sheetMain = ss.getSheetByName('QuyTrinhHienHanh');
    }

    var tagsStr = Array.isArray(doc.tags) ? doc.tags.join(', ') : (doc.tags || '');
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    // XỬ LÝ 1: CẬP NHẬT / SỬA LINK QUY TRÌNH HIỆN CÓ
    if (action === 'updateDocument') {
      var lastRow = sheetMain.getLastRow();
      var foundRow = -1;
      var targetCode = (doc.code || '').trim().toUpperCase();

      if (lastRow > 1) {
        var codes = sheetMain.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < codes.length; i++) {
          if ((codes[i][0] || '').toString().trim().toUpperCase() === targetCode) {
            foundRow = i + 2;
            break;
          }
        }
      }

      if (foundRow > 0) {
        // Đọc giá trị cũ trước khi ghi đè
        var oldValues = sheetMain.getRange(foundRow, 1, 1, 9).getValues()[0];
        var oldCode = oldValues[0] || targetCode;
        var oldVer = oldValues[4] || 'v1.0';
        var oldDate = oldValues[5] || todayStr;
        var oldDriveUrl = oldValues[6] || '';

        // Tự động lưu bản cũ vào tab LichSuPhienBan nếu link hoặc phiên bản thay đổi
        if (oldDriveUrl !== doc.driveUrl || oldVer !== doc.version) {
          var sheetHistory = ss.getSheetByName('LichSuPhienBan') || ss.insertSheet('LichSuPhienBan', 1);
          if (sheetHistory.getLastRow() < 1) {
            sheetHistory.appendRow(["Mã tài liệu", "Phiên bản", "Ngày ban hành", "Ngày hết hiệu lực", "Trạng thái", "Người cập nhật / Phê duyệt", "Lý do thay đổi / Nội dung cập nhật", "Link Google Drive bản cũ", "Ghi chú"]);
          }
          sheetHistory.appendRow([
            oldCode,
            oldVer,
            oldDate,
            todayStr,
            "Đã thay thế",
            payload.author || doc.department || "Ban Quản Trị",
            payload.changeReason || "Cập nhật đường dẫn Google Drive / phiên bản mới.",
            oldDriveUrl,
            "Lưu trữ tự động khi sửa tài liệu từ ProcessHub"
          ]);
        }

        // Cập nhật dòng hiện hành
        var updatedRow = [
          doc.code || oldCode,
          doc.title || oldValues[1],
          doc.department || oldValues[2],
          doc.category || oldValues[3],
          doc.version || oldVer,
          doc.updatedAt || todayStr,
          doc.driveUrl || '',
          doc.description || '',
          tagsStr
        ];
        sheetMain.getRange(foundRow, 1, 1, 9).setValues([updatedRow]);

        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Đã cập nhật thành công quy trình [' + targetCode + '] trên Google Sheet!',
          document: doc
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // XỬ LÝ 2: XÓA QUY TRÌNH KHỎI GOOGLE SHEET (ADMIN)
    if (action === 'deleteDocument') {
      var lastRowDel = sheetMain.getLastRow();
      var foundRowDel = -1;
      var targetCodeDel = (doc.code || '').trim().toUpperCase();
      var targetTitleDel = (doc.title || '').trim().toLowerCase();

      if (lastRowDel > 1) {
        var sheetValues = sheetMain.getRange(2, 1, lastRowDel - 1, 2).getValues();
        for (var k = 0; k < sheetValues.length; k++) {
          var rCode = (sheetValues[k][0] || '').toString().trim().toUpperCase();
          var rTitle = (sheetValues[k][1] || '').toString().trim().toLowerCase();
          if ((targetCodeDel && rCode === targetCodeDel) || (targetTitleDel && rTitle === targetTitleDel)) {
            foundRowDel = k + 2;
            break;
          }
        }
      }

      if (foundRowDel > 0) {
        var oldDelValues = sheetMain.getRange(foundRowDel, 1, 1, 9).getValues()[0];
        var dCode = oldDelValues[0] || targetCodeDel;
        var dVer = oldDelValues[4] || 'v1.0';
        var dDate = oldDelValues[5] || todayStr;
        var dDriveUrl = oldDelValues[6] || '';

        // Tự động lưu 1 dòng vào LichSuPhienBan để lưu vết kiểm toán và đối soát
        var sheetHistDel = ss.getSheetByName('LichSuPhienBan') || ss.insertSheet('LichSuPhienBan', 1);
        if (sheetHistDel.getLastRow() < 1) {
          sheetHistDel.appendRow(["Mã tài liệu", "Phiên bản", "Ngày ban hành", "Ngày hết hiệu lực", "Trạng thái", "Người cập nhật / Phê duyệt", "Lý do thay đổi / Nội dung cập nhật", "Link Google Drive bản cũ", "Ghi chú"]);
        }
        sheetHistDel.appendRow([
          dCode,
          dVer,
          dDate,
          todayStr,
          "Đã xóa khỏi danh mục",
          payload.deletedBy || "Ban Giám Đốc",
          "Xóa quy trình từ ProcessHub Web App",
          dDriveUrl,
          "Đã gỡ bỏ khỏi danh mục hiện hành"
        ]);

        // Xóa dòng khỏi tab QuyTrinhHienHanh
        sheetMain.deleteRow(foundRowDel);

        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Đã xóa thành công quy trình [' + targetCodeDel + '] khỏi Google Sheet và lưu vết vào Lịch Sử!',
          document: doc
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'warning',
          message: 'Không tìm thấy dòng có mã [' + targetCodeDel + '] trên Google Sheet để xóa.',
          document: doc
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // XỬ LÝ 3: CẬP NHẬT LINK TRỢ LÝ AI NOTEBOOKLM LÊN GOOGLE SHEET
    if (action === 'updateAiUrl' || action === 'updateConfig') {
      var newAiUrl = (payload.url || payload.notebookLmUrl || '').toString().trim();
      var sheetConf = null;
      var sheetsList = ss.getSheets();
      for (var sh = 0; sh < sheetsList.length; sh++) {
        var shNorm = sheetsList[sh].getName().toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        if (shNorm.indexOf('cauhinh') >= 0 || shNorm.indexOf('caidat') >= 0 || shNorm.indexOf('setting') >= 0 || shNorm.indexOf('config') >= 0) {
          sheetConf = sheetsList[sh];
          break;
        }
      }

      if (!sheetConf) {
        sheetConf = ss.insertSheet('CauHinhHeThong', ss.getSheets().length);
        sheetConf.appendRow(["Tên cấu hình / Tính năng", "Giá trị thiết lập (URL / Thông tin)", "Mô tả"]);
      }

      var lastRc = sheetConf.getLastRow();
      var foundConfRow = -1;
      if (lastRc >= 2) {
        var confRows = sheetConf.getRange(2, 1, lastRc - 1, 1).getValues();
        for (var cr = 0; cr < confRows.length; cr++) {
          var keyNorm = (confRows[cr][0] || '').toString().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
          if (keyNorm.indexOf('notebook') >= 0 || keyNorm.indexOf('ai') >= 0 || keyNorm.indexOf('troly') >= 0) {
            foundConfRow = cr + 2;
            break;
          }
        }
      }

      if (foundConfRow > 0) {
        sheetConf.getRange(foundConfRow, 2).setValue(newAiUrl);
      } else {
        sheetConf.appendRow(["Link Trợ lý AI NotebookLM", newAiUrl, "Tự động cập nhật từ ProcessHub Web App"]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Đã lưu và đồng bộ thành công link Trợ lý AI NotebookLM lên Google Sheet!',
        url: newAiUrl
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // XỬ LÝ 4: DUYỆT PHÁT HÀNH QUY TRÌNH (ADMIN)
    if (action === 'approveDocument') {
      var lastRowApprove = sheetMain.getLastRow();
      var foundRowApprove = -1;
      var targetCodeApprove = (doc.code || '').trim().toUpperCase();

      if (lastRowApprove > 1) {
        var codesApprove = sheetMain.getRange(2, 1, lastRowApprove - 1, 1).getValues();
        for (var ap = 0; ap < codesApprove.length; ap++) {
          if ((codesApprove[ap][0] || '').toString().trim().toUpperCase() === targetCodeApprove) {
            foundRowApprove = ap + 2;
            break;
          }
        }
      }

      if (foundRowApprove > 0) {
        // Cập nhật trạng thái sang Chính thức và ngày hiệu lực
        var headersArr = sheetMain.getRange(1, 1, 1, sheetMain.getLastColumn()).getValues()[0];
        var colStatusIdx = -1;
        var colDateIdx = -1;
        for (var cs = 0; cs < headersArr.length; cs++) {
          var hName = (headersArr[cs] || '').toString().toLowerCase();
          if (colStatusIdx === -1 && (hName.indexOf('trạng thái') >= 0 || hName.indexOf('status') >= 0)) {
            colStatusIdx = cs + 1;
          }
          if (colDateIdx === -1 && (hName.indexOf('ngày') >= 0 || hName.indexOf('date') >= 0)) {
            colDateIdx = cs + 1;
          }
        }

        if (colStatusIdx > 0) {
          sheetMain.getRange(foundRowApprove, colStatusIdx).setValue("Chính thức");
        }
        if (colDateIdx > 0 && doc.updatedAt) {
          sheetMain.getRange(foundRowApprove, colDateIdx).setValue(doc.updatedAt);
        }
        
        // Thêm vào tab LichSuPhienBan
        var sheetHistory = ss.getSheetByName('LichSuPhienBan') || ss.insertSheet('LichSuPhienBan', 1);
        if (sheetHistory.getLastRow() < 1) {
          sheetHistory.appendRow(["Mã tài liệu", "Phiên bản", "Ngày ban hành", "Ngày hết hiệu lực", "Trạng thái", "Người cập nhật / Phê duyệt", "Lý do thay đổi / Nội dung cập nhật", "Link Google Drive bản cũ", "Ghi chú"]);
        }
        sheetHistory.appendRow([
          targetCodeApprove,
          doc.version || "v1.0",
          doc.updatedAt || todayStr,
          "Đang áp dụng",
          "Đang hiệu lực",
          payload.approvedBy || "Ban Quản Lý",
          "Phê duyệt & ban hành chính thức có hiệu lực áp dụng.",
          doc.driveUrl || "",
          "Duyệt trực tiếp từ ProcessHub Web App"
        ]);

        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Đã duyệt và phát hành chính thức quy trình [' + targetCodeApprove + ']!',
          document: doc
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // XỬ LÝ 5: THÊM MỚI QUY TRÌNH VÀO SHEET (Mặc định)
    var newRow = [
      doc.code || '',
      doc.title || '',
      doc.department || 'Bộ phận Kỹ Thuật',
      doc.category || 'Quy trình',
      doc.status || 'Chính thức',
      doc.version || 'v1.0',
      doc.updatedAt || todayStr,
      doc.driveUrl || '',
      doc.description || '',
      tagsStr
    ];

    sheetMain.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Đã thêm thành công quy trình [' + (doc.code || '') + '] vào Google Sheet!',
      document: doc
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}


