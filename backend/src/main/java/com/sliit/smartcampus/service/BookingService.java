package com.sliit.smartcampus.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sliit.smartcampus.dto.request.BookingRequestDTO;
import com.sliit.smartcampus.dto.request.BookingReviewDTO;
import com.sliit.smartcampus.dto.response.BookingResponseDTO;
import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.BookingStatus;
import com.sliit.smartcampus.enums.NotificationType;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.BookingConflictException;
import com.sliit.smartcampus.exception.InvalidOperationException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.exception.UnauthorizedException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;

@SuppressWarnings("null")
@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final EntityMapper mapper;
    private final EmailService emailService;

    public BookingService(BookingRepository bookingRepository, ResourceRepository resourceRepository,
            NotificationService notificationService, EntityMapper mapper, EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
        this.emailService = emailService;
    }

    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
    private static final int MAX_BOOKING_HOURS = 12;
    private static final int MAX_ADVANCE_DAYS = 90;

    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getAll(User currentUser, BookingStatus status, Pageable pageable) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            if (status != null)
                return bookingRepository.findByStatus(status, pageable).map(mapper::toBookingDTO);
            return bookingRepository.findAllWithDetails(pageable).map(mapper::toBookingDTO);
        }
        if (status != null)
            return bookingRepository.findByUserIdAndStatus(currentUser.getId(), status, pageable)
                    .map(mapper::toBookingDTO);
        return bookingRepository.findByUserId(currentUser.getId(), pageable).map(mapper::toBookingDTO);
    }

    @Transactional(readOnly = true)
    public BookingResponseDTO getById(Long id) {
        return mapper.toBookingDTO(Objects.requireNonNull(bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id))));
    }

    public boolean hasConflict(Long resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        return !bookingRepository.findConflicting(resourceId, startTime, endTime, ACTIVE_STATUSES).isEmpty();
    }

    @Transactional
    public BookingResponseDTO create(BookingRequestDTO dto, User currentUser) {
        Resource resource = Objects.requireNonNull(resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.getResourceId())));

        // Role-based booking purpose validation
        UserRole role = currentUser.getRole();
        if (role == UserRole.TECHNICIAN) {
            if (dto.getPurpose() == null || !dto.getPurpose().toUpperCase().startsWith("MAINTENANCE:"))
                throw new InvalidOperationException(
                        "Technicians can only book for maintenance. Purpose must start with 'MAINTENANCE:'");
        } else if (role == UserRole.LECTURER) {
            if (dto.getPurpose() == null || !dto.getPurpose().toUpperCase().startsWith("LECTURE:") &&
                    !dto.getPurpose().toUpperCase().startsWith("MEETING:") &&
                    !dto.getPurpose().toUpperCase().startsWith("EXAM:"))
                throw new InvalidOperationException(
                        "Lecturers can book for LECTURE:, MEETING:, or EXAM: purposes only.");
        } else if (role == UserRole.LAB_ASSISTANT) {
            if (dto.getPurpose() == null || !dto.getPurpose().toUpperCase().startsWith("LAB:") &&
                    !dto.getPurpose().toUpperCase().startsWith("MAINTENANCE:"))
                throw new InvalidOperationException(
                        "Lab Assistants can book for LAB: or MAINTENANCE: purposes only.");
        }

        // Validate resource is active (TECHNICIAN & LAB_ASSISTANT can also book
        // OUT_OF_SERVICE for repair)
        boolean isMaintenanceStaff = role == UserRole.TECHNICIAN || role == UserRole.LAB_ASSISTANT;
        if (resource.getStatus() != ResourceStatus.ACTIVE && !isMaintenanceStaff)
            throw new InvalidOperationException("Resource '" + resource.getName() + "' is not available for booking");

        // Validate start time is not in the past
        if (dto.getStartTime().isBefore(LocalDateTime.now()))
            throw new InvalidOperationException("Booking start time cannot be in the past");

        // Validate end time is after start time
        if (!dto.getEndTime().isAfter(dto.getStartTime()))
            throw new InvalidOperationException("End time must be after start time");

        // Validate booking duration (max 12 hours)
        long durationHours = java.time.Duration.between(dto.getStartTime(), dto.getEndTime()).toHours();
        if (durationHours > MAX_BOOKING_HOURS)
            throw new InvalidOperationException("Booking duration cannot exceed " + MAX_BOOKING_HOURS + " hours");

        // Validate not too far in advance (max 90 days)
        if (dto.getStartTime().isAfter(LocalDateTime.now().plusDays(MAX_ADVANCE_DAYS)))
            throw new InvalidOperationException(
                    "Bookings cannot be made more than " + MAX_ADVANCE_DAYS + " days in advance");

        // Validate within resource availability hours
        if (resource.getAvailabilityStart() != null && resource.getAvailabilityEnd() != null) {
            LocalTime startT = dto.getStartTime().toLocalTime();
            LocalTime endT = dto.getEndTime().toLocalTime();
            if (startT.isBefore(resource.getAvailabilityStart()) || endT.isAfter(resource.getAvailabilityEnd()))
                throw new InvalidOperationException("Booking must be within resource availability hours: "
                        + resource.getAvailabilityStart() + " - " + resource.getAvailabilityEnd());
        }

        // Validate attendees vs capacity
        if (dto.getAttendees() != null && resource.getCapacity() != null && dto.getAttendees() > resource.getCapacity())
            throw new InvalidOperationException("Attendees (" + dto.getAttendees() + ") exceeds resource capacity ("
                    + resource.getCapacity() + ")");

        // Check for time conflicts
        if (!bookingRepository
                .findConflicting(dto.getResourceId(), dto.getStartTime(), dto.getEndTime(), ACTIVE_STATUSES).isEmpty())
            throw new BookingConflictException("This resource is already booked during the selected time slot");

        Booking booking = Booking.builder()
                .resource(resource).user(currentUser)
                .startTime(dto.getStartTime()).endTime(dto.getEndTime())
                .purpose(dto.getPurpose()).attendees(dto.getAttendees())
                .status(BookingStatus.PENDING).build();

        return mapper.toBookingDTO(Objects.requireNonNull(bookingRepository.save(booking)));
    }

    @Transactional
    public BookingResponseDTO review(Long id, BookingReviewDTO dto, User admin) {
        Booking booking = Objects.requireNonNull(bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id)));

        if (booking.getStatus() != BookingStatus.PENDING)
            throw new InvalidOperationException(
                    "Only PENDING bookings can be reviewed (current status: " + booking.getStatus() + ")");

        if (dto.getStatus() == BookingStatus.REJECTED && (dto.getReason() == null || dto.getReason().isBlank()))
            throw new InvalidOperationException("A reason is required when rejecting a booking");

        if (dto.getStatus() != BookingStatus.APPROVED && dto.getStatus() != BookingStatus.REJECTED)
            throw new InvalidOperationException("Review status must be either APPROVED or REJECTED");

        booking.setStatus(dto.getStatus());
        booking.setAdminReason(dto.getReason());
        booking.setReviewedBy(admin);
        booking = Objects.requireNonNull(bookingRepository.save(booking));

        NotificationType nType = dto.getStatus() == BookingStatus.APPROVED
                ? NotificationType.BOOKING_APPROVED
                : NotificationType.BOOKING_REJECTED;
        String msg = dto.getStatus() == BookingStatus.APPROVED
                ? "Your booking for '" + booking.getResource().getName() + "' has been approved"
                : "Your booking for '" + booking.getResource().getName() + "' was rejected"
                        + (dto.getReason() != null ? ": " + dto.getReason() : "");
        notificationService.createNotification(booking.getUser(), nType,
                "Booking " + dto.getStatus().name().toLowerCase(), msg, booking.getId());

        // Send email notification
        String fmt = "MMM d, yyyy hh:mm a";
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern(fmt);
        String startStr = booking.getStartTime() != null ? booking.getStartTime().format(dtf) : "";
        String endStr = booking.getEndTime() != null ? booking.getEndTime().format(dtf) : "";
        String userEmail = booking.getUser().getEmail();
        String userName = booking.getUser().getName();
        String resName = booking.getResource().getName();
        if (dto.getStatus() == BookingStatus.APPROVED) {
            emailService.sendBookingApprovedEmail(userEmail, userName, booking.getId(), resName, startStr, endStr);
        } else {
            emailService.sendBookingRejectedEmail(userEmail, userName, booking.getId(), resName, dto.getReason());
        }

        return mapper.toBookingDTO(booking);
    }

    @Transactional
    public BookingResponseDTO cancel(Long id, User currentUser) {
        Booking booking = Objects.requireNonNull(bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id)));

        if (currentUser.getRole() != UserRole.ADMIN && !booking.getUser().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only cancel your own bookings");

        if (booking.getStatus() == BookingStatus.CANCELLED)
            throw new InvalidOperationException("Booking is already cancelled");

        if (booking.getStatus() == BookingStatus.REJECTED)
            throw new InvalidOperationException("Cannot cancel a rejected booking");

        // Prevent cancelling a booking that already started
        if (currentUser.getRole() != UserRole.ADMIN && booking.getStartTime().isBefore(LocalDateTime.now()))
            throw new InvalidOperationException("Cannot cancel a booking that has already started");

        booking.setStatus(BookingStatus.CANCELLED);
        booking = Objects.requireNonNull(bookingRepository.save(booking));

        notificationService.createNotification(booking.getUser(), NotificationType.BOOKING_CANCELLED,
                "Booking cancelled",
                "Your booking for '" + booking.getResource().getName() + "' has been cancelled.",
                booking.getId());

        return mapper.toBookingDTO(booking);
    }
}