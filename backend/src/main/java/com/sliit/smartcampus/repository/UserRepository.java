package com.sliit.smartcampus.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByRole(UserRole role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = com.sliit.smartcampus.enums.UserRole.PENDING_STAFF")
    Page<User> findPendingStaff(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.userType = :userType")
    Page<User> findByUserType(@org.springframework.data.repository.query.Param("userType") String userType,
            Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role IN (com.sliit.smartcampus.enums.UserRole.LECTURER, com.sliit.smartcampus.enums.UserRole.LAB_ASSISTANT)")
    Page<User> findAcademicStaff(Pageable pageable);

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<User> searchUsers(@Param("q") String query, Pageable pageable);

    Optional<User> findByPasswordResetToken(String token);
}