package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.request.ResourceRequestDTO;
import com.sliit.smartcampus.dto.response.ResourceResponseDTO;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.mapper.EntityMapper;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

@SuppressWarnings("null")
@Service
public class ResourceService {
    private final ResourceRepository resourceRepository;
    private final EntityMapper mapper;

    public ResourceService(ResourceRepository resourceRepository, EntityMapper mapper) {
        this.resourceRepository = resourceRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> getAll(ResourceType type, ResourceStatus status,
                                             String search, String location, Integer minCapacity,
                                             Pageable pageable) {
        return resourceRepository.findWithFilters(
            (search != null && !search.isBlank()) ? search : null,
            type, status,
            (location != null && !location.isBlank()) ? location : null,
            minCapacity, pageable
        ).map(mapper::toResourceDTO);
    }

    @Transactional(readOnly = true)
    public ResourceResponseDTO getById(Long id) {
        Resource resource = Objects.requireNonNull(resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id)));
        return mapper.toResourceDTO(resource);
    }

    @Transactional
    public ResourceResponseDTO create(ResourceRequestDTO dto) {
        Resource r = Resource.builder().name(dto.getName()).type(dto.getType()).capacity(dto.getCapacity())
            .location(dto.getLocation()).description(dto.getDescription())
            .status(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE)
            .availabilityStart(dto.getAvailabilityStart()).availabilityEnd(dto.getAvailabilityEnd()).build();
        return mapper.toResourceDTO(Objects.requireNonNull(resourceRepository.save(r)));
    }

    @Transactional
    public ResourceResponseDTO update(Long id, ResourceRequestDTO dto) {
        Resource r = Objects.requireNonNull(resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id)));
        r.setName(dto.getName()); r.setType(dto.getType()); r.setCapacity(dto.getCapacity());
        r.setLocation(dto.getLocation()); r.setDescription(dto.getDescription());
        if (dto.getStatus() != null) r.setStatus(dto.getStatus());
        r.setAvailabilityStart(dto.getAvailabilityStart()); r.setAvailabilityEnd(dto.getAvailabilityEnd());
        return mapper.toResourceDTO(Objects.requireNonNull(resourceRepository.save(r)));
    }

    @Transactional
    public ResourceResponseDTO updateStatus(Long id, ResourceStatus status) {
        Resource r = Objects.requireNonNull(resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id)));
        r.setStatus(status);
        return mapper.toResourceDTO(Objects.requireNonNull(resourceRepository.save(r)));
    }

    @Transactional
    public void delete(Long id) {
        if (!resourceRepository.existsById(id)) throw new ResourceNotFoundException("Resource not found: " + id);
        resourceRepository.deleteById(id);
    }
}

