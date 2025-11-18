package com.example.aiimagestudio.project;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=320)
    private String ownerEmail;

    @Column(nullable=false, length=200)
    private String title;

    @Column(nullable=false, updatable=false)
    private Instant createdAt = Instant.now();

    protected Project() {}
    public Project(String ownerEmail, String title) {
        this.ownerEmail = ownerEmail;
        this.title = title;
    }

    public Long getId() { return id; }
    public String getOwnerEmail() { return ownerEmail; }
    public String getTitle() { return title; }
    public Instant getCreatedAt() { return createdAt; }
}
