package com.sliit.smartcampus.mapper;

import com.sliit.smartcampus.dto.response.*;
import com.sliit.smartcampus.entity.*;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class EntityMapper {
    public UserResponseDTO toUserDTO(User user) {
        if (user == null) return null;
        return UserResponseDTO.builder()
            .id(user.getId()).email(user.getEmail()).name(user.getName())
            .avatarUrl(user.getAvatarUrl()).role(user.getRole())
            .requestedRole(user.getRequestedRole())
            .pendingApproval(user.getRole() == com.sliit.smartcampus.enums.UserRole.PENDING_STAFF)
            .userType(user.getUserType())
            .build();
    }

    public ResourceResponseDTO toResourceDTO(Resource resource) {
        if (resource == null) return null;
        return ResourceResponseDTO.builder().id(resource.getId()).name(resource.getName()).type(resource.getType())
            .capacity(resource.getCapacity()).location(resource.getLocation()).description(resource.getDescription())
            .status(resource.getStatus()).availabilityStart(resource.getAvailabilityStart())
            .availabilityEnd(resource.getAvailabilityEnd()).createdAt(resource.getCreatedAt())
            .updatedAt(resource.getUpdatedAt()).build();
    }

    public BookingResponseDTO toBookingDTO(Booking booking) {
        if (booking == null) return null;
        return BookingResponseDTO.builder().id(booking.getId()).resource(toResourceDTO(booking.getResource()))
            .user(toUserDTO(booking.getUser())).startTime(booking.getStartTime()).endTime(booking.getEndTime())
            .purpose(booking.getPurpose()).attendees(booking.getAttendees()).status(booking.getStatus())
            .adminReason(booking.getAdminReason()).reviewedBy(toUserDTO(booking.getReviewedBy()))
            .createdAt(booking.getCreatedAt()).updatedAt(booking.getUpdatedAt()).build();
    }

    public TicketResponseDTO toTicketDTO(Ticket ticket) {
        if (ticket == null) return null;
        return TicketResponseDTO.builder().id(ticket.getId()).resource(toResourceDTO(ticket.getResource()))
            .reporter(toUserDTO(ticket.getReporter())).assignedTo(toUserDTO(ticket.getAssignedTo()))
            .category(ticket.getCategory()).title(ticket.getTitle()).description(ticket.getDescription()).priority(ticket.getPriority())
            .status(ticket.getStatus()).contactDetails(ticket.getContactDetails())
            .rejectionReason(ticket.getRejectionReason()).resolutionNotes(ticket.getResolutionNotes())
            .attachmentCount(ticket.getAttachments() != null ? ticket.getAttachments().size() : 0)
            .attachments(ticket.getAttachments() != null ? ticket.getAttachments().stream().map(this::toAttachmentDTO).collect(Collectors.toList()) : Collections.emptyList())
            .commentCount(ticket.getComments() != null ? ticket.getComments().size() : 0)
            .comments(ticket.getComments() != null ? ticket.getComments().stream().map(this::toCommentDTO).collect(Collectors.toList()) : Collections.emptyList())
            .createdAt(ticket.getCreatedAt()).updatedAt(ticket.getUpdatedAt()).build();
    }

    public AttachmentResponseDTO toAttachmentDTO(TicketAttachment attachment) {
        if (attachment == null) return null;
        return AttachmentResponseDTO.builder().id(attachment.getId()).fileName(attachment.getFileName())
            .filePath(attachment.getFilePath()).fileType(attachment.getFileType())
            .fileSize(attachment.getFileSize()).uploadedAt(attachment.getUploadedAt()).build();
    }

    public CommentResponseDTO toCommentDTO(Comment comment) {
        if (comment == null) return null;
        return CommentResponseDTO.builder().id(comment.getId()).author(toUserDTO(comment.getAuthor()))
            .content(comment.getContent()).createdAt(comment.getCreatedAt()).updatedAt(comment.getUpdatedAt()).build();
    }

    public NotificationResponseDTO toNotificationDTO(Notification notification) {
        if (notification == null) return null;
        return NotificationResponseDTO.builder().id(notification.getId()).title(notification.getTitle())
            .message(notification.getMessage()).type(notification.getType()).referenceId(notification.getReferenceId())
            .read(notification.isRead()).createdAt(notification.getCreatedAt()).build();
    }
}
