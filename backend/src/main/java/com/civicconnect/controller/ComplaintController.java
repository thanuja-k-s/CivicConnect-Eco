package com.civicconnect.controller;

import com.civicconnect.dto.CreateComplaintDTO;
import com.civicconnect.entity.Complaint;
import com.civicconnect.service.ComplaintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/complaint-id/{complaintId}")
    public ResponseEntity<Complaint> getComplaintByComplaintId(@PathVariable String complaintId) {
        return complaintService.getComplaintByComplaintId(complaintId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<List<Complaint>> getComplaintsByCitizen(@PathVariable Long citizenId) {
        return ResponseEntity.ok(complaintService.getComplaintsByCitizenId(citizenId));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Complaint>> getComplaintsByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(complaintService.getComplaintsByAssignedWorker(workerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Complaint>> getComplaintsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(complaintService.getComplaintsByStatus(status));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Complaint>> getComplaintsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(complaintService.getComplaintsByCategory(category));
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody CreateComplaintDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(complaintService.createComplaint(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(@PathVariable Long id, @RequestBody Complaint complaintDetails) {
        return ResponseEntity.ok(complaintService.updateComplaint(id, complaintDetails));
    }

    @PostMapping("/{complaintId}/assign/{workerId}")
    public ResponseEntity<Complaint> assignWorker(@PathVariable Long complaintId, @PathVariable Long workerId) {
        return ResponseEntity.ok(complaintService.assignWorker(complaintId, workerId));
    }

    @PostMapping("/{complaintId}/resolve")
    public ResponseEntity<Complaint> resolveComplaint(@PathVariable Long complaintId, @RequestBody String resolutionNotes) {
        return ResponseEntity.ok(complaintService.resolveComplaint(complaintId, resolutionNotes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.noContent().build();
    }
}
