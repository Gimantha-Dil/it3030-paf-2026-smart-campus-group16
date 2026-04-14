package com.sliit.smartcampus.dto.request;

import jakarta.validation.constraints.*;

public class LoginRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v != null ? v.trim().toLowerCase() : null; }
    public String getPassword() { return password; }
    public void setPassword(String v) { this.password = v; }
}
