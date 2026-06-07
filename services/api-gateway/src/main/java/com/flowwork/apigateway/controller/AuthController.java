package com.flowwork.apigateway.controller;

import com.flowwork.apigateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    // Endpoint para simular un login y obtener un JWT válido.
    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String role) {
        return jwtUtil.generateToken(username, role);
    }

    @PostMapping("/register")
    public String register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Usuario obligatorio");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Contraseña obligatoria");
        }

        // En desarrollo, aceptamos cualquier registro y devolvemos token
        return jwtUtil.generateToken(username, "ADMIN");
    }
}