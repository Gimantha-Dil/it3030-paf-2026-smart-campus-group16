package com.sliit.smartcampus.dto.request;

import com.sliit.smartcampus.enums.BookingStatus;
import jakarta.validation.constraints.*;

public class BookingReviewDTO {
    @NotNull(message = "Status is required")
    private BookingStatus status;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    public BookingStatus getStatus() { return status; } public void setStatus(BookingStatus v) { this.status = v; }
    public String getReason() { return reason; } public void setReason(String v) { this.reason = v != null ? v.trim() : null; }
}
