package com.civicconnect.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "eco_point_transactions")
public class EcoPointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private String reason; // Human-readable reason

    @Column(nullable = false)
    private String transactionType;
    // EVENT_REGISTRATION, EVENT_ATTENDANCE, TREE_PLANTATION, CLEANUP_DRIVE,
    // RECYCLING_EVENT, AWARENESS_PROGRAM, CIVIC_COMPLAINT, CRITICAL_COMPLAINT,
    // VOLUNTEER_MILESTONE

    @Column
    private Long referenceId; // eventId or complaintId

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public EcoPointTransaction() {}

    public EcoPointTransaction(User user, Integer points, String reason, String transactionType, Long referenceId) {
        this.user = user;
        this.points = points;
        this.reason = reason;
        this.transactionType = transactionType;
        this.referenceId = referenceId;
        this.createdAt = LocalDateTime.now();
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getUserId() { return user != null ? user.getId() : null; }
    public String getUserName() { return user != null ? user.getFullName() : null; }
}
