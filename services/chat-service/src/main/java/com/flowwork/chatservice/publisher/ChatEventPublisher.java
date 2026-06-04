package com.flowwork.chatservice.publisher;

import com.flowwork.chatservice.config.RabbitMQConfig;
import com.flowwork.chatservice.dto.ChatMessageEventDto;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public ChatEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishChatMessageSent(Long messageId, String content, Long roomId) {
        ChatMessageEventDto event = new ChatMessageEventDto(messageId, content, roomId);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.CHAT_MESSAGE_SENT_ROUTING_KEY,
                event
        );
        System.out.println("Evento emitido a RabbitMQ: [chat.message.sent] de Sala " + roomId);
    }
}