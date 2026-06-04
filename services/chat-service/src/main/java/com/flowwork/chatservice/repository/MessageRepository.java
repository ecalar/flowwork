package com.flowwork.chatservice.repository;

import com.flowwork.chatservice.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    // Obtener el historial de mensajes de una sala, ordenados por fecha de más antiguo a más reciente
    List<Message> findByRoomIdOrderByTimestampAsc(Long roomId);
}