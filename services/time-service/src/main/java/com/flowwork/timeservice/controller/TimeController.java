package com.flowwork.timeservice.controller;

import com.flowwork.timeservice.model.entity.TimeRecord;
import com.flowwork.timeservice.service.TimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time")
public class TimeController {

    private final TimeService timeService;

    public TimeController(TimeService timeService) {
        this.timeService = timeService;
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<List<TimeRecord>> getRecordsByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeService.getRecordsByTask(taskId));
    }

    @PutMapping("/tasks/{taskId}/stop")
    public ResponseEntity<TimeRecord> stopTimer(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeService.stopTimer(taskId));
    }
}