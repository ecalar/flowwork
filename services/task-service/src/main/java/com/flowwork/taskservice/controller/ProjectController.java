package com.flowwork.taskservice.controller;

import com.flowwork.taskservice.dto.ProjectRequest;
import com.flowwork.taskservice.model.entity.Project;
import com.flowwork.taskservice.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody ProjectRequest request) {
        Project project = new Project(request.name(), request.description(), request.ownerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(project));
    }

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(@RequestParam String ownerId) {
        return ResponseEntity.ok(projectService.getProjectsByOwner(ownerId));
    }
}