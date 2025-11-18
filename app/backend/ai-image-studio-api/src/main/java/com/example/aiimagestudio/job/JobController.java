package com.example.aiimagestudio.job;

import com.example.aiimagestudio.auth.JwtUtil;
import com.example.aiimagestudio.common.Req;
import com.example.aiimagestudio.job.dto.JobDtos.*;
import com.example.aiimagestudio.project.Project;
import com.example.aiimagestudio.project.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JobController {

    private final ProjectRepository projects;
    private final JobRepository jobs;
    private final JwtUtil jwt;

    public JobController(ProjectRepository projects, JobRepository jobs, JwtUtil jwt) {
        this.projects = projects; this.jobs = jobs; this.jwt = jwt;
    }

    @PostMapping("/projects/{projectId}/jobs")
    public ResponseEntity<?> create(@RequestHeader(value="Authorization", required=false) String auth,
                                    @PathVariable Long projectId,
                                    @Valid @RequestBody CreateReq req) {
        String token = Req.emailFromBearer(auth);
        String email = jwt.getEmail(token);

        Project p = projects.findById(projectId).orElse(null);
        if (p == null) return Req.Error.of("not_found","프로젝트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        if (!p.getOwnerEmail().equals(email)) return Req.Error.of("forbidden","다른 사용자의 프로젝트입니다.", HttpStatus.FORBIDDEN);

        Job j = jobs.save(new Job(p, req.paramsJson));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new Res(j.getId(), p.getId(), j.getStatus().name(), j.getParamsJson(), j.getCreatedAt()));
    }

    @GetMapping("/projects/{projectId}/jobs")
    public ResponseEntity<?> listByProject(@RequestHeader(value="Authorization", required=false) String auth,
                                           @PathVariable Long projectId) {
        String token = Req.emailFromBearer(auth);
        String email = jwt.getEmail(token);

        Project p = projects.findById(projectId).orElse(null);
        if (p == null) return Req.Error.of("not_found","프로젝트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        if (!p.getOwnerEmail().equals(email)) return Req.Error.of("forbidden","다른 사용자의 프로젝트입니다.", HttpStatus.FORBIDDEN);

        List<Res> list = jobs.findByProjectOrderByIdDesc(p).stream()
                .map(j -> new Res(j.getId(), p.getId(), j.getStatus().name(), j.getParamsJson(), j.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<?> one(@RequestHeader(value="Authorization", required=false) String auth,
                                 @PathVariable Long id) {
        String token = Req.emailFromBearer(auth);
        String email = jwt.getEmail(token);

        return jobs.findById(id)
                .<ResponseEntity<?>>map(j -> {
                    if (!j.getProject().getOwnerEmail().equals(email))
                        return Req.Error.of("forbidden","다른 사용자의 작업입니다.", HttpStatus.FORBIDDEN);
                    var p = j.getProject();
                    return ResponseEntity.ok(new Res(j.getId(), p.getId(), j.getStatus().name(), j.getParamsJson(), j.getCreatedAt()));
                })
                .orElseGet(() -> Req.Error.of("not_found","작업을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }
}
