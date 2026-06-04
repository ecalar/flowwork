package com.flowwork.taskservice.dto;

public record TaskEventDto(
        Long taskId,
        String title,
        Long projectId,
        String assigneeId
) {}