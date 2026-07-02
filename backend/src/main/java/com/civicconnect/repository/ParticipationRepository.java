package com.civicconnect.repository;

import com.civicconnect.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    @Query("SELECT p FROM Participation p WHERE p.user.id = :userId AND p.event.id = :eventId")
    Optional<Participation> findByUserIdAndEventId(@Param("userId") Long userId, @Param("eventId") Long eventId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN TRUE ELSE FALSE END FROM Participation p WHERE p.user.id = :userId AND p.event.id = :eventId")
    boolean existsByUserIdAndEventId(@Param("userId") Long userId, @Param("eventId") Long eventId);

    @Query("SELECT p FROM Participation p WHERE p.user.id = :userId")
    List<Participation> findByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Participation p WHERE p.event.id = :eventId")
    List<Participation> findByEventId(@Param("eventId") Long eventId);

    @Query("SELECT p FROM Participation p WHERE p.user.id = :userId AND p.status = :status")
    List<Participation> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query("SELECT p FROM Participation p WHERE p.event.id = :eventId AND p.status = :status")
    List<Participation> findByEventIdAndStatus(@Param("eventId") Long eventId, @Param("status") String status);

    @Query("SELECT COUNT(p) FROM Participation p WHERE p.event.id = :eventId AND p.status != 'CANCELLED'")
    long countActiveParticipantsByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(p) FROM Participation p WHERE p.user.id = :userId AND p.status = 'ATTENDED'")
    long countAttendedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT p.user.id) FROM Participation p WHERE p.status = 'ATTENDED'")
    long countDistinctVolunteers();
}


