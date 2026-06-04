package com.flowwork.timeservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
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
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        converter.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.INFERRED);
        return converter;
    }

    @Bean
    public TopicExchange flowworkExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue taskCreatedQueue() {
        return new Queue(TIME_TASK_CREATED_QUEUE, true); // true = la cola sobrevive reinicios
    }

    @Bean
    public Binding taskCreatedBinding(Queue taskCreatedQueue, TopicExchange flowworkExchange) {
        return BindingBuilder.bind(taskCreatedQueue).to(flowworkExchange).with("task.created");
    }
}