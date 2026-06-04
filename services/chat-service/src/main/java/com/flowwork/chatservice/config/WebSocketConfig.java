package com.flowwork.chatservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Punto de conexión inicial. React se conectará a ws://localhost:8080/ws/chat
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*") // En producción aquí iría la URL de tu frontend
                .withSockJS(); // Fallback por si el navegador no soporta WebSockets puros
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // "/topic" es el prefijo para los canales a los que los usuarios se suscribirán (ej. /topic/rooms/1)
        registry.enableSimpleBroker("/topic");

        // "/app" es el prefijo que usarán los clientes para enviar mensajes al servidor
        registry.setApplicationDestinationPrefixes("/app");
    }
}