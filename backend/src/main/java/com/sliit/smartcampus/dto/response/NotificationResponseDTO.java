package com.sliit.smartcampus.dto.response;
import com.sliit.smartcampus.enums.NotificationType;
import java.time.LocalDateTime;
public class NotificationResponseDTO {
    private Long id; private String title; private String message; private NotificationType type;
    private Long referenceId; private boolean read; private LocalDateTime createdAt;
    public Long getId() { return id; } public void setId(Long v) { this.id = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getMessage() { return message; } public void setMessage(String v) { this.message = v; }
    public NotificationType getType() { return type; } public void setType(NotificationType v) { this.type = v; }
    public Long getReferenceId() { return referenceId; } public void setReferenceId(Long v) { this.referenceId = v; }
    public boolean isRead() { return read; } public void setRead(boolean v) { this.read = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final NotificationResponseDTO d = new NotificationResponseDTO();
        public Builder id(Long v) { d.id = v; return this; } public Builder title(String v) { d.title = v; return this; }
        public Builder message(String v) { d.message = v; return this; } public Builder type(NotificationType v) { d.type = v; return this; }
        public Builder referenceId(Long v) { d.referenceId = v; return this; } public Builder read(boolean v) { d.read = v; return this; }
        public Builder createdAt(LocalDateTime v) { d.createdAt = v; return this; } public NotificationResponseDTO build() { return d; }
    }
}
