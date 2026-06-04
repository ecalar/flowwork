package com.flowwork.timeservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "flowwork.exchange";
    public static final String TIME_TASK_CREATED_QUEUE = "time.task.created.queue";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public TopicExchange flowworkExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue taskCreatedQueue() {
        return new Queue(TIME_TASK_CREATED_QUEUE, true);
    }

    // Le decimos a RabbitMQ: "Envíame a esta cola todo lo que tenga la etiqueta 'task.created'"
    @Bean
    public Binding taskCreatedBinding(Queue taskCreatedQueue, TopicExchange flowworkExchange) {
        return BindingBuilder.bind(taskCreatedQueue).to(flowworkExchange).with("task.created");
    }
}