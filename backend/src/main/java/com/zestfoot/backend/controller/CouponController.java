package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.Coupon;
import com.zestfoot.backend.entity.UserVoucher;
import com.zestfoot.backend.repository.CouponRepository;
import com.zestfoot.backend.repository.UserVoucherRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private UserVoucherRepository voucherRepository;

    @GetMapping
    public List<Coupon> list() {
        return couponRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> get(@PathVariable Long id) {
        return couponRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Coupon> create(@Valid @RequestBody Coupon coupon) {
        if (coupon.getCode() != null) coupon.setCode(coupon.getCode().toUpperCase().trim());
        return ResponseEntity.status(HttpStatus.CREATED).body(couponRepository.save(coupon));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> update(@PathVariable Long id, @Valid @RequestBody Coupon coupon) {
        return couponRepository.findById(id).map(existing -> {
            coupon.setId(existing.getId());
            if (coupon.getCode() != null) coupon.setCode(coupon.getCode().toUpperCase().trim());
            return ResponseEntity.ok(couponRepository.save(coupon));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!couponRepository.existsById(id)) return ResponseEntity.notFound().build();
        couponRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validations")
    public Map<String, Object> validate(@RequestBody Map<String, Object> req) {
        Map<String, Object> result = new HashMap<>();
        String code = req.get("code") == null ? "" : req.get("code").toString().toUpperCase().trim();
        Double orderTotal = toDouble(req.get("orderTotal"));
        Long userId = toLong(req.get("userId"));

        Optional<Coupon> coupOpt = couponRepository.findByCodeAndIsActiveTrue(code);
        if (coupOpt.isPresent()) {
            Coupon c = coupOpt.get();
            LocalDateTime now = LocalDateTime.now();
            if (c.getStartDate() != null && c.getStartDate().isAfter(now)) {
                result.put("valid", false);
                result.put("message", "Mã giảm giá chưa đến đợt áp dụng.");
                return result;
            }
            if (c.getEndDate() != null && c.getEndDate().isBefore(now)) {
                result.put("valid", false);
                result.put("message", "Mã giảm giá đã hết hạn.");
                return result;
            }
            if (c.getUsageLimit() != null && c.getUsedCount() != null && c.getUsedCount() >= c.getUsageLimit()) {
                result.put("valid", false);
                result.put("message", "Mã giảm giá đã hết số lượng.");
                return result;
            }
            double minOrder = c.getMinOrderValue() == null ? 0 : c.getMinOrderValue();
            if (orderTotal < minOrder) {
                result.put("valid", false);
                result.put("message", "Đơn hàng tối thiểu để dùng mã này là " + (long) minOrder + "đ");
                return result;
            }
            double discount = 0;
            if ("fixed".equalsIgnoreCase(c.getDiscountType())) {
                discount = c.getDiscountValue();
            } else if ("percent".equalsIgnoreCase(c.getDiscountType())) {
                discount = orderTotal * c.getDiscountValue() / 100;
                if (c.getMaxDiscountAmount() != null && discount > c.getMaxDiscountAmount()) {
                    discount = c.getMaxDiscountAmount();
                }
            }
            result.put("valid", true);
            result.put("type", "public");
            result.put("discount", discount);
            result.put("message", "Áp dụng Coupon thành công! -" + (long) discount + "đ");
            result.put("coupon", c);
            return result;
        }

        if (userId != null) {
            Optional<UserVoucher> vOpt = voucherRepository.findByCodeAndUserIdAndStatus(code, userId, "active");
            if (vOpt.isPresent()) {
                UserVoucher v = vOpt.get();
                if (v.getExpiresAt() != null && v.getExpiresAt().isBefore(LocalDateTime.now())) {
                    result.put("valid", false);
                    result.put("message", "Voucher đã hết hạn.");
                    return result;
                }
                double minOrder = v.getMinOrderValue() == null ? 0 : v.getMinOrderValue();
                if (orderTotal < minOrder) {
                    result.put("valid", false);
                    result.put("message", "Đơn hàng tối thiểu để dùng voucher này là " + (long) minOrder + "đ");
                    return result;
                }
                double discount = v.getDiscountAmount() == null ? 0 : v.getDiscountAmount();
                result.put("valid", true);
                result.put("type", "private");
                result.put("discount", discount);
                result.put("message", "Áp dụng Voucher thành công! -" + (long) discount + "đ");
                result.put("voucher", v);
                return result;
            }
        }

        result.put("valid", false);
        result.put("message", "Mã giảm giá không tồn tại hoặc đã hết hạn.");
        return result;
    }

    @PostMapping("/{code}/usages")
    public ResponseEntity<?> markUsed(@PathVariable String code) {
        String cleanCode = code.toUpperCase().trim();
        Optional<Coupon> opt = couponRepository.findByCode(cleanCode);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Coupon c = opt.get();
        c.setUsedCount((c.getUsedCount() == null ? 0 : c.getUsedCount()) + 1);
        couponRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private static Double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return Double.parseDouble(o.toString()); } catch (Exception e) { return 0.0; }
    }

    private static Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }
}
