package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enums.NotificationType;
import jakarta.persistence.*;

@Entity @Table(name = "notifications", indexes = @Index(name = "idx_notif_user_read", columnList = "user_id,is_read"))
public class Notification extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String message;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private NotificationType type;
    private Long referenceId;
    @Column(name = "is_read") private boolean isRead = false;

    public Notification() {}
    public User getUser() { return user; } public void setUser(User v) { this.user = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getMessage() { return message; } public void setMessage(String v) { this.message = v; }
    public NotificationType getType() { return type; } public void setType(NotificationType v) { this.type = v; }
    public Long getReferenceId() { return referenceId; } public void setReferenceId(Long v) { this.referenceId = v; }
    public boolean isRead() { return isRead; } public void setRead(boolean v) { this.isRead = v; }

    public static NotificationBuilder builder() { return new NotificationBuilder(); }
    public static class NotificationBuilder {
        private final Notification n = new Notification();
        public NotificationBuilder user(User v) { n.user = v; return this; }
        public NotificationBuilder type(NotificationType v) { n.type = v; return this; }
        public NotificationBuilder title(String v) { n.title = v; return this; }
        public NotificationBuilder message(String v) { n.message = v; return this; }
        public NotificationBuilder referenceId(Long v) { n.referenceId = v; return this; }
        public NotificationBuilder isRead(boolean v) { n.isRead = v; return this; }
        public Notification build() { return n; }
    }
}
