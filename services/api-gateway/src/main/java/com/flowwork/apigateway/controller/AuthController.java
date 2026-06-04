package com.flowwork.apigateway.controller;

import com.flowwork.apigateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}