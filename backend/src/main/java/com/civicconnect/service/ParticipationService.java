package com.civicconnect.service;

import com.civicconnect.entity.*;
import com.civicconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ParticipationService {

    private static final double ATTENDANCE_RADIUS_METERS = 100.0;

    private final ParticipationRepository participationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EcoPointService ecoPointService;
    private final NotificationService notificationService;

    public ParticipationService(ParticipationRepository participationRepository,
                                 EventRepository eventRepository,
                                 UserRepository userRepository,
                                 EcoPointService ecoPointService,
                                 NotificationService notificationService) {
        this.participationRepository = participationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.ecoPointService = ecoPointService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Participation joinEvent(Long userId, Long eventId) {
        if (participationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Already registered for this event.");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        if (!"UPCOMING".equals(event.getStatus()) && !"ONGOING".equals(event.getStatus())) {
            throw new RuntimeException("Event is not accepting registrations.");
        }

        long activeCount = participationRepository.countActiveParticipantsByEventId(eventId);
        if (activeCount >= event.getMaxParticipants()) {
            throw new RuntimeException("Event is full. No slots available.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Participation p = new Participation();
        p.setUser(user);
        p.setEvent(event);
        p.setStatus("REGISTERED");
        p.setJoinedAt(LocalDateTime.now());
        Participation saved = participationRepository.save(p);

        event.setCurrentParticipants((int) activeCount + 1);
        eventRepository.save(event);

        // Award registration points
        ecoPointService.awardPoints(userId, 10, "Registered for event: " + event.getTitle(),
                "EVENT_REGISTRATION", eventId);

        notificationService.createNotification(user, "Event Registration Confirmed",
                "You are registered for: " + event.getTitle() + " on " + event.getDate(),
                "EVENT", eventId);

        return saved;
    }

    @Transactional
    public void cancelParticipation(Long userId, Long eventId) {
        Participation p = participationRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new RuntimeException("Not registered for this event."));

        if ("ATTENDED".equals(p.getStatus()) || "COMPLETED".equals(p.getStatus())) {
            throw new RuntimeException("Cannot cancel after attendance is verified.");
        }

        p.setStatus("CANCELLED");
        participationRepository.save(p);

        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null && event.getCurrentParticipants() > 0) {
            event.setCurrentParticipants(event.getCurrentParticipants() - 1);
            eventRepository.save(event);
        }
    }

    /**
     * GPS-based attendance verification.
     * Citizen must be within 100 metres of the event location.
     */
    @Transactional
    public Participation verifyGpsAttendance(Long userId, Long eventId, double citizenLat, double citizenLng) {
        Participation p = participationRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new RuntimeException("You are not registered for this event."));

        if ("ATTENDED".equals(p.getStatus()) || "COMPLETED".equals(p.getStatus())) {
            throw new RuntimeException("Attendance already verified.");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        double distance = EventService.haversineDistance(
                citizenLat, citizenLng, event.getLatitude(), event.getLongitude());

        p.setAttendanceLat(citizenLat);
        p.setAttendanceLng(citizenLng);
        p.setDistanceFromEvent(distance);
        p.setAttendanceTimestamp(LocalDateTime.now());

        if (distance > ATTENDANCE_RADIUS_METERS) {
            throw new RuntimeException(String.format(
                "You are %.0f m away from the event location. Must be within 100 m to verify attendance.", distance));
        }

        p.setStatus("ATTENDED");
        p.setAttendedAt(LocalDateTime.now());
        Participation saved = participationRepository.save(p);

        // Award attendance points based on event type
        int bonusPoints = getEventTypePoints(event.getEventType());
        ecoPointService.awardPoints(userId, 50, "Attended event: " + event.getTitle(),
                "EVENT_ATTENDANCE", eventId);
        if (bonusPoints > 0) {
            ecoPointService.awardPoints(userId, bonusPoints,
                    "Bonus for " + event.getEventType() + ": " + event.getTitle(),
                    event.getEventType(), eventId);
        }

        // Check for volunteer milestone bonus
        long totalAttended = participationRepository.countAttendedByUserId(userId);
        if (totalAttended % 5 == 0) {
            ecoPointService.awardPoints(userId, 100,
                    "Volunteer milestone: " + totalAttended + " events attended!",
                    "VOLUNTEER_MILESTONE", null);
            notificationService.createNotification(
                    p.getUser(), "🏅 Volunteer Milestone!",
                    "Amazing! You've attended " + totalAttended + " events and earned 100 bonus Eco Points!",
                    "BADGE", null);
        }

        notificationService.createNotification(p.getUser(),
                "✅ Attendance Verified",
                "Your attendance at " + event.getTitle() + " has been confirmed. Eco Points awarded!",
                "EVENT", eventId);

        return saved;
    }

    private int getEventTypePoints(String eventType) {
        if (eventType == null) return 0;
        return switch (eventType) {
            case "TREE_PLANTATION" -> 50;   // 50 base + 50 bonus = 100 total
            case "BEACH_CLEANUP", "LAKE_CLEANUP", "ROAD_CLEANUP", "COMMUNITY_CLEANUP" -> 30; // 50+30=80
            case "PLASTIC_COLLECTION" -> 30;
            case "RECYCLING_WORKSHOP" -> 20; // 50+20=70
            case "AWARENESS_CAMPAIGN" -> 0;  // just 50 base = 40 (reduced base for this type)
            default -> 0;
        };
    }

    public List<Participation> findByUserId(Long userId) {
        return participationRepository.findByUserId(userId);
    }

    public List<Participation> findByEventId(Long eventId) {
        return participationRepository.findByEventId(eventId);
    }

    public Optional<Participation> findByUserAndEvent(Long userId, Long eventId) {
        return participationRepository.findByUserIdAndEventId(userId, eventId);
    }
}
