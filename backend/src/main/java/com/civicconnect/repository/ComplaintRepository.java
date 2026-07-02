package com.civicconnect.repository;

import com.civicconnect.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByComplaintId(String complaintId);
    List<Complaint> findByCitizenId(Long citizenId);
    List<Complaint> findByAssignedWorkerId(Long workerId);
    List<Complaint> findByStatus(String status);
    List<Complaint> findByCategory(String category);

    // ─── FEATURE 5: Priority-based queries ──────────────────────────────────────
    /** Find all complaints with a specific AI-assigned priority level */
    List<Complaint> findByPriorityLevel(String priorityLevel);

    /** Find complaints by priority, ordered newest first */
    List<Complaint> findByPriorityLevelOrderByCreatedAtDesc(String priorityLevel);

    // ─── FEATURE 4: AI Category queries ─────────────────────────────────────────
    /** Find all complaints detected in a specific AI category */
    List<Complaint> findByAiCategory(String aiCategory);

    // ─── FEATURE 7: Emergency Alert queries ─────────────────────────────────────
    /**
     * Returns all CRITICAL complaints ordered by creation date descending.
     * Used by the emergency alert workflow.
     */
    @Query("SELECT c FROM Complaint c WHERE c.priorityLevel = 'CRITICAL' ORDER BY c.createdAt DESC")
    List<Complaint> findEmergencyComplaints();

    /**
     * Returns all complaints ordered by priority (CRITICAL first) then by date.
     * Used for the worker queue sorted by urgency.
     */
    @Query("SELECT c FROM Complaint c ORDER BY " +
           "CASE c.priorityLevel " +
           "  WHEN 'CRITICAL' THEN 1 " +
           "  WHEN 'HIGH'     THEN 2 " +
           "  WHEN 'MEDIUM'   THEN 3 " +
           "  WHEN 'LOW'      THEN 4 " +
           "  ELSE 5 END, " +
           "c.createdAt DESC")
    List<Complaint> findAllOrderByPriority();
}
