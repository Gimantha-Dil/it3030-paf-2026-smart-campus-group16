package com.sliit.smartcampus.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sliit.smartcampus.dto.response.UserResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.NotificationRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, EntityMapper mapper,
            TicketRepository ticketRepository, BookingRepository bookingRepository,
            NotificationRepository notificationRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getAllUsers(UserRole role, String search, String userType, boolean academicStaff,
            @NonNull Pageable pageable) {
        if (search != null && !search.isBlank())
            return userRepository.searchUsers(search, pageable).map(mapper::toUserDTO);
        if (academicStaff)
            return userRepository.findAcademicStaff(pageable).map(mapper::toUserDTO);
        if (userType != null && !userType.isBlank())
            return userRepository.findByUserType(userType, pageable).map(mapper::toUserDTO);
        if (role != null)
            return userRepository.findByRole(role, pageable).map(mapper::toUserDTO);
        return userRepository.findAll(pageable).map(mapper::toUserDTO);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapper.toUserDTO(user);
    }

    @Transactional
    public UserResponseDTO updateRole(@NonNull Long id, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setRole(role);
        return mapper.toUserDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        // Null out assigned_to on tickets assigned to this user (targeted query)
        ticketRepository.unassignUser(id);
        // Delete user's notifications, bookings via cascade on User entity
        // (cascadeAll set on User.notifications and User.bookings)
        // But we delete them explicitly to avoid FK issues on non-cascaded refs
        notificationRepository.deleteByUserId(id);
        bookingRepository.deleteByUserId(id);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getPendingStaff(@NonNull Pageable pageable) {
        return userRepository.findPendingStaff(pageable).map(mapper::toUserDTO);
    }

    @Transactional
    public UserResponseDTO approveStaff(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (user.getRole() != com.sliit.smartcampus.enums.UserRole.PENDING_STAFF)
            throw new com.sliit.smartcampus.exception.InvalidOperationException("User is not pending staff approval");
        String approvedRole = (user.getRequestedRole() != null ? user.getRequestedRole()
                : com.sliit.smartcampus.enums.UserRole.TECHNICIAN).name();
        user.setRole(user.getRequestedRole() != null ? user.getRequestedRole()
                : com.sliit.smartcampus.enums.UserRole.TECHNICIAN);
        user.setRequestedRole(null);
        UserResponseDTO result = mapper.toUserDTO(userRepository.save(user));
        emailService.sendStaffApprovedEmail(user.getEmail(), user.getName(), approvedRole);
        return result;
    }

    @Transactional
    public UserResponseDTO rejectStaff(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (user.getRole() != com.sliit.smartcampus.enums.UserRole.PENDING_STAFF)
            throw new com.sliit.smartcampus.exception.InvalidOperationException("User is not pending staff approval");
        String rejectedRole = user.getRequestedRole() != null ? user.getRequestedRole().name() : "TECHNICIAN";
        user.setRole(com.sliit.smartcampus.enums.UserRole.USER);
        user.setRequestedRole(null);
        UserResponseDTO result = mapper.toUserDTO(userRepository.save(user));
        emailService.sendStaffRejectedEmail(user.getEmail(), user.getName(), rejectedRole);
        return result;
    }
}
