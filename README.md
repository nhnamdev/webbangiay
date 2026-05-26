# ZestFoot — React + Spring Boot + MySQL

Vite/React SPA gọi REST API tới Spring Boot 3, dữ liệu lưu trên MySQL. Không còn phụ thuộc Supabase.

## Stack

- Frontend: React 19 + Vite (`frontend/`)
- Backend: Spring Boot 3 + Spring Data JPA + BCrypt (`backend/`)
- Database: MySQL 8 (đã sẵn trên VPS)

## Chạy local

### Backend

```bash
cd backend
mvn spring-boot:run
```

Mặc định lắng nghe ở `http://localhost:8080`. Cấu hình MySQL trong `backend/src/main/resources/application.properties` (hoặc override bằng env `SPRING_DATASOURCE_*`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server proxy `/api` sang `http://localhost:8080`. Hoặc set biến môi trường `VITE_API_URL` để trỏ thẳng tới BE.

## Biến môi trường

Xem `.env.example`. Tóm tắt:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:3306/zestfootdb?useSSL=false&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
SPRING_JPA_HIBERNATE_DDL_AUTO=update

VITE_API_URL=http://localhost:8080/api

# Optional cho AI chatbot
VITE_OPENAI_API_KEY=
VITE_GEMINI_API_KEY=
```

## Cấp quyền admin

Sau khi `POST /api/auth/register`, sửa role qua MySQL hoặc gọi admin API:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## REST endpoints chính

| Tài nguyên | Endpoint |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Products | `GET/POST/PUT/DELETE /api/products`, query `?isNew=&isSale=&isTrending=&brand=` |
| Brands | `GET/POST/PUT/DELETE /api/brands` |
| News | `GET/POST/PUT/DELETE /api/news` |
| Orders | `GET/POST/PUT/DELETE /api/orders`, `PUT /api/orders/{id}/status`, `GET /api/orders/by-email?email=` |
| Users | `GET /api/users?search=&page=&size=`, `GET/PUT/DELETE /api/users/{id}` |
| Coupons | `GET /api/coupons`, `POST /api/coupons/validate`, `POST /api/coupons/mark-used` |
| Vouchers | `GET /api/vouchers`, `GET /api/vouchers/user/{userId}`, `POST/PUT/DELETE /api/vouchers/{id}` |
| Points | `GET /api/points/user/{userId}/transactions`, `POST /api/points/user/{userId}` |

## Docker Compose

```bash
docker compose up -d --build
```

Frontend serve build tĩnh bằng `serve` (Node) trên port 80. Browser gọi REST trực tiếp tới backend qua `VITE_API_URL` đã baked-in lúc build (set qua env hoặc Coolify panel).
