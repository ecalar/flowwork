package com.flowwork.apigateway.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    // Lista de endpoints que no requieren token
    public static final List<String> openApiEndpoints = List.of(
            "/api/auth/login",
            "/eureka",
            "/ws-chat"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));
}