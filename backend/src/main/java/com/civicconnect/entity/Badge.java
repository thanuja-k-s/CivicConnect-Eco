package com.civicconnect.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer requiredPoints;

    @Column(nullable = false)
    private String icon; // emoji or icon identifier

    @Column(nullable = false, unique = true)
    private String badgeCode; // GREEN_STARTER, ECO_WARRIOR, TREE_GUARDIAN, etc.

    @Column(nullable = false)
    private Integer sortOrder = 0;

    public Badge() {}

    public Badge(String name, String description, Integer requiredPoints, String icon, String badgeCode, Integer sortOrder) {
        this.name = name;
        this.description = description;
        this.requiredPoints = requiredPoints;
        this.icon = icon;
        this.badgeCode = badgeCode;
        this.sortOrder = sortOrder;
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRequiredPoints() { return requiredPoints; }
    public void setRequiredPoints(Integer requiredPoints) { this.requiredPoints = requiredPoints; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getBadgeCode() { return badgeCode; }
    public void setBadgeCode(String badgeCode) { this.badgeCode = badgeCode; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
