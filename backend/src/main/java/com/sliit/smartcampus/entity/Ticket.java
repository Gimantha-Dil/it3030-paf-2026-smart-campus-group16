package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enums.*;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "tickets")
public class Ticket extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "resource_id") private Resource resource;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User reporter;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assigned_to") private User assignedTo;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private TicketCategory category;
    @Column(length = 150) private String title;
    @Column(columnDefinition = "TEXT", nullable = false) private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private TicketPriority priority;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private TicketStatus status = TicketStatus.OPEN;
    private String contactDetails;
    @Column(columnDefinition = "TEXT") private String rejectionReason;
    @Column(columnDefinition = "TEXT") private String resolutionNotes;
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true) private List<TicketAttachment> attachments = new ArrayList<>();
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true) private List<Comment> comments = new ArrayList<>();

    public Ticket() {}
    public Resource getResource() { return resource; } public void setResource(Resource v) { this.resource = v; }
    public User getReporter() { return reporter; } public void setReporter(User v) { this.reporter = v; }
    public User getAssignedTo() { return assignedTo; } public void setAssignedTo(User v) { this.assignedTo = v; }
    public TicketCategory getCategory() { return category; } public void setCategory(TicketCategory v) { this.category = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public TicketPriority getPriority() { return priority; } public void setPriority(TicketPriority v) { this.priority = v; }
    public TicketStatus getStatus() { return status; } public void setStatus(TicketStatus v) { this.status = v; }
    public String getContactDetails() { return contactDetails; } public void setContactDetails(String v) { this.contactDetails = v; }
    public String getRejectionReason() { return rejectionReason; } public void setRejectionReason(String v) { this.rejectionReason = v; }
    public String getResolutionNotes() { return resolutionNotes; } public void setResolutionNotes(String v) { this.resolutionNotes = v; }
    public List<TicketAttachment> getAttachments() { return attachments; } public void setAttachments(List<TicketAttachment> v) { this.attachments = v; }
    public List<Comment> getComments() { return comments; } public void setComments(List<Comment> v) { this.comments = v; }

    public static TicketBuilder builder() { return new TicketBuilder(); }
    public static class TicketBuilder {
        private final Ticket t = new Ticket();
        public TicketBuilder resource(Resource v) { t.resource = v; return this; }
        public TicketBuilder reporter(User v) { t.reporter = v; return this; }
        public TicketBuilder category(TicketCategory v) { t.category = v; return this; }
        public TicketBuilder title(String v) { t.title = v; return this; }
        public TicketBuilder description(String v) { t.description = v; return this; }
        public TicketBuilder priority(TicketPriority v) { t.priority = v; return this; }
        public TicketBuilder status(TicketStatus v) { t.status = v; return this; }
        public TicketBuilder contactDetails(String v) { t.contactDetails = v; return this; }
        public TicketBuilder attachments(List<TicketAttachment> v) { t.attachments = v; return this; }
        public TicketBuilder comments(List<Comment> v) { t.comments = v; return this; }
        public Ticket build() { return t; }
    }
}
