package com.sliit.smartcampus.dto.request;

import jakarta.validation.constraints.*;

public class TicketAssignDTO {
    @NotNull(message = "Technician ID is required")
    @Positive(message = "Technician ID must be a positive number")
    private Long technicianId;

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long v) { this.technicianId = v; }
}
