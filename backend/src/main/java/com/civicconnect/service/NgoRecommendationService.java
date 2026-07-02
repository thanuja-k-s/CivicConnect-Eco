package com.civicconnect.service;

import com.civicconnect.entity.Ngo;
import com.civicconnect.entity.User;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.NgoRepository;
import com.civicconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

/**
 * AI Hotspot Detection + NGO Recommendation Engine.
 *
 * Detects when a geographic area has too many complaints of the same category,
 * then automatically notifies relevant NGOs to organize a cleanup/action event.
 *
 * This service is modular: future ML models can replace the threshold-based
 * detection logic without changing the notification/recommendation pipeline.
 */
@Service
public class NgoRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(NgoRecommendationService.class);

    // Threshold: notify NGOs when this many complaints exist in the same category
    private static final int COMPLAINT_THRESHOLD = 10;

    // Category → recommended event type mapping
    private static final Map<String, String> CATEGORY_TO_EVENT = Map.of(
        "garbage",        "COMMUNITY_CLEANUP",
        "illegal-dumping","COMMUNITY_CLEANUP",
        "pollution",      "AWARENESS_CAMPAIGN",
        "water",          "WATER_CONSERVATION",
        "drainage",       "COMMUNITY_CLEANUP",
        "road",           "COMMUNITY_CLEANUP",
        "tree-fall",      "TREE_PLANTATION"
    );

    private final ComplaintRepository complaintRepository;
    private final NgoRepository ngoRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public NgoRecommendationService(ComplaintRepository complaintRepository,
                                     NgoRepository ngoRepository,
                                     UserRepository userRepository,
                                     NotificationService notificationService,
                                     EmailService emailService) {
        this.complaintRepository = complaintRepository;
        this.ngoRepository = ngoRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    /**
     * Called after every new complaint is saved.
     * Counts complaints by category, triggers NGO notification when threshold hit.
     */
    public void analyzeAndNotify(String category, String area) {
        try {
            List<?> categoryComplaints = complaintRepository.findByCategory(category);
            int count = categoryComplaints.size();

            if (count >= COMPLAINT_THRESHOLD && count % COMPLAINT_THRESHOLD == 0) {
                String recommendedEvent = CATEGORY_TO_EVENT.getOrDefault(category.toLowerCase(), "COMMUNITY_CLEANUP");
                notifyActiveNgos(category, area, count, recommendedEvent);
            }
        } catch (Exception e) {
            log.warn("[NgoRecommendationService] Analysis failed: {}", e.getMessage());
        }
    }

    private void notifyActiveNgos(String category, String area, int count, String eventType) {
        List<Ngo> activeNgos = ngoRepository.findByStatus("ACTIVE");
        if (activeNgos.isEmpty()) {
            log.info("[NgoRecommendation] No active NGOs to notify.");
            return;
        }

        String friendlyCategory = category.replace("-", " ");
        String message = "🚨 Hotspot Alert: " + count + " " + friendlyCategory +
                " complaints detected in " + area + ". Consider organizing a " + eventType.replace("_", " ") + "!";

        for (Ngo ngo : activeNgos) {
            // In-app notification to NGO owner
            userRepository.findById(ngo.getCreatedByUserId()).ifPresent(user -> {
                notificationService.createNotification(user,
                        "🚨 Environmental Hotspot Detected",
                        message, "NGO_RECOMMENDATION", null);
            });

            // Email alert
            emailService.sendNgoHotspotAlert(ngo.getEmail(), ngo.getName(),
                    friendlyCategory, area, count);

            log.info("[NgoRecommendation] Notified NGO '{}' about {} hotspot in {}",
                    ngo.getName(), category, area);
        }
    }
}
