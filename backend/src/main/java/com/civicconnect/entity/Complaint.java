package com.civicconnect.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", unique = true, nullable = false)
    private String complaintId; // CMP-001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User citizen;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Extended category list (13 categories including AI-detected ones)
    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, RESOLVED, REJECTED

    @Column(nullable = false)
    private String address;

    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double latitude;

    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double longitude;

    // ─── FEATURE 2: GPS Accuracy ────────────────────────────────────────────────
    /** Accuracy of GPS fix in metres */
    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double locationAccuracy;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    // ─── FEATURE 3: Camera-captured image URL ───────────────────────────────────
    /** Separate URL / Base64 for camera-captured images */
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    // ─── FEATURE 1: Voice Transcript ────────────────────────────────────────────
    /** Full voice-to-text transcript of the spoken complaint */
    @Column(columnDefinition = "TEXT")
    private String voiceTranscript;

    // ─── FEATURE 4: AI Category Detection ──────────────────────────────────────
    /** AI-detected complaint category (may differ from user-selected category) */
    @Column(length = 100)
    private String aiCategory;

    /** Confidence score (0–100) for the AI category prediction */
    @Column
    private Integer aiConfidence;

    // ─── FEATURE 5: AI Priority Classification ──────────────────────────────────
    /** AI-assigned priority: CRITICAL, HIGH, MEDIUM, LOW */
    @Column(length = 20)
    private String priorityLevel;

    /** Human-readable reason for the AI priority assignment */
    @Column(columnDefinition = "TEXT")
    private String priorityReason;

    // ─── FEATURE 6: Image-Based Issue Analysis ──────────────────────────────────
    /** JSON string with detected objects, confidence scores, suggestedCategory, suggestedPriority */
    @Column(columnDefinition = "TEXT")
    private String imageAnalysisResult;

    // ─── Source Flags ────────────────────────────────────────────────────────────
    /** True when the complaint description originated from voice recording */
    @Column
    private Boolean createdFromVoice = false;

    /** True when the complaint image was captured directly from the device camera */
    @Column
    private Boolean createdFromCamera = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_worker_id")
    @JsonIgnore
    private User assignedWorker;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ─── Constructors ────────────────────────────────────────────────────────────
    public Complaint() {}

    public Complaint(String title, String description, String category, String address, User citizen) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.address = address;
        this.citizen = citizen;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }

    public User getCitizen() { return citizen; }
    public void setCitizen(User citizen) { this.citizen = citizen; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getLocationAccuracy() { return locationAccuracy; }
    public void setLocationAccuracy(Double locationAccuracy) { this.locationAccuracy = locationAccuracy; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getVoiceTranscript() { return voiceTranscript; }
    public void setVoiceTranscript(String voiceTranscript) { this.voiceTranscript = voiceTranscript; }

    public String getAiCategory() { return aiCategory; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }

    public Integer getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Integer aiConfidence) { this.aiConfidence = aiConfidence; }

    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

    public String getPriorityReason() { return priorityReason; }
    public void setPriorityReason(String priorityReason) { this.priorityReason = priorityReason; }

    public String getImageAnalysisResult() { return imageAnalysisResult; }
    public void setImageAnalysisResult(String imageAnalysisResult) { this.imageAnalysisResult = imageAnalysisResult; }

    public Boolean getCreatedFromVoice() { return createdFromVoice; }
    public void setCreatedFromVoice(Boolean createdFromVoice) { this.createdFromVoice = createdFromVoice; }

    public Boolean getCreatedFromCamera() { return createdFromCamera; }
    public void setCreatedFromCamera(Boolean createdFromCamera) { this.createdFromCamera = createdFromCamera; }

    public User getAssignedWorker() { return assignedWorker; }
    public void setAssignedWorker(User assignedWorker) { this.assignedWorker = assignedWorker; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    /** Get assigned worker name without exposing the entire User object */
    public String getAssignedWorkerName() {
        return assignedWorker != null ? assignedWorker.getFullName() : null;
    }

    /** Get citizen name without exposing the entire User object */
    public String getCitizenName() {
        return citizen != null ? citizen.getFullName() : null;
    }
}
