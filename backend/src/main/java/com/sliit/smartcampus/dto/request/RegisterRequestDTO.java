package com.sliit.smartcampus.dto.request;

import jakarta.validation.constraints.*;
import com.sliit.smartcampus.enums.UserRole;

public class RegisterRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "Name can only contain letters, spaces, hyphens and apostrophes")
    private String name;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v != null ? v.trim().toLowerCase() : null; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v != null ? v.trim() : null; }
    public String getPassword() { return password; }
    public void setPassword(String v) { this.password = v; }

    private UserRole requestedRole;
    public UserRole getRequestedRole() { return requestedRole; }
    public void setRequestedRole(UserRole v) { this.requestedRole = v; }

    // Optional display label for USER role: STUDENT | GENERAL_STAFF
    private String userType;
    public String getUserType() { return userType; }
    public void setUserType(String v) { this.userType = v; }
}
