package com.civicconnect.service;

import com.civicconnect.dto.AuthResponseDTO;
import com.civicconnect.dto.RegisterDTO;
import com.civicconnect.entity.User;
import com.civicconnect.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponseDTO register(RegisterDTO dto) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // Hash password with BCrypt
        user.setFullName(dto.getName());
        user.setPhoneNumber(dto.getPhone());
        user.setRole(dto.getRole().toUpperCase());
        user.setAddress(dto.getAddress() != null ? dto.getAddress() : "Not provided");
        user.setIsActive(true);

        // Save user to database
        User savedUser = userRepository.save(user);

        // Generate JWT token (just UUID, no "Bearer-" prefix)
        String token = UUID.randomUUID().toString();

        return new AuthResponseDTO(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhoneNumber(),
                savedUser.getRole().toLowerCase(),
                token
        );
    }

    public AuthResponseDTO login(String email, String password) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check password using BCrypt
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Check if user is active
        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Generate JWT token (just UUID, no "Bearer-" prefix)
        String token = UUID.randomUUID().toString();

        return new AuthResponseDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().toLowerCase(),
                token
        );
    }
}
