package com.zestfoot.backend.service;

import com.zestfoot.backend.entity.Order;
import com.zestfoot.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import vn.payos.PayOS;
import vn.payos.exception.PayOSException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

import java.util.Map;

@Service
public class PayOSService {

    @Autowired
    private PayOS payOS;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    public CreatePaymentLinkResponse createPaymentLink(Order order) throws PayOSException {
        String description = "ZestFoot " + order.getId();
        if (description.length() > 25) {
            description = "ZF " + order.getId();
        }

        Double totalAmount = order.getTotalAmount();
        if (totalAmount == null || totalAmount <= 0) {
            throw new RuntimeException("totalAmount is null or invalid for order " + order.getId());
        }

        CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                .orderCode(order.getId())
                .amount(totalAmount.longValue())
                .description(description)
                .returnUrl(returnUrl + "?orderCode=" + order.getId())
                .cancelUrl(cancelUrl + "?orderCode=" + order.getId())
                .build();

        return payOS.paymentRequests().create(request);
    }

    public PaymentLink getPaymentInfo(Long orderCode) throws PayOSException {
        return payOS.paymentRequests().get(orderCode);
    }

    public PaymentLink cancelPaymentLink(Long orderCode) throws PayOSException {
        return payOS.paymentRequests().cancel(orderCode, "User cancelled");
    }

    public WebhookData verifyWebhook(Map<String, Object> webhookBody) throws PayOSException {
        return payOS.webhooks().verify(webhookBody);
    }
}
