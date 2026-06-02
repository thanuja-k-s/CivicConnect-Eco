package com.civicconnect.dto;

public class UpdateStatusDTO {
    private String status;
    private String resolutionNotes;

    public UpdateStatusDTO() {}

    public UpdateStatusDTO(String status, String resolutionNotes) {
        this.status = status;
        this.resolutionNotes = resolutionNotes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
