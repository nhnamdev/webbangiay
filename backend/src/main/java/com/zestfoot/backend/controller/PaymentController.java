package com.zestfoot.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zestfoot.backend.entity.Order;
import com.zestfoot.backend.repository.OrderRepository;
import com.zestfoot.backend.service.PayOSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PayOSService payOSService;

    @Autowired
    private OrderRepository orderRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/payos/create")
    public ResponseEntity<Map<String, Object>> createPayOSPayment(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long orderId = Long.valueOf(body.get("orderId").toString());

            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                response.put("success", false);
                response.put("message", "Order not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            CreatePaymentLinkResponse payosResponse = payOSService.createPaymentLink(order);

            Map<String, Object> paymentInfo = new HashMap<>();
            try {
                paymentInfo = objectMapper.readValue(order.getPaymentInfo(), HashMap.class);
            } catch (Exception ignored) {}
            paymentInfo.put("method", "payos");
            paymentInfo.put("status", "pending");
            paymentInfo.put("orderCode", order.getId());
            paymentInfo.put("paymentLinkId", payosResponse.getPaymentLinkId());
            try {
                order.setPaymentInfo(objectMapper.writeValueAsString(paymentInfo));
            } catch (Exception e) {
                order.setPaymentInfo("{\"method\":\"payos\",\"status\":\"pending\",\"orderCode\":" + order.getId() + "}");
            }
            orderRepository.save(order);

            response.put("success", true);
            response.put("checkoutUrl", payosResponse.getCheckoutUrl());
            response.put("orderCode", order.getId());
            response.put("qrCode", payosResponse.getQrCode());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/payos/status/{orderCode}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(@PathVariable Long orderCode) {
        Map<String, Object> response = new HashMap<>();
        try {
            PaymentLink paymentLink = payOSService.getPaymentInfo(orderCode);
            response.put("success", true);
            response.put("status", paymentLink.getStatus().name());
            response.put("amount", paymentLink.getAmount());
            response.put("amountPaid", paymentLink.getAmountPaid());
            response.put("amountRemaining", paymentLink.getAmountRemaining());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/payos/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> body) {
        try {
            WebhookData webhookData = payOSService.verifyWebhook(body);

            Long orderCode = webhookData.getOrderCode();

            Order order = orderRepository.findById(orderCode).orElse(null);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
            }

            String code = webhookData.getCode();
            if ("00".equals(code)) {
                order.setStatus("processing");
            } else if ("CANCELLED".equals(code)) {
                order.setStatus("cancelled");
            }

            Map<String, Object> paymentInfo = new HashMap<>();
            try {
                paymentInfo = objectMapper.readValue(order.getPaymentInfo(), HashMap.class);
            } catch (Exception ignored) {}
            paymentInfo.put("status", code);
            paymentInfo.put("paid_at", LocalDateTime.now().toString());
            paymentInfo.put("transaction_ref", webhookData.getReference());
            try {
                order.setPaymentInfo(objectMapper.writeValueAsString(paymentInfo));
            } catch (Exception ignored) {}

            orderRepository.save(order);

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook verification failed: " + e.getMessage());
        }
    }

    @PostMapping("/payos/cancel/{orderCode}")
    public ResponseEntity<Map<String, Object>> cancelPayment(@PathVariable Long orderCode) {
        Map<String, Object> response = new HashMap<>();
        try {
            payOSService.cancelPaymentLink(orderCode);

            Order order = orderRepository.findById(orderCode).orElse(null);
            if (order != null) {
                order.setStatus("cancelled");
                orderRepository.save(order);
            }

            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
