package com.example.aiimagestudio;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class HealthController {
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new HashMap<>();
        body.put("ok", true);
        body.put("service", "api");
        body.put("version", "0.1.0");
        return body;
    }
}
