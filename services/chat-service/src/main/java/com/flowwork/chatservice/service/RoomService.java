package com.flowwork.chatservice.service;

import com.flowwork.chatservice.model.Room;
import com.flowwork.chatservice.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Transactional
    public Room getOrCreateRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseGet(() -> {
                    Room newRoom = new Room(roomId, "Room " + roomId);
                    return roomRepository.save(newRoom);
                });
    }
}