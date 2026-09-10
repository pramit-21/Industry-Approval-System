package com.industryone.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_alerts")
public class SecurityAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_type", nullable = false)
    private String alertType;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean resolved = false;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public SecurityAlert() {}

    public SecurityAlert(String alertType, String severity, String email,
                         String role, String ipAddress, String message, int attempts) {
        this.alertType = alertType;
        this.severity = severity;
        this.email = email;
        this.role = role;
        this.ipAddress = ipAddress;
        this.message = message;
        this.attempts = attempts;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getAlertType() { return alertType; }
    public String getSeverity() { return severity; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getIpAddress() { return ipAddress; }
    public String getMessage() { return message; }
    public int getAttempts() { return attempts; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isResolved() { return resolved; }
    public String getResolvedBy() { return resolvedBy; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }

    public void resolve(String adminEmail) {
        this.resolved = true;
        this.resolvedBy = adminEmail;
        this.resolvedAt = LocalDateTime.now();
    }
}
