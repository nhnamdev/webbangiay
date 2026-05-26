package com.zestfoot.backend.repository;

import com.zestfoot.backend.entity.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {
    List<UserVoucher> findByUserId(Long userId);
    Optional<UserVoucher> findByCodeAndUserIdAndStatus(String code, Long userId, String status);
}
