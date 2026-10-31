package com.portfoliopro.controller;

import com.portfoliopro.dto.Dtos.*;
import com.portfoliopro.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest r) { return auth.signup(r); }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) { return auth.login(r); }

    @PostMapping("/google")
    public AuthResponse googleLogin() { return auth.loginWithGoogle(); }
}
