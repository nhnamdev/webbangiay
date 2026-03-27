# Người 1 — Catalog & Sales

Phụ trách toàn bộ trải nghiệm mua hàng: sản phẩm, giỏ hàng, đặt hàng, thanh toán + toàn bộ hạ tầng dự án.

## Frontend

### Routes (`frontend/app/(main)/`)
- `products/` — danh sách & chi tiết sản phẩm
- `collections/` — bộ sưu tập
- `search/` — tìm kiếm
- `cart/` — giỏ hàng
- `checkout/` — đặt hàng
- `payment-gateway/` — cổng thanh toán
- `orders/` — đơn hàng của khách

### Admin (`frontend/app/admin/(dashboard)/`)
- `products/`, `orders/`, `coupons/`, `vouchers/`, `points/`, `brands/`

### Components (`frontend/components/`)
- `ProductCard/`, `ProductCarousel.jsx`, `ProductCarousel.css`, `ProductDetail/`
- `Cart/`, `Checkout/`, `Payment/`, `Order/`
- `Collection/`, `Search/`, `CategoryBar/`, `Banner/`, `Home/`

### Hạ tầng (sở hữu chính, dùng chung cho cả team)
- `package.json`, `package-lock.json`, `vite.config.js`, `tsconfig.json`, `eslint.config.mjs`, `index.html`, `vercel.json`
- `components/MainLayout.jsx`, `components/providers/`, `components/routes/`
- `context/`, `hooks/`, `redux/`, `services/`, `utils/`, `data/`, `public/`, `src/`
- `app/page.tsx`, `app/globals.css`, `app/admin/admin.css`, `app/admin/supabaseClient.ts`
- `app/admin/(dashboard)/layout.tsx`, `app/admin/(dashboard)/page.tsx`

## Backend

### Java (`backend/src/main/java/com/zestfoot/backend/`)
- `controller/ProductController.java`, `controller/OrderController.java`
- `entity/Product.java`, `entity/Order.java`, `entity/OrderItem.java`
- `repository/ProductRepository.java`, `repository/OrderRepository.java`, `repository/OrderItemRepository.java`

### Hạ tầng
- `pom.xml`, `src/main/resources/application.properties`
- `ZestFootBackendApplication.java`

## Quy tắc commit
- Chỉ commit/push file thuộc các mục trên.
- Khi cần sửa file hạ tầng dùng chung (Providers, redux store, services/api…), thông báo cho Người 2 để tránh xung đột.
