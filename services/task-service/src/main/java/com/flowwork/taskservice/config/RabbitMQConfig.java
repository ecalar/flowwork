package com.flowwork.taskservice.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "flowwork.exchange";
    public static final String TASK_CREATED_ROUTING_KEY = "task.created";
    public static final String TASK_COMPLETED_ROUTING_KEY = "task.completed";

    // Convertidor para que los mensajes viajen en formato JSON y no en bytes incomprensibles
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // El Exchange es como el router de la oficina de correos
    @Bean
    public TopicExchange flowworkExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }
}