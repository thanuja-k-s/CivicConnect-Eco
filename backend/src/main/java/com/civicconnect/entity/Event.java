package com.civicconnect.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String eventType;
    // TREE_PLANTATION, BEACH_CLEANUP, LAKE_CLEANUP, ROAD_CLEANUP,
    // PLASTIC_COLLECTION, RECYCLING_WORKSHOP, AWARENESS_CAMPAIGN,
    // E_WASTE_COLLECTION, WATER_CONSERVATION, COMMUNITY_CLEANUP,
    // WILDLIFE_PROTECTION, OTHER

    @Column(columnDefinition = "TEXT")
    private String bannerImage;

    @Column(nullable = false)
    private LocalDate date;

    @Column
    private LocalTime startTime;

    @Column
    private LocalTime endTime;

    @Column(nullable = false)
    private String locationName;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double latitude;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double longitude;

    @Column(nullable = false)
    private Integer maxParticipants = 100;

    @Column(nullable = false)
    private Integer currentParticipants = 0;

    @Column(nullable = false)
    private Integer rewardPoints = 50;

    @Column(columnDefinition = "TEXT")
    private String requiredMaterials;

    @Column(columnDefinition = "TEXT")
    private String organizerNotes;

    @Column(nullable = false)
    private String status = "UPCOMING"; // UPCOMING, ONGOING, COMPLETED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    @JsonIgnore
    private Ngo ngo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Event() {}

    // ─── Getters and Setters ─────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public Integer getCurrentParticipants() { return currentParticipants; }
    public void setCurrentParticipants(Integer currentParticipants) { this.currentParticipants = currentParticipants; }

    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer rewardPoints) { this.rewardPoints = rewardPoints; }

    public String getRequiredMaterials() { return requiredMaterials; }
    public void setRequiredMaterials(String requiredMaterials) { this.requiredMaterials = requiredMaterials; }

    public String getOrganizerNotes() { return organizerNotes; }
    public void setOrganizerNotes(String organizerNotes) { this.organizerNotes = organizerNotes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Ngo getNgo() { return ngo; }
    public void setNgo(Ngo ngo) { this.ngo = ngo; }

    public String getNgoName() { return ngo != null ? ngo.getName() : null; }
    public Long getNgoId() { return ngo != null ? ngo.getId() : null; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
