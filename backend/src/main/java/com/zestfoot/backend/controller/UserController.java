package com.zestfoot.backend.controller;

import com.zestfoot.backend.dto.UserResponse;
import com.zestfoot.backend.entity.User;
import com.zestfoot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> p = userRepository.findAll(PageRequest.of(Math.max(0, page - 1), size, Sort.by(Sort.Direction.DESC, "updatedAt")));
        List<User> all = p.getContent();
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            all = all.stream().filter(u ->
                    (u.getFullName() != null && u.getFullName().toLowerCase().contains(q))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(q))
            ).toList();
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("data", all.stream().map(UserResponse::from).toList());
        resp.put("total", p.getTotalElements());
        resp.put("page", page);
        resp.put("size", size);
        return resp;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(UserResponse.from(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserResponse createUser(@RequestBody Map<String, Object> body) {
        User u = new User();
        u.setEmail((String) body.get("email"));
        u.setFullName((String) body.getOrDefault("fullName", body.get("full_name")));
        u.setFirstName((String) body.get("firstName"));
        u.setLastName((String) body.get("lastName"));
        u.setPhone((String) body.get("phone"));
        u.setAddress((String) body.get("address"));
        u.setRole((String) body.getOrDefault("role", "USER"));
        Object pw = body.get("password");
        if (pw != null) u.setPasswordHash(passwordEncoder.encode(pw.toString()));
        return UserResponse.from(userRepository.save(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return userRepository.findById(id).map(u -> {
            if (body.containsKey("fullName")) u.setFullName((String) body.get("fullName"));
            if (body.containsKey("full_name")) u.setFullName((String) body.get("full_name"));
            if (body.containsKey("firstName")) u.setFirstName((String) body.get("firstName"));
            if (body.containsKey("lastName")) u.setLastName((String) body.get("lastName"));
            if (body.containsKey("phone")) u.setPhone((String) body.get("phone"));
            if (body.containsKey("address")) u.setAddress((String) body.get("address"));
            if (body.containsKey("role")) u.setRole((String) body.get("role"));
            if (body.containsKey("points")) u.setPoints(toInt(body.get("points")));
            if (body.containsKey("spinTickets")) u.setSpinTickets(toInt(body.get("spinTickets")));
            if (body.containsKey("spin_tickets")) u.setSpinTickets(toInt(body.get("spin_tickets")));
            if (body.containsKey("lastLuckySpin")) u.setLastLuckySpin(parseDateTime(body.get("lastLuckySpin")));
            if (body.containsKey("last_lucky_spin")) u.setLastLuckySpin(parseDateTime(body.get("last_lucky_spin")));
            if (body.containsKey("lastDailyCheckIn")) u.setLastDailyCheckIn(parseDateTime(body.get("lastDailyCheckIn")));
            if (body.containsKey("last_daily_check_in")) u.setLastDailyCheckIn(parseDateTime(body.get("last_daily_check_in")));
            if (body.containsKey("password") && body.get("password") != null) {
                u.setPasswordHash(passwordEncoder.encode(body.get("password").toString()));
            }
            return ResponseEntity.ok(UserResponse.from(userRepository.save(u)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).intValue();
        try { return Integer.parseInt(o.toString()); } catch (Exception e) { return null; }
    }

    private static LocalDateTime parseDateTime(Object o) {
        if (o == null) return null;
        try {
            String str = o.toString();
            if (str.endsWith("Z")) {
                return java.time.ZonedDateTime.parse(str).toLocalDateTime();
            }
            if (str.contains("T")) {
                return LocalDateTime.parse(str, java.time.format.DateTimeFormatter.ISO_DATE_TIME);
            }
            return LocalDateTime.parse(str);
        } catch (Exception e) {
            try {
                long ms = Long.parseLong(o.toString());
                return LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(ms), java.time.ZoneId.systemDefault());
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
