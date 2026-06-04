package com.flowwork.chatservice.listener;

import com.flowwork.chatservice.dto.TaskCompletedEventDto;
import com.flowwork.chatservice.model.entity.Message;
import com.flowwork.chatservice.model.entity.Room;
import com.flowwork.chatservice.service.ChatService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TaskEventListener {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public TaskEventListener(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @RabbitListener(queues = "chat.task.completed.queue")
    public void handleTaskCompleted(TaskCompletedEventDto event) {
        System.out.println("Evento recibido en Chat Service: Tarea Completada ID " + event.taskId());

        // Buscamos si el proyecto de esta tarea tiene alguna sala de chat creada
        List<Room> rooms = chatService.getRoomsByProjectId(event.projectId());

        if (!rooms.isEmpty()) {
            Room mainRoom = rooms.get(0);
            String text = "¡El sistema informa: La tarea '" + event.title() + "' ha sido completada!";

            // Guardamos el mensaje en base de datos como "SYSTEM"
            Message savedMessage = chatService.saveMessage(text, mainRoom.getId(), "SYSTEM");

            // Enviamos el mensaje por WebSocket a todos los usuarios conectados a esa sala
            messagingTemplate.convertAndSend("/topic/rooms/" + mainRoom.getId(), savedMessage);
        }
    }
}