package com.civicconnect.repository;

import com.civicconnect.entity.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NgoRepository extends JpaRepository<Ngo, Long> {
    Optional<Ngo> findByCreatedByUserId(Long userId);
    List<Ngo> findByStatus(String status);
    List<Ngo> findByOrganizationType(String organizationType);
    boolean existsByRegistrationNumber(String registrationNumber);
    boolean existsByEmail(String email);
    List<Ngo> findByStatusOrderByCreatedAtDesc(String status);
}
