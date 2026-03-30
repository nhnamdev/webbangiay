package com.zestfoot.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String brand;
    private String category;
    
    @Column(name = "subCategory")
    private String subCategory;
    
    private String image; // Contains Supabase image URL
    private String gender;
    
    private Double price;
    
    @Column(name = "salePrice")
    private Double salePrice;
    
    @Column(name = "isSale")
    private Boolean isSale;
    
    @Column(name = "isTrending")
    private Boolean isTrending;
    
    @Column(name = "isNew")
    private Boolean isNew;
}
