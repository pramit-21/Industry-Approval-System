package com.industryone.service;

import com.industryone.model.AuthToken;
import com.industryone.model.User;
import com.industryone.repository.AuthTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final int TOKEN_HOURS = 8;

    private final AuthTokenRepository repository;

    public AuthService(AuthTokenRepository repository) {
        this.repository = repository;
    }

    public String createToken(User user) {
        String token = UUID.randomUUID().toString();
        AuthToken authToken = new AuthToken(
                token,
                user,
                LocalDateTime.now().plusHours(TOKEN_HOURS)
        );
        repository.save(authToken);
        return token;
    }

    public Optional<User> getUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        return repository.findById(token)
                .filter(t -> LocalDateTime.now().isBefore(t.getExpiresAt()))
                .map(AuthToken::getUser);
    }

    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            repository.deleteById(token);
        }
    }
}
