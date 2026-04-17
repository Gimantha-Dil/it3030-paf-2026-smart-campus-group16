package com.sliit.smartcampus.dto.response;
import java.time.LocalDateTime;
public class CommentResponseDTO {
    private Long id; private UserResponseDTO author; private String content; private LocalDateTime createdAt; private LocalDateTime updatedAt;
    public Long getId() { return id; } public void setId(Long v) { this.id = v; }
    public UserResponseDTO getAuthor() { return author; } public void setAuthor(UserResponseDTO v) { this.author = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final CommentResponseDTO d = new CommentResponseDTO();
        public Builder id(Long v) { d.id = v; return this; } public Builder author(UserResponseDTO v) { d.author = v; return this; }
        public Builder content(String v) { d.content = v; return this; } public Builder createdAt(LocalDateTime v) { d.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { d.updatedAt = v; return this; } public CommentResponseDTO build() { return d; }
    }
}
