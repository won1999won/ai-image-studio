package com.example.aiimagestudio.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JobTicker {

    private final JobRepository jobs;

    public JobTicker(JobRepository jobs) {
        this.jobs = jobs;
    }

    // 3초마다 PENDING 몇 개를 DONE으로 전환 (데모용)
    @Scheduled(fixedDelay = 3000)
    @Transactional
    public void tick() {
        jobs.findAll().stream()
            .filter(j -> j.getStatus() == Job.Status.PENDING)
            .limit(5) // 한 번에 처리할 최대 개수 (데모용)
            .forEach(j -> j.setStatus(Job.Status.DONE));
        // @Transactional 덕분에 flush/save 생략 가능 (변경감지)
    }
}
