package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.Product;
import com.zestfoot.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean isSale,
            @RequestParam(required = false) Boolean isTrending,
            @RequestParam(required = false) String brand) {
        if (Boolean.TRUE.equals(isNew)) return productRepository.findByIsNewTrue();
        if (Boolean.TRUE.equals(isSale)) return productRepository.findByIsSaleTrue();
        if (Boolean.TRUE.equals(isTrending)) return productRepository.findByIsTrendingTrue();
        if (brand != null && !brand.isBlank()) return productRepository.findByBrandIgnoreCase(brand);
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return productRepository.findById(id).map(existing -> {
            product.setId(existing.getId());
            return ResponseEntity.ok(productRepository.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) return ResponseEntity.notFound().build();
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
