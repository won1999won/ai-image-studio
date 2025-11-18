package com.example.aiimagestudio.job.dto;

import jakarta.validation.constraints.NotBlank;

public class JobDtos {
    public static class CreateReq {
        // 간단히 JSON 문자열로 받음(후에 구조화 가능)
        @NotBlank
        public String paramsJson;
    }
    public static class Res {
        public Long id;
        public Long projectId;
        public String status;
        public String paramsJson;
        public java.time.Instant createdAt;
        public Res(Long id, Long projectId, String status, String paramsJson, java.time.Instant createdAt) {
            this.id = id; this.projectId = projectId; this.status = status; this.paramsJson = paramsJson; this.createdAt = createdAt;
        }
    }
}
