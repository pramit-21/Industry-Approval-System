package com.industryone.model;

public record RegisterRequest(
        String email,
        String password,
        String role,
        String fullName
) {}
