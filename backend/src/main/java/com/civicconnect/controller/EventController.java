package com.civicconnect.controller;

import com.civicconnect.dto.CreateEventDTO;
import com.civicconnect.entity.Event;
import com.civicconnect.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody CreateEventDTO dto) {
        try {
            Event event = eventService.createEvent(dto);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.findUpcomingEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        return eventService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<List<Event>> getEventsByNgo(@PathVariable Long ngoId) {
        return ResponseEntity.ok(eventService.findByNgoId(ngoId));
    }

    /**
     * Nearby events using Haversine distance.
     * Default radius: 20 km.
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<Event>> getNearbyEvents(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "20") double radiusKm) {
        return ResponseEntity.ok(eventService.findNearbyEvents(lat, lng, radiusKm));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody CreateEventDTO dto) {
        try {
            return ResponseEntity.ok(eventService.updateEvent(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelEvent(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventService.cancelEvent(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeEvent(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventService.completeEvent(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
