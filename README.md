# ProcessHub - Cổng Tra Cứu Quy Trình & Hướng Dẫn Làm Việc (H-Design)

**ProcessHub** là ứng dụng web tra cứu quy trình nội bộ, quy chuẩn kỹ thuật và hướng dẫn làm việc chuẩn hóa cho các phòng ban công ty (Thiết kế, Thi công & Kỹ thuật, Quản lý dự án, Nhân sự, Tài chính - Kế toán, Kinh doanh, Ban Giám Đốc...).

Toàn bộ danh mục tài liệu được quản trị dễ dàng trên **Google Sheets**, và các file quy trình/bản vẽ/biểu mẫu được lưu trữ trực tiếp trên **Google Drive**. Khi nhân sự bấm vào, phần mềm sẽ **tự động chuyển link Drive thành link tải về trực tiếp** hoặc mở trình xem trước trực quan.

---

## 🌟 Tính Năng Nổi Bật

1. **Đồng bộ tự động với Google Sheets**:
   - Dữ liệu quy trình được cập nhật theo thời gian thực từ Google Sheets thông qua cơ chế API mở (không cần cấu hình API Key phức tạp).
   - Tự động nhận diện cột linh hoạt (hỗ trợ cả tiếng Việt có dấu, không dấu và tiếng Anh).
   - Có cơ chế lưu đệm (LocalStorage Cache) giúp tải trang tức thì ngay cả khi mạng yếu hoặc offline.

2. **Tự động xử lý link Google Drive**:
   - Nhân viên chỉ cần dán link chia sẻ thông thường của Google Drive (`drive.google.com/file/d/.../view?usp=sharing`).
   - Phần mềm tự động trích xuất File ID và chuyển đổi thành **Link Tải Trực Tiếp (Direct Download)** (`drive.usercontent.google.com/download?id=...&export=download`).
   - Hỗ trợ **Xem trước trực tiếp (Preview)** ngay trên giao diện web thông qua modal cửa sổ xem file.

3. **Tra cứu siêu tốc & Đa tiêu chí**:
   - Ô tìm kiếm thông minh (Omni-search) tìm theo mã quy trình, tên tài liệu, từ khóa, phòng ban, mô tả (phím tắt `/` để kích hoạt nhanh).
   - Bộ lọc linh hoạt theo từng phòng ban, theo loại tài liệu (*Quy trình*, *Quy chuẩn*, *Hướng dẫn*, *Biểu mẫu*, *Chính sách*).
   - Thanh điều hướng phân loại phòng ban bằng chip trực quan.
   - Chức năng đánh dấu **Tài liệu Yêu thích (Favorites)** cho từng cá nhân.

4. **Trải nghiệm giao diện cao cấp**:
   - Hỗ trợ 2 chế độ hiển thị: **Dạng lưới thẻ (Grid View)** hiện đại và **Dạng bảng danh sách (Table View)** tra cứu chuyên sâu.
   - Chuyển đổi giao diện **Sáng (Light Mode)** / **Tối (Dark Mode)** tùy chọn.
   - Thống kê tự động số lượng tài liệu theo từng thể loại và từng phòng ban.

---

## 🚀 Hướng Dẫn Sử Dụng & Kết Nối Google Sheets

### Bước 1: Tạo Google Sheets lưu danh mục quy trình
1. Truy cập [Google Sheets](https://sheets.new) để tạo một bảng tính mới.
2. Bạn có thể mở file `ProcessHub_Sample_Template.csv` có sẵn trong thư mục này và import vào Google Sheets, hoặc tạo các cột theo đúng thứ tự sau:

| Mã tài liệu | Tên tài liệu | Phòng ban | Phân loại | Phiên bản | Ngày ban hành | Link Google Drive | Mô tả tóm tắt | Từ khóa |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| QT-TK-01 | Quy trình thiết kế ý tưởng | Phòng Thiết Kế | Quy trình | v3.2 | 2026-10-10 | https://drive.google.com/... | Quy trình từ brief đến concept 3D... | thiết kế, concept |
| QC-BV-02 | Quy chuẩn hồ sơ bản vẽ | Phòng Thiết Kế | Quy chuẩn | v2.0 | 2026-09-25 | https://drive.google.com/... | Tiêu chuẩn nét vẽ CAD & Revit... | cad, revit |

> 💡 **Lưu ý về link Google Drive**:
> - Trên Google Drive, nhấp chuột phải vào file quy trình/biểu mẫu -> chọn **Chia sẻ (Share)** -> đổi quyền sang **"Bất kỳ ai có đường liên kết đều có thể xem" (Anyone with the link can view)**.
> - Sao chép link đó và dán vào cột **Link Google Drive** trên Google Sheets.

### Bước 2: Bật quyền truy cập công khai cho Google Sheet
1. Trên file Google Sheets của bạn, bấm nút **Chia sẻ (Share)** ở góc trên bên phải.
2. Tại mục *Quyền truy cập chung*, chọn **Bất kỳ ai có đường liên kết (Anyone with the link)** với vai trò **Người xem (Viewer)**.
3. Bấm **Sao chép đường liên kết (Copy link)**.

### Bước 3: Kết nối vào ProcessHub
1. Mở phần mềm ProcessHub trên trình duyệt.
2. Bấm nút **"Nguồn Sheets"** trên thanh menu trên cùng.
3. Dán đường dẫn Google Sheets vừa sao chép vào ô nhập.
4. Bấm **"Kiểm tra kết nối"** -> Khi hiển thị thông báo thành công, bấm **"Lưu & Đồng bộ ngay"**.
5. Toàn bộ quy trình từ Google Sheet sẽ hiển thị ngay lập tức! Mỗi khi bạn sửa trên Google Sheet, nhân sự chỉ cần bấm nút **"Đồng bộ"** trên thanh menu là thấy ngay dữ liệu mới nhất.

---

## 💻 Cách Khởi Chạy Phần Mềm

ProcessHub được xây dựng dạng thuần (Vanilla HTML5 / CSS3 / ES6 Javascript) siêu nhẹ, không phụ thuộc môi trường backend nặng nề, có thể chạy theo nhiều cách:

### Cách 1: Mở trực tiếp (Không cần cài đặt)
- Nhấp đúp chuột vào file `index.html` để mở trực tiếp trên Google Chrome, Microsoft Edge, Cốc Cốc hoặc Safari.

### Cách 2: Chạy qua Live Server hoặc máy chủ web cục bộ
Nếu bạn đang dùng VS Code / Antigravity IDE:
- Sử dụng tiện ích Live Server hoặc lệnh Python:
  ```bash
  python -m http.server 3000
  ```
- Hoặc Node `npx serve`:
  ```bash
  npx serve .
  ```
- Mở trình duyệt tại: `http://localhost:3000`

### Cách 3: Đưa lên mạng nội bộ hoặc GitHub Pages (Miễn phí)
- Vì toàn bộ mã nguồn là file tĩnh, bạn có thể đẩy thư mục này lên GitHub và bật **GitHub Pages** (Settings -> Pages -> Deploy from Branch: main).
- Mọi nhân sự trong công ty chỉ cần truy cập vào đường link web đó là có thể tra cứu và tải quy trình mọi lúc, mọi nơi trên máy tính lẫn điện thoại di động.

---

## 📁 Cấu Trúc Dự Án

```
ProcessHub/
├── index.html                   # Giao diện chính của ứng dụng
├── css/
│   └── style.css                # Bộ thiết kế giao diện (Design System, Dark/Light mode, Responsive)
├── js/
│   ├── data.js                  # Cơ chế kết nối Google Sheets CSV & chuyển đổi link Google Drive
│   └── app.js                   # Logic lọc, tìm kiếm, xem trước tài liệu, giao diện modal
├── ProcessHub_Sample_Template.csv # File mẫu chuẩn bị sẵn để import vào Google Sheets
└── README.md                    # Hướng dẫn chi tiết
```

---
*Phát triển bởi H-Design Solution (2026).*
