package com.example.aiimagestudio.job;

import com.example.aiimagestudio.project.Project;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="jobs")
public class Job {
    public enum Status { PENDING, RUNNING, DONE, ERROR }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=20)
    private Status status = Status.PENDING;

    @Lob
    private String paramsJson; // 옵션 저장용(간단히 문자열)

    @Column(nullable=false, updatable=false)
    private Instant createdAt = Instant.now();

    protected Job() {}
    public Job(Project project, String paramsJson) {
        this.project = project;
        this.paramsJson = paramsJson;
    }

    public Long getId() { return id; }
    public Project getProject() { return project; }
    public Status getStatus() { return status; }
    public String getParamsJson() { return paramsJson; }
    public Instant getCreatedAt() { return createdAt; }

    public void setStatus(Status s) { this.status = s; }
    public void setParamsJson(String p) { this.paramsJson = p; }
}
