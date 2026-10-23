# BÁO CÁO TIẾN ĐỘ & BÀN GIAO CÔNG VIỆC (HANDOVER NOTES)
**Dự án:** ProcessHub - Cổng Tra Cứu Quy Trình & Hướng Dẫn Làm Việc  
**Đơn vị:** Solution by H-Design  
**Ngày cập nhật:** 23/10/2026  
**Trạng thái hiện tại:** ✅ Đã hoàn thiện toàn diện Hệ Thống Phân Quyền & Quy Trình Phê Duyệt Tài Liệu  

---

## 📌 1. Tóm Tắt Mục Tiêu & Yêu Cầu Vừa Triển Khai
1. **Phân Quyền Vai Trò (Role-based Access Control):**
   - **Quản Trị Viên (`admin`):** Toàn quyền Thêm, Sửa, Xóa, Cài đặt kết nối hệ thống và **Phê duyệt phát hành chính thức** các quy trình dự thảo.
   - **Ban Quản Lý (`bql` - Đổi từ Ban Giám Đốc):** Có quyền tra cứu, xem hồ sơ của toàn bộ 5 phòng ban (`*`), nhưng hoạt động ở chế độ **Chỉ xem (Read-only)**. Tuyệt đối ẩn toàn bộ các nút Thêm, Sửa, Xóa, Duyệt và Cài đặt.
   - **Các bộ phận chuyên môn (`kythuat`, `sanxuat`, `kinhdoanh`, `hcns`):** Hoạt động ở chế độ **Chỉ xem (Read-only)** trong phạm vi các phòng ban được cấp quyền.

2. **Vòng Đời Trạng Thái Tài Liệu (Document Status Lifecycle):**
   - **Chính thức (`Chính thức`):** Quy trình đã được phê duyệt, áp dụng bắt buộc trong toàn bộ hoạt động.
   - **Dự thảo (`Dự thảo`):** Bản thảo đang soạn thảo hoặc thử nghiệm. **Tự động ẩn khỏi tài khoản nhân viên & Ban Quản Lý** để tránh áp dụng sai. Chỉ Admin mới nhìn thấy kèm huy hiệu cảnh báo và nút "Duyệt phát hành ngay".
   - **Tham khảo (`Tham khảo`):** Cẩm nang, sổ tay thông số kỹ thuật, catalogue vật tư để tra cứu đọc thêm.

---

## 🛠️ 2. Những Việc Đã Hoàn Thành

### 1. Cơ sở dữ liệu & Google Apps Script
- `ProcessHub_Sample_Template.csv`: Bổ sung cột `Trạng thái`, chuyển "Ban Giám Đốc" thành "Ban Quản Lý", thêm ví dụ quy trình dự thảo (`QT-TK-02`) và tham khảo (`TK-VL-01`).
- `ProcessHub_Version_History_Template.csv`: Đồng bộ 100% tên "Ban Quản Lý".
- `Google_Apps_Script_ProcessHub.js`:
  - Cập nhật danh mục `DEPARTMENTS` ("Ban Quản Lý") và `DOC_STATUSES` (`Chính thức`, `Dự thảo`, `Tham khảo`).
  - Tự động tạo Dropdown xác thực dữ liệu cột *Trạng thái* ở Tab 1 `QuyTrinhHienHanh`.
  - Khởi tạo Tab 4 `TaiKhoan` với tài khoản `admin` và `bql` phân biệt rõ ràng vai trò.
  - Xử lý API Web App `doPost` hỗ trợ `action: 'approveDocument'` khi Admin duyệt trên web.

### 2. Tầng dữ liệu & Logic phân quyền (`js/data.js`)
- `AuthStore.isAdmin(user)`: Khắc phục triệt để lỗi logic phân quyền; chỉ cấp quyền Admin cho tài khoản có vai trò `Admin`. Tài khoản `bql` dù có quyền xem `*` vẫn ở chế độ Chỉ xem.
- `AuthStore.filterAllowedDocuments(docs, user)`: Tự động ẩn các tài liệu `Dự thảo` đối với tất cả người dùng không phải Admin.
- `DataStore.approveDocument(code, approvedBy)`: Tự động chuyển trạng thái sang `Chính thức`, ghi nhật ký vào Lịch sử phiên bản và đồng bộ hai chiều lên Google Apps Script.

### 3. Giao diện & Trải nghiệm người dùng (`index.html`, `css/style.css`, `js/app.js`)
- **Bộ lọc Trạng thái:** Dropdown lọc trạng thái kèm nút huy hiệu cảnh báo nhanh **"Chờ duyệt (X)"** chỉ hiển thị cho Admin.
- **Huy hiệu trực quan:** Huy hiệu trạng thái màu sắc chuyên biệt (Xanh ngọc cho Chính thức, Vàng viền nhấp nháy cho Dự thảo, Xanh lam nhạt cho Tham khảo).
- **Thao tác nhanh:** Thêm nút **Duyệt** trực tiếp trên thẻ Lưới và dòng Bảng cho Admin.
- **Cửa sổ Xem trước:** Banner cảnh báo viền sọc nổi bật khi xem bản thảo, tích hợp nút *"Duyệt Phát Hành Ngay"*.
- **Chuyển đổi tài khoản nhanh:** Bộ chip tài khoản cập nhật đầy đủ `admin`, `bql`, `kythuat`, `sanxuat`, `kinhdoanh`, `hcns` với nhãn rõ ràng.

---

## 💻 3. Hướng Dẫn Kiểm Thử Nhanh

1. **Kiểm tra tài khoản Quản trị (`admin` / pass: `1612`):**
   - Đăng nhập -> Thấy nút "Thêm mới", nút "Cài đặt", nút "Chờ duyệt (1)".
   - Tài liệu `QT-TK-02` (Dự thảo) hiển thị với nút "Duyệt".
   - Bấm "Duyệt" -> Xác nhận -> Tài liệu tự động chuyển sang "Chính thức", xuất hiện trong Lịch sử phiên bản.
2. **Kiểm tra tài khoản Ban Quản Lý (`bql` / pass: `1612`):**
   - Đăng nhập -> Xem được đầy đủ tài liệu của cả 5 phòng ban.
   - Các nút Thêm mới, Sửa, Xóa, Duyệt, Cài đặt hoàn toàn bị ẩn.
   - Tài liệu "Dự thảo" hoàn toàn bị ẩn, không gây nhiễu thao tác.
3. **Kiểm tra tài khoản phòng ban (`kythuat` / pass: `1612`):**
   - Chỉ xem tài liệu nội bộ Kỹ Thuật, chế độ chỉ xem.
