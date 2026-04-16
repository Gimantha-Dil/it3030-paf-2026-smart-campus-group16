package com.sliit.smartcampus.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.smartcampus.dto.response.UserResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.service.EmailService;
import com.sliit.smartcampus.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;
    private final EmailService emailService;

    public UserController(UserService userService, EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String userType,
            @RequestParam(required = false, defaultValue = "false") boolean academicStaff,
            @NonNull Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(role, search, userType, academicStaff, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> getUserById(@NonNull @PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateRole(
            @NonNull @PathVariable Long id,
            @RequestParam UserRole role) {
        return ResponseEntity.ok(userService.updateRole(id, role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@NonNull @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/v1/users/me — self-service account deletion */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal User user) {
        userService.deleteUser(user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pending-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getPendingStaff(@NonNull Pageable pageable) {
        return ResponseEntity.ok(userService.getPendingStaff(pageable));
    }

    @PostMapping("/{id}/approve-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> approveStaff(@NonNull @PathVariable Long id) {
        return ResponseEntity.ok(userService.approveStaff(id));
    }

    @PostMapping("/{id}/reject-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> rejectStaff(@NonNull @PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectStaff(id));
    }
}