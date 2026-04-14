package com.sliit.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.sliit.smartcampus.security.CustomOAuth2UserService;
import com.sliit.smartcampus.security.JwtAuthenticationFilter;
import com.sliit.smartcampus.security.OAuth2SuccessHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final CorsConfigurationSource corsConfigurationSource;
        private final OAuth2SuccessHandler oAuth2SuccessHandler;
        private final CustomOAuth2UserService customOAuth2UserService;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                        CorsConfigurationSource corsConfigurationSource,
                        OAuth2SuccessHandler oAuth2SuccessHandler,
                        CustomOAuth2UserService customOAuth2UserService) {
                this.jwtAuthFilter = jwtAuthFilter;
                this.corsConfigurationSource = corsConfigurationSource;
                this.oAuth2SuccessHandler = oAuth2SuccessHandler;
                this.customOAuth2UserService = customOAuth2UserService;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/v1/auth/**").permitAll()
                                                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                                                .requestMatchers("/uploads/**").permitAll()
                                                .requestMatchers("/error").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/resources/**").authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/v1/resources/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/resources/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/resources/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/resources/**")
                                                .hasRole("ADMIN")
                                                // Bookings — TECHNICIAN can GET & POST (maintenance bookings); cannot
                                                // approve/review
                                                .requestMatchers(HttpMethod.GET, "/api/v1/bookings/**")
                                                .hasAnyRole("ADMIN", "USER", "TECHNICIAN", "LECTURER", "LAB_ASSISTANT")
                                                .requestMatchers(HttpMethod.POST, "/api/v1/bookings/**")
                                                .hasAnyRole("ADMIN", "USER", "TECHNICIAN", "LECTURER", "LAB_ASSISTANT")
                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/review")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/cancel")
                                                .hasAnyRole("ADMIN", "USER", "TECHNICIAN", "LECTURER", "LAB_ASSISTANT")
                                                // Tickets — TECHNICIAN can view and update status of assigned tickets;
                                                // only ADMIN can assign
                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/tickets/*/assign")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/tickets/*/status")
                                                .hasAnyRole("ADMIN", "TECHNICIAN", "LECTURER", "LAB_ASSISTANT")
                                                .requestMatchers(HttpMethod.GET, "/api/v1/tickets/**")
                                                .hasAnyRole("ADMIN", "USER", "TECHNICIAN", "LECTURER", "LAB_ASSISTANT")
                                                .requestMatchers(HttpMethod.POST, "/api/v1/tickets/**")
                                                .hasAnyRole("ADMIN", "USER", "LECTURER", "LAB_ASSISTANT")
                                                .requestMatchers("/api/v1/notifications/preferences").authenticated()
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/me").authenticated()
                                                .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2SuccessHandler))
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }
}