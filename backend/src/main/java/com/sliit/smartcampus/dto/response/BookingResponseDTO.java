package com.sliit.smartcampus.dto.response;
import com.sliit.smartcampus.enums.BookingStatus;
import java.time.LocalDateTime;
public class BookingResponseDTO {
    private Long id; private ResourceResponseDTO resource; private UserResponseDTO user; private LocalDateTime startTime;
    private LocalDateTime endTime; private String purpose; private Integer attendees; private BookingStatus status;
    private String adminReason; private UserResponseDTO reviewedBy; private LocalDateTime createdAt; private LocalDateTime updatedAt;
    public Long getId() { return id; } public void setId(Long v) { this.id = v; }
    public ResourceResponseDTO getResource() { return resource; } public void setResource(ResourceResponseDTO v) { this.resource = v; }
    public UserResponseDTO getUser() { return user; } public void setUser(UserResponseDTO v) { this.user = v; }
    public LocalDateTime getStartTime() { return startTime; } public void setStartTime(LocalDateTime v) { this.startTime = v; }
    public LocalDateTime getEndTime() { return endTime; } public void setEndTime(LocalDateTime v) { this.endTime = v; }
    public String getPurpose() { return purpose; } public void setPurpose(String v) { this.purpose = v; }
    public Integer getAttendees() { return attendees; } public void setAttendees(Integer v) { this.attendees = v; }
    public BookingStatus getStatus() { return status; } public void setStatus(BookingStatus v) { this.status = v; }
    public String getAdminReason() { return adminReason; } public void setAdminReason(String v) { this.adminReason = v; }
    public UserResponseDTO getReviewedBy() { return reviewedBy; } public void setReviewedBy(UserResponseDTO v) { this.reviewedBy = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final BookingResponseDTO d = new BookingResponseDTO();
        public Builder id(Long v) { d.id = v; return this; } public Builder resource(ResourceResponseDTO v) { d.resource = v; return this; }
        public Builder user(UserResponseDTO v) { d.user = v; return this; } public Builder startTime(LocalDateTime v) { d.startTime = v; return this; }
        public Builder endTime(LocalDateTime v) { d.endTime = v; return this; } public Builder purpose(String v) { d.purpose = v; return this; }
        public Builder attendees(Integer v) { d.attendees = v; return this; } public Builder status(BookingStatus v) { d.status = v; return this; }
        public Builder adminReason(String v) { d.adminReason = v; return this; } public Builder reviewedBy(UserResponseDTO v) { d.reviewedBy = v; return this; }
        public Builder createdAt(LocalDateTime v) { d.createdAt = v; return this; } public Builder updatedAt(LocalDateTime v) { d.updatedAt = v; return this; }
        public BookingResponseDTO build() { return d; }
    }
}
