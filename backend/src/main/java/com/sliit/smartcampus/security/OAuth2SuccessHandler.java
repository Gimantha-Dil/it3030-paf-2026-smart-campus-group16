package com.sliit.smartcampus.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.smartcampus.dto.response.AuthResponseDTO;
import com.sliit.smartcampus.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2SuccessHandler(AuthService authService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Detect which provider was used
        String provider = "google";
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            provider = oauthToken.getAuthorizedClientRegistrationId(); // "google", "microsoft", "facebook"
        }

        AuthResponseDTO authResponse = authService.authenticateWithOAuth2(oAuth2User.getAttributes(), provider);
        String token = authResponse.getToken();
        String userJson = URLEncoder.encode(objectMapper.writeValueAsString(authResponse.getUser()),
                StandardCharsets.UTF_8);
        boolean isNew = authResponse.isNewUser();
        String redirectUrl = frontendUrl.split(",")[0] + "/oauth2/callback?token=" + token + "&user=" + userJson
                + "&isNewUser=" + isNew;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}