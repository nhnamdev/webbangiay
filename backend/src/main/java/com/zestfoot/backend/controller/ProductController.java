package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.Product;
import com.zestfoot.backend.repository.ProductRepository;
import com.zestfoot.backend.service.R2StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private R2StorageService r2StorageService;

    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean isSale,
            @RequestParam(required = false) Boolean isTrending,
            @RequestParam(required = false) String brand) {
        if (Boolean.TRUE.equals(isNew)) {
            return productRepository.findByIsNewTrue();
        }
        if (Boolean.TRUE.equals(isSale)) {
            return productRepository.findByIsSaleTrue();
        }
        if (Boolean.TRUE.equals(isTrending)) {
            return productRepository.findByIsTrendingTrue();
        }
        if (brand != null && !brand.isBlank()) {
            return productRepository.findByBrandIgnoreCase(brand);
        }
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Product create(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product createMultipart(
            @ModelAttribute Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        applyUploadedImage(product, imageFile);
        return productRepository.save(product);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return productRepository.findById(id).map(existing -> {
            mergeEditableFields(existing, product);
            return ResponseEntity.ok(productRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateMultipart(
            @PathVariable Long id,
            @ModelAttribute Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        return productRepository.findById(id).map(existing -> {
            mergeEditableFields(existing, product);
            applyUploadedImage(existing, imageFile);
            return ResponseEntity.ok(productRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyUploadedImage(Product product, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImage(r2StorageService.uploadProductImage(imageFile));
        }
    }

    private void mergeEditableFields(Product target, Product source) {
        if (source.getName() != null) {
            target.setName(source.getName());
        }
        if (source.getBrand() != null) {
            target.setBrand(source.getBrand());
        }
        if (source.getCategory() != null) {
            target.setCategory(source.getCategory());
        }
        if (source.getSubCategory() != null) {
            target.setSubCategory(source.getSubCategory());
        }
        if (source.getImage() != null) {
            target.setImage(source.getImage());
        }
        if (source.getGender() != null) {
            target.setGender(source.getGender());
        }
        if (source.getSlug() != null) {
            target.setSlug(source.getSlug());
        }
        if (source.getPrice() != null) {
            target.setPrice(source.getPrice());
        }
        if (source.getSalePrice() != null) {
            target.setSalePrice(source.getSalePrice());
        }
        if (source.getIsSale() != null) {
            target.setIsSale(source.getIsSale());
        }
        if (source.getIsTrending() != null) {
            target.setIsTrending(source.getIsTrending());
        }
        if (source.getIsNew() != null) {
            target.setIsNew(source.getIsNew());
        }
        if (source.getIsAsicsExclusive() != null) {
            target.setIsAsicsExclusive(source.getIsAsicsExclusive());
        }
        if (source.getDescription() != null) {
            target.setDescription(source.getDescription());
        }
        if (source.getImages() != null) {
            target.setImages(source.getImages());
        }
        if (source.getSizes() != null) {
            target.setSizes(source.getSizes());
        }
        if (source.getColors() != null) {
            target.setColors(source.getColors());
        }
        if (source.getBadges() != null) {
            target.setBadges(source.getBadges());
        }
    }
}
