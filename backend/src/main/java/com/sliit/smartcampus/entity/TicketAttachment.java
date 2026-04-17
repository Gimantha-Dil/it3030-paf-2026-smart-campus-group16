package com.sliit.smartcampus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "ticket_attachments")
public class TicketAttachment extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_id", nullable = false) private Ticket ticket;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public TicketAttachment() {}
    public Ticket getTicket() { return ticket; } public void setTicket(Ticket v) { this.ticket = v; }
    public String getFileName() { return fileName; } public void setFileName(String v) { this.fileName = v; }
    public String getFilePath() { return filePath; } public void setFilePath(String v) { this.filePath = v; }
    public String getFileType() { return fileType; } public void setFileType(String v) { this.fileType = v; }
    public Long getFileSize() { return fileSize; } public void setFileSize(Long v) { this.fileSize = v; }
    public LocalDateTime getUploadedAt() { return uploadedAt; } public void setUploadedAt(LocalDateTime v) { this.uploadedAt = v; }

    public static TABuilder builder() { return new TABuilder(); }
    public static class TABuilder {
        private final TicketAttachment a = new TicketAttachment();
        public TABuilder ticket(Ticket v) { a.ticket = v; return this; }
        public TABuilder fileName(String v) { a.fileName = v; return this; }
        public TABuilder filePath(String v) { a.filePath = v; return this; }
        public TABuilder fileType(String v) { a.fileType = v; return this; }
        public TABuilder fileSize(Long v) { a.fileSize = v; return this; }
        public TicketAttachment build() { return a; }
    }
}
