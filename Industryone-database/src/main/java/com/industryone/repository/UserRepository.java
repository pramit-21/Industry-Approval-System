package com.industryone.repository;

import com.industryone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCaseAndRoleIgnoreCase(String email, String role);
    boolean existsByEmailIgnoreCaseAndRoleIgnoreCase(String email, String role);
}
