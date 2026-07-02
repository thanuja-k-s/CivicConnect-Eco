package com.civicconnect.service;

import com.civicconnect.dto.CreateEventDTO;
import com.civicconnect.entity.Event;
import com.civicconnect.entity.Ngo;
import com.civicconnect.repository.EventRepository;
import com.civicconnect.repository.NgoRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    private final EventRepository eventRepository;
    private final NgoRepository ngoRepository;

    public EventService(EventRepository eventRepository, NgoRepository ngoRepository) {
        this.eventRepository = eventRepository;
        this.ngoRepository = ngoRepository;
    }

    public Event createEvent(CreateEventDTO dto) {
        Ngo ngo = ngoRepository.findById(dto.getNgoId())
                .orElseThrow(() -> new RuntimeException("NGO not found: " + dto.getNgoId()));

        if (!"ACTIVE".equals(ngo.getStatus())) {
            throw new RuntimeException("NGO must be ACTIVE to create events.");
        }

        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventType(dto.getEventType());
        event.setBannerImage(dto.getBannerImage());
        event.setDate(dto.getDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setLocationName(dto.getLocationName());
        event.setLatitude(dto.getLatitude());
        event.setLongitude(dto.getLongitude());
        event.setMaxParticipants(dto.getMaxParticipants() != null ? dto.getMaxParticipants() : 100);
        event.setRewardPoints(dto.getRewardPoints() != null ? dto.getRewardPoints() : 50);
        event.setRequiredMaterials(dto.getRequiredMaterials());
        event.setOrganizerNotes(dto.getOrganizerNotes());
        event.setNgo(ngo);
        event.setStatus("UPCOMING");
        event.setCurrentParticipants(0);
        return eventRepository.save(event);
    }

    public Optional<Event> findById(Long id) {
        return eventRepository.findById(id);
    }

    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    public List<Event> findByNgoId(Long ngoId) {
        return eventRepository.findByNgoIdOrderByDateAsc(ngoId);
    }

    public List<Event> findUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDate.now());
    }

    /**
     * Finds events within radiusKm of the given coordinates using
     * a bounding-box pre-filter + exact Haversine distance calculation.
     */
    public List<Event> findNearbyEvents(double lat, double lng, double radiusKm) {
        double deltaLat = Math.toDegrees(radiusKm / 6371.0);
        double deltaLng = Math.toDegrees(radiusKm / (6371.0 * Math.cos(Math.toRadians(lat))));

        // Repository doesn't expose a bounding-box query in this workspace snapshot.
        // Fallback: load all events and pre-filter by bounding box in memory.
        List<Event> all = eventRepository.findAll();
        List<Event> candidates = new ArrayList<>();
        double minLat = lat - deltaLat, maxLat = lat + deltaLat;
        double minLng = lng - deltaLng, maxLng = lng + deltaLng;
        for (Event e : all) {
            if (e.getLatitude() == null || e.getLongitude() == null) continue;
            if (e.getLatitude() >= minLat && e.getLatitude() <= maxLat
                    && e.getLongitude() >= minLng && e.getLongitude() <= maxLng) {
                candidates.add(e);
            }
        }

        List<Event> result = new ArrayList<>();
        for (Event e : candidates) {
            double distance = haversineDistance(lat, lng, e.getLatitude(), e.getLongitude());
            if (distance <= radiusKm * 1000) {
                result.add(e);
            }
        }
        return result;
    }

    public Event updateEvent(Long id, CreateEventDTO dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventType(dto.getEventType());
        event.setBannerImage(dto.getBannerImage());
        event.setDate(dto.getDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setLocationName(dto.getLocationName());
        event.setLatitude(dto.getLatitude());
        event.setLongitude(dto.getLongitude());
        event.setMaxParticipants(dto.getMaxParticipants());
        event.setRewardPoints(dto.getRewardPoints());
        event.setRequiredMaterials(dto.getRequiredMaterials());
        event.setOrganizerNotes(dto.getOrganizerNotes());
        return eventRepository.save(event);
    }

    public Event cancelEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setStatus("CANCELLED");
        return eventRepository.save(event);
    }

    public Event completeEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setStatus("COMPLETED");
        return eventRepository.save(event);
    }

    public void incrementParticipantCount(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setCurrentParticipants(event.getCurrentParticipants() + 1);
        eventRepository.save(event);
    }

    public void decrementParticipantCount(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        int current = event.getCurrentParticipants();
        event.setCurrentParticipants(Math.max(0, current - 1));
        eventRepository.save(event);
    }

    /**
     * Haversine formula: returns distance in meters between two GPS coordinates.
     */
    public static double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
