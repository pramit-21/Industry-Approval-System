package com.industryone.controller;

import com.industryone.model.LoginRequest;
import com.industryone.model.LoginResponse;
import com.industryone.model.User;
import com.industryone.service.AuthService;
import com.industryone.service.LoginAttemptService;
import com.industryone.service.SecurityAlertService;
import com.industryone.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final UserService userService;
    private final LoginAttemptService attemptService;
    private final SecurityAlertService alertService;
    private final AuthService authService;

    public LoginController(UserService userService,
                           LoginAttemptService attemptService,
                           SecurityAlertService alertService,
                           AuthService authService) {
        this.userService = userService;
        this.attemptService = attemptService;
        this.alertService = alertService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            @RequestHeader(value = "X-Client-IP", defaultValue = "unknown") String ip) {

        String email = request.email() == null ? "" : request.email().trim();
        String password = request.password() == null ? "" : request.password();
        String role = request.role() == null ? "" : request.role().trim().toUpperCase();

        if (email.isBlank() || password.isBlank() || role.isBlank()) {
            return ResponseEntity.badRequest().body(
                    LoginResponse.failure(
                            "Email, password and role are required.", 3));
        }

        if (!validRole(role)) {
            return ResponseEntity.badRequest().body(
                    LoginResponse.failure("Invalid role.", 3));
        }

        if (attemptService.isLocked(email, role)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                    LoginResponse.locked(
                            "Too many failed attempts. Account is temporarily locked.",
                            attemptService.remainingSeconds(email, role)));
        }

        Optional<User> result = userService.authenticate(email, password, role);

        if (result.isEmpty()) {
            int count = attemptService.registerFailure(email, role, ip);

            if (count >= LoginAttemptService.MAX_ATTEMPTS) {
                alertService.createLoginLockAlert(email, role, ip, count);

                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                        LoginResponse.locked(
                                "Login failed 3 times. Your account is locked for 3 minutes. Admin has been alerted.",
                                180));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    LoginResponse.failure(
                            "Invalid email, password or role.",
                            LoginAttemptService.MAX_ATTEMPTS - count));
        }

        User user = result.get();
        attemptService.reset(email, role);

        String token = authService.createToken(user);

        String redirect = switch (user.getRole()) {
            case "OFFICER" -> "/Officer.html";
            case "ENTREPRENEUR" -> "/entrepreneur.html";
            case "INSPECTOR" -> "/Inspector.html";
            case "ADMIN" -> "/AdminDashboard.html";
            default -> "/";
        };

        return ResponseEntity.ok(
                LoginResponse.success(
                        token,
                        user.getId(),
                        user.getEmail(),
                        user.getRole(),
                        user.getFullName(),
                        redirect));
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        authService.logout(token);

        return Map.of(
                "success", true,
                "message", "Logged out successfully."
        );
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {

        Optional<User> result = authService.getUser(token);

        if (result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("authenticated", false));
        }

        User user = result.get();

        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "userId", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "fullName", user.getFullName()
        ));
    }

    private boolean validRole(String role) {
        return role.equals("OFFICER")
                || role.equals("ENTREPRENEUR")
                || role.equals("INSPECTOR")
                || role.equals("ADMIN");
    }
}
