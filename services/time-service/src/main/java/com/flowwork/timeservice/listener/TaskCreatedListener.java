package com.flowwork.timeservice.listener;

import com.flowwork.timeservice.dto.TaskEventDto;
import com.flowwork.timeservice.service.TimeService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TaskCreatedListener {

    private final TimeService timeService;

    public TaskCreatedListener(TimeService timeService) {
        this.timeService = timeService;
    }

    @RabbitListener(queues = "time.task.created.queue")
    public void handleTaskCreated(TaskEventDto event) {
        System.out.println("Time Service recibió evento: Tarea creada ID " + event.getTaskId() + ". Iniciando cronómetro...");
        timeService.startTimer(event.getTaskId());
    }
}