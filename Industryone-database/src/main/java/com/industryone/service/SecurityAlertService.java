package com.industryone.service;

import com.industryone.model.SecurityAlert;
import com.industryone.repository.SecurityAlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SecurityAlertService {

    private final SecurityAlertRepository repository;

    public SecurityAlertService(SecurityAlertRepository repository) {
        this.repository = repository;
    }

    public SecurityAlert createLoginLockAlert(
            String email, String role, String ip, int attempts) {

        SecurityAlert alert = new SecurityAlert(
                "LOGIN_LOCKOUT",
                "HIGH",
                email,
                role,
                ip,
                "Account locked after " + attempts
                        + " failed login attempts. Account is locked for 3 minutes.",
                attempts
        );

        return repository.save(alert);
    }

    public List<SecurityAlert> unresolved() {
        return repository.findByResolvedFalseOrderByCreatedAtDesc();
    }

    public List<SecurityAlert> all() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public boolean resolve(long id, String adminEmail) {
        return repository.findById(id)
                .map(alert -> {
                    alert.resolve(adminEmail);
                    repository.save(alert);
                    return true;
                })
                .orElse(false);
    }
}
