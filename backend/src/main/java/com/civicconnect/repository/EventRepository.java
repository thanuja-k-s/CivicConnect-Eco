package com.civicconnect.repository;

import com.civicconnect.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE e.ngo.id = :ngoId ORDER BY e.date ASC")
    List<Event> findByNgoIdOrderByDateAsc(@Param("ngoId") Long ngoId);

    @Query("SELECT e FROM Event e WHERE e.date >= :today AND e.status = 'UPCOMING' ORDER BY e.date ASC")
    List<Event> findUpcomingEvents(@Param("today") LocalDate today);

    @Query("SELECT e FROM Event e WHERE e.status = :status ORDER BY e.date ASC")
    List<Event> findByStatus(@Param("status") String status);

    @Query("SELECT e FROM Event e WHERE e.eventType = :eventType AND e.date >= CURRENT_DATE ORDER BY e.date ASC")
    List<Event> findByEventType(@Param("eventType") String eventType);

    @Query("SELECT e FROM Event e WHERE e.date >= :startDate AND e.date <= :endDate ORDER BY e.date ASC")
    List<Event> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = 'COMPLETED'")
    long countAllCompleted();

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = 'UPCOMING'")
    long countAllUpcoming();
}
