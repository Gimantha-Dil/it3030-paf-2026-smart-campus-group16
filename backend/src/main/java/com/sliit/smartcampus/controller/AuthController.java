package com.sliit.smartcampus.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.smartcampus.dto.request.LoginRequestDTO;
import com.sliit.smartcampus.dto.request.RegisterRequestDTO;
import com.sliit.smartcampus.dto.response.AuthResponseDTO;
import com.sliit.smartcampus.dto.response.UserResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.InvalidOperationException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final EntityMapper mapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, EntityMapper mapper,
            UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.mapper = mapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(mapper.toUserDTO(user));
    }

    /** PATCH /api/v1/auth/profile — update display name */
    @PatchMapping("/profile")
    public ResponseEntity<UserResponseDTO> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().length() < 2)
            throw new InvalidOperationException("Name must be at least 2 characters");
        user.setName(name.trim());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(mapper.toUserDTO(saved));
    }

    /** PATCH /api/v1/auth/password — change password */
    @PatchMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (user.getPassword() == null)
            throw new InvalidOperationException("Password change is not available for OAuth accounts");
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new InvalidOperationException("Current password is incorrect");
        if (newPassword == null || newPassword.length() < 8)
            throw new InvalidOperationException("New password must be at least 8 characters");

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    /** POST /api/v1/auth/request-staff-role — OAuth new user requests staff role */
    @PostMapping("/request-staff-role")
    public ResponseEntity<UserResponseDTO> requestStaffRole(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        String roleStr = body.get("requestedRole");
        try {
            UserRole requestedRole = UserRole.valueOf(roleStr);
            user.setRole(UserRole.PENDING_STAFF);
            user.setRequestedRole(requestedRole);
            User saved = userRepository.save(user);
            return ResponseEntity.ok(mapper.toUserDTO(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** POST /api/v1/auth/set-user-type — OAuth new user sets userType (STUDENT) */
    @PostMapping("/set-user-type")
    public ResponseEntity<UserResponseDTO> setUserType(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        String userType = body.get("userType");
        user.setUserType(userType);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(mapper.toUserDTO(saved));
    }
}
