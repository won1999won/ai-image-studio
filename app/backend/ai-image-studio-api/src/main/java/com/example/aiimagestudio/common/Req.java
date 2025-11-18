package com.example.aiimagestudio.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;

public class Req {
    public static String emailFromBearer(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new IllegalArgumentException("missing_auth");
        return authHeader.substring("Bearer ".length());
    }

    public record Error(String code, String message) {
        public static ResponseEntity<Error> of(String code, String message, HttpStatus status) {
            return ResponseEntity.status(status).body(new Error(code, message));
        }
    }
}
