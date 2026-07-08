# ZestFoot — Sneaker E-Commerce Platform (React 19 + Spring Boot 3 + MySQL)

**ZestFoot** (HKT-Shoes) là một nền tảng thương mại điện tử mua bán giày sneaker hiện đại, được xây dựng với kiến trúc phân tầng hiệu năng cao. Hệ thống tích hợp Trí tuệ nhân tạo (AI Chatbot) tư vấn sản phẩm thời gian thực, cơ chế tích điểm thành viên qua các mini-games, và cổng thanh toán trực tuyến.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

* **Thanh Toán Trực Tuyến PayOS:** Tích hợp cổng thanh toán mã QR ngân hàng thông qua PayOS SDK, đi kèm cơ chế tự động đồng bộ hóa trạng thái đơn hàng (Active Status Syncing) chống lỗi/trễ Webhook.
* **AI Chatbot Tư Vấn Thông Minh:** Chatbot tích hợp mô hình **Google Gemini 1.5 Flash** áp dụng kỹ thuật **RAG (Retrieval-Augmented Generation)** tại Client để tư vấn size, gợi ý sản phẩm trực tiếp từ kho hàng mà không bị ảo giác dữ liệu (hallucination).
* **Mini-games Tích Điểm Đổi Thưởng:** Hệ thống trò chơi phong phú: Rắn săn mồi (Snake), Xếp gạch (Tetris), Ghép giày (Shoe Match), Vòng quay may mắn (Lucky Wheel), và Điểm danh hàng ngày (Daily Check-in) giúp tích lũy xu thành viên để đổi Voucher giảm giá.
* **Quản Lý Ảnh Đám Mây Cloudflare R2:** Lưu trữ hình ảnh sản phẩm và tin tức trực tiếp trên Cloudflare R2 Object Storage (tương thích chuẩn S3), tối ưu dung lượng máy chủ và tăng tốc độ tải ảnh.
* **Tối Ưu Hiệu Năng Vượt Trội:** 
  - **Code Splitting (Lazy Loading):** Phân mảnh mã nguồn giúp dung lượng tải lần đầu giảm xuống dưới 870 kB.
  - **TanStack React Query:** Caching dữ liệu phía Client, hạn chế tối đa các request tải lại thừa.

---

## 💻 Công Nghệ Sử Dụng (Tech Stack)

* **Frontend:** React 19, Redux Toolkit (State Management), Vite, TanStack React Query, Lucide Icons.
* **Backend:** Spring Boot 3, Spring Data JPA, Spring Security (BCrypt Password Encoder), AWS S3 Java SDK v2 (R2 Integration), PayOS SDK.
* **Database:** MySQL 8.0 (Hỗ trợ lưu trữ và truy vấn trường dữ liệu JSON động).

---

## ⚙️ Hướng Dẫn Chạy Môi Trường Local

### 1. Cấu Hình Cơ Sở Dữ Liệu & Backend
Tạo cơ sở dữ liệu MySQL và cấu hình các khóa dịch vụ trong tệp [backend/src/main/resources/application.properties](file:///d:/ZestFoot-2/backend/src/main/resources/application.properties):

```properties
# MySQL Connection
spring.datasource.url=jdbc:mysql://localhost:3306/webbangiay?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=yourpassword

# PayOS Keys
payos.client-id=your-payos-client-id
payos.api-key=your-payos-api-key
payos.checksum-key=your-payos-checksum-key

# Cloudflare R2 Configuration (S3-Compatible)
r2.endpoint=https://<account-id>.r2.cloudflarestorage.com
r2.access-key-id=your-r2-access-key-id
r2.secret-access-key=your-r2-secret-access-key
r2.bucket=your-bucket-name
r2.public-base-url=https://pub-your-public-url.r2.dev
```

Khởi động server Backend Spring Boot:
```bash
cd backend
mvn spring-boot:run
```
Mặc định REST API lắng nghe tại: `http://localhost:8080`

### 2. Cấu Hư hình & Khởi Động Frontend
Tạo file `.env` tại thư mục `/frontend` chứa khóa API Gemini:
```env
VITE_GEMINI_API_KEY=CAMSURoyKhBlLVE3WEZydnQ5Qmt0NkxNMg5RN1hGcnZ0OUJrdDZMTToOYnBaUFk5bmkyT3NoX00gBCoXCgFzEhBlLVE3WEZydnQ5Qmt0NkxNGAEwARgHILeB2r4CSggQARgBIAEoAQ
```

Cài đặt package và chạy Frontend:
```bash
cd frontend
npm install
npm run dev
```
Trình duyệt tự động mở tại: `http://localhost:5173` (Vite dev server cấu hình tự động proxy `/api` sang cổng `8080`).

---

## 🛣️ Danh Sách RESTful API Endpoints Chuẩn Hóa

Hệ thống API đã được tái cấu trúc hoàn toàn theo tiêu chuẩn thiết kế RESTful hướng tài nguyên:

| Tài nguyên | Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- | :--- |
| **Tài khoản (Auth)** | `POST` | `/api/auth/register` | Đăng ký tài khoản mới *(Trả về 201)* |
| | `POST` | `/api/auth/login` | Đăng nhập hệ thống |
| | `POST` | `/api/auth/logout` | Đăng xuất khỏi hệ thống |
| **Sản Phẩm (Products)** | `GET` | `/api/products` | Lấy danh sách sản phẩm |
| | `POST` | `/api/products` | Thêm sản phẩm mới *(Trả về 201)* |
| | `PATCH` | `/api/products/{id}` | Cập nhật một phần thông tin sản phẩm |
| | `DELETE` | `/api/products/{id}` | Xóa sản phẩm |
| **Điểm Tích Lũy (Points)** | `GET` | `/api/users/{userId}/point-transactions` | Xem lịch sử giao dịch điểm của người dùng |
| | `POST` | `/api/users/{userId}/point-transactions` | Thêm giao dịch cộng/trừ điểm *(Trả về 201)* |
| **Mã Giảm Giá (Coupons)** | `POST` | `/api/coupons` | Tạo mới mã giảm giá công khai *(Trả về 201)* |
| | `POST` | `/api/coupons/validations` | Kiểm tra tính hợp lệ của mã giảm giá |
| | `POST` | `/api/coupons/{code}/usages` | Đánh dấu sử dụng mã giảm giá |
| **Voucher Cá Nhân** | `GET` | `/api/users/{userId}/vouchers` | Xem danh sách Voucher game của người dùng |
| | `POST` | `/api/vouchers` | Tạo mới voucher cho người dùng *(Trả về 201)* |
| **Đơn Hàng (Orders)** | `POST` | `/api/orders` | Tạo mới đơn đặt hàng *(Trả về 201)* |
| | `PATCH` | `/api/orders/{id}/status` | Cập nhật trạng thái đơn hàng (duyệt/hủy) |
| **Thanh Toán (Payment)** | `POST` | `/api/payments/payos/create` | Tạo liên kết thanh toán PayOS |
| | `GET` | `/api/payments/payos/status/{orderCode}` | Lấy trạng thái thanh toán từ PayOS & Sync DB |

---

## 🐳 Triển Khai Với Docker Compose

Để chạy toàn bộ ứng dụng trong môi trường container hóa (Production/Staging):
```bash
docker compose up -d --build
```
Hệ thống sẽ khởi tạo 3 container:
1. `mysql-db`: Cơ sở dữ liệu MySQL.
2. `zestfoot-backend`: Ứng dụng Spring Boot chạy trên port `8080`.
3. `zestfoot-frontend`: Web app React được đóng gói bản build tĩnh chạy trên port `80` (sử dụng proxy Nginx chuyển tiếp API sang backend).
