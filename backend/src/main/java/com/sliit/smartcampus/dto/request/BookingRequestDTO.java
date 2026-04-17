package com.sliit.smartcampus.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class BookingRequestDTO {
    @NotNull(message = "Resource is required")
    private Long resourceId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(min = 10, max = 500, message = "Purpose must be between 10 and 500 characters")
    private String purpose;

    @Min(value = 1, message = "Attendees must be at least 1")
    @Max(value = 1000, message = "Attendees cannot exceed 1000")
    private Integer attendees;

    public Long getResourceId() { return resourceId; } public void setResourceId(Long v) { this.resourceId = v; }
    public LocalDateTime getStartTime() { return startTime; } public void setStartTime(LocalDateTime v) { this.startTime = v; }
    public LocalDateTime getEndTime() { return endTime; } public void setEndTime(LocalDateTime v) { this.endTime = v; }
    public String getPurpose() { return purpose; } public void setPurpose(String v) { this.purpose = v != null ? v.trim() : null; }
    public Integer getAttendees() { return attendees; } public void setAttendees(Integer v) { this.attendees = v; }
}
