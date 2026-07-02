package com.civicconnect.controller;

import com.civicconnect.dto.NgoRegistrationDTO;
import com.civicconnect.entity.Ngo;
import com.civicconnect.service.NgoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ngo")
public class NgoController {

    private final NgoService ngoService;

    public NgoController(NgoService ngoService) {
        this.ngoService = ngoService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody NgoRegistrationDTO dto) {
        try {
            Ngo ngo = ngoService.register(dto);
            return ResponseEntity.ok(ngo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<?> getMyNgo(@PathVariable Long userId) {
        return ngoService.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ngoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Ngo>> getAll() {
        return ResponseEntity.ok(ngoService.findAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Ngo>> getPending() {
        return ResponseEntity.ok(ngoService.findPendingNgos());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Ngo>> getActive() {
        return ResponseEntity.ok(ngoService.findActiveNgos());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ngoService.approveNgo(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            return ResponseEntity.ok(ngoService.rejectNgo(id, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspend(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ngoService.suspendNgo(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
