package com.sliit.smartcampus.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sliit.smartcampus.enums.UserRole;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String name;
    private String password;
    private String avatarUrl;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role = UserRole.USER;
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private UserRole requestedRole;
    private String userType; // STUDENT | GENERAL_STAFF (display label for USER role)
    // Comma-separated disabled notification types e.g.
    // "BOOKING_APPROVED,TICKET_COMMENT"
    @Column(length = 500)
    private String disabledNotifications;
    private String provider;
    private String providerId;
    private String passwordResetToken;
    private LocalDateTime passwordResetExpiry;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private final List<Booking> bookings = new ArrayList<>();
    @OneToMany(mappedBy = "reporter", cascade = CascadeType.ALL)
    private final List<Ticket> reportedTickets = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private final List<Notification> notifications = new ArrayList<>();

    public User() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String v) {
        this.email = v;
    }

    public String getName() {
        return name;
    }

    public void setName(String v) {
        this.name = v;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String v) {
        this.password = v;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String v) {
        this.avatarUrl = v;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole v) {
        this.role = v;
    }

    public UserRole getRequestedRole() {
        return requestedRole;
    }

    public void setRequestedRole(UserRole v) {
        this.requestedRole = v;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String v) {
        this.userType = v;
    }

    public String getDisabledNotifications() {
        return disabledNotifications;
    }

    public void setDisabledNotifications(String v) {
        this.disabledNotifications = v;
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public List<Ticket> getReportedTickets() {
        return reportedTickets;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String v) {
        this.provider = v;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String v) {
        this.providerId = v;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String v) {
        this.passwordResetToken = v;
    }

    public LocalDateTime getPasswordResetExpiry() {
        return passwordResetExpiry;
    }

    public void setPasswordResetExpiry(LocalDateTime v) {
        this.passwordResetExpiry = v;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private final User u = new User();

        public UserBuilder email(String v) {
            u.email = v;
            return this;
        }

        public UserBuilder name(String v) {
            u.name = v;
            return this;
        }

        public UserBuilder password(String v) {
            u.password = v;
            return this;
        }

        public UserBuilder avatarUrl(String v) {
            u.avatarUrl = v;
            return this;
        }

        public UserBuilder role(UserRole v) {
            u.role = v;
            return this;
        }

        public UserBuilder requestedRole(UserRole v) {
            u.requestedRole = v;
            return this;
        }

        public UserBuilder userType(String v) {
            u.userType = v;
            return this;
        }

        public UserBuilder provider(String v) {
            u.provider = v;
            return this;
        }

        public UserBuilder providerId(String v) {
            u.providerId = v;
            return this;
        }

        public User build() {
            return u;
        }
    }
}