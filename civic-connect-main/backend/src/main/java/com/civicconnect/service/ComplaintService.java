package com.civicconnect.service;

import com.civicconnect.dto.CreateComplaintDTO;
import com.civicconnect.entity.Complaint;
import com.civicconnect.entity.User;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public Complaint createComplaint(CreateComplaintDTO dto) {
        // Fetch the citizen/user
        User citizen = userRepository.findById(dto.getCitizenId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getCitizenId()));

        // Create complaint entity
        Complaint complaint = new Complaint();
        complaint.setTitle(dto.getTitle());
        complaint.setDescription(dto.getDescription());
        complaint.setCategory(dto.getCategory());
        complaint.setAddress(dto.getAddress());
        complaint.setLatitude(dto.getLatitude());
        complaint.setLongitude(dto.getLongitude());
        complaint.setPhotoUrl(dto.getPhotoUrl());
        complaint.setCitizen(citizen);
        complaint.setStatus("PENDING");

        // Generate unique complaint ID
        String complaintId = "CMP-" + String.format("%06d", (System.currentTimeMillis() % 1000000));
        complaint.setComplaintId(complaintId);

        return complaintRepository.save(complaint);
    }

    public Complaint createComplaint(Complaint complaint) {
        // Generate unique complaint ID
        String complaintId = "CMP-" + String.format("%06d", 
            (System.currentTimeMillis() % 1000000));
        complaint.setComplaintId(complaintId);
        complaint.setStatus("PENDING");
        return complaintRepository.save(complaint);
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    public Optional<Complaint> getComplaintByComplaintId(String complaintId) {
        return complaintRepository.findByComplaintId(complaintId);
    }

    public List<Complaint> getComplaintsByCitizenId(Long citizenId) {
        return complaintRepository.findByCitizenId(citizenId);
    }

    public List<Complaint> getComplaintsByAssignedWorker(Long workerId) {
        return complaintRepository.findByAssignedWorkerId(workerId);
    }

    public List<Complaint> getComplaintsByStatus(String status) {
        return complaintRepository.findByStatus(status);
    }

    public List<Complaint> getComplaintsByCategory(String category) {
        return complaintRepository.findByCategory(category);
    }

    public Complaint updateComplaint(Long id, Complaint complaintDetails) {
        return complaintRepository.findById(id)
                .map(complaint -> {
                    complaint.setTitle(complaintDetails.getTitle());
                    complaint.setDescription(complaintDetails.getDescription());
                    complaint.setCategory(complaintDetails.getCategory());
                    complaint.setStatus(complaintDetails.getStatus());
                    complaint.setAddress(complaintDetails.getAddress());
                    complaint.setLatitude(complaintDetails.getLatitude());
                    complaint.setLongitude(complaintDetails.getLongitude());
                    complaint.setPhotoUrl(complaintDetails.getPhotoUrl());
                    complaint.setResolutionNotes(complaintDetails.getResolutionNotes());
                    return complaintRepository.save(complaint);
                })
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    public Complaint assignWorker(Long complaintId, Long workerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        complaint.setAssignedWorker(worker);
        complaint.setStatus("IN_PROGRESS");
        return complaintRepository.save(complaint);
    }

    public Complaint updateStatus(Long id, String status, String resolutionNotes) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isEmpty()) {
            complaint.setResolutionNotes(resolutionNotes);
        }
        return complaintRepository.save(complaint);
    }

    public Complaint resolveComplaint(Long complaintId, String resolutionNotes) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus("RESOLVED");
        complaint.setResolutionNotes(resolutionNotes);
        return complaintRepository.save(complaint);
    }

    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }
}
