package com.example.aiimagestudio.auth;

import com.example.aiimagestudio.auth.dto.LoginRequest;
import com.example.aiimagestudio.auth.dto.LoginResponse;
import com.example.aiimagestudio.auth.dto.RegisterRequest;
import com.example.aiimagestudio.user.User;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwt;
    private final AuthService auth;

    public AuthController(JwtUtil jwt, AuthService auth) {
        this.jwt = jwt;
        this.auth = auth;
    }

    @PostMapping("/register")
    public LoginResponse register(@Valid @RequestBody RegisterRequest req) {
        User u = auth.register(req.getEmail(), req.getPassword());
        String token = jwt.generate(u.getEmail());
        return new LoginResponse(token, u.getEmail());
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        User u = auth.authenticate(req.getEmail(), req.getPassword());
        String token = jwt.generate(u.getEmail());
        return new LoginResponse(token, u.getEmail());
    }
}
