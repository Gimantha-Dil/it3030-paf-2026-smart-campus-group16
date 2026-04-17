package com.sliit.smartcampus.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.exception.InvalidOperationException;
import com.sliit.smartcampus.repository.UserRepository;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int TOKEN_EXPIRY_MINUTES = 30;

    public PasswordResetService(UserRepository userRepository,
            PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void sendResetLink(String email, String frontendUrl) {
        // Always respond success to avoid email enumeration
        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            if (user.getPassword() == null) {
                // OAuth-only account — send info email instead
                emailService.sendOAuthAccountEmail(user.getEmail(), user.getName());
                return;
            }
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiry(LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token, frontendUrl);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new InvalidOperationException("Invalid or expired reset link."));

        if (user.getPasswordResetExpiry() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetExpiry())) {
            throw new InvalidOperationException("Reset link has expired. Please request a new one.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new InvalidOperationException("Password must be at least 8 characters.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
    }
}
