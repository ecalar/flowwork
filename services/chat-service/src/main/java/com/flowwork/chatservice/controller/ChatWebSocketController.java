package com.flowwork.chatservice.controller;

import com.flowwork.chatservice.model.Message;
import com.flowwork.chatservice.service.MessageService;
import com.flowwork.chatservice.service.RoomService;
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
    private final RoomService roomService;
    private final RabbitTemplate rabbitTemplate;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate,
                                   MessageService messageService,
                                   RoomService roomService,
                                   RabbitTemplate rabbitTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.roomService = roomService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message message) {
        System.out.println("Mensaje recibido: roomId=" + message.getRoomId() + ", content=" + message.getContent());
        message.setTimestamp(LocalDateTime.now());

        // Crear la sala si no existe
        roomService.getOrCreateRoom(message.getRoomId());

        // Guardar mensaje
        Message savedMessage = messageService.saveMessage(message);
        System.out.println("Mensaje guardado con ID=" + savedMessage.getId() + ", roomId=" + savedMessage.getRoomId());

        // Enviar a los suscriptores
        messagingTemplate.convertAndSend("/topic/rooms/" + message.getRoomId(), savedMessage);

        // Publicar a RabbitMQ
        rabbitTemplate.convertAndSend("chat.exchange", "chat.message.sent", savedMessage);
    }
}