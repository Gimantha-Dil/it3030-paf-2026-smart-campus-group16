package com.sliit.smartcampus.dto.response;

public class AuthResponseDTO {
    private String token;
    private String tokenType;
    private UserResponseDTO user;
    private boolean isNewUser;

    public String getToken() {
        return token;
    }

    public void setToken(String v) {
        this.token = v;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String v) {
        this.tokenType = v;
    }

    public UserResponseDTO getUser() {
        return user;
    }

    public void setUser(UserResponseDTO v) {
        this.user = v;
    }

    public boolean isNewUser() {
        return isNewUser;
    }

    public void setNewUser(boolean v) {
        this.isNewUser = v;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final AuthResponseDTO d = new AuthResponseDTO();

        public Builder token(String v) {
            d.token = v;
            return this;
        }

        public Builder tokenType(String v) {
            d.tokenType = v;
            return this;
        }

        public Builder user(UserResponseDTO v) {
            d.user = v;
            return this;
        }

        public Builder isNewUser(boolean v) {
            d.isNewUser = v;
            return this;
        }

        public AuthResponseDTO build() {
            return d;
        }
    }
}