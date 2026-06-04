package com.flowwork.taskservice.dto;

public record ProjectRequest(
        String name,
        String description,
        String ownerId
) {}