package com.industryone.controller;

import com.industryone.model.User;
import com.industryone.service.AuthService;
import com.industryone.service.SecurityAlertService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminAlertController {

    private final SecurityAlertService alertService;
    private final AuthService authService;

    public AdminAlertController(SecurityAlertService alertService,
                                AuthService authService) {
        this.alertService = alertService;
        this.authService = authService;
    }

    @GetMapping("/alerts")
    public ResponseEntity<?> unresolved(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        Optional<User> admin = admin(token);
        if (admin.isEmpty()) {
            return forbidden();
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "alerts", alertService.unresolved()
        ));
    }

    @GetMapping("/alerts/all")
    public ResponseEntity<?> all(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        Optional<User> admin = admin(token);
        if (admin.isEmpty()) {
            return forbidden();
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "alerts", alertService.all()
        ));
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<?> resolve(
            @PathVariable long id,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        Optional<User> admin = admin(token);
        if (admin.isEmpty()) {
            return forbidden();
        }

        boolean resolved = alertService.resolve(id, admin.get().getEmail());

        if (!resolved) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("success", false, "message", "Alert not found."));
        }

        return ResponseEntity.ok(
                Map.of("success", true, "message", "Alert resolved."));
    }

    private Optional<User> admin(String token) {
        return authService.getUser(token)
                .filter(user -> "ADMIN".equals(user.getRole()));
    }

    private ResponseEntity<Map<String, Object>> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                        "success", false,
                        "message", "Admin access required."
                ));
    }
}
