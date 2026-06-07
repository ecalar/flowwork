package com.flowwork.taskservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "task.exchange";
    public static final String TASK_CREATED_ROUTING_KEY = "task.created";
    public static final String TASK_COMPLETED_ROUTING_KEY = "task.completed";

    @Bean
    public Queue taskCompletedQueue() {
        return new Queue("task.completed.queue", true);
    }

    @Bean
    public Queue taskCreatedQueue() {
        return new Queue("task.created.queue", true);
    }

    @Bean
    public TopicExchange taskExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding taskCompletedBinding() {
        return BindingBuilder.bind(taskCompletedQueue()).to(taskExchange()).with(TASK_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding taskCreatedBinding() {
        return BindingBuilder.bind(taskCreatedQueue()).to(taskExchange()).with(TASK_CREATED_ROUTING_KEY);
    }
}