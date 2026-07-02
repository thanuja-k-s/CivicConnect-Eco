package com.civicconnect.controller;

import com.civicconnect.dto.ImpactDashboardDTO;
import com.civicconnect.service.ImpactAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/impact")
public class EcoImpactController {

    private final ImpactAnalyticsService analyticsService;

    public EcoImpactController(ImpactAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ImpactDashboardDTO> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }
}
