package com.example.aiimagestudio.project.dto;

import jakarta.validation.constraints.NotBlank;

public class ProjectDtos {
    public static class CreateReq {
        @NotBlank
        public String title;
    }
    public static class Res {
        public Long id;
        public String title;
        public String ownerEmail;
        public java.time.Instant createdAt;
        public Res(Long id, String title, String ownerEmail, java.time.Instant createdAt) {
            this.id = id; this.title = title; this.ownerEmail = ownerEmail; this.createdAt = createdAt;
        }
    }
}
