package com.civicconnect.dto;

public class ImpactDashboardDTO {
    private Long totalEvents;
    private Long completedEvents;
    private Long upcomingEvents;
    private Long totalVolunteers;
    private Integer treesPlanted;
    private Double wasteCollectedKg;
    private Double plasticRemovedKg;
    private Double volunteerHours;
    private Long complaintsResolved;
    private Long activeNgos;
    private Double co2ReductionEstimateKg; // calculated estimate

    public ImpactDashboardDTO() {}

    public Long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(Long totalEvents) { this.totalEvents = totalEvents; }
    public Long getCompletedEvents() { return completedEvents; }
    public void setCompletedEvents(Long completedEvents) { this.completedEvents = completedEvents; }
    public Long getUpcomingEvents() { return upcomingEvents; }
    public void setUpcomingEvents(Long upcomingEvents) { this.upcomingEvents = upcomingEvents; }
    public Long getTotalVolunteers() { return totalVolunteers; }
    public void setTotalVolunteers(Long totalVolunteers) { this.totalVolunteers = totalVolunteers; }
    public Integer getTreesPlanted() { return treesPlanted; }
    public void setTreesPlanted(Integer treesPlanted) { this.treesPlanted = treesPlanted; }
    public Double getWasteCollectedKg() { return wasteCollectedKg; }
    public void setWasteCollectedKg(Double wasteCollectedKg) { this.wasteCollectedKg = wasteCollectedKg; }
    public Double getPlasticRemovedKg() { return plasticRemovedKg; }
    public void setPlasticRemovedKg(Double plasticRemovedKg) { this.plasticRemovedKg = plasticRemovedKg; }
    public Double getVolunteerHours() { return volunteerHours; }
    public void setVolunteerHours(Double volunteerHours) { this.volunteerHours = volunteerHours; }
    public Long getComplaintsResolved() { return complaintsResolved; }
    public void setComplaintsResolved(Long complaintsResolved) { this.complaintsResolved = complaintsResolved; }
    public Long getActiveNgos() { return activeNgos; }
    public void setActiveNgos(Long activeNgos) { this.activeNgos = activeNgos; }
    public Double getCo2ReductionEstimateKg() { return co2ReductionEstimateKg; }
    public void setCo2ReductionEstimateKg(Double co2ReductionEstimateKg) { this.co2ReductionEstimateKg = co2ReductionEstimateKg; }
}
