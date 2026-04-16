package com.sliit.smartcampus.dto.request;

import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import jakarta.validation.constraints.*;
import java.time.LocalTime;

public class ResourceRequestDTO {
    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 10000, message = "Capacity cannot exceed 10,000")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 150, message = "Location must be between 2 and 150 characters")
    private String location;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private ResourceStatus status;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;

    public String getName() { return name; } public void setName(String v) { this.name = v != null ? v.trim() : null; }
    public ResourceType getType() { return type; } public void setType(ResourceType v) { this.type = v; }
    public Integer getCapacity() { return capacity; } public void setCapacity(Integer v) { this.capacity = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v != null ? v.trim() : null; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v != null ? v.trim() : null; }
    public ResourceStatus getStatus() { return status; } public void setStatus(ResourceStatus v) { this.status = v; }
    public LocalTime getAvailabilityStart() { return availabilityStart; } public void setAvailabilityStart(LocalTime v) { this.availabilityStart = v; }
    public LocalTime getAvailabilityEnd() { return availabilityEnd; } public void setAvailabilityEnd(LocalTime v) { this.availabilityEnd = v; }
}
