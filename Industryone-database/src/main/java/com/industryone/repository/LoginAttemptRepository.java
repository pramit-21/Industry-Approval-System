package com.industryone.repository;

import com.industryone.model.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    Optional<LoginAttempt> findByEmailIgnoreCaseAndRoleIgnoreCase(String email, String role);
}
