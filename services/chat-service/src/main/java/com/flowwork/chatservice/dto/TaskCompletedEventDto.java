package com.flowwork.chatservice.dto;

public record TaskCompletedEventDto(Long taskId, String title, Long projectId) {}