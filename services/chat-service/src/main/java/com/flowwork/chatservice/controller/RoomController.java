package com.flowwork.chatservice.controller;

import com.flowwork.chatservice.model.Message;
import com.flowwork.chatservice.service.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
public class RoomController {

    private final MessageService messageService;

    public RoomController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/{roomId}/messages")
    public List<Message> getMessages(@PathVariable Long roomId) {
        return messageService.getMessagesByRoomId(roomId);
    }
}