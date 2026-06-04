package com.flowwork.chatservice.dto;

public record ChatMessageEventDto(Long messageId, String content, Long roomId) {}