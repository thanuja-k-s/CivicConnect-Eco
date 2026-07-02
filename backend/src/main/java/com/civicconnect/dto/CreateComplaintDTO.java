package com.civicconnect.dto;

/**
 * Data Transfer Object for creating a new complaint.
 * Extended to support voice transcripts, GPS accuracy, camera images,
 * and AI-generated category/priority fields.
 */
public class CreateComplaintDTO {
    // ─── Core Fields ─────────────────────────────────────────────────────────────
    private String title;
    private String description;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private String photoUrl;
    private Long citizenId;
    private String status = "PENDING";

    // ─── FEATURE 2: GPS Accuracy ─────────────────────────────────────────────────
    /** GPS accuracy in metres */
    private Double locationAccuracy;

    // ─── FEATURE 3: Camera Image ─────────────────────────────────────────────────
    /** Camera-captured image as Base64 data URL or storage URL */
    private String imageUrl;

    // ─── FEATURE 1: Voice Transcript ─────────────────────────────────────────────
    /** Full voice-to-text transcript */
    private String voiceTranscript;

    // ─── FEATURE 4: AI Category ──────────────────────────────────────────────────
    private String aiCategory;
    private Integer aiConfidence;

    // ─── FEATURE 5: AI Priority ──────────────────────────────────────────────────
    /** CRITICAL / HIGH / MEDIUM / LOW */
    private String priorityLevel;
    private String priorityReason;

    // ─── FEATURE 6: Image Analysis Result ────────────────────────────────────────
    /** JSON string containing detected objects and AI analysis */
    private String imageAnalysisResult;

    // ─── Source Flags ─────────────────────────────────────────────────────────────
    private Boolean createdFromVoice = false;
    private Boolean createdFromCamera = false;

    public CreateComplaintDTO() {}

    public CreateComplaintDTO(String title, String description, String category, String address, Long citizenId) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.address = address;
        this.citizenId = citizenId;
        this.status = "PENDING";
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────────
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

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

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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
}
