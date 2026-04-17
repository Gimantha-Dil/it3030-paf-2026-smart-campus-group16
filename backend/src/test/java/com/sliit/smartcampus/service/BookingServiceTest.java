package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.request.BookingRequestDTO;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.*;
import com.sliit.smartcampus.exception.BookingConflictException;
import com.sliit.smartcampus.exception.InvalidOperationException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BookingServiceTest {
    @Mock private BookingRepository bookingRepository;
    @Mock private ResourceRepository resourceRepository;
    @Mock private NotificationService notificationService;
    @Mock private EntityMapper mapper;
    @InjectMocks private BookingService bookingService;

    private User testUser;
    private Resource testResource;

    @BeforeEach
    void setUp() {
        testUser = User.builder().email("test@sliit.lk").name("Test User").role(UserRole.USER).build();
        testUser.setId(1L);
        testResource = Resource.builder().name("Room A").type(ResourceType.LECTURE_HALL).location("Building A")
            .capacity(50).status(ResourceStatus.ACTIVE).build();
        testResource.setId(1L);
    }

    @Test
    void createBooking_shouldThrowWhenResourceInactive() {
        testResource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId(1L); dto.setStartTime(LocalDateTime.now().plusDays(1)); dto.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        dto.setPurpose("Test"); dto.setAttendees(10);
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        var ex = assertThrows(InvalidOperationException.class, () -> bookingService.create(dto, testUser));
        assertNotNull(ex);
    }

    @Test
    void createBooking_shouldThrowWhenTimeConflict() {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId(1L); dto.setStartTime(LocalDateTime.now().plusDays(1)); dto.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        dto.setPurpose("Test"); dto.setAttendees(10);
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findConflicting(anyLong(), any(), any(), anyCollection()))
            .thenReturn(List.of(new com.sliit.smartcampus.entity.Booking()));
        var ex = assertThrows(BookingConflictException.class, () -> bookingService.create(dto, testUser));
        assertNotNull(ex);
    }

    @Test
    void createBooking_shouldThrowWhenEndBeforeStart() {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId(1L); dto.setStartTime(LocalDateTime.now().plusDays(2)); dto.setEndTime(LocalDateTime.now().plusDays(1));
        dto.setPurpose("Test"); dto.setAttendees(10);
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        var ex = assertThrows(InvalidOperationException.class, () -> bookingService.create(dto, testUser));
        assertNotNull(ex);
    }

    @Test
    void createBooking_shouldThrowWhenExceedsCapacity() {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId(1L); dto.setStartTime(LocalDateTime.now().plusDays(1)); dto.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        dto.setPurpose("Test"); dto.setAttendees(100);
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.findConflicting(anyLong(), any(), any(), anyCollection()))
            .thenReturn(Collections.emptyList());
        var ex = assertThrows(InvalidOperationException.class, () -> bookingService.create(dto, testUser));
        assertNotNull(ex);
    }
}
