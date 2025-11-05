package com.example.aiimagestudio.auth;

import com.example.aiimagestudio.user.User;
import com.example.aiimagestudio.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository users) {
        this.users = users;
    }

    public User register(String email, String rawPassword) {
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("email_already_exists");
        }
        String hash = encoder.encode(rawPassword);
        return users.save(new User(email, hash));
    }

    public User authenticate(String email, String rawPassword) {
        User u = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("invalid_credentials"));
        if (!encoder.matches(rawPassword, u.getPasswordHash())) {
            throw new IllegalArgumentException("invalid_credentials");
        }
        return u;
    }
}
