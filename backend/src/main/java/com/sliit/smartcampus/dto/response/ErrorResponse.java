package com.sliit.smartcampus.dto.response;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private int status; private String error; private String message; private LocalDateTime timestamp; private String path; private Map<String, String> validationErrors;
    public int getStatus() { return status; } public void setStatus(int v) { this.status = v; }
    public String getError() { return error; } public void setError(String v) { this.error = v; }
    public String getMessage() { return message; } public void setMessage(String v) { this.message = v; }
    public LocalDateTime getTimestamp() { return timestamp; } public void setTimestamp(LocalDateTime v) { this.timestamp = v; }
    public String getPath() { return path; } public void setPath(String v) { this.path = v; }
    public Map<String, String> getValidationErrors() { return validationErrors; } public void setValidationErrors(Map<String, String> v) { this.validationErrors = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final ErrorResponse d = new ErrorResponse();
        public Builder status(int v) { d.status = v; return this; } public Builder error(String v) { d.error = v; return this; }
        public Builder message(String v) { d.message = v; return this; } public Builder timestamp(LocalDateTime v) { d.timestamp = v; return this; }
        public Builder path(String v) { d.path = v; return this; } public Builder validationErrors(Map<String, String> v) { d.validationErrors = v; return this; }
        public ErrorResponse build() { return d; }
    }
}
