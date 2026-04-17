package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.request.CommentRequestDTO;
import com.sliit.smartcampus.dto.response.CommentResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class CommentController {
    private final CommentService commentService;
    public CommentController(CommentService commentService) { this.commentService = commentService; }

    @GetMapping
    public ResponseEntity<Page<CommentResponseDTO>> getByTicket(@PathVariable Long ticketId, Pageable pageable) {
        return ResponseEntity.ok(commentService.getByTicket(ticketId, pageable));
    }
    @PostMapping
    public ResponseEntity<CommentResponseDTO> create(@PathVariable Long ticketId, @Valid @RequestBody CommentRequestDTO dto, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.create(ticketId, dto, user));
    }
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDTO> update(@PathVariable Long commentId, @Valid @RequestBody CommentRequestDTO dto, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(commentService.update(commentId, dto, user));
    }
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long commentId, @AuthenticationPrincipal User user) {
        commentService.delete(commentId, user); return ResponseEntity.noContent().build();
    }
}
