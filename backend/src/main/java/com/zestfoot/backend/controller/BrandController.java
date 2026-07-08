package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.Brand;
import com.zestfoot.backend.repository.BrandRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandRepository brandRepository;

    @GetMapping
    public List<Brand> list() {
        return brandRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> get(@PathVariable Long id) {
        return brandRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Brand> create(@Valid @RequestBody Brand brand) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandRepository.save(brand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> update(@PathVariable Long id, @Valid @RequestBody Brand brand) {
        return brandRepository.findById(id).map(existing -> {
            brand.setId(existing.getId());
            return ResponseEntity.ok(brandRepository.save(brand));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!brandRepository.existsById(id)) return ResponseEntity.notFound().build();
        brandRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
