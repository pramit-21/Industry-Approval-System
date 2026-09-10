package com.industryone.service;

import com.industryone.model.User;
import com.industryone.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> authenticate(String email, String password, String role) {
        return userRepository.findByEmailIgnoreCaseAndRoleIgnoreCase(email, role)
                .filter(User::isActive)
                .filter(user -> passwordEncoder.matches(password, user.getPasswordHash()));
    }

    public User createUser(String email, String password, String role, String fullName) {
        User user = new User(
                email.trim().toLowerCase(),
                passwordEncoder.encode(password),
                role.trim().toUpperCase(),
                fullName,
                true
        );
        return userRepository.save(user);
    }

    public boolean exists(String email, String role) {
        return userRepository.existsByEmailIgnoreCaseAndRoleIgnoreCase(email, role);
    }
}
