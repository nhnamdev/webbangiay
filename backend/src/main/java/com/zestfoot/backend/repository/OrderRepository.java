package com.zestfoot.backend.repository;

import com.zestfoot.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "SELECT * FROM orders WHERE JSON_UNQUOTE(JSON_EXTRACT(customer, '$.email')) = :email OR customer LIKE CONCAT('%', :email, '%') ORDER BY created_at DESC", nativeQuery = true)
    List<Order> findByCustomerEmail(@Param("email") String email);
}
