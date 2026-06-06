package com.flowwork.chatservice.controller;

import com.flowwork.chatservice.model.Message;
import com.flowwork.chatservice.service.MessageService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final RabbitTemplate rabbitTemplate;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate,
                                   MessageService messageService,
                                   RabbitTemplate rabbitTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message message) {
        message.setTimestamp(LocalDateTime.now());

        // 1. Guardar en base de datos
        Message savedMessage = messageService.saveMessage(message);

        // 2. Enviar a los suscriptores
        messagingTemplate.convertAndSend("/topic/rooms/" + message.getRoomId(), savedMessage);

        // 3. Publicar a RabbitMQ
        rabbitTemplate.convertAndSend("chat.exchange", "chat.message.sent", savedMessage);
    }
}