/**
 * ProcessHub - Data Layer & Google Sheets / Drive Sync Engine
 * Handles Google Drive link conversion, Google Sheets CSV fetching & parsing,
 * LocalStorage caching, and realistic sample data.
 */

// Key constants for LocalStorage
const STORAGE_KEYS = {
  SHEET_CONFIG: 'processhub_sheet_config',
  DOCUMENTS_CACHE: 'processhub_documents_cache',
  VERSION_HISTORY_CACHE: 'processhub_version_history_cache',
  FAVORITES: 'processhub_favorites',
  THEME: 'processhub_theme',
  LAST_SYNC: 'processhub_last_sync',
  AUTH_USER: 'processhub_auth_user',
  REMOTE_ACCOUNTS: 'processhub_remote_accounts',
  NOTEBOOKLM_URL: 'processhub_notebooklm_url',
  SHEET_AI_URL: 'processhub_sheet_ai_url'
};

// Default NotebookLM AI Assistant Link (Sổ tay Trợ lý AI chính thức của H-Design)
const DEFAULT_NOTEBOOKLM_URL = 'https://notebooklm.google.com/notebook/238a94aa-0f51-468f-8e40-84d5628f3a4f';

// Default Google Apps Script Web App URL (Tự động đồng bộ với Google Sheets của H-Design)
const DEFAULT_SHEET_CONFIG = {
  sheetId: 'https://script.google.com/macros/s/AKfycbxuIDFM_Ks9C6aVhMVAhTMjiKwztiHTVZrLeB2ZdieweWFteerKN60e5C71R1K1oP3w1g/exec',
  tabName: 'QuyTrinhHienHanh'
};

// Rich Sample Data (Mapped to H-Design's 5 Core Departments)
const DEFAULT_MOCK_DOCUMENTS = [
  {
    id: "doc-tem-inox",
    code: "HD-SX-03",
    title: "HƯỚNG DẪN THAO TÁC GẮN TEM INOX LÊN TỦ ĐÔNG",
    department: "Bộ phận Sản Xuất",
    category: "Hướng dẫn",
    status: "Chính thức",
    version: "v1.0",
    updatedAt: "2026-10-21",
    driveUrl: "https://drive.google.com/",
    description: "Quy chuẩn thao tác vệ sinh bề mặt tủ đông bằng cồn công nghiệp, căn chỉnh thước đo định vị góc gắn tem, bóc dán băng keo chuyên dụng và nghiệm thu độ phẳng - độ bám dính trước khi đóng gói bao bì xuất xưởng.",
    tags: ["tem inox", "tủ đông", "gắn tem", "sản xuất", "hướng dẫn", "hoàn thiện", "kiểm tra chất lượng"]
  },
  {
    id: "doc-1",
    code: "QT-TK-01",
    title: "Quy trình thiết kế phương án kiến trúc & nội thất",
    department: "Bộ phận Kỹ Thuật",
    category: "Quy trình",
    status: "Chính thức",
    version: "v3.2",
    updatedAt: "2026-10-10",
    driveUrl: "Tài liệu Quy trình chính (PDF): https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing\nBiểu mẫu khảo sát hiện trạng BM-01 (Excel): https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing\nChecklist kiểm tra hồ sơ thiết kế: https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing",
    description: "Quy định các bước từ tiếp nhận brief khách hàng, lên concept 2D/3D, duyệt phương án với chủ đầu tư đến bàn giao hồ sơ thiết kế kỹ thuật.",
    tags: ["kiến trúc", "nội thất", "concept", "3d", "brief", "h-design"]
  },
  {
    id: "doc-2",
    code: "TC-BV-02",
    title: "Tiêu chuẩn thể hiện hồ sơ bản vẽ kỹ thuật thi công (CAD & Revit)",
    department: "Bộ phận Kỹ Thuật",
    category: "Tiêu chuẩn",
    version: "v2.0",
    updatedAt: "2026-09-25",
    driveUrl: "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing",
    description: "Bộ tiêu chuẩn nét vẽ, tỷ lệ, ký hiệu vật liệu, quy cách đóng khung tên bản vẽ cho toàn bộ kiến trúc sư và họa viên tại H-Design.",
    tags: ["bản vẽ", "cad", "revit", "tiêu chuẩn nét", "khung tên", "hồ sơ thi công"]
  },
  {
    id: "doc-3",
    code: "HD-SX-01",
    title: "Hướng dẫn vận hành máy CNC, máy dán cạnh & kiểm soát chất lượng gia công xưởng",
    department: "Bộ phận Sản Xuất",
    category: "Hướng dẫn",
    version: "v2.5",
    updatedAt: "2026-10-05",
    driveUrl: "Hướng dẫn vận hành máy CNC (PDF): https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing\nBiểu mẫu kiểm tra bảo dưỡng định kỳ: https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing",
    description: "Chỉ dẫn chi tiết cách vận hành máy móc xưởng gỗ, kiểm tra đường cắt CNC, độ bám keo dán cạnh và lập biên bản kiểm tra bán thành phẩm.",
    tags: ["sản xuất", "xưởng", "cnc", "chất lượng", "máy móc", "gia công"]
  },
  {
    id: "doc-4",
    code: "QT-SX-02",
    title: "Quy trình nghiệm thu vật tư gỗ, cơ khí, phụ kiện đầu vào & bàn giao xuất xưởng",
    department: "Bộ phận Sản Xuất",
    category: "Quy trình",
    version: "v1.8",
    updatedAt: "2026-08-30",
    driveUrl: "https://drive.google.com/file/d/1D_Sample_NghiemThuVatTu_DriveFile/view?usp=sharing",
    description: "Các bước đối chiếu mẫu ván An Cường, phụ kiện Hafele/Blum thực tế với catalogue đã duyệt, kiểm tra chứng chỉ xuất xưởng trước khi gia công.",
    tags: ["nghiệm thu", "vật tư", "sản xuất", "gỗ", "phụ kiện", "kiểm tra"]
  },
  {
    id: "doc-5",
    code: "BM-SX-01",
    title: "Mẫu báo cáo tiến độ sản xuất xưởng & kế hoạch phân bổ nguồn lực tuần",
    department: "Bộ phận Sản Xuất",
    category: "Biểu mẫu",
    version: "v4.0",
    updatedAt: "2026-10-12",
    driveUrl: "https://drive.google.com/file/d/1E_Sample_BieuMauTienDoDuAn_DriveFile/view?usp=sharing",
    description: "Biểu mẫu chuẩn Gantt chart và bảng theo dõi tiến độ gia công từng đơn hàng, cảnh báo rủi ro trễ tiến độ lắp đặt công trình.",
    tags: ["tiến độ", "biểu mẫu", "sản xuất", "gantt", "báo cáo tuần"]
  },
  {
    id: "doc-6",
    code: "QT-NS-01",
    title: "Quy trình tuyển dụng, đào tạo & tiếp nhận nhân sự mới (Onboarding)",
    department: "Hành Chính - Nhân Sự",
    category: "Quy trình",
    version: "v2.1",
    updatedAt: "2026-09-18",
    driveUrl: "https://drive.google.com/file/d/1F_Sample_OnboardingHR_DriveFile/view?usp=sharing",
    description: "Hướng dẫn các bước từ phỏng vấn, thẩm định năng lực, cấp phát thiết bị làm việc, giới thiệu văn hóa doanh nghiệp đến kết thúc 2 tháng thử việc.",
    tags: ["nhân sự", "onboarding", "thử việc", "tuyển dụng", "hợp đồng"]
  },
  {
    id: "doc-7",
    code: "HD-HC-02",
    title: "Hướng dẫn đề nghị tạm ứng, thanh toán chi phí & nội quy văn phòng",
    department: "Hành Chính - Nhân Sự",
    category: "Hướng dẫn",
    version: "v2.2",
    updatedAt: "2026-10-01",
    driveUrl: "https://drive.google.com/file/d/1G_Sample_TamUngThanhToan_DriveFile/view?usp=sharing",
    description: "Thời hạn gửi chứng từ hợp lệ, hạn mức chi tiêu ăn ở đi lại khi công tác, quy định giờ giấc làm việc và văn hóa ứng xử nội bộ.",
    tags: ["hành chính", "nhân sự", "tạm ứng", "thanh toán", "nội quy"]
  },
  {
    id: "doc-8",
    code: "TC-AT-01",
    title: "Tiêu chuẩn an toàn lao động, vệ sinh công nghiệp & PCCC tại phân xưởng",
    department: "Bộ phận Sản Xuất",
    category: "Tiêu chuẩn",
    version: "v3.0",
    updatedAt: "2026-07-20",
    driveUrl: "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing",
    description: "Quy định bắt buộc về trang bị bảo hộ cá nhân (kính, khẩu trang, găng tay), an toàn nguồn điện máy công nghiệp và phòng chống cháy nổ.",
    tags: ["an toàn", "bảo hộ", "pccc", "sản xuất", "xưởng", "vệ sinh"]
  },
  {
    id: "doc-9",
    code: "QT-KD-02",
    title: "Quy trình tư vấn khách hàng, lập báo giá & ký kết hợp đồng thi công",
    department: "Bộ phận Kinh Doanh",
    category: "Quy trình",
    version: "v1.5",
    updatedAt: "2026-08-14",
    driveUrl: "https://drive.google.com/file/d/1I_Sample_BaoGiaHopDong_DriveFile/view?usp=sharing",
    description: "Quy định cơ chế tính giá theo đơn giá thiết kế & thi công trọn gói, thẩm quyền chiết khấu cho khách hàng và quy trình rà soát hợp đồng mẫu.",
    tags: ["hợp đồng", "báo giá", "sale", "khách hàng", "chiết khấu"]
  },
  {
    id: "doc-10",
    code: "CS-QL-01",
    title: "Chính sách bảo mật thông tin nội bộ, quản lý dữ liệu & phân quyền tài liệu",
    department: "Ban Quản Lý",
    category: "Chính sách",
    status: "Chính thức",
    version: "v1.2",
    updatedAt: "2026-06-30",
    driveUrl: "https://drive.google.com/file/d/1J_Sample_BaoMatThongTin_DriveFile/view?usp=sharing",
    description: "Quy định phân quyền truy cập tài liệu giữa các bộ phận, bảo mật file thiết kế 3D/CAD của khách hàng và cam kết bảo mật NDA của nhân sự.",
    tags: ["bảo mật", "chính sách", "nda", "tài sản trí tuệ", "quy định nội bộ", "ban quản lý"]
  },
  {
    id: "doc-11",
    code: "BM-TK-04",
    title: "Checklist kiểm tra hồ sơ thiết kế chi tiết trước khi chuyển giao xưởng sản xuất",
    department: "Bộ phận Kỹ Thuật",
    category: "Biểu mẫu",
    status: "Chính thức",
    version: "v2.8",
    updatedAt: "2026-10-14",
    driveUrl: "https://drive.google.com/file/d/1K_Sample_ChecklistDesignQA_DriveFile/view?usp=sharing",
    description: "Bảng kiểm tra 45 đầu việc kỹ thuật gồm: kích thước công thái học, khớp nối vật liệu, file cắt CNC và bảng bóc tách khối lượng phụ kiện.",
    tags: ["checklist", "qa", "kiểm tra", "bàn giao", "hồ sơ thiết kế"]
  },
  {
    id: "doc-12",
    code: "BM-KD-01",
    title: "Biểu mẫu khảo sát nhu cầu khách hàng & bảng phân tích hiện trạng dự án",
    department: "Bộ phận Kinh Doanh",
    category: "Biểu mẫu",
    status: "Chính thức",
    version: "v1.4",
    updatedAt: "2026-09-02",
    driveUrl: "https://drive.google.com/file/d/1L_Sample_ITGuide_DriveFile/view?usp=sharing",
    description: "Phiếu thu thập thông tin khách hàng: phong cách mong muốn, ngân sách đầu tư, tiến độ yêu cầu và đặc điểm mặt bằng cần cải tạo.",
    tags: ["kinh doanh", "khảo sát", "brief", "khách hàng", "tư vấn"]
  },
  {
    id: "doc-ref-wood",
    code: "TK-VL-01",
    title: "Cẩm nang tra cứu thông số kỹ thuật gỗ công nghiệp & phụ kiện nội thất 2026",
    department: "Bộ phận Sản Xuất",
    category: "Hướng dẫn",
    status: "Tham khảo",
    version: "v1.0",
    updatedAt: "2026-10-15",
    driveUrl: "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing",
    description: "Tài liệu cẩm nang kỹ thuật tổng hợp quy cách ván MDF, HDF, MFC An Cường và catalog phụ kiện Hafele dùng làm căn cứ tham khảo sản xuất.",
    tags: ["cam nang", "go", "an cuong", "tham khao", "vat tu"]
  }
];

// Rich Default Version History (Mapped to Google Sheets Tab: LichSuPhienBan)
const DEFAULT_VERSION_HISTORY = [
  // HD-SX-03 History
  {
    code: "HD-SX-03",
    version: "v1.0",
    releaseDate: "2026-10-21",
    deprecatedDate: "Đang áp dụng",
    status: "active",
    author: "Bộ phận Sản Xuất",
    reason: "Ban hành hướng dẫn chuẩn quy trình thao tác gắn tem inox hoàn thiện tủ đông tiêu chuẩn H-Design.",
    driveUrl: "https://drive.google.com/",
    notes: "Bản ban hành chính thức"
  },
  // QT-TK-01 History
  {
    code: "QT-TK-01",
    version: "v3.2",
    releaseDate: "2026-10-10",
    deprecatedDate: "Đang áp dụng",
    status: "active",
    author: "Ban Quản Lý",
    reason: "Cập nhật quy trình duyệt phối cảnh 3D bằng kính VR và chuẩn hóa các mốc nghiệm thu concept với Chủ đầu tư.",
    driveUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing",
    notes: "Bắt buộc áp dụng cho toàn bộ dự án từ Q4/2026"
  },
  {
    code: "QT-TK-01",
    version: "v3.1",
    releaseDate: "2026-05-15",
    deprecatedDate: "2026-10-10",
    status: "archived",
    author: "Trưởng phòng Thiết Kế",
    reason: "Bổ sung bước lập bảng Moodboard vật liệu & màu sắc thực tế trước khi lên 3D chi tiết để giảm thời gian chỉnh sửa.",
    driveUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing",
    notes: "Đã thay thế bởi bản v3.2"
  },
  {
    code: "QT-TK-01",
    version: "v3.0",
    releaseDate: "2026-01-10",
    deprecatedDate: "2026-05-15",
    status: "archived",
    author: "Ban Quản Lý",
    reason: "Nâng cấp toàn diện quy trình thiết kế tích hợp mô hình BIM/Revit đồng bộ hóa dữ liệu trực tiếp với xưởng sản xuất.",
    driveUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing",
    notes: "Chuyển đổi công nghệ vẽ CAD sang Revit"
  },
  {
    code: "QT-TK-01",
    version: "v2.0",
    releaseDate: "2025-06-20",
    deprecatedDate: "2026-01-10",
    status: "archived",
    author: "P. Thiết Kế",
    reason: "Chuẩn hóa quy trình thiết kế 2D/3D phân tách rõ 2 giai đoạn: Phương án sơ phác và Hồ sơ triển khai thi công chi tiết.",
    driveUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing",
    notes: "Lưu trữ đối soát hồ sơ dự án 2025"
  },
  {
    code: "QT-TK-01",
    version: "v1.0",
    releaseDate: "2024-03-15",
    deprecatedDate: "2025-06-20",
    status: "archived",
    author: "Giám Đốc Sáng Lập",
    reason: "Ban hành lần đầu quy trình thiết kế cơ sở nội bộ cho H-Design.",
    driveUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing",
    notes: "Phiên bản sơ khai ban đầu"
  },
  // QC-BV-02 History
  {
    code: "QC-BV-02",
    version: "v2.0",
    releaseDate: "2026-09-25",
    deprecatedDate: "Đang áp dụng",
    status: "active",
    author: "P. Kỹ Thuật",
    reason: "Chuẩn hóa hệ thống Family Revit, file mẫu in CTB theo tiêu chuẩn TCVN 2026 và tích hợp mã QR truy xuất bản vẽ hiện trường.",
    driveUrl: "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing",
    notes: "Áp dụng cho toàn bộ KTS và Họa viên"
  },
  {
    code: "QC-BV-02",
    version: "v1.5",
    releaseDate: "2026-03-10",
    deprecatedDate: "2026-09-25",
    status: "archived",
    author: "P. Thiết Kế",
    reason: "Thống nhất quy cách đóng khung tên bản vẽ chuẩn khổ A3/A1 và quy tắc đánh số thứ tự chi tiết kiến trúc.",
    driveUrl: "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing",
    notes: "Hết hiệu lực từ 25/09/2026"
  },
  {
    code: "QC-BV-02",
    version: "v1.0",
    releaseDate: "2025-01-15",
    deprecatedDate: "2026-03-10",
    status: "archived",
    author: "P. Thiết Kế",
    reason: "Ban hành quy chuẩn nét vẽ, font chữ và layer AutoCAD dùng chung.",
    driveUrl: "https://drive.google.com/file/d/1A2b3c4D5E6F7G8H9I0J_SampleStandardFile/view?usp=sharing",
    notes: "Lưu trữ hồ sơ cũ"
  },
  // HD-SX-01 History
  {
    code: "HD-SX-01",
    version: "v2.5",
    releaseDate: "2026-10-05",
    deprecatedDate: "Đang áp dụng",
    status: "active",
    author: "Quản Đốc Phân Xưởng",
    reason: "Bổ sung quy định kiểm tra độ bám keo PUR chịu nước và checklist kiểm tra độ mòn dao cắt CNC sau 80 giờ chạy liên tục.",
    driveUrl: "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing",
    notes: "Nghiêm cấm bỏ qua checklist dao cắt"
  },
  {
    code: "HD-SX-01",
    version: "v2.0",
    releaseDate: "2026-04-12",
    deprecatedDate: "2026-10-05",
    status: "archived",
    author: "Quản Đốc Xưởng",
    reason: "Bổ sung chỉ dẫn an toàn vận hành máy dán cạnh tự động 8 chức năng mới nhập khẩu và quy cách cắt phôi gỗ melamine.",
    driveUrl: "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing",
    notes: "Thay thế khi xưởng đầu tư máy mới"
  },
  {
    code: "HD-SX-01",
    version: "v1.0",
    releaseDate: "2025-08-01",
    deprecatedDate: "2026-04-12",
    status: "archived",
    author: "Bộ phận Sản Xuất",
    reason: "Ban hành quy trình thao tác máy CNC nesting ban đầu của xưởng gỗ H-Design.",
    driveUrl: "https://drive.google.com/file/d/1C_Sample_GiamSatCongTruong_DriveFile/view?usp=sharing",
    notes: "Bản đầu tiên"
  },
  // QC-AT-01 History
  {
    code: "QC-AT-01",
    version: "v3.0",
    releaseDate: "2026-07-20",
    deprecatedDate: "Đang áp dụng",
    status: "active",
    author: "Ban Quản Lý & P. Sản Xuất",
    reason: "Cập nhật tiêu chuẩn PCCC mới theo Nghị định 50/2024/NĐ-CP và hướng dẫn vận hành hệ thống hút bụi trung tâm phân xưởng.",
    driveUrl: "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing",
    notes: "Bắt buộc 100% công nhân xưởng học định kỳ"
  },
  {
    code: "QC-AT-01",
    version: "v2.0",
    releaseDate: "2025-11-15",
    deprecatedDate: "2026-07-20",
    status: "archived",
    author: "P. Sản Xuất",
    reason: "Quy chuẩn trang bị đồ bảo hộ cá nhân (kính, nút tai, khẩu trang hoạt tính) và quy định khu lưu trữ sơn PU/hóa chất chống cháy.",
    driveUrl: "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing",
    notes: "Đã nâng cấp lên v3.0"
  },
  {
    code: "QC-AT-01",
    version: "v1.0",
    releaseDate: "2024-09-01",
    deprecatedDate: "2025-11-15",
    status: "archived",
    author: "Ban Quản Lý",
    reason: "Quy định an toàn lao động và vệ sinh công nghiệp sơ khai khi mới thành lập xưởng.",
    driveUrl: "https://drive.google.com/file/d/1H_Sample_AnToanLaoDong_DriveFile/view?usp=sharing",
    notes: "Bản lưu trữ lịch sử"
  }
];

// Department Color Mapping & Metadata (5 Core Departments)
const DEPARTMENT_COLORS = {
  "Ban Quản Lý": { border: "#8B5CF6", text: "#7C3AED", icon: "shield-check" },
  "Bộ phận Kỹ Thuật": { border: "#06B6D4", text: "#0891B2", icon: "pen-tool" },
  "Bộ phận Sản Xuất": { border: "#10B981", text: "#059669", icon: "hammer" },
  "Bộ phận Kinh Doanh": { border: "#3B82F6", text: "#2563EB", icon: "briefcase" },
  "Hành Chính - Nhân Sự": { border: "#F59E0B", text: "#D97706", icon: "users" }
};

// Default Accounts & Department Access Permissions
const DEFAULT_ACCOUNTS = [
  {
    id: "user-admin",
    username: "admin",
    password: "1612",
    fullName: "Quản Trị Viên (Admin)",
    department: "Ban Quản Lý",
    role: "Admin",
    allowedDepartments: ["*"], // Toàn quyền quản trị & duyệt phát hành
    avatarIcon: "shield-check"
  },
  {
    id: "user-bql",
    username: "bql",
    password: "1612",
    fullName: "Ban Quản Lý",
    department: "Ban Quản Lý",
    role: "Ban Quản Lý",
    allowedDepartments: ["*"], // Xem tất cả 5 bộ phận (Chỉ xem - Read-only)
    avatarIcon: "shield"
  },
  {
    id: "user-kythuat",
    username: "kythuat",
    password: "1612",
    fullName: "Kỹ Sư Hoàng (Kỹ Thuật)",
    department: "Bộ phận Kỹ Thuật",
    role: "User",
    allowedDepartments: ["Bộ phận Kỹ Thuật"],
    avatarIcon: "pen-tool"
  },
  {
    id: "user-sanxuat",
    username: "sanxuat",
    password: "1612",
    fullName: "Quản Đốc Nam (Sản Xuất)",
    department: "Bộ phận Sản Xuất",
    role: "User",
    allowedDepartments: ["Bộ phận Sản Xuất"],
    avatarIcon: "hammer"
  },
  {
    id: "user-kinhdoanh",
    username: "kinhdoanh",
    password: "1612",
    fullName: "Sale Mai (Kinh Doanh)",
    department: "Bộ phận Kinh Doanh",
    role: "User",
    allowedDepartments: ["Bộ phận Kinh Doanh"],
    avatarIcon: "briefcase"
  },
  {
    id: "user-hcns",
    username: "hcns",
    password: "1612",
    fullName: "HR Lan (Hành Chính - NS)",
    department: "Hành Chính - Nhân Sự",
    role: "User",
    allowedDepartments: ["Hành Chính - Nhân Sự"],
    avatarIcon: "users"
  }
];

/**
 * Authentication & Access Control Store
 */
const AuthStore = {
  getAccounts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMOTE_ACCOUNTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc remote accounts:', e);
    }
    return DEFAULT_ACCOUNTS;
  },

  setRemoteAccounts(accounts) {
    if (!Array.isArray(accounts) || accounts.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEYS.REMOTE_ACCOUNTS, JSON.stringify(accounts));
      // Nếu user đang đăng nhập có trong danh sách mới, cập nhật lại thông tin quyền và họ tên
      const current = this.getCurrentUser();
      if (current) {
        const updated = accounts.find(a => a.username.toLowerCase() === current.username.toLowerCase());
        if (updated) {
          this.setCurrentUser(updated);
        }
      }
    } catch (e) {
      console.error('Không thể lưu remote accounts:', e);
    }
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username) {
          if (parsed.department === 'Bộ phận Thiết Kế') {
            parsed.department = 'Bộ phận Kỹ Thuật';
            parsed.fullName = 'Kỹ Sư Hoàng (Kỹ Thuật)';
          }
          if (Array.isArray(parsed.allowedDepartments)) {
            parsed.allowedDepartments = parsed.allowedDepartments.map(d => 
              d === 'Bộ phận Thiết Kế' ? 'Bộ phận Kỹ Thuật' : d
            );
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc auth user:', e);
    }
    // Return null when unauthenticated so the login prompt is displayed
    return null;
  },

  setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Không thể lưu auth user:', e);
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  login(username, password) {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const accounts = this.getAccounts();
    const user = accounts.find(u => 
      u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu! Vui lòng kiểm tra lại.' };
  },

  canAccessDepartment(user, deptName) {
    if (!user) return false;
    if (user.allowedDepartments && user.allowedDepartments.includes('*')) return true;
    return user.allowedDepartments ? user.allowedDepartments.includes(deptName) : false;
  },

  isAdmin(user) {
    if (!user) return false;
    return user.role === 'Admin' || user.username === 'admin';
  },

  isManagement(user) {
    if (!user) return false;
    return user.role === 'Ban Quản Lý' || user.username === 'bql';
  },

  filterAllowedDocuments(docs, user) {
    if (!user || !Array.isArray(docs)) return [];
    const isUserAdmin = this.isAdmin(user);

    // 1. Phân quyền xem theo Trạng thái (Status):
    // Nhân viên thông thường & Ban Quản Lý chỉ xem tài liệu "Chính thức" và "Tham khảo".
    // Tuyệt đối KHÔNG hiển thị tài liệu "Dự thảo" (Chờ duyệt) cho người không phải Admin, tránh nhầm lẫn áp dụng!
    let statusFiltered = docs;
    if (!isUserAdmin) {
      statusFiltered = docs.filter(doc => {
        const st = (doc.status || 'Chính thức').trim();
        return st !== 'Dự thảo' && st !== 'Chờ duyệt';
      });
    }

    // 2. Phân quyền xem theo Bộ phận (Department):
    if (user.allowedDepartments && user.allowedDepartments.includes('*')) {
      return statusFiltered;
    }
    return statusFiltered.filter(doc => user.allowedDepartments && user.allowedDepartments.includes(doc.department));
  }
};

/**
 * Utility: Extract Google Drive File ID from any shareable Drive link
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Utility: Convert a Google Drive link to a Direct Download URL
 */
function getDriveDownloadUrl(url) {
  const fileId = extractDriveFileId(url);
  if (fileId) {
    // Official direct download link format
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  }
  return url; // fallback to original link
}

/**
 * Utility: Convert a Google Drive link to an Embed Preview URL
 */
function getDrivePreviewUrl(url) {
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return url;
}

/**
 * Utility: Parse document links into an array of { name, url }
 * Supports:
 * - Single Drive link: "https://drive.google.com/..." -> [{ name: "Tài liệu chính", url: "..." }]
 * - Multi-line strings in Google Sheet cell:
 *     "File Quy trình: https://drive..."
 *     "Biểu mẫu 01: https://drive..."
 * - Pipe format: "Tên link | https://drive..."
 * - Colon format: "Tên link: https://drive..."
 * - JSON format: '[{"name": "...", "url": "..."}]'
 * - doc.attachments array if available
 */
function parseDocumentLinks(docOrUrl) {
  if (!docOrUrl) return [];

  // If passed a document object with attachments
  if (typeof docOrUrl === 'object' && !Array.isArray(docOrUrl)) {
    if (Array.isArray(docOrUrl.attachments) && docOrUrl.attachments.length > 0) {
      const valid = docOrUrl.attachments
        .filter(a => a && a.url)
        .map(a => ({ name: (a.name || 'Tài liệu').trim(), url: a.url.trim() }));
      if (valid.length > 0) return valid;
    }
    // If passed a document object, extract its driveUrl
    docOrUrl = docOrUrl.driveUrl || '';
  }

  if (typeof docOrUrl !== 'string') return [];
  const raw = docOrUrl.trim();
  if (!raw) return [];

  // Check JSON format
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const jsonLinks = parsed
          .filter(item => item && item.url)
          .map(item => ({ name: (item.name || 'Tài liệu').trim(), url: item.url.trim() }));
        if (jsonLinks.length > 0) return jsonLinks;
      }
    } catch (e) {}
  }

  // Check newline or semicolon separation
  const lines = raw.split(/[\r\n;]+/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    const results = [];
    lines.forEach((line, idx) => {
      // Check pipe format: "Tên file | https://..."
      const pipeIdx = line.indexOf('|');
      if (pipeIdx > 0) {
        const name = line.substring(0, pipeIdx).trim();
        const url = line.substring(pipeIdx + 1).trim();
        if (url) {
          results.push({ name: name || `Tài liệu ${idx + 1}`, url });
          return;
        }
      }

      // Check colon format: "Tên file: https://..."
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/i);
      if (urlMatch) {
        const url = urlMatch[1].trim();
        let name = line.replace(url, '').trim();
        name = name.replace(/[:|-]+$/, '').trim();
        results.push({ name: name || `Tài liệu ${idx + 1}`, url });
        return;
      }

      // Fallback if line starts with http
      if (line.startsWith('http://') || line.startsWith('https://')) {
        results.push({ name: `Tài liệu ${idx + 1}`, url: line });
      }
    });
    if (results.length > 0) return results;
  }

  // Single line check for "Tên: URL" or "Tên | URL"
  const pipeIdx = raw.indexOf('|');
  if (pipeIdx > 0) {
    const name = raw.substring(0, pipeIdx).trim();
    const url = raw.substring(pipeIdx + 1).trim();
    if (url) return [{ name: name || 'Tài liệu chính', url }];
  }

  const urlMatch = raw.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch) {
    const url = urlMatch[1].trim();
    let name = raw.replace(url, '').trim();
    name = name.replace(/[:|-]+$/, '').trim();
    if (name) {
      return [{ name: name, url }];
    }
  }

  return [{ name: 'Tài liệu chính', url: raw }];
}

/**
 * Utility: Serialize an array of { name, url } back into driveUrl format
 */
function serializeDocumentLinks(links) {
  if (!Array.isArray(links) || links.length === 0) return '';
  const valid = links.filter(l => l && l.url && l.url.trim());
  if (valid.length === 0) return '';
  if (valid.length === 1 && (!valid[0].name || valid[0].name.trim() === 'Tài liệu chính')) {
    return valid[0].url.trim();
  }
  return valid
    .map(l => `${(l.name || 'Tài liệu').trim()}: ${l.url.trim()}`)
    .join('\n');
}

/**
 * Utility: Extract Google Sheet ID from URL or return raw ID
 */
function extractSheetId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  // Check if it's a Google Apps Script Web App URL
  if (trimmed.includes('script.google.com/macros/s/')) {
    return trimmed;
  }
  // Check if it's already a clean ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  // Extract from full sheet URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Robust CSV Line Parser that respects quoted fields containing commas and quotes
 */
function parseCsv(csvText) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentToken = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \r\n
      }
      row.push(currentToken.trim());
      currentToken = '';
      if (row.length > 0 && row.some(col => col !== '')) {
        lines.push(row);
      }
      row = [];
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0 || row.length > 0) {
    row.push(currentToken.trim());
    if (row.some(col => col !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Utility: Parse Accounts & Permissions from CSV rows (Tab TaiKhoan)
 */
function parseAccountsCsv(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map(h => (h || '').toString().toLowerCase().trim());
  let colUser = -1, colPass = -1, colName = -1, colDept = -1, colRole = -1, colAllowed = -1;
  headers.forEach((h, idx) => {
    const norm = h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    if (colUser === -1 && (norm.includes('user') || norm.includes('dangnhap') || norm.includes('id') || norm.includes('ten'))) colUser = idx;
    else if (colPass === -1 && (norm.includes('pass') || norm.includes('matkhau') || norm.includes('pin'))) colPass = idx;
    else if (colName === -1 && (norm.includes('ho') || norm.includes('hienthi') || norm.includes('name'))) colName = idx;
    else if (colDept === -1 && (norm.includes('phong') || norm.includes('bophan') || norm.includes('dept'))) colDept = idx;
    else if (colRole === -1 && (norm.includes('vaitro') || norm.includes('role') || norm.includes('quyen'))) colRole = idx;
    else if (colAllowed === -1 && (norm.includes('xem') || norm.includes('allowed') || norm.includes('truycap'))) colAllowed = idx;
  });

  if (colUser === -1) colUser = 0;
  if (colPass === -1) colPass = 1;
  if (colName === -1) colName = 2;
  if (colDept === -1) colDept = 3;
  if (colRole === -1) colRole = 4;
  if (colAllowed === -1) colAllowed = 5;

  const accounts = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const username = (row[colUser] || '').toString().trim();
    const password = (row[colPass] || '').toString().trim();
    if (!username) continue;

    const fullName = (row[colName] || username).toString().trim();
    const department = (row[colDept] || 'Bộ phận Sản Xuất').toString().trim();
    const role = (row[colRole] || 'User').toString().trim();
    const rawAllowed = (row[colAllowed] || '').toString().trim();

    let allowedList = [];
    if (!rawAllowed || rawAllowed.includes('*') || role.toLowerCase() === 'admin' || username.toLowerCase() === 'admin') {
      allowedList = ['*'];
    } else {
      allowedList = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);
    }

    let icon = 'user-check';
    if (role.toLowerCase() === 'admin' || username.toLowerCase() === 'admin') icon = 'shield-check';
    else if (department.includes('Kỹ Thuật') || department.includes('Thiết Kế')) icon = 'pen-tool';
    else if (department.includes('Sản Xuất')) icon = 'hammer';
    else if (department.includes('Kinh Doanh')) icon = 'briefcase';
    else if (department.includes('Hành Chính') || department.includes('Nhân Sự')) icon = 'users';

    accounts.push({
      id: 'user-' + username.toLowerCase().replace(/[^a-z0-9]/g, ''),
      username,
      password,
      fullName,
      department,
      role: (role.toLowerCase() === 'admin' || username.toLowerCase() === 'admin') ? 'Admin' : 'User',
      allowedDepartments: allowedList,
      avatarIcon: icon
    });
  }
  return accounts;
}

/**
 * Tự động sửa chữa và chuẩn hóa các tài liệu bị lệch cột dữ liệu từ Google Sheets
 * Đặc biệt khi cột Trạng thái bị bỏ trống hoặc cột Drive URL bị trôi sang cột Ngày cập nhật
 */
function sanitizeDocumentFields(doc) {
  if (!doc || typeof doc !== 'object') return doc;

  const isUrl = str => typeof str === 'string' && (/^https?:\/\//i.test(str.trim()) || str.includes('drive.google.com'));

  let rawUpdated = (doc.updatedAt || '').toString().trim();
  let rawDrive = (doc.driveUrl || '').toString().trim();
  let rawVer = (doc.version || '').toString().trim();
  let rawStatus = (doc.status || '').toString().trim();
  let rawDesc = (doc.description || '').toString().trim();

  // Phát hiện cột bị lệch: Link Google Drive bị trôi vào cột Ngày ban hành (updatedAt)
  if (isUrl(rawUpdated)) {
    const realDriveUrl = rawUpdated;

    // Nếu driveUrl chứa nội dung mô tả thay vì link
    if (rawDrive && !isUrl(rawDrive)) {
      doc.description = rawDesc ? `${rawDrive}. ${rawDesc}` : rawDrive;
    }
    doc.driveUrl = realDriveUrl;

    // Nếu version chứa chuỗi ngày tháng (VD: Sat Oct 24 2026... hoặc 2026-10-24)
    const parsedDate = new Date(rawVer);
    if (!isNaN(parsedDate.getTime()) && (rawVer.includes('202') || rawVer.includes('GMT') || rawVer.includes('-') || rawVer.includes('/'))) {
      const day = String(parsedDate.getDate()).padStart(2, '0');
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const year = parsedDate.getFullYear();
      doc.updatedAt = `${year}-${month}-${day}`;
    } else {
      doc.updatedAt = new Date().toISOString().slice(0, 10);
    }

    // Nếu status chứa số phiên bản (VD: "v1.0", "1.0")
    if (/^v?\d+(\.\d+)?$/i.test(rawStatus)) {
      doc.version = rawStatus.startsWith('v') ? rawStatus : `v${rawStatus}`;
      doc.status = 'Chính thức';
    } else {
      doc.version = 'v1.0';
      doc.status = rawStatus || 'Chính thức';
    }
  } else if (!isUrl(rawDrive) && isUrl(rawDesc)) {
    doc.driveUrl = rawDesc;
    doc.description = rawDrive;
  }

  // Chuẩn hóa trạng thái
  if (!doc.status || !['Chính thức', 'Dự thảo', 'Tham khảo'].includes(doc.status)) {
    if (doc.status === 'v1.0' || doc.status === 'v2.0' || !doc.status) {
      doc.status = 'Chính thức';
    }
  }

  // Chuẩn hóa phiên bản
  if (!doc.version || doc.version === 'undefined') {
    doc.version = 'v1.0';
  } else if (/^\d+(\.\d+)?$/.test(doc.version)) {
    doc.version = `v${doc.version}`;
  }

  // Chuẩn hóa tên bộ phận và thể loại
  if (doc.department === 'Ban Giám Đốc') doc.department = 'Ban Quản Lý';
  if (doc.department === 'Phòng Thiết Kế') doc.department = 'Bộ phận Kỹ Thuật';
  if (doc.category === 'Quy chuẩn') doc.category = 'Tiêu chuẩn';

  return doc;
}

/**
 * Normalize and map CSV headers flexibly (supports various Vietnamese and English column names)
 */
function mapHeaderIndex(headers) {
  const map = {
    code: -1,
    title: -1,
    department: -1,
    category: -1,
    status: -1,
    version: -1,
    updatedAt: -1,
    driveUrl: -1,
    description: -1,
    tags: -1
  };

  const clean = str => str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]/g, '');

  headers.forEach((h, idx) => {
    const norm = clean(h);

    if (norm.includes('ma') || norm.includes('code') || norm.includes('maso')) {
      if (map.code === -1) map.code = idx;
    } else if (norm.includes('ten') || norm.includes('title') || norm.includes('quytrinh') || norm.includes('tentailieu')) {
      if (map.title === -1) map.title = idx;
    } else if (norm.includes('phongban') || norm.includes('dept') || norm.includes('bophan') || norm.includes('phong')) {
      if (map.department === -1) map.department = idx;
    } else if (norm.includes('loai') || norm.includes('phanloai') || norm.includes('theloai') || norm.includes('category') || norm.includes('type')) {
      if (map.category === -1) map.category = idx;
    } else if (norm.includes('trangthai') || norm.includes('status') || norm.includes('tinhtrang')) {
      if (map.status === -1) map.status = idx;
    } else if (norm.includes('phienban') || norm.includes('version') || norm.includes('ver')) {
      if (map.version === -1) map.version = idx;
    } else if (norm.includes('ngay') || norm.includes('date') || norm.includes('capnhat') || norm.includes('banhanh')) {
      if (map.updatedAt === -1) map.updatedAt = idx;
    } else if (norm.includes('drive') || norm.includes('link') || norm.includes('url') || norm.includes('taive') || norm.includes('download')) {
      if (map.driveUrl === -1) map.driveUrl = idx;
    } else if (norm.includes('mota') || norm.includes('desc') || norm.includes('noidung') || norm.includes('ghichu')) {
      if (map.description === -1) map.description = idx;
    } else if (norm.includes('tukhoa') || norm.includes('tag') || norm.includes('keyword')) {
      if (map.tags === -1) map.tags = idx;
    }
  });

  return map;
}

/**
 * Fetch and parse data from Google Sheets
 */
async function fetchGoogleSheetData(sheetId, tabName = '') {
  if (!sheetId) {
    throw new Error('Chưa cung cấp Google Sheet ID hoặc Web App URL');
  }

  // Nếu là đường link Google Apps Script Web App (/exec)
  if (sheetId.startsWith('http') && sheetId.includes('script.google.com/macros/s/')) {
    const response = await fetch(sheetId, {
      method: 'GET',
      headers: { 'Accept': 'application/json, text/plain, */*' }
    });

    if (!response.ok) {
      throw new Error(`Không thể kết nối đến Web App (HTTP ${response.status}). Vui lòng đảm bảo bản triển khai đã bật quyền "Bất kỳ ai (Anyone)".`);
    }

    const result = await response.json();
    if (result.status === 'error') {
      throw new Error(result.message || 'Lỗi trả về từ Google Apps Script Web App.');
    }

    if (result.history && Array.isArray(result.history) && result.history.length > 0) {
      DataStore.setVersionHistory(result.history);
    }

    // Tự động nhận link AI Assistant từ Google Sheets Web App nếu có
    if (result.notebookLmUrl && typeof result.notebookLmUrl === 'string' && result.notebookLmUrl.trim()) {
      const remoteAiUrl = result.notebookLmUrl.trim();
      localStorage.setItem(STORAGE_KEYS.SHEET_AI_URL, remoteAiUrl);
      
      const currentManualUrl = localStorage.getItem(STORAGE_KEYS.NOTEBOOKLM_URL);
      // Chỉ ghi đè vào NOTEBOOKLM_URL nếu máy chưa có, hoặc máy đang dùng link mặc định, hoặc remote đã được người dùng đổi mới khác link mẫu
      if (!currentManualUrl || currentManualUrl === DEFAULT_NOTEBOOKLM_URL || remoteAiUrl !== DEFAULT_NOTEBOOKLM_URL) {
        localStorage.setItem(STORAGE_KEYS.NOTEBOOKLM_URL, remoteAiUrl);
      }
    }

    // Tự động nhận danh sách Tài Khoản & Phân Quyền từ Google Sheets (Tab TaiKhoan) nếu có
    if (result.users && Array.isArray(result.users) && result.users.length > 0) {
      AuthStore.setRemoteAccounts(result.users);
      console.log(`Đã đồng bộ ${result.users.length} tài khoản từ Google Sheets (Tab TaiKhoan)`);
    }

    return (result.documents || []).map(sanitizeDocumentFields);
  }

  // Trường hợp chuẩn: Google Visualization API CSV Export URL
  let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  if (tabName && tabName.trim()) {
    csvUrl += `&sheet=${encodeURIComponent(tabName.trim())}`;
  }

  // Quét linh hoạt các Tab cấu hình trên Google Sheets (CauHinhHeThong, CauHinh, Settings...)
  const potentialTabNames = ['CauHinhHeThong', 'CauHinh', 'Cau Hinh', 'CaiDat', 'Settings', 'Config'];
  for (let t = 0; t < potentialTabNames.length; t++) {
    try {
      const configCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(potentialTabNames[t])}`;
      const confRes = await fetch(configCsvUrl, { headers: { 'Accept': 'text/csv, text/plain, */*' } });
      if (confRes.ok) {
        const confCsv = await confRes.text();
        const confRows = parseCsv(confCsv);
        if (confRows && confRows.length > 0) {
          let foundAi = false;
          for (let r = 0; r < confRows.length; r++) {
            for (let c = 0; c < confRows[r].length; c++) {
              const cell = (confRows[r][c] || '').trim();
              if (cell.includes('notebooklm.google.com') || (cell.startsWith('http') && (confRows[r][0] || '').toLowerCase().includes('ai'))) {
                localStorage.setItem(STORAGE_KEYS.SHEET_AI_URL, cell);
                localStorage.setItem(STORAGE_KEYS.NOTEBOOKLM_URL, cell);
                foundAi = true;
                break;
              }
            }
            if (foundAi) break;
          }
          if (foundAi) break;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Quét linh hoạt các Tab Tài Khoản & Phân Quyền trên Google Sheets (TaiKhoan, PhanQuyen, Users...)
  const potentialUserTabs = ['TaiKhoan', 'PhanQuyen', 'NguoiDung', 'Users', 'Accounts'];
  for (let u = 0; u < potentialUserTabs.length; u++) {
    try {
      const userCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(potentialUserTabs[u])}`;
      const userRes = await fetch(userCsvUrl, { headers: { 'Accept': 'text/csv, text/plain, */*' } });
      if (userRes.ok) {
        const userCsv = await userRes.text();
        const userRows = parseCsv(userCsv);
        if (userRows && userRows.length >= 2) {
          const parsedAccounts = parseAccountsCsv(userRows);
          if (parsedAccounts.length > 0) {
            AuthStore.setRemoteAccounts(parsedAccounts);
            console.log(`Đã đồng bộ ${parsedAccounts.length} tài khoản từ Tab ${potentialUserTabs[u]}`);
            break;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const response = await fetch(csvUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/csv, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(`Không thể kết nối đến Google Sheets (HTTP ${response.status}). Vui lòng đảm bảo file đã được bật chia sẻ: "Bất kỳ ai có liên kết đều có thể xem".`);
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);

  if (!rows || rows.length < 2) {
    throw new Error('Google Sheet không có dữ liệu hoặc không đủ số dòng.');
  }

  const headers = rows[0];
  const headerMap = mapHeaderIndex(headers);

  // If essential columns cannot be identified, try standard fallback indices 0, 1, 2...
  if (headerMap.title === -1) headerMap.title = 1;
  if (headerMap.code === -1) headerMap.code = 0;
  if (headerMap.department === -1) headerMap.department = 2;
  if (headerMap.category === -1) headerMap.category = 3;
  if (headerMap.version === -1) headerMap.version = 4;
  if (headerMap.updatedAt === -1) headerMap.updatedAt = 5;
  if (headerMap.driveUrl === -1) headerMap.driveUrl = 6;
  if (headerMap.description === -1) headerMap.description = 7;

  const documents = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const title = row[headerMap.title] || '';
    if (!title.trim()) continue; // skip blank rows

    const code = (headerMap.code >= 0 && row[headerMap.code]) ? row[headerMap.code].trim() : `DOC-${i}`;
    const department = (headerMap.department >= 0 && row[headerMap.department]) ? row[headerMap.department].trim() : 'Chung';
    const category = (headerMap.category >= 0 && row[headerMap.category]) ? row[headerMap.category].trim() : 'Quy trình';
    const status = (headerMap.status >= 0 && row[headerMap.status]) ? row[headerMap.status].trim() : 'Chính thức';
    const version = (headerMap.version >= 0 && row[headerMap.version]) ? row[headerMap.version].trim() : 'v1.0';
    const updatedAt = (headerMap.updatedAt >= 0 && row[headerMap.updatedAt]) ? row[headerMap.updatedAt].trim() : new Date().toISOString().split('T')[0];
    const driveUrl = (headerMap.driveUrl >= 0 && row[headerMap.driveUrl]) ? row[headerMap.driveUrl].trim() : '';
    const description = (headerMap.description >= 0 && row[headerMap.description]) ? row[headerMap.description].trim() : '';
    const tagsRaw = (headerMap.tags >= 0 && row[headerMap.tags]) ? row[headerMap.tags] : '';

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().toLowerCase()) : [];

    documents.push({
      id: `sheet-${i}-${code.replace(/[^a-zA-Z0-9]/g, '')}`,
      code,
      title,
      department: department === 'Ban Giám Đốc' ? 'Ban Quản Lý' : department,
      category,
      status: status || 'Chính thức',
      version,
      updatedAt,
      driveUrl,
      description,
      tags
    });
  }

  return documents.map(sanitizeDocumentFields);
}

/**
 * Fetch and parse Document Version History from Google Sheets (Tab: LichSuPhienBan)
 */
async function fetchGoogleSheetVersionHistory(sheetId, tabName = 'LichSuPhienBan') {
  if (!sheetId) return [];
  
  let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName.trim())}`;
  
  try {
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/csv, text/plain, */*' }
    });
    
    if (!response.ok) {
      console.warn(`Tab lịch sử phiên bản [${tabName}] chưa được tạo trên Google Sheets.`);
      return [];
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);
    if (!rows || rows.length < 2) return [];

    const headers = rows[0];
    const clean = str => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');

    const map = {
      code: -1,
      version: -1,
      releaseDate: -1,
      deprecatedDate: -1,
      status: -1,
      author: -1,
      reason: -1,
      driveUrl: -1,
      notes: -1
    };

    headers.forEach((h, idx) => {
      const norm = clean(h);
      if (norm.includes('ma') || norm.includes('code')) map.code = idx;
      else if (norm.includes('phienban') || norm.includes('ver')) map.version = idx;
      else if (norm.includes('banhanh') || norm.includes('ngayhieuluc') || norm.includes('releasedate')) map.releaseDate = idx;
      else if (norm.includes('hethieuluc') || norm.includes('deprecated') || norm.includes('denngay')) map.deprecatedDate = idx;
      else if (norm.includes('trangthai') || norm.includes('status')) map.status = idx;
      else if (norm.includes('nguoi') || norm.includes('pheduyet') || norm.includes('author') || norm.includes('capnhat')) map.author = idx;
      else if (norm.includes('lydo') || norm.includes('reason') || norm.includes('noidung') || norm.includes('thaydoi')) map.reason = idx;
      else if (norm.includes('drive') || norm.includes('link') || norm.includes('url')) map.driveUrl = idx;
      else if (norm.includes('ghichu') || norm.includes('note')) map.notes = idx;
    });

    if (map.code === -1) map.code = 0;
    if (map.version === -1) map.version = 1;
    if (map.releaseDate === -1) map.releaseDate = 2;
    if (map.reason === -1) map.reason = 6;

    const list = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const code = (map.code >= 0 && row[map.code]) ? row[map.code].trim() : '';
      if (!code) continue;

      const version = (map.version >= 0 && row[map.version]) ? row[map.version].trim() : 'v1.0';
      const releaseDate = (map.releaseDate >= 0 && row[map.releaseDate]) ? row[map.releaseDate].trim() : '';
      const deprecatedDate = (map.deprecatedDate >= 0 && row[map.deprecatedDate]) ? row[map.deprecatedDate].trim() : '';
      const rawStatus = (map.status >= 0 && row[map.status]) ? row[map.status].trim() : '';
      const author = (map.author >= 0 && row[map.author]) ? row[map.author].trim() : 'Ban Quản Trị';
      const reason = (map.reason >= 0 && row[map.reason]) ? row[map.reason].trim() : '';
      const driveUrl = (map.driveUrl >= 0 && row[map.driveUrl]) ? row[map.driveUrl].trim() : '';
      const notes = (map.notes >= 0 && row[map.notes]) ? row[map.notes].trim() : '';

      const isActive = rawStatus.toLowerCase().includes('hieu luc') || 
                       rawStatus.toLowerCase().includes('active') || 
                       deprecatedDate.toLowerCase().includes('dang ap dung') ||
                       deprecatedDate === '';

      list.push({
        code,
        version,
        releaseDate,
        deprecatedDate: deprecatedDate || (isActive ? 'Đang áp dụng' : ''),
        status: isActive ? 'active' : 'archived',
        author,
        reason,
        driveUrl,
        notes
      });
    }

    return list;
  } catch (err) {
    console.warn('Lỗi khi tải lịch sử phiên bản từ Sheets:', err);
    return [];
  }
}

/**
 * Storage helpers
 */
const DataStore = {
  // Load documents: prefer cached Google Sheet data, otherwise default mock data
  getDocuments() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.DOCUMENTS_CACHE);
      if (cached) {
        let parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Tự động chuyển đổi các tài liệu cũ sang danh xưng Ban Quản Lý và gán trạng thái
          parsed.forEach(d => {
            if (d.department === 'Ban Giám Đốc') d.department = 'Ban Quản Lý';
            if (d.department === 'Phòng Thiết Kế') d.department = 'Bộ phận Kỹ Thuật';
            if (d.category === 'Quy chuẩn') d.category = 'Tiêu chuẩn';
            if (!d.status) d.status = 'Chính thức';
          });

          // Tự động chuẩn hóa và sửa lỗi lệch cột (nếu có)
          parsed = parsed.map(sanitizeDocumentFields);

          // Loại bỏ tài liệu mẫu BV-TK-01 và QT-TK-02 nếu còn lưu trong cache cũ
          parsed = parsed.filter(d => {
            const code = (d.code || '').trim().toUpperCase();
            return code !== 'BV-TK-01' && code !== 'QT-TK-02' && d.id !== 'doc-draft-ai';
          });
          
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS_CACHE, JSON.stringify(parsed));

          return parsed;
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc cache dữ liệu:', e);
    }
    return DEFAULT_MOCK_DOCUMENTS;
  },

  setDocuments(docs) {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS_CACHE, JSON.stringify(docs));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.error('Không thể lưu documents vào localStorage:', e);
    }
  },

  // Version History Helpers
  getVersionHistory() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc cache lịch sử phiên bản:', e);
    }
    return DEFAULT_VERSION_HISTORY;
  },

  setVersionHistory(list) {
    try {
      localStorage.setItem(STORAGE_KEYS.VERSION_HISTORY_CACHE, JSON.stringify(list));
    } catch (e) {
      console.error('Không thể lưu version history vào localStorage:', e);
    }
  },

  getVersionHistoryForDoc(doc) {
    if (!doc) return [];
    const allHistory = this.getVersionHistory();
    const cleanCode = (doc.code || '').trim().toLowerCase();
    const matches = allHistory.filter(h => (h.code || '').trim().toLowerCase() === cleanCode);

    if (matches.length > 0) {
      // Sort: active version first, then newest releaseDate to oldest
      return matches.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      });
    }

    // Default single version fallback if no history recorded yet
    return [
      {
        code: doc.code,
        version: doc.version || 'v1.0',
        releaseDate: doc.updatedAt || new Date().toISOString().slice(0, 10),
        deprecatedDate: 'Đang áp dụng',
        status: 'active',
        author: doc.department || 'Ban Quản Trị',
        reason: 'Phiên bản ban hành đầu tiên theo hồ sơ quản trị tiêu chuẩn.',
        driveUrl: doc.driveUrl || '',
        notes: 'Bản gốc khởi tạo'
      }
    ];
  },

  clearCustomDocuments() {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS_CACHE);
    localStorage.removeItem(STORAGE_KEYS.VERSION_HISTORY_CACHE);
    localStorage.removeItem(STORAGE_KEYS.SHEET_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.SHEET_AI_URL);
  },

  /**
   * Lấy đường link Trợ lý AI NotebookLM
   * Ưu tiên 1: Link được đồng bộ tự động từ Google Sheets (Tab CauHinhHeThong)
   * Ưu tiên 2: Link cấu hình thủ công tại trình duyệt (nếu có)
   * Ưu tiên 3: Link mặc định ban đầu của hệ thống
   */
  getAiAssistantUrl() {
    const manualUrl = localStorage.getItem(STORAGE_KEYS.NOTEBOOKLM_URL);
    if (manualUrl && manualUrl.trim()) {
      return manualUrl.trim();
    }
    const sheetAiUrl = localStorage.getItem(STORAGE_KEYS.SHEET_AI_URL);
    if (sheetAiUrl && sheetAiUrl.trim()) {
      return sheetAiUrl.trim();
    }
    return (typeof DEFAULT_NOTEBOOKLM_URL !== 'undefined') ? DEFAULT_NOTEBOOKLM_URL : 'https://notebooklm.google.com/';
  },

  setAiAssistantUrl(url) {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEYS.NOTEBOOKLM_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.NOTEBOOKLM_URL);
    }
  },

  getSheetConfig() {
    try {
      const config = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
      if (config) {
        const parsed = JSON.parse(config);
        if (parsed && parsed.sheetId) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return (typeof DEFAULT_SHEET_CONFIG !== 'undefined' && DEFAULT_SHEET_CONFIG && DEFAULT_SHEET_CONFIG.sheetId) ? DEFAULT_SHEET_CONFIG : null;
  },

  setSheetConfig(config) {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
  },

  getFavorites() {
    try {
      const favs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favs ? JSON.parse(favs) : [];
    } catch (e) {
      return [];
    }
  },

  toggleFavorite(docId) {
    const favs = this.getFavorites();
    const idx = favs.indexOf(docId);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.push(docId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return favs.includes(docId);
  },

  isFavorite(docId) {
    return this.getFavorites().includes(docId);
  },

  /**
   * Thêm tài liệu mới vào DataStore và lưu lịch sử phiên bản v1.0
   */
  addDocument(doc) {
    const rawDocs = this.getDocuments();
    const cleanCode = (doc.code || '').trim().toUpperCase();
    const existingFiltered = rawDocs.filter(d => (d.code || '').trim().toUpperCase() !== cleanCode);
    const docs = [doc, ...existingFiltered];
    this.setDocuments(docs);

    // Tự động ghi nhận mốc phiên bản khởi tạo vào LichSuPhienBan
    const rawHistory = this.getVersionHistory();
    const historyItem = {
      code: doc.code,
      version: doc.version || 'v1.0',
      releaseDate: doc.updatedAt || new Date().toISOString().slice(0, 10),
      deprecatedDate: 'Đang áp dụng',
      status: 'active',
      author: doc.department || 'Ban Quản Trị',
      reason: doc.description ? `Khởi tạo quy trình: ${doc.description.slice(0, 90)}...` : 'Ban hành tài liệu quy trình mới trên hệ thống ProcessHub.',
      driveUrl: doc.driveUrl || '',
      notes: 'Ban hành trực tiếp từ ProcessHub Web App'
    };
    const allHistory = [historyItem, ...rawHistory];
    this.setVersionHistory(allHistory);

    return docs;
  },

  /**
   * Gửi dữ liệu quy trình mới lên Google Apps Script Web App để ghi vào Google Sheet
   */
  async syncDocumentToGoogleSheet(doc) {
    const config = this.getSheetConfig();
    const sheetId = config ? config.sheetId : null;
    if (!sheetId || !sheetId.includes('script.google.com/macros/s/')) {
      return { 
        synced: false, 
        isWebApp: false, 
        message: 'Đã lưu trên web app thành công. (Chưa kết nối Web App URL để tự động ghi vào Google Sheets)' 
      };
    }

    try {
      const response = await fetch(sheetId, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'addDocument',
          document: doc
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawText = await response.text();
      let resJson = null;
      try {
        resJson = JSON.parse(rawText);
      } catch (e) {
        // Response is HTML or plain error text
      }

      if (!resJson || resJson.status === 'error') {
        const isMissingDoPost = rawText.includes('doPost') || rawText.includes('Không tìm thấy hàm tập lệnh');
        const errMsg = (resJson && resJson.message) ? resJson.message : 
          (isMissingDoPost ? 'Google Apps Script chưa triển khai Phiên bản mới chứa hàm doPost.' : 'Máy chủ Google Apps Script trả về lỗi.');
        return {
          synced: false,
          isWebApp: true,
          error: errMsg,
          message: `Đã lưu trên ProcessHub, nhưng chưa thể ghi vào Google Sheet: ${errMsg}`
        };
      }

      return {
        synced: true,
        isWebApp: true,
        message: resJson.message || `Đã thêm thành công [${doc.code}] vào Google Sheet!`
      };
    } catch (err) {
      console.warn('Lỗi khi gửi dữ liệu lên Google Apps Script:', err);
      return {
        synced: false,
        isWebApp: true,
        error: err.message,
        message: `Đã lưu trên web app, nhưng chưa thể tự động thêm vào Google Sheet (${err.message}).`
      };
    }
  },

  /**
   * Cập nhật quy trình và tự động ghi nhận lịch sử phiên bản cũ nếu link hoặc version thay đổi
   */
  updateDocument(updatedDoc, changeReason = '', author = '') {
    const rawDocs = this.getDocuments();
    const cleanCode = (updatedDoc.code || '').trim().toUpperCase();
    const index = rawDocs.findIndex(d => (d.code || '').trim().toUpperCase() === cleanCode);

    if (index === -1) {
      return this.addDocument(updatedDoc);
    }

    const oldDoc = rawDocs[index];
    const todayStr = updatedDoc.updatedAt || new Date().toISOString().slice(0, 10);

    // Kiểm tra nếu link drive hoặc phiên bản thay đổi -> Lưu vết vào LichSuPhienBan
    if (oldDoc.driveUrl !== updatedDoc.driveUrl || oldDoc.version !== updatedDoc.version) {
      const rawHistory = this.getVersionHistory();
      const historyItem = {
        code: oldDoc.code,
        version: oldDoc.version || 'v1.0',
        releaseDate: oldDoc.updatedAt || todayStr,
        deprecatedDate: todayStr,
        status: 'replaced',
        author: author || updatedDoc.department || 'Ban Quản Trị',
        reason: changeReason || 'Cập nhật đường dẫn Google Drive / nội dung mới.',
        driveUrl: oldDoc.driveUrl || '',
        notes: 'Lưu trữ tự động khi sửa link/tài liệu từ ProcessHub'
      };
      const allHistory = [historyItem, ...rawHistory];
      this.setVersionHistory(allHistory);
    }

    // Ghi đè tài liệu tại vị trí cũ
    rawDocs[index] = { ...oldDoc, ...updatedDoc };
    this.setDocuments(rawDocs);

    return rawDocs;
  },

  /**
   * Phê duyệt và phát hành chính thức tài liệu dự thảo
   */
  async approveDocument(code, approvedBy = 'Ban Quản Lý', newVersion = null, effectiveDate = null) {
    const rawDocs = this.getDocuments();
    const cleanCode = (code || '').trim().toUpperCase();
    const index = rawDocs.findIndex(d => (d.code || '').trim().toUpperCase() === cleanCode);
    if (index === -1) return { success: false, message: 'Không tìm thấy tài liệu cần duyệt.' };

    const doc = rawDocs[index];
    const todayStr = effectiveDate || new Date().toISOString().slice(0, 10);
    doc.status = 'Chính thức';
    doc.updatedAt = todayStr;
    if (newVersion) doc.version = newVersion;
    this.setDocuments(rawDocs);

    // Lưu vào lịch sử phiên bản
    const historyItem = {
      code: doc.code,
      version: doc.version || 'v1.0',
      releaseDate: todayStr,
      deprecatedDate: 'Đang áp dụng',
      status: 'active',
      author: approvedBy || 'Ban Quản Lý',
      reason: 'Phê duyệt & ban hành chính thức có hiệu lực áp dụng.',
      driveUrl: doc.driveUrl || '',
      notes: 'Đã duyệt bởi Quản Trị Viên (Admin)'
    };
    const allHistory = [historyItem, ...this.getVersionHistory()];
    this.setVersionHistory(allHistory);

    // Đồng bộ lên Google Apps Script nếu có kết nối
    const config = this.getSheetConfig();
    if (config && config.sheetId && config.sheetId.includes('script.google.com/macros/s/')) {
      try {
        fetch(config.sheetId, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'approveDocument',
            document: doc,
            approvedBy: approvedBy || 'Ban Quản Lý'
          })
        }).catch(err => console.warn('Lỗi gọi approveDocument lên Apps Script:', err));
      } catch (e) {}
    }

    return { success: true, document: doc };
  },

  /**
   * Gửi yêu cầu cập nhật quy trình lên Google Apps Script Web App
   */
  async syncUpdateToGoogleSheet(updatedDoc, changeReason = '', author = '') {
    const config = this.getSheetConfig();
    const sheetId = config ? config.sheetId : null;
    if (!sheetId || !sheetId.includes('script.google.com/macros/s/')) {
      return { 
        synced: false, 
        isWebApp: false, 
        message: 'Đã cập nhật trên web app. (Chưa kết nối Web App URL để ghi trực tiếp vào Google Sheet)' 
      };
    }

    try {
      const response = await fetch(sheetId, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'updateDocument',
          document: updatedDoc,
          changeReason: changeReason,
          author: author
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawText = await response.text();
      let resJson = null;
      try {
        resJson = JSON.parse(rawText);
      } catch (e) {
        // Response is HTML or plain error text
      }

      if (!resJson || resJson.status === 'error') {
        const isMissingDoPost = rawText.includes('doPost') || rawText.includes('Không tìm thấy hàm tập lệnh');
        const errMsg = (resJson && resJson.message) ? resJson.message : 
          (isMissingDoPost ? 'Google Apps Script chưa triển khai Phiên bản mới chứa hàm doPost.' : 'Máy chủ Google Apps Script trả về lỗi.');
        return {
          synced: false,
          isWebApp: true,
          error: errMsg,
          message: `Đã cập nhật trên ProcessHub, nhưng chưa thể ghi vào Google Sheet: ${errMsg}`
        };
      }

      return {
        synced: true,
        isWebApp: true,
        message: resJson.message || `Đã cập nhật thành công [${updatedDoc.code}] trên Google Sheet!`
      };
    } catch (err) {
      console.warn('Lỗi khi gửi cập nhật lên Google Apps Script:', err);
      return {
        synced: false,
        isWebApp: true,
        error: err.message,
        message: `Đã cập nhật trên web app, nhưng chưa thể ghi vào Google Sheet (${err.message}).`
      };
    }
  },

  /**
   * Xóa tài liệu khỏi DataStore (LocalStorage & in-memory)
   */
  deleteDocument(docId, docCode) {
    const rawDocs = this.getDocuments();
    const cleanCode = (docCode || '').trim().toUpperCase();
    const filtered = rawDocs.filter(d => {
      if (docId && d.id === docId) return false;
      if (cleanCode && (d.code || '').trim().toUpperCase() === cleanCode) return false;
      return true;
    });
    this.setDocuments(filtered);

    // Xóa khỏi danh sách yêu thích nếu có
    if (docId) {
      const favs = this.getFavorites();
      const favIdx = favs.indexOf(docId);
      if (favIdx >= 0) {
        favs.splice(favIdx, 1);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
      }
    }

    return filtered;
  },

  /**
   * Gửi yêu cầu xóa quy trình lên Google Apps Script Web App
   */
  async syncDeleteToGoogleSheet(doc) {
    const config = this.getSheetConfig();
    const sheetId = config ? config.sheetId : null;
    if (!sheetId || !sheetId.includes('script.google.com/macros/s/')) {
      return { 
        synced: false, 
        isWebApp: false, 
        message: 'Đã xóa trên ProcessHub. (Chưa kết nối Web App URL để xóa tự động trên Google Sheets)' 
      };
    }

    try {
      const currentUser = AuthStore.getCurrentUser();
      const response = await fetch(sheetId, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'deleteDocument',
          document: doc,
          deletedBy: currentUser ? currentUser.fullName : 'Ban Giám Đốc'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawText = await response.text();
      let resJson = null;
      try {
        resJson = JSON.parse(rawText);
      } catch (e) {
        // Response is HTML or plain error text
      }

      if (!resJson || resJson.status === 'error') {
        const errMsg = (resJson && resJson.message) ? resJson.message : 'Máy chủ Google Apps Script trả về lỗi.';
        return {
          synced: false,
          isWebApp: true,
          error: errMsg,
          message: `Đã xóa trên ProcessHub, nhưng chưa thể gỡ khỏi Google Sheet: ${errMsg}`
        };
      }

      return {
        synced: true,
        isWebApp: true,
        message: resJson.message || `Đã xóa thành công quy trình [${doc.code || ''}] trên Google Sheet!`
      };
    } catch (err) {
      console.warn('Lỗi khi gửi yêu cầu xóa lên Google Apps Script:', err);
      return {
        synced: false,
        isWebApp: true,
        error: err.message,
        message: `Đã xóa trên ProcessHub, nhưng chưa thể tự động gỡ khỏi Google Sheet (${err.message}).`
      };
    }
  },

  /**
   * Gửi link Trợ lý AI NotebookLM lên Google Sheet để đồng bộ cho toàn bộ công ty
   */
  async syncAiUrlToGoogleSheet(url) {
    const config = this.getSheetConfig();
    const sheetId = config ? config.sheetId : null;
    if (!sheetId || !sheetId.includes('script.google.com/macros/s/')) {
      return { 
        synced: false, 
        isWebApp: false, 
        message: 'Đã lưu trên web app. (Chưa kết nối Web App URL để ghi vào Google Sheet)' 
      };
    }

    try {
      const response = await fetch(sheetId, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'updateAiUrl',
          url: url
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawText = await response.text();
      let resJson = null;
      try { resJson = JSON.parse(rawText); } catch (e) {}

      return {
        synced: true,
        isWebApp: true,
        message: (resJson && resJson.message) || 'Đã đồng bộ link AI lên Google Sheet thành công!'
      };
    } catch (err) {
      console.warn('Lỗi khi gửi link AI lên Google Apps Script:', err);
      return {
        synced: false,
        isWebApp: true,
        error: err.message
      };
    }
  }
};


