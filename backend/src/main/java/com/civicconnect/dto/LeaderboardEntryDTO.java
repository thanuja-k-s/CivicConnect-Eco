package com.civicconnect.dto;

public class LeaderboardEntryDTO {
    private Integer rank;
    private Long userId;
    private String userName;
    private Integer totalPoints;
    private String topBadgeName;
    private String topBadgeIcon;
    private Long attendedEvents;

    public LeaderboardEntryDTO() {}

    public LeaderboardEntryDTO(Integer rank, Long userId, String userName, Integer totalPoints) {
        this.rank = rank;
        this.userId = userId;
        this.userName = userName;
        this.totalPoints = totalPoints;
    }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }
    public String getTopBadgeName() { return topBadgeName; }
    public void setTopBadgeName(String topBadgeName) { this.topBadgeName = topBadgeName; }
    public String getTopBadgeIcon() { return topBadgeIcon; }
    public void setTopBadgeIcon(String topBadgeIcon) { this.topBadgeIcon = topBadgeIcon; }
    public Long getAttendedEvents() { return attendedEvents; }
    public void setAttendedEvents(Long attendedEvents) { this.attendedEvents = attendedEvents; }
}
