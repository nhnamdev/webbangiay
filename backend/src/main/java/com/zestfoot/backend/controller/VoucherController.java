package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.UserVoucher;
import com.zestfoot.backend.repository.UserVoucherRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    private UserVoucherRepository voucherRepository;

    @GetMapping
    public List<UserVoucher> list() {
        return voucherRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<UserVoucher> create(@Valid @RequestBody UserVoucher voucher) {
        return ResponseEntity.status(HttpStatus.CREATED).body(voucherRepository.save(voucher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserVoucher> update(@PathVariable Long id, @Valid @RequestBody UserVoucher voucher) {
        return voucherRepository.findById(id).map(existing -> {
            voucher.setId(existing.getId());
            return ResponseEntity.ok(voucherRepository.save(voucher));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!voucherRepository.existsById(id)) return ResponseEntity.notFound().build();
        voucherRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
