package com.example.aiimagestudio.common;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    record ApiError(String code, String message, Instant timestamp) {}

    // 우리가 던진 IllegalArgumentException을 코드로 매핑
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        String code = ex.getMessage();
        return switch (code) {
            case "email_already_exists" ->
                    ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ApiError(code, "이미 사용 중인 이메일입니다.", Instant.now()));
            case "invalid_credentials" ->
                    ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new ApiError(code, "이메일 또는 비밀번호가 올바르지 않습니다.", Instant.now()));
            default ->
                    ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ApiError("bad_request", ex.getMessage(), Instant.now()));
        };
    }

    // DB 유니크 제약 등 (중복 이메일이 DB 레벨에서 터질 때)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("email_already_exists", "이미 사용 중인 이메일입니다.", Instant.now()));
    }

    // @Valid 검증 실패 (이메일 형식 등)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiError("validation_error", msg, Instant.now()));
    }
}
