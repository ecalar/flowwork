package com.flowwork.chatservice.controller;

import com.flowwork.chatservice.dto.ChatMessagePayload;
import com.flowwork.chatservice.model.entity.Message;
import com.flowwork.chatservice.publisher.ChatEventPublisher;
import com.flowwork.chatservice.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatEventPublisher chatEventPublisher; // <-- Nuevo

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate, ChatEventPublisher chatEventPublisher) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
        this.chatEventPublisher = chatEventPublisher;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessagePayload payload) {
        Message savedMessage = chatService.saveMessage(payload.content(), payload.roomId(), payload.senderId());

        // 1. Enviar por WebSocket a los usuarios conectados
        messagingTemplate.convertAndSend("/topic/rooms/" + payload.roomId(), savedMessage);

        // 2. Notificar a RabbitMQ para que otros microservicios lo sepan
        chatEventPublisher.publishChatMessageSent(savedMessage.getId(), savedMessage.getContent(), savedMessage.getRoom().getId());
    }
}