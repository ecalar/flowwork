package com.flowwork.taskservice.publisher;

import com.flowwork.taskservice.config.RabbitMQConfig;
import com.flowwork.taskservice.dto.TaskEventDto;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class TaskEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public TaskEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishTaskCreatedEvent(TaskEventDto event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.TASK_CREATED_ROUTING_KEY,
                event
        );
    }

    public void publishTaskCompletedEvent(Long taskId) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.TASK_COMPLETED_ROUTING_KEY,
                taskId.toString()
        );
    }
}