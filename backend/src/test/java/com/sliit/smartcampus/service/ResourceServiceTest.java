package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.request.ResourceRequestDTO;
import com.sliit.smartcampus.dto.response.ResourceResponseDTO;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {
    @Mock private ResourceRepository resourceRepository;
    @Mock private EntityMapper mapper;
    @InjectMocks private ResourceService resourceService;

    @Test
    void getById_shouldThrowWhenNotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> resourceService.getById(999L));
    }

    @Test
    void create_shouldReturnDTO() {
        ResourceRequestDTO dto = new ResourceRequestDTO();
        dto.setName("Lab B"); dto.setType(ResourceType.LAB); dto.setLocation("Building B"); dto.setCapacity(30);
        Resource saved = Resource.builder().name("Lab B").type(ResourceType.LAB).location("Building B").capacity(30).status(ResourceStatus.ACTIVE).build();
        saved.setId(1L);
        ResourceResponseDTO responseDTO = new ResourceResponseDTO();
        responseDTO.setId(1L); responseDTO.setName("Lab B");
        when(resourceRepository.save(any())).thenReturn(saved);
        when(mapper.toResourceDTO(saved)).thenReturn(responseDTO);
        ResourceResponseDTO result = resourceService.create(dto);
        assertNotNull(result); assertEquals("Lab B", result.getName());
    }

    @Test
    void delete_shouldThrowWhenNotFound() {
        when(resourceRepository.existsById(999L)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> resourceService.delete(999L));
    }
}
