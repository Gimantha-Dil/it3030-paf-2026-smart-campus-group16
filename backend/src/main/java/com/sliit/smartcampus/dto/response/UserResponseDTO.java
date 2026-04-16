package com.sliit.smartcampus.dto.response;
import com.sliit.smartcampus.enums.UserRole;
public class UserResponseDTO {
    private Long id; private String email; private String name; private String avatarUrl; private UserRole role;
    private UserRole requestedRole;
    private boolean pendingApproval;
    private String userType;
    public Long getId() { return id; } public void setId(Long v) { this.id = v; }
    public String getEmail() { return email; } public void setEmail(String v) { this.email = v; }
    public String getName() { return name; } public void setName(String v) { this.name = v; }
    public String getAvatarUrl() { return avatarUrl; } public void setAvatarUrl(String v) { this.avatarUrl = v; }
    public UserRole getRole() { return role; } public void setRole(UserRole v) { this.role = v; }
    public UserRole getRequestedRole() { return requestedRole; } public void setRequestedRole(UserRole v) { this.requestedRole = v; }
    public boolean isPendingApproval() { return pendingApproval; } public void setPendingApproval(boolean v) { this.pendingApproval = v; }
    public String getUserType() { return userType; } public void setUserType(String v) { this.userType = v; }
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final UserResponseDTO d = new UserResponseDTO();
        public Builder id(Long v) { d.id = v; return this; } public Builder email(String v) { d.email = v; return this; }
        public Builder name(String v) { d.name = v; return this; } public Builder avatarUrl(String v) { d.avatarUrl = v; return this; }
        public Builder role(UserRole v) { d.role = v; return this; }
        public Builder requestedRole(UserRole v) { d.requestedRole = v; return this; }
        public Builder pendingApproval(boolean v) { d.pendingApproval = v; return this; }
        public Builder userType(String v) { d.userType = v; return this; }
        public UserResponseDTO build() { return d; }
    }
}
