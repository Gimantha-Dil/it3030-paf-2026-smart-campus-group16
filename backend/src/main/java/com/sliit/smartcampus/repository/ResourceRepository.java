package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    Page<Resource> findByStatus(ResourceStatus status, Pageable pageable);
    Page<Resource> findByType(ResourceType type, Pageable pageable);
    Page<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%',:search,'%'))) AND " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%',:location,'%'))) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity)")
    Page<Resource> findWithFilters(@Param("search") String search,
                                   @Param("type") ResourceType type,
                                   @Param("status") ResourceStatus status,
                                   @Param("location") String location,
                                   @Param("minCapacity") Integer minCapacity,
                                   Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Resource> search(@Param("q") String query, Pageable pageable);
}
