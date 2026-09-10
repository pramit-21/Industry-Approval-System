package com.industryone.repository;

import com.industryone.model.SecurityAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {
    List<SecurityAlert> findByResolvedFalseOrderByCreatedAtDesc();
    List<SecurityAlert> findAllByOrderByCreatedAtDesc();
}
