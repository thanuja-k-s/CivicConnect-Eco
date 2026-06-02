package com.civicconnect.dto;

public class CreateComplaintDTO {
    private String title;
    private String description;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private String photoUrl;
    private Long citizenId;
    private String status = "PENDING";

    public CreateComplaintDTO() {}

    public CreateComplaintDTO(String title, String description, String category, String address, Long citizenId) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.address = address;
        this.citizenId = citizenId;
        this.status = "PENDING";
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Long getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(Long citizenId) {
        this.citizenId = citizenId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
