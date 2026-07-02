package com.civicconnect.controller;

import com.civicconnect.dto.CreateComplaintDTO;
import com.civicconnect.dto.UpdateStatusDTO;
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

    // ─── Standard CRUD Endpoints ─────────────────────────────────────────────────

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

    // ─── FEATURE 5: Priority-Based Endpoints ────────────────────────────────────

    /**
     * Returns complaints filtered by priority level.
     * Priority values: CRITICAL, HIGH, MEDIUM, LOW
     */
    @GetMapping("/priority/{level}")
    public ResponseEntity<List<Complaint>> getComplaintsByPriority(@PathVariable String level) {
        return ResponseEntity.ok(complaintService.getComplaintsByPriority(level.toUpperCase()));
    }

    // ─── FEATURE 4: AI Category Endpoint ────────────────────────────────────────

    /**
     * Returns complaints filtered by AI-detected category.
     */
    @GetMapping("/ai-category/{category}")
    public ResponseEntity<List<Complaint>> getComplaintsByAiCategory(@PathVariable String category) {
        return ResponseEntity.ok(complaintService.getComplaintsByAiCategory(category));
    }

    // ─── FEATURE 7: Emergency Alert Endpoint ────────────────────────────────────

    /**
     * Returns all CRITICAL priority complaints for the emergency alert workflow.
     * Used by admin dashboard to display emergency counter and highlight urgent issues.
     */
    @GetMapping("/emergency")
    public ResponseEntity<List<Complaint>> getEmergencyComplaints() {
        return ResponseEntity.ok(complaintService.getEmergencyComplaints());
    }

    /**
     * Returns all complaints sorted by priority (CRITICAL first).
     * Used by worker dashboard to show the most urgent work items at the top.
     */
    @GetMapping("/sorted-by-priority")
    public ResponseEntity<List<Complaint>> getAllSortedByPriority() {
        return ResponseEntity.ok(complaintService.getAllComplaintsByPriority());
    }

    // ─── Mutation Endpoints ──────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody CreateComplaintDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(complaintService.createComplaint(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(@PathVariable Long id, @RequestBody Complaint complaintDetails) {
        return ResponseEntity.ok(complaintService.updateComplaint(id, complaintDetails));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusDTO statusUpdate) {
        try {
            System.out.println("[ComplaintController] ===== UPDATE STATUS REQUEST =====");
            System.out.println("[ComplaintController] Complaint ID: " + id);
            System.out.println("[ComplaintController] New Status: " + statusUpdate.getStatus());
            System.out.println("[ComplaintController] Resolution Notes: " + statusUpdate.getResolutionNotes());

            Complaint updated = complaintService.updateStatus(id, statusUpdate.getStatus(), statusUpdate.getResolutionNotes());

            System.out.println("[ComplaintController] ✓ Successfully updated complaint " + id);
            System.out.println("[ComplaintController] Updated status in DB: " + updated.getStatus());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("[ComplaintController] ✗ Error updating status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
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
