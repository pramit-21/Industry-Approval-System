package com.industryone.model;

public record LoginResponse(
        boolean success,
        boolean locked,
        String message,
        Integer remainingAttempts,
        Long retryAfterSeconds,
        String token,
        Long userId,
        String email,
        String role,
        String fullName,
        String redirect
) {
    public static LoginResponse failure(String message, int remaining) {
        return new LoginResponse(false, false, message, remaining,
                null, null, null, null, null, null, null);
    }

    public static LoginResponse locked(String message, long seconds) {
        return new LoginResponse(false, true, message, 0,
                seconds, null, null, null, null, null, null);
    }

    public static LoginResponse success(String token, Long userId,
                                        String email, String role,
                                        String fullName, String redirect) {
        return new LoginResponse(true, false, "Login successful.",
                null, null, token, userId, email, role, fullName, redirect);
    }
}
