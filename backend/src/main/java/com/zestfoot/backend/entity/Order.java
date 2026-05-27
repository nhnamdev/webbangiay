package com.zestfoot.backend.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(columnDefinition = "json")
    private String customer;

    @Column(columnDefinition = "json")
    private String items;

    @Column(name = "sub_total")
    private Double subTotal;

    @Column(name = "shipping_fee")
    private Double shippingFee;

    private Double discount;

    @Column(name = "total_amount")
    private Double totalAmount;

    private String status;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_info", columnDefinition = "json")
    private String paymentInfo;

    @Column(name = "voucher_discount")
    private Double voucherDiscount;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Column(name = "point_discount")
    private Double pointDiscount;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (totalAmount == null) {
            double total = (subTotal != null ? subTotal : 0)
                + (shippingFee != null ? shippingFee : 0)
                - (discount != null ? discount : 0)
                - (voucherDiscount != null ? voucherDiscount : 0)
                - (pointDiscount != null ? pointDiscount : 0);
            totalAmount = Math.max(total, 0);
        }
    }
}
