package com.civicconnect.controller;

import com.civicconnect.dto.LeaderboardEntryDTO;
import com.civicconnect.entity.Badge;
import com.civicconnect.entity.UserBadge;
import com.civicconnect.service.BadgeService;
import com.civicconnect.service.EcoPointService;
import com.civicconnect.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/gamification")
public class GamificationController {

    private final BadgeService badgeService;
    private final EcoPointService ecoPointService;
    private final LeaderboardService leaderboardService;

    public GamificationController(BadgeService badgeService,
                                   EcoPointService ecoPointService,
                                   LeaderboardService leaderboardService) {
        this.badgeService = badgeService;
        this.ecoPointService = ecoPointService;
        this.leaderboardService = leaderboardService;
    }

    // ── Badges ────────────────────────────────────────────────────────────────

    @GetMapping("/badges")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/badges/user/{userId}")
    public ResponseEntity<List<UserBadge>> getUserBadges(@PathVariable Long userId) {
        return ResponseEntity.ok(badgeService.getUserBadges(userId));
    }

    // ── Eco Points ────────────────────────────────────────────────────────────

    @GetMapping("/points/{userId}")
    public ResponseEntity<?> getUserPoints(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(ecoPointService.getUserPoints(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/points/{userId}/transactions")
    public ResponseEntity<?> getUserTransactions(@PathVariable Long userId) {
        return ResponseEntity.ok(ecoPointService.getUserTransactions(userId));
    }

    // ── Leaderboard ───────────────────────────────────────────────────────────

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(
            @RequestParam(defaultValue = "all-time") String period) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(period));
    }
}
