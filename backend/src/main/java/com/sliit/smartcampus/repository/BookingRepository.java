package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b JOIN FETCH b.resource JOIN FETCH b.user WHERE b.user.id = :userId")
    Page<Booking> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT b FROM Booking b JOIN FETCH b.resource JOIN FETCH b.user WHERE b.status = :status")
    Page<Booking> findByStatus(@Param("status") BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b JOIN FETCH b.resource JOIN FETCH b.user WHERE b.user.id = :userId AND b.status = :status")
    Page<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") BookingStatus status, Pageable pageable);

    @Query(value = "SELECT b FROM Booking b JOIN FETCH b.resource JOIN FETCH b.user",
           countQuery = "SELECT COUNT(b) FROM Booking b")
    Page<Booking> findAllWithDetails(Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status IN :statuses AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflicting(@Param("resourceId") Long resourceId,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime,
                                  @Param("statuses") Collection<BookingStatus> statuses);

    /** Delete all bookings for a user — used before user deletion. */
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
