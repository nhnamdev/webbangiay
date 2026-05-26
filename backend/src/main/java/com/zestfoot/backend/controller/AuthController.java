package com.zestfoot.backend.controller;

import com.zestfoot.backend.dto.UserResponse;
import com.zestfoot.backend.entity.User;
import com.zestfoot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String firstName = body.getOrDefault("firstName", "");
        String lastName = body.getOrDefault("lastName", "");
        String fullName = body.getOrDefault("fullName", (firstName + " " + lastName).trim());

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email và mật khẩu bắt buộc"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Email đã được sử dụng"));
        }

        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password));
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setFullName(fullName.isBlank() ? email : fullName);
        u.setRole("USER");
        u.setPoints(200);
        u.setSpinTickets(0);
        User saved = userRepository.save(u);

        Map<String, Object> resp = new HashMap<>();
        resp.put("user", UserResponse.from(saved));
        resp.put("session", session(saved));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "").trim();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Email hoặc mật khẩu không đúng"));
        }
        User u = opt.get();
        if (u.getPasswordHash() == null || !passwordEncoder.matches(password, u.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Email hoặc mật khẩu không đúng"));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("user", UserResponse.from(u));
        resp.put("session", session(u));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> session(User u) {
        Map<String, Object> s = new HashMap<>();
        s.put("access_token", "zf-" + u.getId() + "-" + UUID.randomUUID());
        s.put("token_type", "bearer");
        s.put("expires_in", 60 * 60 * 8);
        s.put("user", UserResponse.from(u));
        return s;
    }
}
