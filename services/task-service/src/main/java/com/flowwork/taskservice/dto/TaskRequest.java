package com.flowwork.taskservice.dto;

import java.time.LocalDate;

public record TaskRequest(
        String title,
        String description,
        String priority,
        Long projectId,
        String assigneeId,
        LocalDate dueDate
) {}