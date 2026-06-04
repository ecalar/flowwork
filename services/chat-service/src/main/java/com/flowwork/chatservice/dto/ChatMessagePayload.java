package com.flowwork.chatservice.dto;

public record ChatMessagePayload(String content, String senderId, Long roomId) {}