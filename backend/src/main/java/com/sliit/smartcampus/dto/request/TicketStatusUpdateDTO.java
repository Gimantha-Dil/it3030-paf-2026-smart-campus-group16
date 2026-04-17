package com.sliit.smartcampus.dto.request;

import com.sliit.smartcampus.enums.TicketStatus;
import jakarta.validation.constraints.*;

public class TicketStatusUpdateDTO {
    @NotNull(message = "Status is required")
    private TicketStatus status;

    @Size(max = 500, message = "Rejection reason cannot exceed 500 characters")
    private String rejectionReason;

    @Size(max = 2000, message = "Resolution notes cannot exceed 2000 characters")
    private String resolutionNotes;

    public TicketStatus getStatus() { return status; } public void setStatus(TicketStatus v) { this.status = v; }
    public String getRejectionReason() { return rejectionReason; } public void setRejectionReason(String v) { this.rejectionReason = v; }
    public String getResolutionNotes() { return resolutionNotes; } public void setResolutionNotes(String v) { this.resolutionNotes = v; }
}
