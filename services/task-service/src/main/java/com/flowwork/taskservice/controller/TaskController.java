package com.flowwork.taskservice.controller;

import com.flowwork.taskservice.dto.TaskRequest;
import com.flowwork.taskservice.model.entity.Task;
import com.flowwork.taskservice.model.enums.TaskPriority;
import com.flowwork.taskservice.model.enums.TaskStatus;
import com.flowwork.taskservice.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(TaskPriority.valueOf(request.priority().toUpperCase()));
        task.setAssigneeId(request.assigneeId());
        task.setDueDate(request.dueDate());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(task, request.projectId()));
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasksByProject(@RequestParam Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        TaskStatus newStatus = TaskStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(taskService.updateTaskStatus(id, newStatus));
    }
}