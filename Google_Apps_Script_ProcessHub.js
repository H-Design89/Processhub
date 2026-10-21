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
  "Ban Giám Đốc",
  "Bộ phận Kỹ Thuật",
  "Bộ phận Sản Xuất",
  "Bộ phận Kinh Doanh",
  "Hành Chính - Nhân Sự"
];

var CATEGORIES = [
  "Quy trình",
  "Quy chuẩn",
  "Hướng dẫn",
  "Biểu mẫu",
  "Chính sách"
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
    .addItem('1. Khởi tạo cấu trúc 2 Tab chuẩn (Tự động format & Tạo mẫu)', 'setupProcessHubSheets')
    .addSeparator()
    .addItem('2. Nâng cấp phiên bản (Tự động chuyển bản cũ sang Lịch Sử)', 'archiveAndUpgradeVersion')
    .addItem('3. Chuẩn hóa & Kiểm tra link Google Drive', 'cleanGoogleDriveLinks')
    .addToUi();
}

/**
 * 1. KHỞI TẠO CẤU TRÚC 2 TAB CHUẨN
 */
function setupProcessHubSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var confirm = ui.alert(
    'Xác nhận khởi tạo ProcessHub',
    'Hệ thống sẽ tạo 2 Tab chuẩn: "QuyTrinhHienHanh" và "LichSuPhienBan" cùng định dạng chuyên nghiệp. Bạn có muốn tiếp tục?',
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) return;

  // --- TAB 1: QuyTrinhHienHanh ---
  var sheetMain = ss.getSheetByName('QuyTrinhHienHanh');
  if (!sheetMain) {
    sheetMain = ss.insertSheet('QuyTrinhHienHanh', 0);
  }

  var headersMain = [
    ["Mã tài liệu", "Tên tài liệu / Quy trình", "Phòng ban", "Phân loại", "Phiên bản", "Ngày ban hành", "Link Google Drive", "Mô tả tóm tắt", "Từ khóa tìm kiếm"]
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
    ["QT-TK-01", "Quy trình thiết kế phương án kiến trúc & nội thất", "Bộ phận Kỹ Thuật", "Quy trình", "v3.2", "2026-10-10", "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing", "Quy định các bước từ tiếp nhận brief khách hàng, lên concept 2D/3D, duyệt VR với CĐT.", "kiến trúc, concept, 3d, brief"],
    ["QC-BV-02", "Quy chuẩn thể hiện hồ sơ bản vẽ kỹ thuật thi công (CAD & Revit)", "Bộ phận Kỹ Thuật", "Quy chuẩn", "v2.0", "2026-09-25", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Bộ tiêu chuẩn nét vẽ, tỷ lệ, Family Revit và tích hợp mã QR truy xuất bản vẽ.", "bản vẽ, cad, revit, ctb"],
    ["HD-SX-01", "Hướng dẫn vận hành máy CNC, máy dán cạnh & kiểm soát chất lượng xưởng", "Bộ phận Sản Xuất", "Hướng dẫn", "v2.5", "2026-10-05", "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing", "Chỉ dẫn chi tiết cách vận hành máy móc xưởng gỗ, kiểm tra keo PUR và kiểm tra dao cắt CNC.", "sản xuất, xưởng, cnc, keo pur"],
    ["QC-AT-01", "Quy chuẩn an toàn lao động, vệ sinh công nghiệp & PCCC phân xưởng", "Bộ phận Sản Xuất", "Quy chuẩn", "v3.0", "2026-07-20", "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing", "Tiêu chuẩn an toàn PCCC theo Nghị định 50/2024/NĐ-CP và hệ thống hút bụi trung tâm.", "an toàn, pccc, xưởng, bảo hộ"],
    ["CS-GD-01", "Chính sách bảo mật thông tin nội bộ, quản lý dữ liệu & phân quyền", "Ban Giám Đốc", "Chính sách", "v1.2", "2026-06-30", "https://drive.google.com/file/d/1J_Sample_BaoMatThongTin_DriveFile/view?usp=sharing", "Quy định phân quyền dữ liệu giữa các bộ phận và cam kết bảo mật NDA.", "bảo mật, chính sách, nda, giám đốc"]
  ];

  sheetMain.getRange(2, 1, sampleDataMain.length, sampleDataMain[0].length).setValues(sampleDataMain);

  // Tạo Dropdown chọn Phòng ban & Phân loại cho 500 dòng
  var ruleDept = SpreadsheetApp.newDataValidation().requireValueInList(DEPARTMENTS, true).build();
  sheetMain.getRange("C2:C500").setDataValidation(ruleDept);

  var ruleCat = SpreadsheetApp.newDataValidation().requireValueInList(CATEGORIES, true).build();
  sheetMain.getRange("D2:D500").setDataValidation(ruleCat);

  // Kẻ viền và căn chỉnh Tab 1
  var bodyRangeMain = sheetMain.getRange(2, 1, sampleDataMain.length, headersMain[0].length);
  bodyRangeMain.setFontFamily('Plus Jakarta Sans')
                .setVerticalAlignment('middle');
  sheetMain.getRange("A2:A500").setHorizontalAlignment('center');
  sheetMain.getRange("E2:F500").setHorizontalAlignment('center');

  sheetMain.setColumnWidth(1, 110); // Mã
  sheetMain.setColumnWidth(2, 320); // Tên
  sheetMain.setColumnWidth(3, 170); // Phòng ban
  sheetMain.setColumnWidth(4, 130); // Phân loại
  sheetMain.setColumnWidth(5, 95);  // Phiên bản
  sheetMain.setColumnWidth(6, 120); // Ngày ban hành
  sheetMain.setColumnWidth(7, 280); // Link Drive
  sheetMain.setColumnWidth(8, 300); // Mô tả
  sheetMain.setColumnWidth(9, 180); // Từ khóa

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

  ss.setActiveSheet(sheetMain);
  ui.alert('Thành công! 🎉', 'Đã khởi tạo xong cấu trúc 2 Tab chuẩn và dữ liệu mẫu của ProcessHub. Bạn có thể sử dụng ngay!', ui.ButtonSet.OK);
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

    // Nếu chưa có tab thì tự động tạo cấu trúc cơ bản
    if (!sheetMain || !sheetHistory) {
      setupProcessHubSheetsSilent();
      sheetMain = ss.getSheetByName('QuyTrinhHienHanh');
      sheetHistory = ss.getSheetByName('LichSuPhienBan');
    }

    var documents = [];
    if (sheetMain && sheetMain.getLastRow() >= 2) {
      var dataMain = sheetMain.getDataRange().getValues();
      for (var i = 1; i < dataMain.length; i++) {
        var row = dataMain[i];
        var code = (row[0] || '').toString().trim();
        var title = (row[1] || '').toString().trim();
        if (!title) continue;

        documents.push({
          id: 'sheet-' + i + '-' + code.replace(/[^a-zA-Z0-9]/g, ''),
          code: code || ('DOC-' + i),
          title: title,
          department: (row[2] || 'Chung').toString().trim(),
          category: (row[3] || 'Quy trình').toString().trim(),
          version: (row[4] || 'v1.0').toString().trim(),
          updatedAt: formatDateIso(row[5]),
          driveUrl: (row[6] || '').toString().trim(),
          description: (row[7] || '').toString().trim(),
          tags: (row[8] || '').toString().split(',').map(function(t) { return t.trim().toLowerCase(); }).filter(Boolean)
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

    var responseData = {
      status: 'success',
      totalDocuments: documents.length,
      totalHistory: history.length,
      updatedAt: new Date().toISOString(),
      documents: documents,
      history: history
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
      ["QC-BV-02", "Quy chuẩn thể hiện hồ sơ bản vẽ kỹ thuật thi công (CAD & Revit)", "Bộ phận Kỹ Thuật", "Quy chuẩn", "v2.0", "2026-09-25", "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing", "Bộ tiêu chuẩn nét vẽ, tỷ lệ, Family Revit và tích hợp mã QR truy xuất bản vẽ.", "bản vẽ, cad, revit, ctb"],
      ["HD-SX-01", "Hướng dẫn vận hành máy CNC, máy dán cạnh & kiểm soát chất lượng xưởng", "Bộ phận Sản Xuất", "Hướng dẫn", "v2.5", "2026-10-05", "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing", "Chỉ dẫn chi tiết cách vận hành máy móc xưởng gỗ, kiểm tra keo PUR và kiểm tra dao cắt CNC.", "sản xuất, xưởng, cnc, keo pur"],
      ["QC-AT-01", "Quy chuẩn an toàn lao động, vệ sinh công nghiệp & PCCC phân xưởng", "Bộ phận Sản Xuất", "Quy chuẩn", "v3.0", "2026-07-20", "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing", "Tiêu chuẩn an toàn PCCC theo Nghị định 50/2024/NĐ-CP và hệ thống hút bụi trung tâm.", "an toàn, pccc, xưởng, bảo hộ"],
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

    // XỬ LÝ 2: THÊM MỚI QUY TRÌNH VÀO SHEET (Mặc định)
    var newRow = [
      doc.code || '',
      doc.title || '',
      doc.department || 'Bộ phận Kỹ Thuật',
      doc.category || 'Quy trình',
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


