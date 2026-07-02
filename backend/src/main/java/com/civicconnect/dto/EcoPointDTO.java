package com.civicconnect.dto;

import java.time.LocalDateTime;

public class EcoPointDTO {
    private Long userId;
    private String userName;
    private Integer totalPoints;
    private Integer monthlyPoints;
    private Integer weeklyPoints;
    private Integer lifetimePoints;

    public EcoPointDTO() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }
    public Integer getMonthlyPoints() { return monthlyPoints; }
    public void setMonthlyPoints(Integer monthlyPoints) { this.monthlyPoints = monthlyPoints; }
    public Integer getWeeklyPoints() { return weeklyPoints; }
    public void setWeeklyPoints(Integer weeklyPoints) { this.weeklyPoints = weeklyPoints; }
    public Integer getLifetimePoints() { return lifetimePoints; }
    public void setLifetimePoints(Integer lifetimePoints) { this.lifetimePoints = lifetimePoints; }
}
