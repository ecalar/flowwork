package com.flowwork.timeservice.controller;

import com.flowwork.timeservice.model.TimeEntry;
import com.flowwork.timeservice.service.TimeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/time")
public class TimeController {

    private final TimeService timeService;

    public TimeController(TimeService timeService) {
        this.timeService = timeService;
    }

    // 1. Iniciar un temporizador
    @PostMapping("/start")
    public TimeEntry startTimer(@RequestBody Map<String, Object> request) {
        Long taskId = Long.valueOf(request.get("taskId").toString());
        String userId = request.get("userId").toString();
        Long projectId = request.get("projectId") != null ? Long.valueOf(request.get("projectId").toString()) : null;
        String description = request.get("description") != null ? request.get("description").toString() : "";
        return timeService.startTimer(taskId, userId, projectId, description);
    }

    // 2. Detener un temporizador
    @PostMapping("/stop")
    public TimeEntry stopTimer(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        return timeService.stopTimer(userId);
    }

    // 3. Ver el historial de un usuario
    @GetMapping("/entries/{userId}")
    public List<TimeEntry> getUserEntries(@PathVariable String userId) {
        return timeService.getUserEntries(userId);
    }

    // 4. Ver el resumen de un proyecto
    @GetMapping("/project/{projectId}")
    public List<TimeEntry> getProjectEntries(@PathVariable Long projectId) {
        return timeService.getProjectEntries(projectId);
    }
}