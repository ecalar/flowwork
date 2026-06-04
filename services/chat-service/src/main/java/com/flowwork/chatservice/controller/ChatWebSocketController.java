package com.flowwork.chatservice.controller;

import com.flowwork.chatservice.dto.ChatMessagePayload;
import com.flowwork.chatservice.model.entity.Message;
import com.flowwork.chatservice.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate; // Herramienta para enviar mensajes

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    // Ruta de entrada: El cliente envía el mensaje a "/app/chat.sendMessage"
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessagePayload payload) {

        // 1. Guardar el mensaje en la base de datos (PostgreSQL) para tener el historial
        Message savedMessage = chatService.saveMessage(payload.content(), payload.roomId(), payload.senderId());

        // 2. Transmitir (broadcasting) el mensaje a todos los usuarios suscritos a esta sala
        String destination = "/topic/rooms/" + payload.roomId();
        messagingTemplate.convertAndSend(destination, savedMessage);
    }
}