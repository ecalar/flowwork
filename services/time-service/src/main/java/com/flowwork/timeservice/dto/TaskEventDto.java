package com.flowwork.timeservice.dto;

public class TaskEventDto {

    private Long taskId;
    private String title;
    private Long projectId;
    private String assigneeId;

    // ¡El constructor vacío es el salvavidas de Jackson!
    public TaskEventDto() {}

    public TaskEventDto(Long taskId, String title, Long projectId, String assigneeId) {
        this.taskId = taskId;
        this.title = title;
        this.projectId = projectId;
        this.assigneeId = assigneeId;
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
}