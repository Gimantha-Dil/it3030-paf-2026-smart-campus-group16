package com.sliit.smartcampus.service;

import java.util.Map;
import java.util.Objects;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sliit.smartcampus.dto.request.LoginRequestDTO;
import com.sliit.smartcampus.dto.request.RegisterRequestDTO;
import com.sliit.smartcampus.dto.response.AuthResponseDTO;
import com.sliit.smartcampus.dto.response.UserResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.InvalidOperationException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.security.JwtTokenProvider;

@SuppressWarnings("null")
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final EntityMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider,
            EntityMapper mapper, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail()))
            throw new InvalidOperationException("Email already in use: " + dto.getEmail());
        boolean wantsStaff = dto.getRequestedRole() == UserRole.TECHNICIAN
                || dto.getRequestedRole() == UserRole.LECTURER
                || dto.getRequestedRole() == UserRole.LAB_ASSISTANT;
        // Determine userType label (STUDENT / GENERAL_STAFF) for USER role accounts
        String userType = null;
        if (!wantsStaff && dto.getUserType() != null)
            userType = dto.getUserType();

        User user = User.builder()
                .email(dto.getEmail()).name(dto.getName())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(wantsStaff ? UserRole.PENDING_STAFF : UserRole.USER)
                .requestedRole(wantsStaff ? dto.getRequestedRole() : null)
                .userType(userType)
                .provider("local").build();
        User saved = Objects.requireNonNull(userRepository.save(user));
        // Send welcome email async
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), saved.getRole().name());
        return buildAuthResponse(saved);
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new InvalidOperationException("Invalid email or password"));
        if (user.getPassword() == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword()))
            throw new InvalidOperationException("Invalid email or password");
        return buildAuthResponse(user);
    }

    // Keep old Google method for backward compatibility
    @Transactional
    public AuthResponseDTO authenticateWithGoogle(Map<String, Object> googleUserInfo) {
        return authenticateWithOAuth2(googleUserInfo, "google");
    }

    // Universal OAuth2 method — Google, Microsoft, Facebook
    @Transactional
    public AuthResponseDTO authenticateWithOAuth2(Map<String, Object> attributes, String provider) {
        // Use final local variables — required for lambda expressions
        final String resolvedEmail;
        final String resolvedName;
        final String resolvedPicture;
        final String resolvedProviderId;

        switch (provider) {
            case "facebook" -> {
                resolvedEmail = (String) attributes.get("email");
                resolvedName = (String) attributes.getOrDefault("name", resolvedEmail);
                resolvedPicture = null;
                resolvedProviderId = (String) attributes.get("id");
            }
            case "microsoft" -> {
                String msEmail = (String) attributes.get("email");
                if (msEmail == null)
                    msEmail = (String) attributes.get("preferred_username");
                resolvedEmail = msEmail;
                resolvedName = (String) attributes.getOrDefault("name", resolvedEmail);
                resolvedPicture = null;
                resolvedProviderId = (String) attributes.get("sub");
            }
            default -> { // google
                resolvedEmail = (String) attributes.get("email");
                resolvedName = (String) attributes.getOrDefault("name", resolvedEmail);
                resolvedPicture = (String) attributes.get("picture");
                resolvedProviderId = (String) attributes.get("sub");
            }
        }

        if (resolvedEmail == null)
            throw new InvalidOperationException(
                    "Email not provided by " + provider + ". Please ensure your account has a public email.");

        final String finalProvider = provider;

        final boolean[] isNewUser = { false };
        User user = userRepository.findByEmail(resolvedEmail).orElseGet(() -> {
            isNewUser[0] = true;
            return Objects.requireNonNull(userRepository.save(User.builder()
                    .email(resolvedEmail)
                    .name(resolvedName != null ? resolvedName : resolvedEmail)
                    .avatarUrl(resolvedPicture)
                    .role(UserRole.USER)
                    .provider(finalProvider)
                    .providerId(resolvedProviderId)
                    .build()));
        });

        if (resolvedName != null)
            user.setName(resolvedName);
        if (resolvedPicture != null)
            user.setAvatarUrl(resolvedPicture);

        User saved = Objects.requireNonNull(userRepository.save(user));
        // Send welcome email only for newly registered OAuth users
        if (isNewUser[0]) {
            emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), saved.getRole().name());
        }
        return buildAuthResponseWithNewUser(saved, isNewUser[0]);
    }

    private AuthResponseDTO buildAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(user);
        UserResponseDTO userDTO = mapper.toUserDTO(user);
        return AuthResponseDTO.builder().token(token).tokenType("Bearer").user(userDTO).build();
    }

    private AuthResponseDTO buildAuthResponseWithNewUser(User user, boolean isNewUser) {
        String token = jwtTokenProvider.generateToken(user);
        UserResponseDTO userDTO = mapper.toUserDTO(user);
        return AuthResponseDTO.builder().token(token).tokenType("Bearer").user(userDTO).isNewUser(isNewUser).build();
    }
}