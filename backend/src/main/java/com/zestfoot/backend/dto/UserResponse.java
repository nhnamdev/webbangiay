package com.zestfoot.backend.dto;

import com.zestfoot.backend.entity.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
public class UserResponse {

    private Long id;
    private String email;
    private String role;
    private Integer points;
    private Integer spinTickets;
    private String fullName;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private LocalDateTime lastLuckySpin;
    private LocalDateTime lastDailyCheckIn;
    private Map<String, Object> user_metadata;
    private Map<String, Object> app_metadata;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.email = u.getEmail();
        r.role = u.getRole() == null ? "USER" : u.getRole();
        r.points = u.getPoints() == null ? 0 : u.getPoints();
        r.spinTickets = u.getSpinTickets() == null ? 0 : u.getSpinTickets();
        r.fullName = u.getFullName();
        r.firstName = u.getFirstName();
        r.lastName = u.getLastName();
        r.phone = u.getPhone();
        r.address = u.getAddress();
        r.lastLuckySpin = u.getLastLuckySpin();
        r.lastDailyCheckIn = u.getLastDailyCheckIn();

        Map<String, Object> meta = new HashMap<>();
        meta.put("first_name", u.getFirstName());
        meta.put("last_name", u.getLastName());
        meta.put("full_name", u.getFullName());
        meta.put("phone", u.getPhone());
        r.user_metadata = meta;

        Map<String, Object> appMeta = new HashMap<>();
        appMeta.put("role", "ADMIN".equalsIgnoreCase(r.role) ? "admin" : "user");
        r.app_metadata = appMeta;
        return r;
    }
}
