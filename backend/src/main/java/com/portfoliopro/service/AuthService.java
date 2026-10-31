package com.portfoliopro.service;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.entity.User;
import com.portfoliopro.repository.UserRepository;
import com.portfoliopro.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;
    private final SnapshotService snapshots;

    @Transactional
    public AuthResponse signup(SignupRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw new IllegalArgumentException("This email is already registered");
        User u = new User();
        u.setName(r.name().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(r.password()));
        u = users.save(u);
        snapshots.backfill(u, 6);   // so the history chart has a starting line
        snapshots.upsertToday(u);
        return new AuthResponse(jwt.generate(u.getId(), u.getEmail()), u.getName(), u.getEmail());
    }

    public AuthResponse login(LoginRequest r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
                .filter(x -> encoder.matches(r.password(), x.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Email or password is incorrect"));
        return new AuthResponse(jwt.generate(u.getId(), u.getEmail()), u.getName(), u.getEmail());
    }

    @Transactional
    public AuthResponse loginWithGoogle() {
        String googleEmail = "google.investor@portfoliopro.local";
        User u = users.findByEmail(googleEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setName("Google Investor");
            newUser.setEmail(googleEmail);
            newUser.setPassword(encoder.encode(java.util.UUID.randomUUID().toString()));
            newUser.setBalance(new java.math.BigDecimal("1000000.00"));
            newUser = users.save(newUser);
            snapshots.backfill(newUser, 6);
            snapshots.upsertToday(newUser);
            return newUser;
        });
        return new AuthResponse(jwt.generate(u.getId(), u.getEmail()), u.getName(), u.getEmail());
    }
}
