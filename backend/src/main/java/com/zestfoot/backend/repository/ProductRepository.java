package com.zestfoot.backend.repository;

import com.zestfoot.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsNewTrue();
    List<Product> findByIsSaleTrue();
    List<Product> findByIsTrendingTrue();
    List<Product> findByBrandIgnoreCase(String brand);
}
