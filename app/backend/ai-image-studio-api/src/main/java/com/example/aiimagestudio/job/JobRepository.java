package com.example.aiimagestudio.job;

import com.example.aiimagestudio.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByProjectOrderByIdDesc(Project project);
}
