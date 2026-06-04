package com.flowwork.chatservice.service;

import com.flowwork.chatservice.model.entity.Message;
import com.flowwork.chatservice.model.entity.Room;
import com.flowwork.chatservice.repository.MessageRepository;
import com.flowwork.chatservice.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final RoomRepository roomRepository;
    private final MessageRepository messageRepository;

    public ChatService(RoomRepository roomRepository, MessageRepository messageRepository) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public Room createRoom(String name, Long projectId) {
        // Intentamos buscar si la sala ya existe para no crear duplicados en el mismo proyecto
        return roomRepository.findByNameAndProjectId(name, projectId)
                .orElseGet(() -> roomRepository.save(new Room(name, projectId)));
    }

    public List<Room> getRoomsByProjectId(Long projectId) {
        return roomRepository.findByProjectId(projectId);
    }

    @Transactional
    public Message saveMessage(String content, Long roomId, String senderId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Sala con ID " + roomId + " no encontrada"));

        Message message = new Message(content, room, senderId);
        return messageRepository.save(message);
    }

    public List<Message> getMessageHistory(Long roomId) {
        return messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }
}