package com.civicconnect.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateEventDTO {
    private String title;
    private String description;
    private String eventType;
    private String bannerImage;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private Integer maxParticipants;
    private Integer rewardPoints;
    private String requiredMaterials;
    private String organizerNotes;
    private Long ngoId;

    public CreateEventDTO() {}

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
    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer rewardPoints) { this.rewardPoints = rewardPoints; }
    public String getRequiredMaterials() { return requiredMaterials; }
    public void setRequiredMaterials(String requiredMaterials) { this.requiredMaterials = requiredMaterials; }
    public String getOrganizerNotes() { return organizerNotes; }
    public void setOrganizerNotes(String organizerNotes) { this.organizerNotes = organizerNotes; }
    public Long getNgoId() { return ngoId; }
    public void setNgoId(Long ngoId) { this.ngoId = ngoId; }
}
