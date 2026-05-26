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

    @Column(columnDefinition = "TEXT")
    private String image;

    private String gender;
    private String slug;

    private Double price;

    @Column(name = "salePrice")
    private Double salePrice;

    @Column(name = "isSale")
    private Boolean isSale;

    @Column(name = "isTrending")
    private Boolean isTrending;

    @Column(name = "isNew")
    private Boolean isNew;

    @Column(name = "isAsicsExclusive")
    private Boolean isAsicsExclusive;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(columnDefinition = "TEXT")
    private String sizes;

    @Column(columnDefinition = "TEXT")
    private String colors;

    @Column(columnDefinition = "TEXT")
    private String badges;
}
