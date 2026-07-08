# ÔN TẬP BÁO CÁO MÔN - DỰ ÁN ZESTFOOT (WEBBANGIAY)

## Tổng hợp câu hỏi & đáp án chi tiết

---

# PHẦN 1: SPRING CORE (IoC / DI)

## Câu 1: IoC là gì? Trong project ZestFoot, ai là người tạo các đối tượng? Làm thế nào để Spring biết cần tạo chúng?

**IoC (Inversion of Control - Đảo ngược quyền kiểm soát):**
- Thông thường: lập trình viên tự `new` object (`Student s = new Student()`)
- Với IoC: Spring IoC Container đảm nhận việc tạo object, lập trình viên chỉ khai báo, Spring tự quản lý vòng đời

**Trong ZestFoot:**
- Spring IoC Container tạo tất cả bean: `ProductRepository`, `PayOSService`, `R2StorageService`, `AuthController`, `BCryptPasswordEncoder`, `PayOS`...
- Spring biết cần tạo nhờ:
  - **Component Scanning**: `@Component`, `@Service`, `@Repository`, `@Controller` → Spring tự động quét package và đăng ký bean
  - **@Bean trong @Configuration**: Ví dụ `PasswordConfig.java` có `@Bean` method trả về `BCryptPasswordEncoder`

```java
// ZestFootBackendApplication.java
@SpringBootApplication  // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class ZestFootBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ZestFootBackendApplication.class, args);
    }
}
```

---

## Câu 2: @Autowired dùng để làm gì? Xem AuthController.java — hãy chỉ ra các dependency được inject. Nếu không có @Autowired thì làm thế nào?

**@Autowired:** yêu cầu Spring tự động inject dependency vào field/constructor/setter của class.

**Trong AuthController.java:**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;           // inject bean UserRepository

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;   // inject bean BCryptPasswordEncoder
    // ...
}
```

**Nếu không có @Autowired, có 2 cách thay thế:**

- **Cách 1: Constructor Injection (khuyến nghị)**
```java
private final UserRepository userRepository;
private final BCryptPasswordEncoder passwordEncoder;

public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
}
```

- **Cách 2: Tự new** (mất lợi ích của DI, khó test)
```java
this.userRepository = new UserRepository();  // Không nên
```

---

## Câu 3: @Component vs @Service vs @Repository vs @Controller khác gì nhau? Trong project, R2StorageService dùng annotation nào? Vì sao?

| Annotation | Mục đích | Trong ZestFoot |
|---|---|---|
| `@Component` | Generic bean cho bất kỳ class nào | (dùng làm base cho các annotation kia) |
| `@Service` | Business logic layer | `PayOSService.java`, `R2StorageService.java` |
| `@Repository` | Data access layer (tương tác DB) | `ProductRepository.java`, `UserRepository.java`... |
| `@Controller` | Web controller (trả View - JSP/Thymeleaf) | (không dùng trong project) |
| `@RestController` | REST API controller (trả JSON) | `AuthController`, `ProductController`, `OrderController`... |

**R2StorageService** dùng `@Service` vì nó chứa business logic (upload file lên Cloudflare R2, sinh key, xử lý file).

```java
@Service
public class R2StorageService {
    // Xử lý upload ảnh lên S3-compatible storage
    public String uploadProductImage(MultipartFile file) { ... }
    public String uploadNewsImage(MultipartFile file) { ... }
}
```

**Điểm khác biệt quan trọng:**
- `@Repository` có thêm cơ chế: Spring tự động chuyển SQL exception thành `DataAccessException`
- `@Service` có thêm cơ chế: Spring tự động gán transactional behavior (nếu cấu hình AOP)
- `@RestController` = `@Controller` + `@ResponseBody` (mọi method tự động trả JSON)

---

## Câu 4: Bean là gì? Hãy kể tên ít nhất 3 bean trong project ZestFoot.

**Bean:** Object do Spring IoC Container tạo, quản lý vòng đời, và inject cho các bean khác.

**5 bean trong ZestFoot:**
1. **PayOS** — từ `PayOSConfig.java` (dùng `@Bean` trong `@Configuration`)
2. **BCryptPasswordEncoder** — từ `PasswordConfig.java` (dùng `@Bean`)
3. **AuthController** — từ `@RestController`
4. **ProductRepository** — từ `@Repository`
5. **R2StorageService** — từ `@Service`

```java
// PasswordConfig.java — tạo bean
@Configuration
public class PasswordConfig {
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// AuthController.java — sử dụng bean
@RestController
public class AuthController {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;  // inject bean từ PasswordConfig
}
```

---

## Câu 5: @SpringBootApplication chứa những annotation nào khác?

`@SpringBootApplication` là **meta-annotation** (tổ hợp của 3 annotation):

```java
@SpringBootApplication
// = @Configuration (đánh dấu class chứa @Bean)
// + @EnableAutoConfiguration (tự động cấu hình dựa trên classpath)
// + @ComponentScan (quét package con tìm @Component, @Service, @Repository, @Controller)
public class ZestFootBackendApplication { ... }
```

**Cụ thể:**
- **@Configuration**: Cho phép khai báo `@Bean` methods (như `corsConfigurer()` trong file này)
- **@EnableAutoConfiguration**: Spring Boot tự động:
  - Có `spring-boot-starter-web` → tự tạo `DispatcherServlet`, `Jackson`, `Tomcat`
  - Có `spring-boot-starter-data-jpa` → tự tạo `DataSource`, `EntityManagerFactory`, `TransactionManager`
  - Đọc cấu hình từ `application.properties`
- **@ComponentScan**: Quét tất cả package con của `com.zestfoot.backend` để tìm bean

---

# PHẦN 2: SPRING MVC (PHẦN 1 - CƠ BẢN)

## Câu 6: Mô tả luồng xử lý request khi client gọi `GET /api/products` trong project ZestFoot.

```
Client (React Frontend)
    │
    ▼  HTTP GET /api/products
DispatcherServlet (Front Controller - do Spring Boot tự tạo)
    │
    ▼  Tìm kiếm HandlerMapping
    │   (dựa trên @RequestMapping("/api/products") + @GetMapping)
    │
ProductController.getAllProducts()
    │
    ▼  Gọi ProductRepository
    │   @Autowired private ProductRepository productRepository;
    │
ProductRepository (JPA Proxy)
    │
    ▼  Nếu có filter:
    │   - isNew=true    → findByIsNewTrue()
    │   - isSale=true   → findByIsSaleTrue()
    │   - isTrending=true → findByIsTrendingTrue()
    │   - brand=Adidas  → findByBrandIgnoreCase("Adidas")
    │   - không filter  → findAll()
    │
    ▼  Hibernate (ORM)
    │   → Tạo câu SQL (SELECT * FROM products WHERE ...)
    │
MySQL Database
    │
    ▼  Trả về ResultSet
Hibernate → Mapping thành List<Product>
    │
ProductController
    │
    ▼  @RestController → @ResponseBody (tự động)
    │   Jackson → serialize thành JSON array
    │
DispatcherServlet
    │
    ▼  HTTP Response 200 OK
    │   Content-Type: application/json
    │   Body: [{ "id": 1, "name": "Nike Air Force 1", ... }, ...]
    │
Client (React nhận JSON → render giao diện)
```

**Luồng chi tiết code:**
```java
// ProductController.java
@GetMapping
public List<Product> getAllProducts(
        @RequestParam(required = false) Boolean isNew,
        @RequestParam(required = false) Boolean isSale,
        @RequestParam(required = false) Boolean isTrending,
        @RequestParam(required = false) String brand) {
    if (Boolean.TRUE.equals(isNew))
        return productRepository.findByIsNewTrue();
    if (Boolean.TRUE.equals(isSale))
        return productRepository.findByIsSaleTrue();
    // ...
    return productRepository.findAll();   // SELECT * FROM products
}
```

---

## Câu 7: @Controller vs @RestController khác nhau thế nào? Project ZestFoot dùng loại nào? Giải thích.

| Tiêu chí | `@Controller` | `@RestController` |
|---|---|---|
| **Kết quả trả về** | View name (JSP/Thymeleaf) | JSON/XML trực tiếp |
| **Cần @ResponseBody?** | Cần nếu muốn trả JSON | **Không cần** (mặc định) |
| **Dùng cho** | Web app render HTML | REST API |
| **Chứa** | Chỉ là stereotype | `@Controller` + `@ResponseBody` |

**Project ZestFoot dùng @RestController cho tất cả controller** vì:
- Đây là REST API backend, **chỉ trả JSON**, không render View
- Frontend là React riêng biệt (chạy ở port khác)
- `@RestController` giúp code ngắn gọn, không cần ghi `@ResponseBody` trên mỗi method

```java
// Dùng @RestController (code ngắn gọn)
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @GetMapping
    public List<Product> getAllProducts() { ... }  // tự động trả JSON

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) { ... }
}

// Nếu dùng @Controller thì phải thêm @ResponseBody
@Controller
@RequestMapping("/api/products")
public class ProductController {
    @GetMapping
    @ResponseBody
    public List<Product> getAllProducts() { ... }  // phải thêm @ResponseBody
}
```

---

## Câu 8: Nếu muốn mapping cả GET và POST cho cùng một URL thì dùng annotation gì?

Có 2 cách:

**Cách 1: Dùng @RequestMapping với method array**
```java
@RequestMapping(value = "/api/products", method = {RequestMethod.GET, RequestMethod.POST})
```

**Cách 2: Dùng @GetMapping và @PostMapping riêng biệt (khuyến nghị)**
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping  // = @RequestMapping(method = GET)
    public List<Product> getAllProducts() { ... }

    @PostMapping  // = @RequestMapping(method = POST)
    public ResponseEntity<Product> create(@RequestBody Product product) { ... }
}
```

---

## Câu 9: Project frontend là React riêng biệt, vậy backend có cần View Resolver không? Giải thích.

**KHÔNG cần View Resolver.**

Lý do:
- View Resolver dùng khi backend render HTML (JSP, Thymeleaf, FreeMarker)
- ZestFoot backend là **REST API thuần túy** — chỉ trả JSON qua `@RestController`
- Frontend React xử lý hoàn toàn phần giao diện, gọi API backend bằng Axios

```properties
# application.properties — không cấu hình View Resolver
spring.jpa.hibernate.ddl-auto=none
# Không có spring.mvc.view.prefix/suffix
```

Nếu project dùng JSP, sẽ cấu hình:
```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

---

# PHẦN 3: REST API (SPRING MVC PHẦN 2)

## Câu 10: REST là gì? Thiết kế REST API cho "quản lý sản phẩm" theo chuẩn RESTful. So sánh với endpoint hiện tại trong ZestFoot.

**REST (Representational State Transfer):**
- Là chuẩn thiết kế Web API
- Dùng HTTP methods (GET, POST, PUT, PATCH, DELETE) tương ứng với CRUD
- URL đại diện cho resource (danh từ, số nhiều)
- Stateless: mỗi request độc lập

**Thiết kế RESTful chuẩn cho Product:**
| Method | URL | Chức năng |
|---|---|---|
| `GET` | `/api/products` | Danh sách tất cả sản phẩm |
| `GET` | `/api/products/{id}` | Chi tiết 1 sản phẩm |
| `POST` | `/api/products` | Tạo mới sản phẩm |
| `PUT` | `/api/products/{id}` | Cập nhật toàn bộ sản phẩm |
| `PATCH` | `/api/products/{id}` | Cập nhật một phần sản phẩm |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm |

**So sánh với ZestFoot (ProductController.java):**
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping                  // ✅ GET /api/products
    public List<Product> getAllProducts(...) { ... }

    @GetMapping("/{id}")         // ✅ GET /api/products/{id}
    public ResponseEntity<Product> getProductById(@PathVariable Long id) { ... }

    @PostMapping                 // ✅ POST /api/products
    public ResponseEntity<Product> create(@RequestBody Product product) { ... }

    @PatchMapping("/{id}")       // ✅ PATCH /api/products/{id}
    public ResponseEntity<Product> update(...) { ... }

    @DeleteMapping("/{id}")      // ✅ DELETE /api/products/{id}
    public ResponseEntity<Void> delete(@PathVariable Long id) { ... }
}
```
→ ZestFoot tuân thủ **RESTful chuẩn** (dùng PATCH thay PUT cho partial update).

---

## Câu 11: Trong OrderController.java, method nào dùng @RequestBody? Dữ liệu JSON gửi lên được ánh xạ sang Java object nào?

Method `createOrder` dùng `@RequestBody`:
```java
@PostMapping
public ResponseEntity<Order> createOrder(@RequestBody Order order) {
    if (order.getStatus() == null) order.setStatus("pending");
    if (order.getTotalAmount() == null) {
        double total = (order.getSubTotal() != null ? order.getSubTotal() : 0)
            + (order.getShippingFee() != null ? order.getShippingFee() : 0)
            - (order.getDiscount() != null ? order.getDiscount() : 0)
            - (order.getVoucherDiscount() != null ? order.getVoucherDiscount() : 0)
            - (order.getPointDiscount() != null ? order.getPointDiscount() : 0);
        order.setTotalAmount(Math.max(total, 0));
    }
    return ResponseEntity.status(HttpStatus.CREATED).body(orderRepository.save(order));
}
```

**Ánh xạ JSON → Java Object:**
```json
// Client gửi JSON:
{
  "customer": "{\"email\":\"test@test.com\",\"name\":\"Nguyen Van A\"}",
  "items": "[{\"productId\":1,\"quantity\":2}]",
  "sub_total": 1000000,
  "shipping_fee": 30000,
  "payment_method": "cod"
}
```
→ Jackson deserialize → `Order` object với các field tương ứng.

**Lưu ý:** Do có `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)`, JSON field `sub_total` ánh xạ vào Java field `subTotal`.

---

## Câu 12: Khi nào cần @ResponseBody? Nếu method trong ProductController trả về Product, Spring làm gì để chuyển thành JSON?

**Khi cần @ResponseBody:**
- Khi dùng `@Controller` (không phải `@RestController`) và muốn trả dữ liệu (JSON/XML) thay vì View name
- Với `@RestController` → **không cần**, vì mặc định tất cả return value đều được serialize

**Cơ chế chuyển Product → JSON (Spring sử dụng HttpMessageConverter):**
1. Spring kiểm tra có `@ResponseBody` (hoặc `@RestController`)
2. Kiểm tra `Accept` header của request (application/json)
3. Chọn `MappingJackson2HttpMessageConverter` (vì có Jackson trong classpath)
4. Jackson serialize object → JSON string
5. Ghi vào HTTP response body

```java
// ProductController.java
@GetMapping("/{id}")
public ResponseEntity<Product> getProductById(@PathVariable Long id) {
    return productRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
// Jackson tạo JSON:
// { "id": 1, "name": "Nike Air Force 1", "brand": "Nike", "price": 3500000, ... }
```

---

## Câu 13: Project ZestFoot có xử lý exception tập trung không? Nếu chưa, hãy đề xuất cách viết.

**Hiện tại: CHƯA CÓ.** Project không có `@ControllerAdvice` hoặc `@ExceptionHandler` tập trung.

Nếu có exception (VD: `RuntimeException` trong `PayOSService.createPaymentLink()` báo "totalAmount is null"), Spring Boot trả về:
```json
{
  "timestamp": "2026-07-08T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "totalAmount is null or invalid for order 1"
}
```

**Đề xuất thêm Global Exception Handler:**
```java
// GlobalExceptionHandler.java
package com.zestfoot.backend.exception;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý khi không tìm thấy resource
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("status", 404, "message", ex.getMessage()));
    }

    // Xử lý validation error
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream().map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", 400, "errors", errors));
    }

    // Xử lý tất cả exception khác
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", 500, "message", "Lỗi máy chủ: " + ex.getMessage()));
    }
}
```

```java
// ResourceNotFoundException.java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

---

# PHẦN 4: SPRING MVC (PHẦN 3 - DATA BINDING & VALIDATION)

## Câu 14: Data Binding — Khi client gửi `GET /api/products?isNew=true&brand=Adidas`, Spring tự động làm gì?

Spring tự động bind query parameters vào method parameters thông qua **@RequestParam** và **ConversionService**.

**Code trong ProductController.java:**
```java
@GetMapping
public List<Product> getAllProducts(
        @RequestParam(required = false) Boolean isNew,    // ← "true" → Boolean.TRUE
        @RequestParam(required = false) String brand      // ← "Adidas"
) {
    if (Boolean.TRUE.equals(isNew)) {
        return productRepository.findByIsNewTrue();        // → WHERE is_new = TRUE
    }
    if (brand != null && !brand.isBlank()) {
        return productRepository.findByBrandIgnoreCase(brand);  // → WHERE LOWER(brand) = 'adidas'
    }
    return productRepository.findAll();
}
```

**Cơ chế Data Binding (ConversionService):**
1. Spring nhận request: `GET /api/products?isNew=true&brand=Adidas`
2. `DispatcherServlet` tìm `ProductController.getAllProducts()`
3. Spring đọc query parameter `isNew="true"`
4. **ConversionService** tìm converter từ `String → Boolean`
5. `"true"` → `Boolean.TRUE`
6. `"Adidas"` → giữ nguyên `String "Adidas"`
7. Gán vào method parameters và gọi method

**Các chuyển đổi tự động:**
- `String "123"` → `int 123`, `long 123`, `double 123.0`
- `String "2026-07-08"` → `LocalDate` (cần `@DateTimeFormat`)
- `String "true"` → `boolean true`

---

## Câu 15: Entity User.java có validation annotations không? Nếu chưa, hãy nêu cách thêm.

**Hiện tại: CHƯA CÓ.** Entity `User.java` không có validation annotations (`@NotBlank`, `@Email`, `@Size`...).

**Cách thêm validation:**
```java
@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Column(name = "password_hash")
    @JsonIgnore
    private String passwordHash;

    @NotBlank(message = "Tên không được để trống")
    @Size(min = 2, max = 100, message = "Tên phải từ 2-100 ký tự")
    @Column(name = "full_name")
    private String fullName;

    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;
    // ...
}
```

**Cập nhật controller để dùng @Valid + BindingResult:**
```java
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody User user, BindingResult result) {
    if (result.hasErrors()) {
        String msg = result.getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }
    // Không lỗi → xử lý tiếp
}
```

---

## Câu 16: BindingResult dùng trong tình huống nào? Cho ví dụ với form đăng ký user.

**BindingResult:** Dùng sau `@Valid` để kiểm tra và xử lý lỗi validation **ngay trong method controller**, thay vì để Spring throw exception.

**Tình huống:** Khi user đăng ký tài khoản, cần validate dữ liệu nhập trước khi lưu vào DB.

**Ví dụ với AuthController.java (sau khi thêm validation):**
```java
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody User user, BindingResult result) {
    // 1. Kiểm tra validation error
    if (result.hasErrors()) {
        Map<String, String> errors = new HashMap<>();
        result.getFieldErrors().forEach(err ->
            errors.put(err.getField(), err.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu không hợp lệ", "errors", errors));
    }

    // 2. Kiểm tra email đã tồn tại
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        return ResponseEntity.status(409).body(Map.of("message", "Email đã được sử dụng"));
    }

    // 3. Không lỗi → tạo user
    User u = new User();
    u.setEmail(user.getEmail());
    u.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
    u.setFullName(user.getFullName());
    // ...
    return ResponseEntity.ok(Map.of("user", UserResponse.from(userRepository.save(u))));
}
```

**Khi có lỗi validation:**
```json
{
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "email": "Email không đúng định dạng",
    "phone": "Số điện thoại không hợp lệ"
  }
}
```

---

## Câu 17: Trong entity Coupon.java có trường startDate, endDate kiểu gì? Nếu client gửi "2026-07-08", Spring có tự parse được không?

**Trong Coupon.java:**
```java
@Column(name = "start_date")
private LocalDateTime startDate;

@Column(name = "end_date")
private LocalDateTime endDate;
```
→ Kiểu `LocalDateTime` (bao gồm cả ngày và giờ).

**Nếu client gửi "2026-07-08":** → **Spring KHÔNG parse được**, vì `LocalDateTime` cần format `yyyy-MM-ddTHH:mm:ss`.

**Giải pháp 1:** Đổi sang `LocalDate`
```java
@Column(name = "start_date")
private LocalDate startDate;
```

**Giải pháp 2:** Dùng `@DateTimeFormat`
```java
@DateTimeFormat(pattern = "yyyy-MM-dd")
@Column(name = "start_date")
private LocalDateTime startDate;
```

**Giải pháp 3:** Client gửi đúng ISO format: `"2026-07-08T00:00:00"`

---

# PHẦN 5: JPA (ENTITY & ORM)

## Câu 18: Entity nào trong project mapping với bảng products? Chỉ ra các annotation: @Table, @Id, @GeneratedValue, @Column.

**Entity Product.java mapping với bảng `products`:**

```java
@Entity                            // Đánh dấu đây là JPA Entity
@Table(name = "products")          // Map với bảng "products" trong MySQL
public class Product {

    @Id                            // Khóa chính
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // AUTO_INCREMENT
    private Long id;

    private String name;           // @Column mặc định: tên field = tên column

    private String brand;
    private String category;

    @Column(name = "subCategory")  // Tên column khác tên field (camelCase → camelCase)
    private String subCategory;

    @Column(columnDefinition = "TEXT")  // Kiểu TEXT trong MySQL (không phải VARCHAR)
    private String image;

    private String gender;
    private String slug;

    private Double price;

    @Column(name = "salePrice")
    private Double salePrice;

    @Column(name = "isSale")       // Tên column có "is" prefix
    private Boolean isSale;

    @Column(name = "isTrending")
    private Boolean isTrending;

    @Column(name = "isNew")
    private Boolean isNew;

    @Column(name = "isAsicsExclusive")
    private Boolean isAsicsExclusive;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(columnDefinition = "TEXT")
    private String sizes;

    @Column(columnDefinition = "TEXT")
    private String colors;

    @Column(columnDefinition = "TEXT")
    private String badges;
}
```

---

## Câu 19: Project dùng @GeneratedValue strategy nào? Giải thích các loại strategy.

**Project dùng: `GenerationType.IDENTITY`**
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
→ MySQL tự động tăng giá trị ID qua AUTO_INCREMENT.

**Các strategy khác:**

| Strategy | Cơ chế | Phù hợp |
|---|---|---|
| `IDENTITY` | DB tự tăng (AUTO_INCREMENT) | MySQL, SQL Server |
| `SEQUENCE` | Dùng sequence DB | PostgreSQL, Oracle, H2 |
| `TABLE` | Dùng bảng riêng lưu next ID | Portable (kém hiệu suất) |
| `AUTO` | Hibernate tự chọn | Mặc định, tùy DB |

**Lưu ý:** IDENTITY không cho phép batch insert (Hibernate phải insert từng dòng để lấy ID sau mỗi INSERT).

---

## Câu 20: Quan hệ giữa Product và Brand trong DB là gì? Trong entity Product.java có mapping quan hệ này không? Giải thích.

**Trong DB:** `products` có cột `brand` là **VARCHAR** (lưu tên thương hiệu dạng text). Không có foreign key đến `brands` table.

**Trong entity:** **KHÔNG có mapping JPA** (`@ManyToOne`, `@OneToMany`...).

```java
// Product.java — chỉ lưu brand dạng String
private String brand;   // ← không phải foreign key
```

**Lý do không dùng @ManyToOne:**
1. Project dùng JSON columns cho dữ liệu linh hoạt
2. Brand được lưu dạng text cho đơn giản
3. Query dùng `findByBrandIgnoreCase(String brand)` — không cần JOIN
4. Có bảng `brands` riêng biệt nhưng không có quan hệ với `products`

**Nếu muốn mapping chuẩn JPA:**
```java
// Product.java
@ManyToOne
@JoinColumn(name = "brand_id")  // Thêm brand_id trong bảng products
private Brand brand;

// Brand.java
@OneToMany(mappedBy = "brand")
private List<Product> products;
```

---

## Câu 21: JpaRepository có sẵn những method CRUD nào? Kể 5 method.

`ProductRepository extends JpaRepository<Product, Long>` → thừa kế tất cả method từ `JpaRepository`:

**5 method CRUD có sẵn:**

| Method | Mục đích | SQL sinh ra |
|---|---|---|
| `findAll()` | Lấy tất cả bản ghi | `SELECT * FROM products` |
| `findById(Long id)` | Tìm theo ID | `SELECT * FROM products WHERE id = ?` |
| `save(Product)` | INSERT hoặc UPDATE | `INSERT INTO products ...` hoặc `UPDATE products SET ...` |
| `deleteById(Long id)` | Xóa theo ID | `DELETE FROM products WHERE id = ?` |
| `existsById(Long id)` | Kiểm tra tồn tại | `SELECT COUNT(1) FROM products WHERE id = ?` |

**Các method khác:** `count()`, `deleteAll()`, `findAllById(Iterable)`, `saveAll(Iterable)`, `flush()`, `delete(Entity)`, `deleteAllById(Iterable)`, `getReferenceById()`...

---

## Câu 22: Derived Query Methods — Spring JPA tự động tạo câu SQL như thế nào từ tên method?

**Cơ chế:** Spring Data JPA phân tích tên method → tạo câu SQL tương ứng.

**Ví dụ 1: `findByIsNewTrue()`**
```java
List<Product> findByIsNewTrue();
```
Phân tích: `findBy` + `IsNew` + `True`
- `findBy` → `SELECT * FROM products WHERE`
- `IsNew` → `is_new` (chuyển camelCase → snake_case)
- `True` → `= TRUE`
→ **SQL:** `SELECT * FROM products WHERE is_new = TRUE`

**Ví dụ 2: `findByBrandIgnoreCase(String brand)`**
```java
List<Product> findByBrandIgnoreCase(String brand);
```
Phân tích: `findBy` + `Brand` + `IgnoreCase`
- `Brand` → column `brand`
- `IgnoreCase` → `LOWER(brand) = LOWER(?)`
→ **SQL:** `SELECT * FROM products WHERE LOWER(brand) = LOWER(?)`

**Các keyword phổ biến:**
| Keyword | SQL |
|---|---|
| `And` | `AND` |
| `Or` | `OR` |
| `Between` | `BETWEEN ? AND ?` |
| `LessThan` | `< ?` |
| `GreaterThan` | `> ?` |
| `Like` | `LIKE ?` |
| `OrderBy` | `ORDER BY ?` |

---

## Câu 23: Trong OrderRepository.java có native query. Giải thích. Khi nào dùng native query thay vì derived query?

**Code trong OrderRepository.java:**
```java
@Query(value = "SELECT * FROM orders WHERE JSON_UNQUOTE(JSON_EXTRACT(customer, '$.email')) = :email OR customer LIKE CONCAT('%', :email, '%') ORDER BY created_at DESC",
       nativeQuery = true)
List<Order> findByCustomerEmail(@Param("email") String email);
```

**Giải thích:**
- `nativeQuery = true` → Spring JPA chạy câu SQL **gốc** của MySQL, không qua JPQL
- `JSON_EXTRACT(customer, '$.email')` → MySQL function lấy giá trị key `email` từ JSON string
- `JSON_UNQUOTE(...)` → bỏ dấu ngoặc kép xung quanh kết quả
- `:email` → bind parameter (thay thế bằng giá trị tham số `@Param("email")`)

**Khi nào dùng native query thay vì derived query:**
1. **Cần function đặc thù của DB**: MySQL JSON_EXTRACT, MySQL FULLTEXT search, PostgreSQL JSONB operators
2. **Cần subquery phức tạp**: Derived query không hỗ trợ
3. **Tối ưu hiệu suất**: Native query cho phép tối ưu SQL thủ công
4. **Dùng stored procedure**: Gọi `CALL sp_get_data()`

**Khi nào dùng derived query:**
1. CRUD đơn giản: `findByEmail()`, `findByBrandIgnoreCase()`
2. Portability: JPQL/derived query không phụ thuộc DB cụ thể

---

# PHẦN 6: AJAX & FETCH API (FRONTEND)

## Câu 24: So sánh Axios với Fetch API. Lợi ích của Axios so với Fetch là gì?

| Tiêu chí | Axios | Fetch API |
|---|---|---|
| **JSON tự động** | Tự parse | Cần `res.json()` |
| **Error handling** | 4xx/5xx vào catch | Chỉ reject network error |
| **Interceptor** | Có sẵn | Phải tự viết wrapper |
| **Upload progress** | `onUploadProgress` | Không |
| **Browser support** | IE11+ (với polyfill) | ES6+ |
| **Request cancellation** | `CancelToken` | `AbortController` |
| **Code gọn** | Ngắn hơn | Dài hơn |

**So sánh code trong project:**
```js
// Axios (project ZestFoot dùng)
export const get = async (url, config) => (await http.get(url, config)).data;
const products = await get('/products');  // ← tự động parse JSON

// Fetch API tương đương
async function getFetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
const products = await getFetch(url);  // ← phải tự gọi res.json()
```

**Lợi ích Axios:**
1. **Interceptor**: tự động gắn token, xử lý lỗi tập trung (ZestFoot dùng trong `http.js`)
2. **JSON tự động**: không cần `.then(res => res.json())`
3. **FormData tự động**: dùng chung với JSON
4. **Response interceptor**: chuẩn hóa lỗi trước khi đến component

---

## Câu 25: async/await — tìm ví dụ trong api.js. Giải thích cách hoạt động. Nếu không có await thì chuyện gì xảy ra?

**Ví dụ trong api.js:**
```js
export const getAllProducts = async () =>
    withFallback(() => get('/products').then(normalizeProducts), [], 'Error fetching all products:');
```

**Cách hoạt động:**
1. `async` đánh dấu hàm trả về **Promise**
2. `await` (trong `get()`) tạm dừng execution cho đến khi Promise resolve
3. Không block main thread — các tác vụ khác vẫn chạy

**Nếu không có `await`:**
```js
// ❌ Sai — không await
const products = getAllProducts();
console.log(products);  // Promise {<pending>} — chưa có dữ liệu!
console.log(products.length);  // undefined

// ✅ Đúng — có await
const products = await getAllProducts();
console.log(products);  // [{ id: 1, name: "Nike" }, ...]
console.log(products.length);  // 10
```

**Giải thích chi tiết:**
- Không await → nhận **Promise** (lời hứa sẽ có dữ liệu), không phải dữ liệu thực
- JavaScript không đợi Promise resolve → chạy tiếp code sau
- Khi dùng trong React Query, framework tự gọi `.then()` hoặc dùng `await` bên trong

---

## Câu 26: Khi gọi getAllProducts(), kết quả trả về là gì? Làm thế nào để xử lý kết quả?

`getAllProducts()` trả về **Promise (Array)** — cụ thể là `Promise<Product[]>`.

**Cách xử lý:**

**Cách 1: async/await**
```js
const products = await getAllProducts();
// products là array: [{ id: 1, name: "...", ... }, ...]
```

**Cách 2: .then()**
```js
getAllProducts().then(products => {
    // products là array
    console.log(products.length);
});
```

**Cách 3: React Query (project dùng)**
```jsx
// Trong component React
import { useQuery } from '@tanstack/react-query';

function ProductList() {
    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: getAllProducts,
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <p>Lỗi: {error.message}</p>;
    return products.map(p => <ProductCard key={p.id} product={p} />);
}
```

---

## Câu 27: Interceptor trong http.js làm gì? Tại sao cần tự động đính kèm Bearer token?

**Request Interceptor — tự động gắn token:**
```js
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Nếu là FormData → xóa Content-Type để browser tự set boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});
```

**Response Interceptor — chuẩn hóa lỗi:**
```js
http.interceptors.response.use(
    (res) => res,
    (err) => {
        const message = err?.response?.data?.message || err?.message || 'Lỗi kết nối máy chủ';
        return Promise.reject({
            status: err?.response?.status,
            message,
            data: err?.response?.data,
            raw: err
        });
    }
);
```

**Tại sao cần Bearer token?**
- Backend ZestFoot dùng authentication dạng token (không dùng JWT chuẩn)
- Token format: `zf-{userId}-{UUID}`
- Backend cần token để biết user nào đang gửi request
- Nếu không có token, backend không thể trả về dữ liệu cá nhân (lịch sử đơn hàng, voucher...)

---

## Câu 28: Khi API trả về lỗi 500, Axios interceptor xử lý thế nào? Viết try-catch cho một API call.

**Xử lý trong interceptor:**
```js
// Response interceptor bắt lỗi
http.interceptors.response.use(
    (res) => res,           // Thành công → trả về response
    (err) => {              // Thất bại (4xx, 5xx, network error)
        const message = err?.response?.data?.message || err?.message || 'Lỗi kết nối máy chủ';
        return Promise.reject({
            status: err?.response?.status,   // 500
            message,                          // message từ server hoặc mặc định
            data: err?.response?.data         // response body gốc
        });
    }
);
```

**Viết try-catch khi gọi API:**
```js
import { get, post } from '../services/http';

async function fetchProduct(id) {
    try {
        const product = await get(`/products/${id}`);
        return { success: true, data: product };
    } catch (error) {
        console.error('Lỗi:', error.message);    // message đã được chuẩn hóa
        console.error('Status:', error.status);  // 500
        return {
            success: false,
            message: error.message || 'Không thể tải sản phẩm'
        };
    }
}
```

**Khi API lỗi 500, component nhận được:**
```js
const result = await fetchProduct(999);
// result = { success: false, message: 'Lỗi máy chủ nội bộ' }
```

---

# PHẦN 7: CÂU HỎI TỔNG HỢP (LIÊN QUAN TRỰC TIẾP PROJECT)

## Câu 29: Authentication flow — mô tả toàn bộ quy trình đăng nhập

**Bước 1: User nhập email/password trên giao diện Login.jsx**
```jsx
// Login.jsx (React)
const handleLogin = async (email, password) => {
    const result = await loginUser(email, password);
    if (result.success) {
        login(result.user);      // set user vào AuthContext
        navigate('/');           // chuyển về trang chủ
    } else {
        alert(result.message);   // "Email hoặc mật khẩu không đúng"
    }
};
```

**Bước 2: api.js gửi POST đến server**
```js
// services/api.js
export const loginUser = async (email, password) => {
    const data = await post('/auth/login', {
        email: email.trim(),
        password: password.trim()
    });
    persistAuth(data);  // lưu token + user vào localStorage
    return { success: true, user: data.user, session: data.session };
};
```

**Bước 3: AuthController.xử lý**
```java
// AuthController.java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    String email = body.getOrDefault("email", "").trim();
    String password = body.getOrDefault("password", "").trim();
    Optional<User> opt = userRepository.findByEmail(email);

    if (opt.isEmpty()) {
        return ResponseEntity.status(401).body(Map.of("message", "Email hoặc mật khẩu không đúng"));
    }
    User u = opt.get();
    if (!passwordEncoder.matches(password, u.getPasswordHash())) {
        return ResponseEntity.status(401).body(Map.of("message", "Email hoặc mật khẩu không đúng"));
    }

    Map<String, Object> resp = new HashMap<>();
    resp.put("user", UserResponse.from(u));       // user data (không có passwordHash)
    resp.put("session", session(u));              // token
    return ResponseEntity.ok(resp);
}

private Map<String, Object> session(User u) {
    Map<String, Object> s = new HashMap<>();
    s.put("access_token", "zf-" + u.getId() + "-" + UUID.randomUUID());
    s.put("token_type", "bearer");
    s.put("expires_in", 60 * 60 * 8);  // 8 giờ
    s.put("user", UserResponse.from(u));
    return s;
}
```

**Bước 4: Lưu token vào localStorage**
```js
const persistAuth = (data) => {
    if (data?.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
    }
    if (data?.user) {
        setStoredUser(data.user);  // localStorage.setItem('currentUser', JSON.stringify(user))
    }
};
```

**Bước 5: Các request sau — Axios interceptor tự động gắn token**
```js
// http.js — request interceptor
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**Bước 6: Logout**
```js
export const logoutUser = async () => {
    await post('/auth/logout', {});     // gọi API logout
    localStorage.removeItem('token');   // xóa token
    clearStoredUser();                  // xóa user khỏi localStorage
    clearAdminSessionCookie();          // xóa admin cookie
};
```

---

## Câu 30: Payment flow (PayOS) — mô tả từng bước

```
Bước 0: User click Thanh Toán
    │
    ▼
Bước 1: Checkout.jsx → paymentService.processPayment()
    │   Tạo order object (customer, items, sub_total, etc.)
    │
    ▼
Bước 2: paymentService.js → POST /api/orders
    │   Gửi JSON order lên backend
    │   Body: { customer: JSON, items: JSON, sub_total, shipping_fee, payment_method: "payos" }
    │
    ▼
Bước 3: OrderController.createOrder()
    │   - Nhận Order (JSON → @RequestBody)
    │   - Tính totalAmount tự động
    │   - Set status = "pending"
    │   - orderRepository.save(order)
    │   - Trả về order đã tạo (có ID)
    │
    ▼
Bước 4: Frontend gọi createPayOSPayment(orderId)
    │   POST /api/payments/payos/create
    │
    ▼
Bước 5: PayOSService.createPaymentLink(Order)
    │   - Tạo CreatePaymentLinkRequest
    │   - Gọi PayOS SDK: payOS.paymentRequests().create(request)
    │   - PayOS trả về link thanh toán + QR code
    │
    ▼
Bước 6: Client redirect đến PayOS checkout page
    │   User scan QR → chuyển khoản
    │
    ▼
Bước 7a: PayOS gửi Webhook (bất đồng bộ)
    │   POST /api/payments/payos/webhook
    │   PaymentController:
    │   - payOS.webhooks().verify(body) → xác thực webhook
    │   - Cập nhật status order
    │
Bước 7b: Client poll GET /api/payments/payos/status/{orderCode}
    │   - payOS.paymentRequests().get(orderCode)
    │   - Cập nhật trạng thái DB
    │
    ▼
Bước 8: Client redirect về /payment-return hoặc /payment-cancel
    │   Success → hiển thị "Đặt hàng thành công"
    │   Failed  → hiển thị "Đặt hàng thất bại"
```

---

## Câu 31: Search feature — tìm ở Frontend hay Backend? Mô tả.

**Ở Frontend!** (Client-side search)

**File: `services/api.js` — `searchProducts()`**

```js
let cachedAllProductsForSearch = null;

export const searchProducts = async (query) => {
    if (!cachedAllProductsForSearch) {
        cachedAllProductsForSearch = await getAllProducts();  // cache toàn bộ sản phẩm
    }

    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 0);

    const scoredProducts = cachedAllProductsForSearch.map(product => {
        let score = 0;
        const searchString = `${product.name} ${product.brand} ${product.category} ${product.subCategory || ''}`.toLowerCase();

        // Brand match → +10
        if (product.brand && query.toLowerCase().includes(product.brand.toLowerCase())) score += 10;
        // Từ khóa match → +2/từ
        keywords.forEach(kw => { if (searchString.includes(kw)) score += 2; });
        // Gender match → +5
        if (query.includes('nam') && product.gender === 'men') score += 5;
        if (query.includes('nữ') && product.gender === 'women') score += 5;
        // Trending match → +5
        if ((query.includes('hot') || query.includes('trend')) && product.isTrending) score += 5;
        // Sale match → +5
        if ((query.includes('sale') || query.includes('giảm')) && product.isSale) score += 5;

        return { ...product, score };
    });

    return scoredProducts
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);  // sắp xếp theo điểm giảm dần
};
```

**Giải thích:**
- **Lần đầu:** fetch toàn bộ sản phẩm từ `GET /api/products` và cache vào biến global
- **Các lần sau:** không gọi API lại, dùng cache
- **Scoring local:** từng sản phẩm được tính điểm dựa trên độ khớp với từ khóa
- **Lợi ích:** không cần API search riêng, response nhanh sau lần đầu

**Hạn chế:** Nếu có >1000 sản phẩm, cache lớn và chậm. Lúc đó cần search backend (Elasticsearch, `LIKE %keyword%` trong SQL, hoặc Full-Text Search MySQL).

---

## Câu 32: ERD — Vẽ sơ đồ quan hệ giữa các entity

```
┌─────────────────────────────────────────────────────────────────┐
│                      ZESTFOOT ERD                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐       ┌───────────────────┐                       │
│  │   User   │       │      Order        │                       │
│  ├──────────┤       ├───────────────────┤                       │
│  │ id (PK)  │──┐    │ id (PK)           │                       │
│  │ email    │  │    │ customer (JSON)──┼──(lưu email)           │
│  │ password │  │    │ items (JSON)      │                       │
│  │ fullName │  │    │ sub_total         │                       │
│  │ role     │  │    │ total_amount      │                       │
│  │ points   │  │    │ status            │                       │
│  │ phone    │  │    │ payment_method    │                       │
│  └──────────┘  │    │ payment_info (JSON)│                      │
│                │    └───────────────────┘                       │
│                │                                                 │
│  ┌──────────────────┐                                           │
│  │ UserVoucher      │                                           │
│  ├──────────────────┤                                           │
│  │ id (PK)          │                                           │
│  │ userId (FK)──┘   │──→ User.id                                │
│  │ code             │                                           │
│  │ discountAmount   │                                           │
│  │ status           │                                           │
│  └──────────────────┘                                           │
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │ PointTransaction     │                                       │
│  ├──────────────────────┤                                       │
│  │ id (PK)              │                                       │
│  │ userId (FK)──┘       │──→ User.id                            │
│  │ type (earn/spend)    │                                       │
│  │ amount               │                                       │
│  │ reason               │                                       │
│  └──────────────────────┘                                       │
│                                                                  │
│  ┌──────────┐       ┌──────────────┐                            │
│  │ Product  │       │    Brand     │                            │
│  ├──────────┤       ├──────────────┤                            │
│  │ id (PK)  │       │ id (PK)      │                            │
│  │ name     │       │ name         │                            │
│  │ brand ───┼───(lưu text, không FK)                            │
│  │ category │       │ slug         │                            │
│  │ price    │       │ logo         │                            │
│  │ isSale   │       │ description  │                            │
│  │ images   │(JSON) └──────────────┘                            │
│  │ sizes    │(JSON)                                              │
│  │ colors   │(JSON)  ┌──────────────┐                            │
│  └──────────┘       │    Coupon    │                            │
│                      ├──────────────┤                            │
│  ┌──────────┐       │ id (PK)      │                            │
│  │   News   │       │ code (unique)│                            │
│  ├──────────┤       │ discountType │                            │
│  │ id (PK)  │       │ discountValue│                            │
│  │ title    │       │ startDate    │                            │
│  │ slug     │       │ endDate      │                            │
│  │ content  │       │ isActive     │                            │
│  │ author   │       └──────────────┘                            │
│  └──────────┘                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Lưu ý quan trọng:** Project này **KHÔNG dùng foreign keys chuẩn trong JPA**:
- `Order.customer` là JSON string (lưu thông tin khách hàng dạng text), không có `@ManyToOne` đến User
- `Product.brand` là String, không có `@ManyToOne` đến Brand
- Quan hệ được xử lý thủ công trong code

---

## Câu 33: Code mini REST API — Product Reviews

### 1. Entity: Review.java

```java
package com.zestfoot.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "productId không được để trống")
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @NotNull(message = "userId không được để trống")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Min(value = 1, message = "Rating tối thiểu là 1")
    @Max(value = 5, message = "Rating tối đa là 5")
    @NotNull(message = "Rating không được để trống")
    private Integer rating;

    @NotBlank(message = "Bình luận không được để trống")
    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### 2. Repository: ReviewRepository.java

```java
package com.zestfoot.backend.repository;

import com.zestfoot.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    Double findAverageRatingByProductId(Long productId);
}
```

### 3. Controller: ReviewController.java

```java
package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.Review;
import com.zestfoot.backend.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    // GET /api/reviews/product/{productId} — lấy review theo sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return ResponseEntity.ok(Map.of(
            "reviews", reviews,
            "averageRating", calculateAverageRating(reviews),
            "totalCount", reviews.size()
        ));
    }

    // GET /api/reviews/user/{userId} — lấy review theo user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    // POST /api/reviews — tạo review mới
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Review review) {
        // Kiểm tra trùng lặp (1 user chỉ review 1 lần cho 1 sản phẩm)
        List<Review> existing = reviewRepository.findByUserIdOrderByCreatedAtDesc(review.getUserId())
            .stream().filter(r -> r.getProductId().equals(review.getProductId()))
            .toList();
        if (!existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Bạn đã đánh giá sản phẩm này rồi"));
        }
        Review saved = reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // DELETE /api/reviews/{id} — xóa review
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!reviewRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method
    private double calculateAverageRating(List<Review> reviews) {
        return reviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);
    }
}
```

### 4. SQL migration

```sql
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_user_product (user_id, product_id)
);
```

### 5. API Endpoints tổng kết

| Method | URL | Chức năng |
|---|---|---|
| `GET` | `/api/reviews/product/{productId}` | Lấy tất cả review của sản phẩm kèm điểm trung bình |
| `GET` | `/api/reviews/user/{userId}` | Lấy tất cả review của user |
| `POST` | `/api/reviews` | Tạo review mới |
| `DELETE` | `/api/reviews/{id}` | Xóa review |

---

# TỔNG HỢP KIẾN THỨC CẦN NHỚ

| Chủ đề | Annotation / Concept quan trọng |
|---|---|
| **Spring Core** | `@SpringBootApplication`, `@Component`, `@Service`, `@Repository`, `@Controller`, `@RestController`, `@Autowired`, `@Bean`, `@Configuration`, IoC, DI |
| **Spring MVC** | `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping`, `@RequestParam`, `@PathVariable`, `@RequestBody`, `@ResponseBody`, `@Valid`, `BindingResult`, `@ControllerAdvice`, `@ExceptionHandler` |
| **JPA** | `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column`, `JpaRepository`, `@Query`, `nativeQuery`, Derived Query Methods, ORM |
| **Validation** | `@NotNull`, `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Email`, `@Pattern`, `@DateTimeFormat` |
| **AJAX/Fetch** | `fetch()`, axios, Promise, `async/await`, `.then().catch()`, Interceptor, localStorage |
| **Project ZestFoot** | Auth flow (token-based), Payment flow (PayOS), Search (client-side scoring), ERD (JSON columns) |

---

*Tài liệu ôn tập dựa trên dự án ZestFoot (webbangiay) và 6 tài liệu: AJAX với Fetch API & jQuery, Spring Framework, Spring MVC Part 1-3, Introduction JPA.*
