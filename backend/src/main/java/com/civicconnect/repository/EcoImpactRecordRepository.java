package com.civicconnect.repository;

import com.civicconnect.entity.EcoImpactRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EcoImpactRecordRepository extends JpaRepository<EcoImpactRecord, Long> {

    @Query("SELECT r FROM EcoImpactRecord r WHERE r.event.id = :eventId")
    Optional<EcoImpactRecord> findByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COALESCE(SUM(r.treesPlanted), 0) FROM EcoImpactRecord r")
    Integer sumTotalTreesPlanted();

    @Query("SELECT COALESCE(SUM(r.wasteCollectedKg), 0.0) FROM EcoImpactRecord r")
    Double sumTotalWasteCollectedKg();

    @Query("SELECT COALESCE(SUM(r.plasticRemovedKg), 0.0) FROM EcoImpactRecord r")
    Double sumTotalPlasticRemovedKg();

    @Query("SELECT COALESCE(SUM(r.volunteerHours), 0.0) FROM EcoImpactRecord r")
    Double sumTotalVolunteerHours();

    @Query("SELECT COALESCE(SUM(r.volunteersParticipated), 0) FROM EcoImpactRecord r")
    Integer sumAllVolunteers();
}
