package com.civicconnect.service;

import com.civicconnect.dto.EcoPointDTO;
import com.civicconnect.entity.EcoPointTransaction;
import com.civicconnect.entity.User;
import com.civicconnect.repository.EcoPointTransactionRepository;
import com.civicconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class EcoPointService {

    private final EcoPointTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;

    public EcoPointService(EcoPointTransactionRepository transactionRepository,
                            UserRepository userRepository,
                            BadgeService badgeService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.badgeService = badgeService;
    }

    @Transactional
    public EcoPointTransaction awardPoints(Long userId, int points, String reason,
                                            String transactionType, Long referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        EcoPointTransaction tx = new EcoPointTransaction(user, points, reason, transactionType, referenceId);
        EcoPointTransaction saved = transactionRepository.save(tx);

        // Auto-evaluate badges after every point transaction
        badgeService.evaluateAndAwardBadges(userId);

        return saved;
    }

    public EcoPointDTO getUserPoints(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        int total = transactionRepository.sumPointsByUserId(userId);

        LocalDateTime weekStart = LocalDateTime.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        int weekly = transactionRepository.sumPointsByUserIdSince(userId, weekStart);
        int monthly = transactionRepository.sumPointsByUserIdSince(userId, monthStart);

        EcoPointDTO dto = new EcoPointDTO();
        dto.setUserId(userId);
        dto.setUserName(user.getFullName());
        dto.setTotalPoints(total);
        dto.setWeeklyPoints(weekly);
        dto.setMonthlyPoints(monthly);
        dto.setLifetimePoints(total);
        return dto;
    }

    public List<EcoPointTransaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** Called when a civic complaint is submitted & verified */
    public void awardComplaintPoints(Long userId, boolean isCritical, Long complaintId) {
        if (isCritical) {
            awardPoints(userId, 30, "Critical complaint reported", "CRITICAL_COMPLAINT", complaintId);
        } else {
            awardPoints(userId, 20, "Civic complaint submitted", "CIVIC_COMPLAINT", complaintId);
        }
    }
}
