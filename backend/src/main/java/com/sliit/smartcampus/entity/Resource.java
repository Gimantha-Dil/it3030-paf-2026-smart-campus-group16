package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "resources")
public class Resource extends BaseEntity {
    @Column(nullable = false) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ResourceType type;
    private Integer capacity;
    @Column(nullable = false) private String location;
    @Column(columnDefinition = "TEXT") private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ResourceStatus status = ResourceStatus.ACTIVE;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL) private List<Booking> bookings = new ArrayList<>();

    public Resource() {}
    public String getName() { return name; } public void setName(String v) { this.name = v; }
    public ResourceType getType() { return type; } public void setType(ResourceType v) { this.type = v; }
    public Integer getCapacity() { return capacity; } public void setCapacity(Integer v) { this.capacity = v; }
    public String getLocation() { return location; } public void setLocation(String v) { this.location = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public ResourceStatus getStatus() { return status; } public void setStatus(ResourceStatus v) { this.status = v; }
    public LocalTime getAvailabilityStart() { return availabilityStart; } public void setAvailabilityStart(LocalTime v) { this.availabilityStart = v; }
    public LocalTime getAvailabilityEnd() { return availabilityEnd; } public void setAvailabilityEnd(LocalTime v) { this.availabilityEnd = v; }

    public static ResourceBuilder builder() { return new ResourceBuilder(); }
    public static class ResourceBuilder {
        private final Resource r = new Resource();
        public ResourceBuilder name(String v) { r.name = v; return this; }
        public ResourceBuilder type(ResourceType v) { r.type = v; return this; }
        public ResourceBuilder capacity(Integer v) { r.capacity = v; return this; }
        public ResourceBuilder location(String v) { r.location = v; return this; }
        public ResourceBuilder description(String v) { r.description = v; return this; }
        public ResourceBuilder status(ResourceStatus v) { r.status = v; return this; }
        public ResourceBuilder availabilityStart(LocalTime v) { r.availabilityStart = v; return this; }
        public ResourceBuilder availabilityEnd(LocalTime v) { r.availabilityEnd = v; return this; }
        public Resource build() { return r; }
    }
}
