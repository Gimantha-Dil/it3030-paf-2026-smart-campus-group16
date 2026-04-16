package com.sliit.smartcampus.dto.response;
import com.sliit.smartcampus.enums.*;
import java.time.LocalDateTime;
import java.util.List;
public class TicketResponseDTO {
    private Long id; private ResourceResponseDTO resource; private UserResponseDTO reporter; private UserResponseDTO assignedTo;
    private TicketCategory category; private String title; private String description; private TicketPriority priority; private TicketStatus status;
    private String contactDetails; private String rejectionReason; private String resolutionNotes;
    private int attachmentCount; private List<AttachmentResponseDTO> attachments; private int commentCount; private List<CommentResponseDTO> comments;
    private LocalDateTime createdAt; private LocalDateTime updatedAt;
    public Long getId() { return id; } public void setId(Long v) { this.id = v; }
    public ResourceResponseDTO getResource() { return resource; } public void setResource(ResourceResponseDTO v) { this.resource = v; }
    public UserResponseDTO getReporter() { return reporter; } public void setReporter(UserResponseDTO v) { this.reporter = v; }
    public UserResponseDTO getAssignedTo() { return assignedTo; } public void setAssignedTo(UserResponseDTO v) { this.assignedTo = v; }
    public TicketCategory getCategory() { return category; } public void setCategory(TicketCategory v) { this.category = v; }
    public String getTitle() { return title; } public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { this.description = v; }
    public TicketPriority getPriority() { return priority; } public void setPriority(TicketPriority v) { this.priority = v; }
    public TicketStatus getStatus() { return status; } public void setStatus(TicketStatus v) { this.status = v; }
    public String getContactDetails() { return contactDetails; } public void setContactDetails(String v) { this.contactDetails = v; }
    public String getRejectionReason() { return rejectionReason; } public void setRejectionReason(String v) { this.rejectionReason = v; }
    public String getResolutionNotes() { return resolutionNotes; } public void setResolutionNotes(String v) { this.resolutionNotes = v; }
    public int getAttachmentCount() { return attachmentCount; } public void setAttachmentCount(int v) { this.attachmentCount = v; }
    public List<AttachmentResponseDTO> getAttachments() { return attachments; } public void setAttachments(List<AttachmentResponseDTO> v) { this.attachments = v; }
    public int getCommentCount() { return commentCount; } public void setCommentCount(int v) { this.commentCount = v; }
    public List<CommentResponseDTO> getComments() { return comments; } public void setComments(List<CommentResponseDTO> v) { this.comments = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final TicketResponseDTO d = new TicketResponseDTO();
        public Builder id(Long v) { d.id = v; return this; } public Builder resource(ResourceResponseDTO v) { d.resource = v; return this; }
        public Builder reporter(UserResponseDTO v) { d.reporter = v; return this; } public Builder assignedTo(UserResponseDTO v) { d.assignedTo = v; return this; }
        public Builder category(TicketCategory v) { d.category = v; return this; } public Builder title(String v) { d.title = v; return this; } public Builder description(String v) { d.description = v; return this; }
        public Builder priority(TicketPriority v) { d.priority = v; return this; } public Builder status(TicketStatus v) { d.status = v; return this; }
        public Builder contactDetails(String v) { d.contactDetails = v; return this; } public Builder rejectionReason(String v) { d.rejectionReason = v; return this; }
        public Builder resolutionNotes(String v) { d.resolutionNotes = v; return this; } public Builder attachmentCount(int v) { d.attachmentCount = v; return this; }
        public Builder attachments(List<AttachmentResponseDTO> v) { d.attachments = v; return this; } public Builder commentCount(int v) { d.commentCount = v; return this; }
        public Builder comments(List<CommentResponseDTO> v) { d.comments = v; return this; } public Builder createdAt(LocalDateTime v) { d.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { d.updatedAt = v; return this; } public TicketResponseDTO build() { return d; }
    }
}
