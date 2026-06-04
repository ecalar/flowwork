package com.flowwork.timeservice.dto;

// Este DTO debe coincidir con la estructura de lo que envió el Task Service
public record TaskEventDto(
        Long taskId,
        String title,
        Long projectId,
        String assigneeId
) {}