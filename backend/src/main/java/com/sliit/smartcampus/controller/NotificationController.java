package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.response.NotificationResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponseDTO>> getAll(
            @AuthenticationPrincipal User user, Pageable pageable) {
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getPreferences(@AuthenticationPrincipal User user) {
        List<String> disabled = notificationService.getDisabledTypes(user);
        return ResponseEntity.ok(Map.of("disabledTypes", disabled));
    }

    @PatchMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, List<String>> body) {
        List<String> disabledTypes = body.get("disabledTypes");
        notificationService.updatePreferences(user, disabledTypes);
        return ResponseEntity.ok(Map.of("message", "Preferences updated", "disabledTypes",
                disabledTypes != null ? disabledTypes : List.of()));
    }
}