package com.sliit.smartcampus.service;

import java.io.IOException;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sliit.smartcampus.dto.request.TicketAssignDTO;
import com.sliit.smartcampus.dto.request.TicketRequestDTO;
import com.sliit.smartcampus.dto.request.TicketStatusUpdateDTO;
import com.sliit.smartcampus.dto.response.TicketResponseDTO;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.TicketAttachment;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.NotificationType;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.InvalidOperationException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.TicketAttachmentRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.repository.UserRepository;

@SuppressWarnings("null")
@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final EntityMapper mapper;

    public TicketService(TicketRepository ticketRepository, ResourceRepository resourceRepository,
            UserRepository userRepository, TicketAttachmentRepository attachmentRepository,
            NotificationService notificationService, FileStorageService fileStorageService, EntityMapper mapper,
            EmailService emailService) {
        this.ticketRepository = ticketRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.attachmentRepository = attachmentRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.fileStorageService = fileStorageService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<TicketResponseDTO> getAll(User currentUser, TicketStatus status, Pageable pageable) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return status != null ? ticketRepository.findByStatus(status, pageable).map(mapper::toTicketDTO)
                    : ticketRepository.findAllWithDetails(pageable).map(mapper::toTicketDTO);
        }
        if (currentUser.getRole() == UserRole.TECHNICIAN)
            return ticketRepository.findByAssignedToId(currentUser.getId(), pageable).map(mapper::toTicketDTO);
        return status != null
                ? ticketRepository.findByReporterIdAndStatus(currentUser.getId(), status, pageable)
                        .map(mapper::toTicketDTO)
                : ticketRepository.findByReporterId(currentUser.getId(), pageable).map(mapper::toTicketDTO);
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getById(Long id) {
        return mapper.toTicketDTO(Objects.requireNonNull(ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id))));
    }

    @Transactional(rollbackFor = Exception.class)
    public TicketResponseDTO create(TicketRequestDTO dto, MultipartFile[] files, User reporter) throws IOException {
        // Validate max 3 attachments
        int fileCount = (files != null) ? (int) java.util.Arrays.stream(files).filter(f -> !f.isEmpty()).count() : 0;
        if (fileCount > 3)
            throw new InvalidOperationException("Maximum 3 attachments allowed per ticket");

        Ticket ticket = Ticket.builder()
                .reporter(reporter).category(dto.getCategoryEnum()).title(dto.getTitle())
                .description(dto.getDescription()).priority(dto.getPriorityEnum())
                .contactDetails(dto.getContactDetails()).status(TicketStatus.OPEN).build();

        if (dto.getResourceId() != null) {
            Resource res = Objects.requireNonNull(resourceRepository.findById(dto.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.getResourceId())));
            ticket.setResource(res);
        }
        ticket = Objects.requireNonNull(ticketRepository.save(ticket));

        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String path = fileStorageService.store(file);
                    TicketAttachment att = TicketAttachment.builder()
                            .ticket(ticket).fileName(file.getOriginalFilename())
                            .filePath(path).fileType(file.getContentType()).fileSize(file.getSize()).build();
                    attachmentRepository.save(att);
                }
            }
        }
        return getById(ticket.getId());
    }

    @Transactional
    public TicketResponseDTO updateStatus(Long id, TicketStatusUpdateDTO dto, User currentUser) {
        Ticket ticket = Objects.requireNonNull(ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id)));

        // TECHNICIAN can only update tickets assigned to them
        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(currentUser.getId()))
                throw new InvalidOperationException("You can only update status of tickets assigned to you");
        }

        // Validate status transitions
        validateStatusTransition(ticket.getStatus(), dto.getStatus());

        if (dto.getStatus() == TicketStatus.REJECTED
                && (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank()))
            throw new InvalidOperationException("A rejection reason is required when rejecting a ticket");

        ticket.setStatus(dto.getStatus());
        if (dto.getRejectionReason() != null)
            ticket.setRejectionReason(dto.getRejectionReason());
        if (dto.getResolutionNotes() != null)
            ticket.setResolutionNotes(dto.getResolutionNotes());
        ticket = Objects.requireNonNull(ticketRepository.save(ticket));

        String statusLabel = dto.getStatus().name().replace("_", " ");
        notificationService.createNotification(ticket.getReporter(), NotificationType.TICKET_STATUS_CHANGE,
                "Ticket #" + ticket.getId() + " status updated",
                "Your ticket status changed to: " + statusLabel, ticket.getId());

        // Send ticket status update email to reporter
        emailService.sendTicketStatusUpdateEmail(
                ticket.getReporter().getEmail(), ticket.getReporter().getName(),
                ticket.getId(), ticket.getTitle(), statusLabel,
                dto.getResolutionNotes());

        return mapper.toTicketDTO(ticket);
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid;
        if (current == TicketStatus.OPEN) {
            valid = next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED || next == TicketStatus.CLOSED;
        } else if (current == TicketStatus.IN_PROGRESS) {
            valid = next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED || next == TicketStatus.CLOSED;
        } else if (current == TicketStatus.RESOLVED) {
            valid = next == TicketStatus.CLOSED || next == TicketStatus.IN_PROGRESS;
        } else {
            valid = false; // CLOSED, REJECTED — no further transitions
        }
        if (!valid)
            throw new InvalidOperationException(
                    "Invalid status transition from " + current + " to " + next);
    }

    @Transactional
    public TicketResponseDTO assign(Long id, TicketAssignDTO dto) {
        Ticket ticket = Objects.requireNonNull(ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id)));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED)
            throw new InvalidOperationException("Cannot assign a " + ticket.getStatus() + " ticket");

        User technician = Objects.requireNonNull(userRepository.findById(dto.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getTechnicianId())));

        if (technician.getRole() != UserRole.TECHNICIAN && technician.getRole() != UserRole.ADMIN)
            throw new InvalidOperationException("User '" + technician.getName() + "' is not a technician or admin");

        ticket.setAssignedTo(technician);
        if (ticket.getStatus() == TicketStatus.OPEN)
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket = Objects.requireNonNull(ticketRepository.save(ticket));

        notificationService.createNotification(technician, NotificationType.TICKET_ASSIGNED,
                "Ticket #" + ticket.getId() + " assigned to you",
                "You have been assigned ticket #" + ticket.getId() + ": "
                        + ticket.getDescription().substring(0, Math.min(80, ticket.getDescription().length())),
                ticket.getId());

        // Send assignment email to technician
        String title = ticket.getTitle() != null ? ticket.getTitle()
                : ticket.getDescription().substring(0, Math.min(60, ticket.getDescription().length()));
        emailService.sendTicketAssignmentEmail(
                technician.getEmail(), technician.getName(), ticket.getId(), title, "Admin");

        return mapper.toTicketDTO(ticket);
    }
}