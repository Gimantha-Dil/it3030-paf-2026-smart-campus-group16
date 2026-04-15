package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.request.ResourceRequestDTO;
import com.sliit.smartcampus.dto.response.ResourceResponseDTO;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import com.sliit.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/resources")
public class ResourceController {
    private final ResourceService resourceService;
    public ResourceController(ResourceService resourceService) { this.resourceService = resourceService; }

    @GetMapping
    public ResponseEntity<Page<ResourceResponseDTO>> getAll(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            Pageable pageable) {
        return ResponseEntity.ok(resourceService.getAll(type, status, search, location, minCapacity, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponseDTO> create(@Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> update(@PathVariable Long id,
                                                       @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.ok(resourceService.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponseDTO> updateStatus(@PathVariable Long id,
                                                             @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
