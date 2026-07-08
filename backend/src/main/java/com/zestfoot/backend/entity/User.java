package com.zestfoot.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash")
    @JsonIgnore
    private String passwordHash;

    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự")
    @Column(name = "full_name")
    private String fullName;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Pattern(regexp = "(^0[0-9]{9}$)?", message = "Số điện thoại phải có 10 số, bắt đầu bằng 0")
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String role;

    private Integer points;

    @Column(name = "spin_tickets")
    private Integer spinTickets;

    @Column(name = "last_lucky_spin")
    private LocalDateTime lastLuckySpin;

    @Column(name = "last_daily_check_in")
    private LocalDateTime lastDailyCheckIn;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.role == null) this.role = "USER";
        if (this.points == null) this.points = 0;
        if (this.spinTickets == null) this.spinTickets = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
