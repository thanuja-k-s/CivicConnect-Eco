package com.civicconnect.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "eco_impact_records")
public class EcoImpactRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    @Column(nullable = false)
    private Integer treesPlanned = 0;

    @Column(nullable = false)
    private Integer treesPlanted = 0;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double wasteCollectedKg = 0.0;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double plasticRemovedKg = 0.0;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double recyclabesCollectedKg = 0.0;

    @Column(nullable = false)
    private Integer volunteersParticipated = 0;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double volunteerHours = 0.0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public EcoImpactRecord() {}

    public EcoImpactRecord(Event event) {
        this.event = event;
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Integer getTreesPlanned() { return treesPlanned; }
    public void setTreesPlanned(Integer treesPlanned) { this.treesPlanned = treesPlanned; }

    public Integer getTreesPlanted() { return treesPlanted; }
    public void setTreesPlanted(Integer treesPlanted) { this.treesPlanted = treesPlanted; }

    public Double getWasteCollectedKg() { return wasteCollectedKg; }
    public void setWasteCollectedKg(Double wasteCollectedKg) { this.wasteCollectedKg = wasteCollectedKg; }

    public Double getPlasticRemovedKg() { return plasticRemovedKg; }
    public void setPlasticRemovedKg(Double plasticRemovedKg) { this.plasticRemovedKg = plasticRemovedKg; }

    public Double getRecyclabesCollectedKg() { return recyclabesCollectedKg; }
    public void setRecyclabesCollectedKg(Double recyclabesCollectedKg) { this.recyclabesCollectedKg = recyclabesCollectedKg; }

    public Integer getVolunteersParticipated() { return volunteersParticipated; }
    public void setVolunteersParticipated(Integer volunteersParticipated) { this.volunteersParticipated = volunteersParticipated; }

    public Double getVolunteerHours() { return volunteerHours; }
    public void setVolunteerHours(Double volunteerHours) { this.volunteerHours = volunteerHours; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getEventId() { return event != null ? event.getId() : null; }
    public String getEventTitle() { return event != null ? event.getTitle() : null; }
}
