package com.sliit.smartcampus.exception;

import com.sliit.smartcampus.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(BookingConflictException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), req.getRequestURI());
    }

    // Spring Security access denied (role-based)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied: insufficient permissions", req.getRequestURI());
    }

    @ExceptionHandler({InvalidOperationException.class, FileValidationException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), req.getRequestURI());
    }

    // Bean validation errors (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        ErrorResponse err = ErrorResponse.builder()
            .status(400).error("Validation Failed")
            .message("Invalid input data").timestamp(LocalDateTime.now())
            .path(req.getRequestURI()).validationErrors(errors).build();
        return ResponseEntity.badRequest().body(err);
    }

    // Missing required request param
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST,
            "Required parameter '" + ex.getParameterName() + "' is missing", req.getRequestURI());
    }

    // Wrong type for path variable or param (e.g. string where Long expected)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST,
            "Invalid value for parameter '" + ex.getName() + "'", req.getRequestURI());
    }

    // Malformed JSON body
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Malformed request body", req.getRequestURI());
    }

    // File too large (multipart)
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUpload(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, "File size exceeds maximum allowed limit (5MB)", req.getRequestURI());
    }

    // IOException (e.g. file storage failures)
    @ExceptionHandler(java.io.IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(java.io.IOException ex, HttpServletRequest req) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "File operation failed: " + ex.getMessage(), req.getRequestURI());
    }

    // Catch-all — log the real cause so backend logs show it
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, HttpServletRequest req) {
        // Log full stack trace so developers can diagnose from backend console
        ex.printStackTrace();
        String msg = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred: " + (msg != null ? msg : ex.getClass().getSimpleName()),
            req.getRequestURI());
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String path) {
        ErrorResponse err = ErrorResponse.builder()
            .status(status.value()).error(status.getReasonPhrase())
            .message(message).timestamp(LocalDateTime.now()).path(path).build();
        return ResponseEntity.status(status).body(err);
    }
}
