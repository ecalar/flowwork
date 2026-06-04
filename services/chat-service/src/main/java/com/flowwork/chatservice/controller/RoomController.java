package com.flowwork.chatservice.controller;

import com.flowwork.chatservice.dto.RoomRequest;
import com.flowwork.chatservice.model.entity.Message;
import com.flowwork.chatservice.model.entity.Room;
import com.flowwork.chatservice.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
public class RoomController {

    private final ChatService chatService;

    public RoomController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.createRoom(request.name(), request.projectId()));
    }

    @GetMapping
    public ResponseEntity<List<Room>> getRoomsByProject(@RequestParam Long projectId) {
        return ResponseEntity.ok(chatService.getRoomsByProjectId(projectId));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessageHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.getMessageHistory(roomId));
    }
}