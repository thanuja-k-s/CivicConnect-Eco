package com.civicconnect.controller;

import com.civicconnect.dto.GpsAttendanceDTO;
import com.civicconnect.entity.Participation;
import com.civicconnect.service.ParticipationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/participation")
public class ParticipationController {

    private final ParticipationService participationService;

    public ParticipationController(ParticipationService participationService) {
        this.participationService = participationService;
    }

    @PostMapping("/join/{eventId}")
    public ResponseEntity<?> joinEvent(@PathVariable Long eventId, @RequestBody Map<String, Long> body) {
        try {
            Long userId = body.get("userId");
            Participation p = participationService.joinEvent(userId, eventId);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/cancel/{eventId}")
    public ResponseEntity<?> cancelParticipation(@PathVariable Long eventId,
                                                  @RequestParam Long userId) {
        try {
            participationService.cancelParticipation(userId, eventId);
            return ResponseEntity.ok(Map.of("message", "Participation cancelled successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GPS-based attendance verification.
     * Citizen must be within 100 metres of the event location.
     */
    @PostMapping("/attend/gps")
    public ResponseEntity<?> verifyGpsAttendance(@RequestBody GpsAttendanceDTO dto) {
        try {
            Participation p = participationService.verifyGpsAttendance(
                    dto.getUserId(), dto.getEventId(), dto.getLatitude(), dto.getLongitude());
            return ResponseEntity.ok(Map.of(
                    "message", "Attendance verified successfully! Eco Points awarded.",
                    "status", p.getStatus(),
                    "distanceMeters", p.getDistanceFromEvent(),
                    "attendedAt", p.getAttendedAt().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Participation>> getUserParticipations(@PathVariable Long userId) {
        return ResponseEntity.ok(participationService.findByUserId(userId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Participation>> getEventParticipants(@PathVariable Long eventId) {
        return ResponseEntity.ok(participationService.findByEventId(eventId));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getParticipationStatus(@RequestParam Long userId, @RequestParam Long eventId) {
        return participationService.findByUserAndEvent(userId, eventId)
                .map(p -> ResponseEntity.ok(Map.of("status", p.getStatus(), "joinedAt", p.getJoinedAt().toString())))
                .orElse(ResponseEntity.ok(Map.of("status", "NOT_REGISTERED")));
    }
}
