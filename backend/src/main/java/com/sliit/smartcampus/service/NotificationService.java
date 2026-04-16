package com.sliit.smartcampus.service;

import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sliit.smartcampus.dto.response.NotificationResponseDTO;
import com.sliit.smartcampus.entity.Notification;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.NotificationType;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.NotificationRepository;
import com.sliit.smartcampus.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@SuppressWarnings("null")
@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    public NotificationService(NotificationRepository notificationRepository,
            UserRepository userRepository, EntityMapper mapper) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(mapper::toNotificationDTO);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponseDTO markAsRead(Long id) {
        Notification n = Objects.requireNonNull(notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id)));
        n.setRead(true);
        return mapper.toNotificationDTO(Objects.requireNonNull(notificationRepository.save(n)));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        var unread = notificationRepository.findUnreadByUserId(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void createNotification(User user, NotificationType type, String title, String message, Long referenceId) {
        if (user == null || user.getId() == null)
            return;
        // Check if user has disabled this notification type
        if (isNotificationDisabled(user, type))
            return;
        User managedUser = entityManager.getReference(User.class, user.getId());
        Notification n = Notification.builder().user(managedUser).type(type).title(title).message(message)
                .referenceId(referenceId).build();
        notificationRepository.save(n);
    }

    private boolean isNotificationDisabled(User user, NotificationType type) {
        String disabled = user.getDisabledNotifications();
        if (disabled == null || disabled.isBlank())
            return false;
        for (String d : disabled.split(",")) {
            if (d.trim().equalsIgnoreCase(type.name()))
                return true;
        }
        return false;
    }

    @Transactional
    public void updatePreferences(User user, java.util.List<String> disabledTypes) {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new com.sliit.smartcampus.exception.ResourceNotFoundException("User not found"));
        if (disabledTypes == null || disabledTypes.isEmpty()) {
            managed.setDisabledNotifications(null);
        } else {
            managed.setDisabledNotifications(String.join(",", disabledTypes));
        }
        userRepository.save(managed);
    }

    @Transactional(readOnly = true)
    public java.util.List<String> getDisabledTypes(User user) {
        String disabled = user.getDisabledNotifications();
        if (disabled == null || disabled.isBlank())
            return java.util.Collections.emptyList();
        return java.util.Arrays.asList(disabled.split(","));
    }
}