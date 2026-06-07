package com.flowwork.apigateway.controller;

import com.flowwork.apigateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    // Almacen de usuarios en memoria (clave: username, valor: password)
    private final Map<String, String> users = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Usuario obligatorio");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Contraseña obligatoria");
        }
        if (users.containsKey(username)) {
            throw new RuntimeException("El usuario ya existe");
        }

        users.put(username, password);
        String token = jwtUtil.generateToken(username, "USER");
        return Map.of("token", token, "username", username);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (!users.containsKey(username)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        if (!users.get(username).equals(password)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(username, "USER");
        return Map.of("token", token, "username", username);
    }
}