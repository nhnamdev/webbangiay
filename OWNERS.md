# ZestFoot - Project Owners & Structure

Đây là tài liệu phân chia trách nhiệm giữa Người 1 và Người 2 trong dự án ZestFoot.

---

# Người 1 — Catalog & Sales

Phụ trách toàn bộ trải nghiệm mua hàng: sản phẩm, giỏ hàng, đặt hàng, thanh toán + toàn bộ hạ tầng dự án.

## Frontend (Người 1)

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

## Backend (Người 1)

### Java (`backend/src/main/java/com/zestfoot/backend/`)
- `controller/ProductController.java`, `controller/OrderController.java`
- `entity/Product.java`, `entity/Order.java`, `entity/OrderItem.java`
- `repository/ProductRepository.java`, `repository/OrderRepository.java`, `repository/OrderItemRepository.java`

### Hạ tầng
- `pom.xml`, `src/main/resources/application.properties`
- `ZestFootBackendApplication.java`

---

# Người 2 — User & Engagement

Phụ trách trải nghiệm người dùng cá nhân: xác thực, hồ sơ, yêu thích, điểm thưởng, blog, cửa hàng, chatbot, membership và các thành phần điều hướng.

## Frontend (Người 2)

### Auth (`frontend/app/(auth)/`)
- `login/`, `register/`, `forgot/`

### Routes (`frontend/app/(main)/`)
- `profile/` — hồ sơ
- `addresses/` — địa chỉ giao hàng
- `change-password/` — đổi mật khẩu
- `favorites/` — yêu thích
- `rewards/` — điểm thưởng
- `blogs/` — bài viết
- `stores/` — cửa hàng

### Admin (`frontend/app/admin/(dashboard)/`)
- `users/`, `news/`

### Components (`frontend/components/`)
- `LogIn_SignUp/`, `Profile/`
- `Favorites/`, `Rewards/`, `Membership/`
- `Blog/`, `SocialNews/`, `StoreLocator/`
- `ChatBot/`
- `Navbar/`, `Footer/`, `ScrollToTop/`

## Backend (Người 2)

### Java (`backend/src/main/java/com/zestfoot/backend/`)
- `controller/UserController.java`
- `entity/User.java`
- `repository/UserRepository.java`

---

## Quy tắc làm việc chung và Commit
- Chỉ commit/push file thuộc các mục phân chia của mình.
- Khi cần sửa file hạ tầng dùng chung (Providers, redux store, services/api…), hai bên cần trao đổi trước với nhau để tránh xung đột.
