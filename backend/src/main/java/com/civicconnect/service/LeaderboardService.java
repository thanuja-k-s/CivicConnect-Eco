package com.civicconnect.service;

import com.civicconnect.dto.LeaderboardEntryDTO;
import com.civicconnect.repository.EcoPointTransactionRepository;
import com.civicconnect.repository.ParticipationRepository;
import com.civicconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {

    private final EcoPointTransactionRepository pointRepository;
    private final UserRepository userRepository;
    private final ParticipationRepository participationRepository;
    private final BadgeService badgeService;

    public LeaderboardService(EcoPointTransactionRepository pointRepository,
                               UserRepository userRepository,
                               ParticipationRepository participationRepository,
                               BadgeService badgeService) {
        this.pointRepository = pointRepository;
        this.userRepository = userRepository;
        this.participationRepository = participationRepository;
        this.badgeService = badgeService;
    }

    public List<LeaderboardEntryDTO> getLeaderboard(String period) {
        List<Object[]> rawData;

        switch (period.toLowerCase()) {
            case "weekly" -> {
                LocalDateTime weekStart = LocalDateTime.now()
                        .with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                rawData = pointRepository.findLeaderboardSince(weekStart);
            }
            case "monthly" -> {
                LocalDateTime monthStart = LocalDateTime.now()
                        .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                rawData = pointRepository.findLeaderboardSince(monthStart);
            }
            default -> rawData = pointRepository.findLeaderboardAllTime();
        }

        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rawData) {
            Long userId = ((Number) row[0]).longValue();
            Integer points = ((Number) row[1]).intValue();

            LeaderboardEntryDTO entry = new LeaderboardEntryDTO();
            entry.setRank(rank++);
            entry.setUserId(userId);
            entry.setTotalPoints(points);

            userRepository.findById(userId).ifPresent(u -> {
                entry.setUserName(u.getFullName());
            });

            entry.setTopBadgeName(badgeService.getTopBadgeName(userId));
            entry.setTopBadgeIcon(badgeService.getTopBadgeIcon(userId));
            entry.setAttendedEvents(participationRepository.countAttendedByUserId(userId));

            entries.add(entry);
            if (rank > 100) break; // limit to top 100
        }
        return entries;
    }
}
