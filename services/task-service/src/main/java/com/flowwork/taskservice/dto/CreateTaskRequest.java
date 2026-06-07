package com.flowwork.taskservice.dto;

import com.flowwork.taskservice.model.enums.TaskPriority;

import java.time.LocalDate;

public class CreateTaskRequest {
    private String title;
    private String description;
    private Long projectId;
    private String assigneeId;
    private TaskPriority priority;
    private LocalDate dueDate;

    // Getters y Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}