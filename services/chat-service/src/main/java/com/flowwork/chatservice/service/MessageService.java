package com.flowwork.chatservice.service;

import com.flowwork.chatservice.model.Message;
import com.flowwork.chatservice.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getMessagesByRoomId(Long roomId) {
        return messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }
}