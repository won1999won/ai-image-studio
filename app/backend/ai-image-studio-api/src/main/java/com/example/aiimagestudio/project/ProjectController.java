package com.example.aiimagestudio.project;

import com.example.aiimagestudio.auth.JwtUtil;
import com.example.aiimagestudio.common.Req;
import com.example.aiimagestudio.project.dto.ProjectDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projects;
    private final JwtUtil jwt;

    public ProjectController(ProjectRepository projects, JwtUtil jwt) {
        this.projects = projects; this.jwt = jwt;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestHeader(value="Authorization", required=false) String auth,
                                    @Valid @RequestBody CreateReq req) {
        try {
            String token = Req.emailFromBearer(auth);
            String email = jwt.getEmail(token);
            Project p = projects.save(new Project(email, req.title));
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new Res(p.getId(), p.getTitle(), p.getOwnerEmail(), p.getCreatedAt()));
        } catch (IllegalArgumentException e) {
            return Req.Error.of("missing_auth","Authorization: Bearer <token> header required", HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping
    public ResponseEntity<List<Res>> myList(@RequestHeader(value="Authorization", required=false) String auth) {
        String token = Req.emailFromBearer(auth);
        String email = jwt.getEmail(token);
        var list = projects.findByOwnerEmailOrderByIdDesc(email)
                .stream().map(p -> new Res(p.getId(), p.getTitle(), p.getOwnerEmail(), p.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@RequestHeader(value="Authorization", required=false) String auth,
                                 @PathVariable Long id) {
        String token = Req.emailFromBearer(auth);
        String email = jwt.getEmail(token);
        return projects.findById(id)
                .<ResponseEntity<?>>map(p -> {
                    if (!p.getOwnerEmail().equals(email))
                        return Req.Error.of("forbidden","다른 사용자의 프로젝트입니다.", HttpStatus.FORBIDDEN);
                    return ResponseEntity.ok(new Res(p.getId(), p.getTitle(), p.getOwnerEmail(), p.getCreatedAt()));
                })
                .orElseGet(() -> Req.Error.of("not_found","프로젝트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }
}
