package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT DISTINCT t FROM Ticket t LEFT JOIN FETCH t.resource LEFT JOIN FETCH t.reporter LEFT JOIN FETCH t.assignedTo WHERE t.reporter.id = :reporterId")
    Page<Ticket> findByReporterId(@Param("reporterId") Long reporterId, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Ticket t LEFT JOIN FETCH t.resource LEFT JOIN FETCH t.reporter LEFT JOIN FETCH t.assignedTo WHERE t.reporter.id = :reporterId AND t.status = :status")
    Page<Ticket> findByReporterIdAndStatus(@Param("reporterId") Long reporterId, @Param("status") TicketStatus status, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Ticket t LEFT JOIN FETCH t.resource LEFT JOIN FETCH t.reporter LEFT JOIN FETCH t.assignedTo WHERE t.assignedTo.id = :technicianId")
    Page<Ticket> findByAssignedToId(@Param("technicianId") Long technicianId, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Ticket t LEFT JOIN FETCH t.resource LEFT JOIN FETCH t.reporter LEFT JOIN FETCH t.assignedTo WHERE t.status = :status")
    Page<Ticket> findByStatus(@Param("status") TicketStatus status, Pageable pageable);

    @Query(value = "SELECT DISTINCT t FROM Ticket t LEFT JOIN FETCH t.resource LEFT JOIN FETCH t.reporter LEFT JOIN FETCH t.assignedTo",
           countQuery = "SELECT COUNT(t) FROM Ticket t")
    Page<Ticket> findAllWithDetails(Pageable pageable);

    /** Null out assignedTo for tickets assigned to the given user (used before user deletion). */
    @Modifying
    @Query("UPDATE Ticket t SET t.assignedTo = null WHERE t.assignedTo.id = :userId")
    void unassignUser(@Param("userId") Long userId);
}
