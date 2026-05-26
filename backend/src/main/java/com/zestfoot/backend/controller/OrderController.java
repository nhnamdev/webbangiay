package com.zestfoot.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zestfoot.backend.entity.Order;
import com.zestfoot.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    private final ObjectMapper json = new ObjectMapper();

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

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @GetMapping("/by-email")
    public List<Order> getOrdersByEmail(@RequestParam String email) {
        return orderRepository.findByEmailOrderByCreatedAtDesc(email);
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> item.setOrder(order));
        }
        if (order.getStatus() == null) order.setStatus("pending");
        return orderRepository.save(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return orderRepository.findById(id).map(o -> {
            String status = (String) body.getOrDefault("status", o.getStatus());
            String reason = (String) body.getOrDefault("reason", null);
            o.setStatus(status);
            if (reason != null) {
                Map<String, Object> info = new HashMap<>();
                if (o.getPaymentInfoJson() != null) {
                    try { info = json.readValue(o.getPaymentInfoJson(), HashMap.class); } catch (Exception ignored) {}
                }
                info.put("cancellation_reason", reason);
                info.put("cancelled_at", LocalDateTime.now().toString());
                try { o.setPaymentInfoJson(json.writeValueAsString(info)); } catch (Exception ignored) {}
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
