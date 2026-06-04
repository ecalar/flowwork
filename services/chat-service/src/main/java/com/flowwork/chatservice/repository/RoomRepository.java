package com.flowwork.chatservice.repository;

import com.flowwork.chatservice.model.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    // Buscar las salas asociadas a un proyecto en concreto
    List<Room> findByProjectId(Long projectId);

    // Útil para evitar crear salas duplicadas con el mismo nombre en un proyecto
    Optional<Room> findByNameAndProjectId(String name, Long projectId);
}