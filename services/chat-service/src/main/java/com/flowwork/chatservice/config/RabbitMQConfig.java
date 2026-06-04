package com.flowwork.chatservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "flowwork.exchange";
    public static final String CHAT_MESSAGE_SENT_ROUTING_KEY = "chat.message.sent";
    public static final String TASK_COMPLETED_QUEUE = "chat.task.completed.queue";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public TopicExchange flowworkExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // Declaramos nuestra cola exclusiva para este servicio
    @Bean
    public Queue taskCompletedQueue() {
        return new Queue(TASK_COMPLETED_QUEUE, true);
    }

    // Conectamos nuestra cola al Exchange para escuchar el evento "task.completed"
    @Bean
    public Binding taskCompletedBinding(Queue taskCompletedQueue, TopicExchange flowworkExchange) {
        return BindingBuilder.bind(taskCompletedQueue).to(flowworkExchange).with("task.completed");
    }
}