package com.civicconnect.service;

import com.civicconnect.dto.NgoRegistrationDTO;
import com.civicconnect.entity.Ngo;
import com.civicconnect.repository.NgoRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NgoService {

    private final NgoRepository ngoRepository;
    private final EmailService emailService;

    public NgoService(NgoRepository ngoRepository, EmailService emailService) {
        this.ngoRepository = ngoRepository;
        this.emailService = emailService;
    }

    public Ngo register(NgoRegistrationDTO dto) {
        if (ngoRepository.existsByRegistrationNumber(dto.getRegistrationNumber())) {
            throw new RuntimeException("Registration number already exists: " + dto.getRegistrationNumber());
        }

        Ngo ngo = new Ngo();
        ngo.setName(dto.getName());
        ngo.setRegistrationNumber(dto.getRegistrationNumber());
        ngo.setOrganizationType(dto.getOrganizationType());
        ngo.setContactPersonName(dto.getContactPersonName());
        ngo.setEmail(dto.getEmail());
        ngo.setPhone(dto.getPhone());
        ngo.setAddress(dto.getAddress());
        ngo.setDescription(dto.getDescription());
        ngo.setWebsite(dto.getWebsite());
        ngo.setDocumentUrl(dto.getDocumentUrl());
        ngo.setCreatedByUserId(dto.getCreatedByUserId());
        ngo.setStatus("PENDING");
        return ngoRepository.save(ngo);
    }

    public Optional<Ngo> findByUserId(Long userId) {
        return ngoRepository.findByCreatedByUserId(userId);
    }

    public Optional<Ngo> findById(Long id) {
        return ngoRepository.findById(id);
    }

    public List<Ngo> findAll() {
        return ngoRepository.findAll();
    }

    public List<Ngo> findPendingNgos() {
        return ngoRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    public List<Ngo> findActiveNgos() {
        return ngoRepository.findByStatus("ACTIVE");
    }

    public Ngo approveNgo(Long id) {
        Ngo ngo = ngoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NGO not found: " + id));
        ngo.setStatus("ACTIVE");
        Ngo saved = ngoRepository.save(ngo);
        emailService.sendNgoApprovalEmail(ngo.getEmail(), ngo.getName());
        return saved;
    }

    public Ngo rejectNgo(Long id, String reason) {
        Ngo ngo = ngoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NGO not found: " + id));
        ngo.setStatus("REJECTED");
        Ngo saved = ngoRepository.save(ngo);
        emailService.sendNgoRejectionEmail(ngo.getEmail(), ngo.getName(), reason);
        return saved;
    }

    public Ngo suspendNgo(Long id) {
        Ngo ngo = ngoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NGO not found: " + id));
        ngo.setStatus("SUSPENDED");
        return ngoRepository.save(ngo);
    }

    public boolean isNgoActive(Long userId) {
        return ngoRepository.findByCreatedByUserId(userId)
                .map(ngo -> "ACTIVE".equals(ngo.getStatus()))
                .orElse(false);
    }
}
