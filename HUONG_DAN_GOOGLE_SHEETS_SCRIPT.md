# 🚀 Hướng Dẫn Cài Đặt Code Tự Động Hóa Lên Google Sheets (H-Design ProcessHub)

Tài liệu này hướng dẫn bạn cách dán đoạn mã **Google Apps Script** vào file Google Sheets của công ty. Sau khi cài đặt, Google Sheets sẽ có thêm một Menu riêng biệt: **`🚀 ProcessHub (H-Design)`** giúp bạn:

1. **Khởi tạo 4 Tab chuẩn chỉ với 1 cú click:** Tự động tạo màu sắc doanh nghiệp, kẻ bảng, đóng băng tiêu đề, và tạo menu chọn thả xuống (Dropdown) cho Phòng ban, Phân loại, **Trạng thái phát hành (`Chính thức`, `Dự thảo`, `Tham khảo`)**, cùng Tab Cấu hình link Trợ lý AI NotebookLM và Phân quyền tài khoản.
2. **Quy trình Phê duyệt & Ban hành tài liệu:**
   - **Tài liệu Dự thảo (`Dự thảo`):** Các quy trình đang trong giai đoạn soạn thảo/thử nghiệm chỉ có tài khoản **Admin (`admin`)** mới nhìn thấy để rà soát và bấm nút **"Duyệt Phát Hành"**. Nhân viên các bộ phận và Ban Quản Lý sẽ không nhìn thấy để tránh nhầm lẫn khi vận hành.
   - **Tài liệu Tham khảo (`Tham khảo`):** Cẩm nang, sổ tay tra cứu kỹ thuật dành cho nhân viên đọc thêm.
   - **Tài liệu Chính thức (`Chính thức`):** Quy trình đã được phê duyệt có hiệu lực bắt buộc thi hành.
3. **Phân quyền vai trò chuẩn xác:**
   - **Quản Trị Viên (`admin`):** Toàn quyền Thêm, Sửa, Xóa, Cấu hình và **Duyệt phát hành tài liệu dự thảo** thành chính thức.
   - **Ban Quản Lý (`bql`):** Được quyền xem toàn bộ 5 phòng ban, ở chế độ **Chỉ xem (Read-only)**, không hiển thị các nút Thêm/Sửa/Xóa/Duyệt.
   - **Các bộ phận chuyên môn (`kythuat`, `sanxuat`, `kinhdoanh`, `hcns`):** Ở chế độ **Chỉ xem (Read-only)** trong phạm vi phòng ban được phân quyền.
4. **Nâng cấp phiên bản tự động:** Chỉ cần chọn 1 dòng quy trình, bấm nút thì bản cũ sẽ **tự động được lưu sang Tab Lịch Sử** kèm lý do thay đổi và ngày hết hiệu lực. Không lo thao tác thủ công bị nhầm lẫn!
5. **Quản lý Link Trợ lý AI trực tiếp trên Sheets:** Dán đường link sổ tay NotebookLM vào Tab **`CauHinhHeThong`**, toàn bộ nhân viên công ty khi bấm nút "Trợ lý AI" trên web sẽ tự động mở đúng link này!
6. **Kiểm tra link Google Drive:** Quét và kiểm tra tính hợp lệ của toàn bộ đường link file.

---

## 🛠️ Các Bước Thực Hiện (Mất đúng 1 phút)

### Bước 1: Mở Google Sheets và truy cập trình soạn thảo mã
1. Mở file Google Sheets mới hoặc file bạn đang dùng tại [Google Sheets](https://sheets.new).
2. Trên thanh menu trên cùng của Google Sheets, chọn:  
   **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.

---

### Bước 2: Dán đoạn mã vào Apps Script
1. Xóa toàn bộ nội dung mặc định (`function myFunction() {...}`) đang có trong ô soạn thảo.
2. Mở file [Google_Apps_Script_ProcessHub.js](file:///d:/GT_Huy/Solution%20by%20H-Design/ProcessHub/Google_Apps_Script_ProcessHub.js) trong thư mục dự án, sao chép toàn bộ code và **Dán (Paste)** vào Apps Script.
3. Bấm biểu tượng **💾 Lưu dự án (Save project)** (hoặc phím tắt `Ctrl + S`).
4. (Tùy chọn) Đổi tên dự án từ *Dự án không có tiêu đề* thành **`ProcessHub Automation`**.

---

### Bước 3: Quay lại Google Sheet & Trải nghiệm
1. Quay lại trang Google Sheet của bạn và **nhấn F5 (hoặc tải lại trang)**.
2. Sau 2–3 giây, bạn sẽ thấy xuất hiện một menu mới toanh trên thanh công cụ:  
   👉 **`🚀 ProcessHub (H-Design)`**

---

## 🌟 Hướng Dẫn Sử Dụng Các Tính Năng Trong Menu

### 1. Bấm `1. Khởi tạo cấu trúc 4 Tab chuẩn`:
* Khi chạy lần đầu, Google sẽ hỏi cấp quyền truy cập (*Cần có ủy quyền*):
  - Bấm **Tiếp tục (Continue)**.
  - Chọn tài khoản Google của bạn.
  - Bấm **Nâng cao (Advanced)** ở góc dưới bên trái ➔ Chọn **Đi tới ProcessHub Automation (không an toàn)**.
  - Bấm **Cho phép (Allow)**.
* Ngay lập tức, **4 Tab chuẩn** sẽ được tạo tự động:
  - **`QuyTrinhHienHanh`** (Màu tím thương hiệu Indigo): Danh mục quy trình đang áp dụng. Cột *Trạng thái* có sẵn menu chọn thả xuống (`Chính thức`, `Dự thảo`, `Tham khảo`).
  - **`LichSuPhienBan`** (Màu xanh ngọc Emerald): Lưu trữ đối soát lịch sử các phiên bản cũ hoặc tài liệu đã xóa.
  - **`CauHinhHeThong`** (Màu tím Violet): Quản lý đường link Trợ lý AI NotebookLM của công ty. Bạn chỉ cần dán link NotebookLM mới vào cột Giá trị ở dòng 2 là xong!
  - **`TaiKhoan`** (Màu xanh Navy Slate): Quản lý **Tên đăng nhập (ID)**, **Mật khẩu (Pass / PIN)**, **Họ tên**, **Phòng ban**, **Vai trò (Role)** và **Quyền xem các phòng ban**.
    - Cột *Vai trò (Role)*: `Admin` (Toàn quyền quản trị), `Ban Quản Lý` (Chỉ xem 5 phòng), `User` (Nhân viên chỉ xem).
    - Cột *Quyền xem bộ phận (Allowed)*: Điền `*` nếu xem toàn bộ 5 bộ phận, hoặc điền tên các phòng ban ngăn cách bằng dấu phẩy (VD: `Bộ phận Kỹ Thuật, Bộ phận Sản Xuất`).
    - *💡 Mẹo bảo mật cho Quản Trị Viên:* Nhấp chuột phải vào tên Tab **`TaiKhoan`** ➔ Chọn **Ẩn trang tính (Hide sheet)** hoặc **Bảo vệ trang tính (Protect sheet)** để chỉ riêng tài khoản của Admin mới có quyền xem tab này, nhân viên mở file Sheet sẽ không nhìn thấy mật khẩu của nhau.

### 2. Bấm `2. Nâng cấp phiên bản (Tự động chuyển bản cũ sang Lịch Sử)`:
* Khi bạn muốn sửa một quy trình (ví dụ nâng `QT-TK-01` từ `v3.2` lên `v3.3`):
  1. Nhấp chuột vào dòng `QT-TK-01` trên Tab **`QuyTrinhHienHanh`**.
  2. Bấm menu **`🚀 ProcessHub (H-Design)`** ➔ Chọn **`2. Nâng cấp phiên bản`**.
  3. Hệ thống sẽ hỏi:
     - Nhập số phiên bản mới: Gõ `v3.3`.
     - Lý do thay đổi: Gõ lý do (VD: *"Bổ sung checklist kiểm tra 3D"*).
     - Người duyệt: Gõ tên người duyệt (VD: *"Ban Quản Lý"*).
     - Link Drive mới: Dán link mới (hoặc để trống nếu dùng chung link).
  4. Bấm **OK**: Bản cũ `v3.2` sẽ được tự động chuyển sang Tab **`LichSuPhienBan`** với trạng thái *"Đã thay thế"*, và dòng hiện tại tự động cập nhật lên `v3.3`!

---

---

## 🌐 Triển Khai Web App Để Ghi Tự Động Từ Web Vào Google Sheets

Để khi bạn bấm **"Thêm tài liệu mới"** hoặc **"Sửa link"** trên Web ProcessHub, thông tin **tự động ghi thẳng vào Google Sheet**:

1. Tại cửa sổ **Apps Script**, bấm nút xanh **Triển khai (Deploy)** ở góc trên bên phải.
2. Chọn **Quản lý bản triển khai (Manage deployments)** *(hoặc Bản triển khai mới nếu làm lần đầu)*.
3. Bấm vào biểu tượng **✏️ Cây bút chì (Chỉnh sửa)** bên cạnh bản triển khai hiện tại:
   - **Phiên bản (Version):** Chọn **Phiên bản mới (New version)** *(⚠️ Bắt buộc mỗi khi cập nhật code để Google nạp các hàm mới như `doPost`)*.
   - **Người thực thi (Execute as):** Chọn **Tôi (Me)**.
   - **Người có quyền truy cập (Who has access):** Chọn **Bất kỳ ai (Anyone)**.
4. Bấm **Triển khai (Deploy)**.
5. Sao chép đường link Web App (có đuôi `/exec`) và gắn vào ProcessHub.

---

## 🔗 Kết Nối Google Sheet Vào Web ProcessHub
1. Mở phần mềm **ProcessHub**, bấm nút **"Cài đặt" (Bánh răng)** ở thanh điều hướng.
2. Dán đường link Web App (hoặc link chia sẻ Google Sheets) vào ô cấu hình.
3. Bấm **"Lưu & Đồng bộ ngay"**. Toàn bộ quy trình và lịch sử phiên bản sẽ tự động liên kết 2 chiều!

