package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.request.CommentRequestDTO;
import com.sliit.smartcampus.dto.response.CommentResponseDTO;
import com.sliit.smartcampus.entity.Comment;
import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.NotificationType;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.exception.UnauthorizedException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.CommentRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

@SuppressWarnings("null")
@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final EntityMapper mapper;

    public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository,
                          NotificationService notificationService, EntityMapper mapper) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    public Page<CommentResponseDTO> getByTicket(Long ticketId, Pageable pageable) {
        return commentRepository.findByTicketId(ticketId, pageable).map(mapper::toCommentDTO);
    }

    @Transactional
    public CommentResponseDTO create(Long ticketId, CommentRequestDTO dto, User author) {
        Ticket ticket = Objects.requireNonNull(ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId)));

        Comment comment = Comment.builder()
            .ticket(ticket).author(author).content(dto.getContent().trim()).build();
        comment = Objects.requireNonNull(commentRepository.save(comment));

        // Notify ticket reporter — but not if they are the one commenting
        if (!ticket.getReporter().getId().equals(author.getId())) {
            notificationService.createNotification(
                ticket.getReporter(),
                NotificationType.TICKET_COMMENT,
                "New comment on your ticket",
                author.getName() + " commented on ticket #" + ticketId,
                ticketId
            );
        }
        // Also notify assigned technician if different from author and reporter
        if (ticket.getAssignedTo() != null
                && !ticket.getAssignedTo().getId().equals(author.getId())
                && !ticket.getAssignedTo().getId().equals(ticket.getReporter().getId())) {
            notificationService.createNotification(
                ticket.getAssignedTo(),
                NotificationType.TICKET_COMMENT,
                "New comment on assigned ticket",
                author.getName() + " commented on ticket #" + ticketId,
                ticketId
            );
        }
        return mapper.toCommentDTO(comment);
    }

    @Transactional
    public CommentResponseDTO update(Long commentId, CommentRequestDTO dto, User currentUser) {
        Comment comment = Objects.requireNonNull(commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId)));

        // Only the author can edit their own comment
        if (!comment.getAuthor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only edit your own comments");

        comment.setContent(dto.getContent().trim());
        return mapper.toCommentDTO(Objects.requireNonNull(commentRepository.save(comment)));
    }

    @Transactional
    public void delete(Long commentId, User currentUser) {
        Comment comment = Objects.requireNonNull(commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId)));

        // Author can delete their own comment; ADMIN can delete any comment
        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

        if (!isAuthor && !isAdmin)
            throw new UnauthorizedException("You can only delete your own comments");

        commentRepository.delete(comment);
    }
}
