package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.request.TicketAssignDTO;
import com.sliit.smartcampus.dto.request.TicketRequestDTO;
import com.sliit.smartcampus.dto.request.TicketStatusUpdateDTO;
import com.sliit.smartcampus.dto.response.TicketResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController @RequestMapping("/api/v1/tickets")
public class TicketController {
    private final TicketService ticketService;
    public TicketController(TicketService ticketService) { this.ticketService = ticketService; }

    @GetMapping
    public ResponseEntity<Page<TicketResponseDTO>> getAll(@AuthenticationPrincipal User user, @RequestParam(required = false) TicketStatus status, Pageable pageable) {
        return ResponseEntity.ok(ticketService.getAll(user, status, pageable));
    }
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getById(@PathVariable Long id) { return ResponseEntity.ok(ticketService.getById(id)); }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponseDTO> create(@Valid @ModelAttribute TicketRequestDTO dto,
            @RequestParam(value = "files", required = false) MultipartFile[] files, @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(dto, files, user));
    }
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id, @Valid @RequestBody TicketStatusUpdateDTO dto,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.updateStatus(id, dto, currentUser));
    }
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assign(@PathVariable Long id, @Valid @RequestBody TicketAssignDTO dto) {
        return ResponseEntity.ok(ticketService.assign(id, dto));
    }
}
