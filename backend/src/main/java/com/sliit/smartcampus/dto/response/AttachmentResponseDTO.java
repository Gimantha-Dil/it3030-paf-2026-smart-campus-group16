package com.sliit.smartcampus.dto.response;
import java.time.LocalDateTime;
public class AttachmentResponseDTO {
    private Long id; private String fileName; private String filePath; private String fileType; private Long fileSize; private LocalDateTime uploadedAt;
    public Long getId() { return id; } public void setId(Long v) { this.id = v; }
    public String getFileName() { return fileName; } public void setFileName(String v) { this.fileName = v; }
    public String getFilePath() { return filePath; } public void setFilePath(String v) { this.filePath = v; }
    public String getFileType() { return fileType; } public void setFileType(String v) { this.fileType = v; }
    public Long getFileSize() { return fileSize; } public void setFileSize(Long v) { this.fileSize = v; }
    public LocalDateTime getUploadedAt() { return uploadedAt; } public void setUploadedAt(LocalDateTime v) { this.uploadedAt = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final AttachmentResponseDTO d = new AttachmentResponseDTO();
        public Builder id(Long v) { d.id = v; return this; } public Builder fileName(String v) { d.fileName = v; return this; }
        public Builder filePath(String v) { d.filePath = v; return this; } public Builder fileType(String v) { d.fileType = v; return this; }
        public Builder fileSize(Long v) { d.fileSize = v; return this; } public Builder uploadedAt(LocalDateTime v) { d.uploadedAt = v; return this; }
        public AttachmentResponseDTO build() { return d; }
    }
}

