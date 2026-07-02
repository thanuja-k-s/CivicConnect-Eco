package com.civicconnect.service;

import com.civicconnect.dto.ImpactDashboardDTO;
import com.civicconnect.repository.*;
import com.civicconnect.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

@Service
public class ImpactAnalyticsService {

    private final EventRepository eventRepository;
    private final EcoImpactRecordRepository impactRepository;
    private final ParticipationRepository participationRepository;
    private final NgoRepository ngoRepository;
    private final ComplaintRepository complaintRepository;

    public ImpactAnalyticsService(EventRepository eventRepository,
                                   EcoImpactRecordRepository impactRepository,
                                   ParticipationRepository participationRepository,
                                   NgoRepository ngoRepository,
                                   ComplaintRepository complaintRepository) {
        this.eventRepository = eventRepository;
        this.impactRepository = impactRepository;
        this.participationRepository = participationRepository;
        this.ngoRepository = ngoRepository;
        this.complaintRepository = complaintRepository;
    }

    public ImpactDashboardDTO getDashboardStats() {
        ImpactDashboardDTO dto = new ImpactDashboardDTO();

        dto.setTotalEvents(eventRepository.count());
        dto.setCompletedEvents(eventRepository.countAllCompleted());
        dto.setUpcomingEvents(eventRepository.countAllUpcoming());
        dto.setTotalVolunteers(participationRepository.countDistinctVolunteers());

        dto.setTreesPlanted(impactRepository.sumTotalTreesPlanted());
        dto.setWasteCollectedKg(impactRepository.sumTotalWasteCollectedKg());
        dto.setPlasticRemovedKg(impactRepository.sumTotalPlasticRemovedKg());
        dto.setVolunteerHours(impactRepository.sumTotalVolunteerHours());

        // Complaints resolved
        long resolved = complaintRepository.findByStatus("RESOLVED").size();
        dto.setComplaintsResolved(resolved);

        // Active NGOs
        dto.setActiveNgos((long) ngoRepository.findByStatus("ACTIVE").size());

        // CO2 reduction estimate: 21 kg/tree/year + 0.5 kg per kg waste diverted
        int trees = dto.getTreesPlanted() != null ? dto.getTreesPlanted() : 0;
        double waste = dto.getWasteCollectedKg() != null ? dto.getWasteCollectedKg() : 0;
        dto.setCo2ReductionEstimateKg(trees * 21.0 + waste * 0.5);

        return dto;
    }
}
