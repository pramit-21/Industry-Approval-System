package com.industryone.service;

import com.industryone.model.LoginAttempt;
import com.industryone.repository.LoginAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class LoginAttemptService {

    public static final int MAX_ATTEMPTS = 3;
    public static final int LOCK_MINUTES = 3;

    private final LoginAttemptRepository repository;

    public LoginAttemptService(LoginAttemptRepository repository) {
        this.repository = repository;
    }

    public boolean isLocked(String email, String role) {
        return repository.findByEmailIgnoreCaseAndRoleIgnoreCase(email, role)
                .map(a -> {
                    if (a.getLockedUntil() == null) return false;
                    if (LocalDateTime.now().isBefore(a.getLockedUntil())) return true;

                    a.setFailedAttempts(0);
                    a.setLockedUntil(null);
                    repository.save(a);
                    return false;
                })
                .orElse(false);
    }

    public long remainingSeconds(String email, String role) {
        return repository.findByEmailIgnoreCaseAndRoleIgnoreCase(email, role)
                .map(a -> {
                    if (a.getLockedUntil() == null) return 0L;
                    return Math.max(0L, Duration.between(
                            LocalDateTime.now(), a.getLockedUntil()).getSeconds());
                })
                .orElse(0L);
    }

    @Transactional
    public synchronized int registerFailure(String email, String role, String ip) {
        LoginAttempt attempt = repository
                .findByEmailIgnoreCaseAndRoleIgnoreCase(email, role)
                .orElseGet(() -> new LoginAttempt(email.toLowerCase(), role.toUpperCase()));

        int count = attempt.getFailedAttempts() + 1;

        attempt.setFailedAttempts(count);
        attempt.setLastFailedAt(LocalDateTime.now());
        attempt.setLastIp(ip);

        if (count >= MAX_ATTEMPTS) {
            attempt.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
        }

        repository.save(attempt);
        return count;
    }

    @Transactional
    public void reset(String email, String role) {
        repository.findByEmailIgnoreCaseAndRoleIgnoreCase(email, role)
                .ifPresent(attempt -> {
                    attempt.setFailedAttempts(0);
                    attempt.setLockedUntil(null);
                    attempt.setLastFailedAt(null);
                    repository.save(attempt);
                });
    }
}
