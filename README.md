# Dot Ads

**Chặn quảng cáo với một chạm.**

Dot Ads là extension chặn quảng cáo cho Safari iOS với giao diện tối giản: chỉ một chấm nhỏ nổi trên trang. Chạm để bật/tắt, nhấn giữ để mở bảng điều khiển.

## Tính năng

- **Bật/tắt nhanh**: chấm xanh nhấp nháy là đang bật, chấm xám là đang tắt.
- **Tự động chặn**: ẩn quảng cáo, banner, popup và nội dung nổi theo tên `id`/`class` phổ biến (`ad`, `ads`, `banner`, `popup`, `float-ad`, `app-download`...).
- **Chặn popup & tab lạ**: chặn lớp phủ và tab tự mở khi không có thao tác thật của người dùng (`window.open`, popunder, clickunder).
- **Chặn chuyển hướng ngoài**: chặn điều hướng sang tên miền lạ, link rút gọn, trang cờ bạc/cá độ và các link mở app (`appname://`).
- **Ẩn cả khung chứa**: ẩn luôn khung, viền và nút ✕ còn sót lại sau khi xoá quảng cáo.
- **Chặn tức thì**: ghi nhớ khung và popup đã ẩn để lần sau ẩn ngay khi tải trang.
- **Quảng cáo video**: tự bỏ qua quảng cáo trong JW Player, Video.js, IMA; lọc cấu hình VAST/VMAP/ad schedule. Không đụng vào player chính.
- **Qua mặt phát hiện adblock**: giả lập các phần tử "mồi" (bait) và ẩn tường chặn kiểu "hãy tắt trình chặn quảng cáo".
- **Chọn phần tử**: nhấn giữ vào một phần tử để xem thông tin, selector, phần tử cha, lớp bên dưới; sao chép hoặc ẩn ngay.
- **Bộ lọc tùy chỉnh** theo 3 loại:
  - **Phần tử**: tên (`smartbanner`, `*adsbygoogle*`) hoặc CSS selector (`.banner, #popup`).
  - **Từ khoá**: ẩn phần tử chứa văn bản (`Quảng cáo`, `Tải ứng dụng`).
  - **Liên kết**: chặn URL/tên miền/scheme (`tinyurl`, `bet`, `win`, `appname://`).
- **Phạm vi bộ lọc**: áp dụng cho **Mọi trang**, **Trang này**, hoặc riêng từng **khung nhúng** (iframe).
- **Lưu cấu hình**: bộ lọc được ghi nhớ khi truy cập lại.
- **Sao lưu & khôi phục**: xuất/nhập JSON, chọn **gộp** hoặc **thay thế**.
- **Màu chấm ngẫu nhiên**: mỗi lần tải một màu khác, có thể tắt để dùng màu xanh mặc định.

## Cài đặt

Dot Ads là userscript, chạy trên Safari thông qua ứng dụng **WBlock**.

1. Tải ứng dụng **WBlock** trên App Store và hoàn tất phần setup.
2. Vào **Userscript → Userscript → File → Choose File**, chọn file `dot-ads_user.js` vừa tải rồi nhấn **Add**.
3. Chuyển sang tab **Filters**, nhấn biểu tượng **Reload** để áp dụng.

Mở Safari và truy cập một trang web bất kỳ để kiểm tra. Nếu thấy **dấu chấm xanh** xuất hiện thì Dot Ads đã hoạt động.

Script yêu cầu quyền `GM_getValue`, `GM_setValue`, `GM_listValues`, `GM_deleteValue` (và bản `GM.*`) để lưu bộ lọc, chạy ở `document-start` trên `*://*/*`.

## Cách dùng

| Thao tác | Kết quả |
|---|---|
| Chạm chấm | Bật / tắt Dot Ads |
| Nhấn giữ chấm (~0,3 giây) | Mở bảng điều khiển |
| Nhấn giữ một phần tử trên trang (~0,25 giây) | Xem thông tin phần tử, chép selector, ẩn phần tử |
| Vuốt xuống / chạm nền / ✕ | Đóng bảng |

### Bảng điều khiển

Các công tắc trong bảng:

- **Chặn quảng cáo**: bật/tắt toàn bộ.
- **Tự động chặn**: ẩn ads, popup, banner, float.
- **Chặn popup & tab lạ**: chặn lớp phủ và tab tự mở.
- **Chặn chuyển hướng ngoài**: chặn tên miền lạ và mở app (hiển thị số lần đã chặn).
- **Ẩn cả khung chứa**: ẩn khung, viền, nút ✕.
- **Chặn tức thì**: nhớ khung/popup cho lần sau (nút chấm bên phải để xoá mục đã nhớ).
- **Nhấn giữ xem phần tử**: bật/tắt chức năng chọn phần tử.
- **Màu chấm ngẫu nhiên**.

### Thêm bộ lọc

1. Chọn tab **Phần tử**, **Từ khoá** hoặc **Liên kết**.
2. Chọn phạm vi: **Mọi trang** / **Trang này** / **Khung ...**.
3. Nhập một mục rồi bấm `+`, hoặc dán nhiều mục vào ô **Thêm nhiều** (cách nhau bằng `;` hoặc xuống dòng).
4. Bấm ✕ trên chip để xoá.

> Luật **Trang này** lưu theo *tên gốc* của site nên dùng chung cho mọi đuôi tên miền (`chophim.com`, `chophim.xyz`... dùng chung một bộ luật).

### Sao lưu & khôi phục

- **Xuất**: chép JSON vào clipboard. **Lưu tệp**: tải về `dot-ads-backup.json`.
- **Nhập / Chọn tệp**: nhập từ JSON dán vào hoặc từ tệp.
- Công tắc **Thay thế**: bật để ghi đè luật hiện có, tắt để gộp thêm.

## Cấu hình mặc định

Có thể chỉnh trong object `CONFIG` ở đầu file `dot-ads_user.js`:

| Khoá | Mô tả |
|---|---|
| `allow` | Tên miền không bao giờ bị chặn (mặc định: `microsoft.com`, `windows.com`, `windowsupdate.com`, `wikipedia.org`) |
| `names` | Tên `id`/`class` ẩn sẵn (`smartbanner`, `app-banner`, `cookie-popup`, `*adsbygoogle*`) |
| `texts` | Từ khoá văn bản ẩn sẵn (`Tải ứng dụng`, `Quảng cáo`) |
| `hosts` | Tên miền chặn thêm |
| `links` | Từ khoá link chặn sẵn (link rút gọn, cờ bạc: `bet`, `casino`, `xoso`...) |
| `appAllow` | Scheme app được phép mở (ví dụ `zalo`) |
| `frames` | Chạy trong iframe |
| `antiAdblock` | Qua mặt phát hiện adblock, bảo vệ player |
| `playerAds` | Bỏ qua quảng cáo trong video |
| `onboarding` | Hiện hướng dẫn cho người mới |

## Lưu trữ dữ liệu

Dữ liệu được lưu qua `GM.setValue` và sao lưu vào `localStorage` của trang. Nếu trình quản lý script không hỗ trợ `GM.setValue`, bảng điều khiển sẽ cảnh báo: luật có thể mất khi xoá dữ liệu Safari.

| Khoá | Nội dung |
|---|---|
| `settings` | Các công tắc |
| `global` | Luật áp dụng mọi trang |
| `site:<tên gốc>` | Luật theo từng site |
| `learn:<tên gốc>` | Khung/popup đã nhớ |

## Lưu ý

- Dot Ads chỉ ẩn/chặn ở phía trình duyệt, một số trang có thể cần thêm luật thủ công.
- Nếu một trang bị lỗi hiển thị, chạm chấm để tắt hoặc thêm tên miền vào `allow`.
- Mọi thứ chạy cục bộ, không gửi dữ liệu ra ngoài.

## Giấy phép

MIT
