package com.sliit.smartcampus.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Custom OAuth2 user service that handles user info loading for all providers.
 * For Microsoft, it fetches additional profile data from MS Graph API.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // For Microsoft, enrich with Graph API data if email is missing
        if ("microsoft".equals(registrationId)) {
            Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());

            // Microsoft sometimes returns email in 'preferred_username' instead of 'email'
            if (!attributes.containsKey("email") && attributes.containsKey("preferred_username")) {
                attributes.put("email", attributes.get("preferred_username"));
            }

            // Try to get display name from MS Graph if missing
            if (!attributes.containsKey("name") || attributes.get("name") == null) {
                String givenName  = (String) attributes.getOrDefault("given_name",  "");
                String familyName = (String) attributes.getOrDefault("family_name", "");
                String fullName   = (givenName + " " + familyName).trim();
                if (!fullName.isEmpty()) {
                    attributes.put("name", fullName);
                } else if (attributes.containsKey("email")) {
                    attributes.put("name", attributes.get("email"));
                }
            }

            // Return enriched user with the same authorities
            return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                attributes,
                "sub"
            );
        }

        return oAuth2User;
    }
}
