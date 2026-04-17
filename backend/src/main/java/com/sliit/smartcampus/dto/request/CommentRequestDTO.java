package com.sliit.smartcampus.dto.request;

import jakarta.validation.constraints.*;

public class CommentRequestDTO {
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 2000, message = "Comment must be between 1 and 2000 characters")
    private String content;

    public String getContent() { return content; }
    public void setContent(String v) { this.content = v != null ? v.trim() : null; }
}
