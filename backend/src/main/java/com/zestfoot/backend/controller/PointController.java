package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.PointTransaction;
import com.zestfoot.backend.entity.User;
import com.zestfoot.backend.repository.PointTransactionRepository;
import com.zestfoot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/points")
public class PointController {

    @Autowired
    private PointTransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}/transactions")
    public List<PointTransaction> transactions(@PathVariable Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping("/user/{userId}")
    @Transactional
    public ResponseEntity<?> apply(@PathVariable Long userId, @RequestBody Map<String, Object> body) {
        Optional<User> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        String type = String.valueOf(body.getOrDefault("type", "earn")).toLowerCase();
        Integer amount = toInt(body.get("amount"));
        String reason = body.get("reason") == null ? "" : body.get("reason").toString();

        User u = opt.get();
        int current = u.getPoints() == null ? 0 : u.getPoints();
        int delta = amount == null ? 0 : amount;
        int next = "spend".equals(type) ? current - delta : current + delta;
        if (next < 0) next = 0;
        u.setPoints(next);
        userRepository.save(u);

        PointTransaction tx = new PointTransaction();
        tx.setUserId(userId);
        tx.setType(type);
        tx.setAmount(delta);
        tx.setReason(reason);
        transactionRepository.save(tx);

        return ResponseEntity.ok(Map.of("points", next, "transaction", tx));
    }

    private static Integer toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number) return ((Number) o).intValue();
        try { return Integer.parseInt(o.toString()); } catch (Exception e) { return 0; }
    }
}
