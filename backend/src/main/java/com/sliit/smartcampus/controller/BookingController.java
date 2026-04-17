package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.request.BookingRequestDTO;
import com.sliit.smartcampus.dto.request.BookingReviewDTO;
import com.sliit.smartcampus.dto.response.BookingResponseDTO;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.BookingStatus;
import com.sliit.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.Map;

@RestController @RequestMapping("/api/v1/bookings")
public class BookingController {
    private final BookingService bookingService;
    public BookingController(BookingService bookingService) { this.bookingService = bookingService; }

    @GetMapping
    public ResponseEntity<Page<BookingResponseDTO>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) BookingStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(bookingService.getAll(user, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    // Flexible formatter that accepts datetime-local format (with or without seconds)
    private static final DateTimeFormatter FLEXIBLE_DT = new DateTimeFormatterBuilder()
        .appendPattern("yyyy-MM-dd'T'HH:mm")
        .optionalStart().appendPattern(":ss").optionalEnd()
        .parseDefaulting(ChronoField.SECOND_OF_MINUTE, 0)
        .toFormatter();

    // Conflict check endpoint — called by frontend before submitting booking
    @GetMapping("/conflicts")
    public ResponseEntity<Map<String, Object>> checkConflicts(
            @RequestParam Long resourceId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        boolean hasConflict = bookingService.hasConflict(resourceId,
                LocalDateTime.parse(startTime, FLEXIBLE_DT),
                LocalDateTime.parse(endTime, FLEXIBLE_DT));
        return ResponseEntity.ok(Map.of("hasConflict", hasConflict));
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> create(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(dto, user));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<BookingResponseDTO> review(
            @PathVariable Long id,
            @Valid @RequestBody BookingReviewDTO dto,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(bookingService.review(id, dto, admin));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.cancel(id, user));
    }
}
