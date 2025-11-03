package com.example.aiimagestudio.auth;

import com.example.aiimagestudio.auth.dto.LoginRequest;
import com.example.aiimagestudio.auth.dto.LoginResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwt;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        // Day2 뼈대: 실제 비번 검증 없이 이메일만 사용 (다음 단계에서 검증 추가 예정)
        String email = (req.getEmail() == null || req.getEmail().isBlank())
                ? "unknown@example.com" : req.getEmail();

        String jwtToken = jwt.generate(email);
        return new LoginResponse(jwtToken, email);
    }
}
