package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enums.BookingStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "bookings", indexes = {
    @Index(name = "idx_booking_resource_time", columnList = "resource_id,startTime,endTime"),
    @Index(name = "idx_booking_user", columnList = "user_id"),
    @Index(name = "idx_booking_status", columnList = "status")
})
public class Booking extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "resource_id", nullable = false) private Resource resource;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(nullable = false) private LocalDateTime startTime;
    @Column(nullable = false) private LocalDateTime endTime;
    @Column(nullable = false) private String purpose;
    private Integer attendees;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private BookingStatus status = BookingStatus.PENDING;
    private String adminReason;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewed_by") private User reviewedBy;

    public Booking() {}
    public Resource getResource() { return resource; } public void setResource(Resource v) { this.resource = v; }
    public User getUser() { return user; } public void setUser(User v) { this.user = v; }
    public LocalDateTime getStartTime() { return startTime; } public void setStartTime(LocalDateTime v) { this.startTime = v; }
    public LocalDateTime getEndTime() { return endTime; } public void setEndTime(LocalDateTime v) { this.endTime = v; }
    public String getPurpose() { return purpose; } public void setPurpose(String v) { this.purpose = v; }
    public Integer getAttendees() { return attendees; } public void setAttendees(Integer v) { this.attendees = v; }
    public BookingStatus getStatus() { return status; } public void setStatus(BookingStatus v) { this.status = v; }
    public String getAdminReason() { return adminReason; } public void setAdminReason(String v) { this.adminReason = v; }
    public User getReviewedBy() { return reviewedBy; } public void setReviewedBy(User v) { this.reviewedBy = v; }

    public static BookingBuilder builder() { return new BookingBuilder(); }
    public static class BookingBuilder {
        private final Booking b = new Booking();
        public BookingBuilder resource(Resource v) { b.resource = v; return this; }
        public BookingBuilder user(User v) { b.user = v; return this; }
        public BookingBuilder startTime(LocalDateTime v) { b.startTime = v; return this; }
        public BookingBuilder endTime(LocalDateTime v) { b.endTime = v; return this; }
        public BookingBuilder purpose(String v) { b.purpose = v; return this; }
        public BookingBuilder attendees(Integer v) { b.attendees = v; return this; }
        public BookingBuilder status(BookingStatus v) { b.status = v; return this; }
        public Booking build() { return b; }
    }
}
