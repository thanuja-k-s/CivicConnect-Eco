package com.civicconnect.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "participations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "event_id"}))
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    @Column(nullable = false)
    private String status = "REGISTERED"; // REGISTERED, ATTENDED, COMPLETED, CANCELLED

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column
    private LocalDateTime attendedAt;

    // GPS attendance verification fields
    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double attendanceLat;

    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double attendanceLng;

    @Column(columnDefinition = "DOUBLE PRECISION")
    private Double distanceFromEvent; // in meters

    @Column
    private LocalDateTime attendanceTimestamp;

    public Participation() {}

    // ─── Getters and Setters ─────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getAttendedAt() { return attendedAt; }
    public void setAttendedAt(LocalDateTime attendedAt) { this.attendedAt = attendedAt; }

    public Double getAttendanceLat() { return attendanceLat; }
    public void setAttendanceLat(Double attendanceLat) { this.attendanceLat = attendanceLat; }

    public Double getAttendanceLng() { return attendanceLng; }
    public void setAttendanceLng(Double attendanceLng) { this.attendanceLng = attendanceLng; }

    public Double getDistanceFromEvent() { return distanceFromEvent; }
    public void setDistanceFromEvent(Double distanceFromEvent) { this.distanceFromEvent = distanceFromEvent; }

    public LocalDateTime getAttendanceTimestamp() { return attendanceTimestamp; }
    public void setAttendanceTimestamp(LocalDateTime attendanceTimestamp) { this.attendanceTimestamp = attendanceTimestamp; }

    // Convenience helpers (no extra fetch needed)
    public Long getUserId() { return user != null ? user.getId() : null; }
    public String getUserName() { return user != null ? user.getFullName() : null; }
    public Long getEventId() { return event != null ? event.getId() : null; }
    public String getEventTitle() { return event != null ? event.getTitle() : null; }
}
