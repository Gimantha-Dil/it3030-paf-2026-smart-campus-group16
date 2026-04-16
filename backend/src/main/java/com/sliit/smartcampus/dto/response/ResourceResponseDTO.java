package com.sliit.smartcampus.dto.response;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import java.time.LocalDateTime;
import java.time.LocalTime;
public class ResourceResponseDTO {
    private Long id; private String name; private ResourceType type; private Integer capacity; private String location;
    private String description; private ResourceStatus status; private LocalTime availabilityStart; private LocalTime availabilityEnd;
    private LocalDateTime createdAt; private LocalDateTime updatedAt;
    public Long getId() { return id; } public void setId(Long v) { this.id = v; }
    public String getName() { return name; } public void setName(String v) { this.name = v; }
    public ResourceType getType() { return type; } public void setType(ResourceType v) { this.type = v; }
    public Integer getCapacity() { return capacity; } public void setCapacity(Integer v) { this.capacity = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public ResourceStatus getStatus() { return status; } public void setStatus(ResourceStatus v) { this.status = v; }
    public LocalTime getAvailabilityStart() { return availabilityStart; } public void setAvailabilityStart(LocalTime v) { this.availabilityStart = v; }
    public LocalTime getAvailabilityEnd() { return availabilityEnd; } public void setAvailabilityEnd(LocalTime v) { this.availabilityEnd = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final ResourceResponseDTO d = new ResourceResponseDTO();
        public Builder id(Long v) { d.id = v; return this; } public Builder name(String v) { d.name = v; return this; }
        public Builder type(ResourceType v) { d.type = v; return this; } public Builder capacity(Integer v) { d.capacity = v; return this; }
        public Builder location(String v) { d.location = v; return this; } public Builder description(String v) { d.description = v; return this; }
        public Builder status(ResourceStatus v) { d.status = v; return this; } public Builder availabilityStart(LocalTime v) { d.availabilityStart = v; return this; }
        public Builder availabilityEnd(LocalTime v) { d.availabilityEnd = v; return this; } public Builder createdAt(LocalDateTime v) { d.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { d.updatedAt = v; return this; } public ResourceResponseDTO build() { return d; }
    }
}
