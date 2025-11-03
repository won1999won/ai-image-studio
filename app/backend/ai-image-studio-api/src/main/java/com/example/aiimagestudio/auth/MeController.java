package com.example.aiimagestudio.auth;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api")
public class MeController {

    private final JwtUtil jwt;

    public MeController(JwtUtil jwt) {
        this.jwt = jwt;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            if (auth == null || !auth.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        new ApiError("missing_auth", "Authorization: Bearer <token> header required"));
            }
            String token = auth.substring("Bearer ".length());
            String email = jwt.getEmail(token);

            return ResponseEntity.ok(new MeResponse(email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ApiError("invalid_token", e.getMessage()));
        }
    }

    static class MeResponse {
        public final String email;
        public MeResponse(String email) { this.email = email; }
    }

    static class ApiError {
        public final String code;
        public final String message;
        public ApiError(String code, String message) { this.code = code; this.message = message; }
    }
}
