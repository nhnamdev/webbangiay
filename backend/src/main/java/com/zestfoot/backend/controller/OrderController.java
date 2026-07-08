package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.Order;
import com.zestfoot.backend.repository.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public List<Order> getOrdersByEmail(@RequestParam String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody Order order) {
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return orderRepository.findById(id).map(o -> {
            String status = (String) body.getOrDefault("status", o.getStatus());
            String reason = (String) body.getOrDefault("reason", null);
            o.setStatus(status);
            if (reason != null) {
                o.setPaymentInfo("{\"cancellation_reason\":\"" + reason + "\"}");
            }
            return ResponseEntity.ok(orderRepository.save(o));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!orderRepository.existsById(id)) return ResponseEntity.notFound().build();
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
