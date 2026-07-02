package com.civicconnect.service;

import com.civicconnect.entity.Badge;
import com.civicconnect.entity.User;
import com.civicconnect.entity.UserBadge;
import com.civicconnect.repository.BadgeRepository;
import com.civicconnect.repository.EcoPointTransactionRepository;
import com.civicconnect.repository.UserBadgeRepository;
import com.civicconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class BadgeService {

    private static final Logger log = LoggerFactory.getLogger(BadgeService.class);

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final EcoPointTransactionRepository pointRepository;
    private final EmailService emailService;

    public BadgeService(BadgeRepository badgeRepository,
                        UserBadgeRepository userBadgeRepository,
                        UserRepository userRepository,
                        EcoPointTransactionRepository pointRepository,
                        EmailService emailService) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userRepository = userRepository;
        this.pointRepository = pointRepository;
        this.emailService = emailService;
    }

    /** Seeds the 6 badge tiers on startup if not already present. */
    @PostConstruct
    public void seedBadges() {
        if (badgeRepository.count() == 0) {
            badgeRepository.save(new Badge("Green Starter", "Awarded for earning 100 Eco Points", 100, "🌱", "GREEN_STARTER", 1));
            badgeRepository.save(new Badge("Eco Warrior", "Awarded for earning 500 Eco Points", 500, "⚔️", "ECO_WARRIOR", 2));
            badgeRepository.save(new Badge("Tree Guardian", "Awarded for earning 1000 Eco Points", 1000, "🌳", "TREE_GUARDIAN", 3));
            badgeRepository.save(new Badge("Community Hero", "Awarded for earning 2000 Eco Points", 2000, "🦸", "COMMUNITY_HERO", 4));
            badgeRepository.save(new Badge("Environment Champion", "Awarded for earning 2500 Eco Points", 2500, "🏆", "ENV_CHAMPION", 5));
            badgeRepository.save(new Badge("Green Legend", "Awarded for earning 5000 Eco Points", 5000, "🌍", "GREEN_LEGEND", 6));
            log.info("[BadgeService] 6 badge tiers seeded.");
        }
    }

    @Transactional
    public void evaluateAndAwardBadges(Long userId) {
        int totalPoints = pointRepository.sumPointsByUserId(userId);
        List<Badge> eligibleBadges = badgeRepository.findByRequiredPointsLessThanEqualOrderBySortOrderAsc(totalPoints);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        for (Badge badge : eligibleBadges) {
            boolean alreadyAwarded = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());
            if (!alreadyAwarded) {
                userBadgeRepository.save(new UserBadge(user, badge));
                emailService.sendBadgeAwardEmail(user.getEmail(), user.getFullName(),
                        badge.getName(), badge.getIcon());
                log.info("[BadgeService] Badge '{}' awarded to user {}", badge.getName(), userId);
            }
        }
    }

    public List<Badge> getAllBadges() {
        return badgeRepository.findAllByOrderBySortOrderAsc();
    }

    public List<UserBadge> getUserBadges(Long userId) {
        return userBadgeRepository.findByUserIdOrderByAwardedAtDesc(userId);
    }

    public String getTopBadgeName(Long userId) {
        List<UserBadge> badges = userBadgeRepository.findByUserIdOrderByAwardedAtDesc(userId);
        if (badges.isEmpty()) return null;
        return badges.stream()
                .map(ub -> ub.getBadge())
                .max(java.util.Comparator.comparingInt(Badge::getRequiredPoints))
                .map(Badge::getName)
                .orElse(null);
    }

    public String getTopBadgeIcon(Long userId) {
        List<UserBadge> badges = userBadgeRepository.findByUserIdOrderByAwardedAtDesc(userId);
        if (badges.isEmpty()) return "🌱";
        return badges.stream()
                .map(ub -> ub.getBadge())
                .max(java.util.Comparator.comparingInt(Badge::getRequiredPoints))
                .map(Badge::getIcon)
                .orElse("🌱");
    }
}
