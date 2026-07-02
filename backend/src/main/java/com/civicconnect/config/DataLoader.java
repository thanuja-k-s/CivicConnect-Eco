package com.civicconnect.config;

import com.civicconnect.entity.User;
import com.civicconnect.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates default test users on startup when they do not exist.
 * This helps local development so the documented demo credentials work.
 */
@Component
@Profile("!test")
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createIfMissing("admin@demo.com", "Admin User", "password", "ADMIN");
        createIfMissing("worker@demo.com", "Worker User", "password", "WORKER");
        createIfMissing("citizen@demo.com", "Citizen User", "password", "CITIZEN");
    }

    private void createIfMissing(String email, String fullName, String rawPassword, String role) {
        var existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User u = existing.get();
            String pw = u.getPassword();
            if (pw == null || !(pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$"))) {
                // Upgrade plaintext or non-BCrypt password to BCrypt using the known default.
                u.setPassword(passwordEncoder.encode(rawPassword));
                userRepository.save(u);
                System.out.println("[DataLoader] Upgraded password for existing user: " + email + " -> set to default '" + rawPassword + "'");
            }
            return;
        }

        User u = new User();
        u.setEmail(email);
        u.setFullName(fullName);
        u.setPhoneNumber("0000000000");
        u.setAddress("Local");
        u.setRole(role);
        u.setIsActive(true);
        u.setPassword(passwordEncoder.encode(rawPassword));

        userRepository.save(u);
        System.out.println("[DataLoader] Created default user: " + email + " / " + rawPassword);
    }
}
