package com.civicconnect.repository;

import com.civicconnect.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
