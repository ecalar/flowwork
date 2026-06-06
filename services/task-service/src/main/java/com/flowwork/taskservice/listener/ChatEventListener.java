package com.flowwork.taskservice.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ChatEventListener {

    @RabbitListener(queues = "chat.message.queue")
    public void handleChatMessage(String message) {
        System.out.println("📩 Evento recibido en Task Service: " + message);
    }
}