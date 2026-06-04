package com.flowwork.timeservice.service;

import com.flowwork.timeservice.model.entity.TimeRecord;
import com.flowwork.timeservice.repository.TimeRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeService {

    private final TimeRecordRepository timeRecordRepository;

    public TimeService(TimeRecordRepository timeRecordRepository) {
        this.timeRecordRepository = timeRecordRepository;
    }

    @Transactional
    public TimeRecord startTimer(Long taskId) {
        // Evitamos crear múltiples cronómetros para la misma tarea si ya hay uno corriendo
        if (timeRecordRepository.findByTaskIdAndEndTimeIsNull(taskId).isPresent()) {
            throw new RuntimeException("Ya hay un temporizador activo para la tarea " + taskId);
        }
        TimeRecord record = new TimeRecord(taskId, LocalDateTime.now());
        return timeRecordRepository.save(record);
    }

    @Transactional
    public TimeRecord stopTimer(Long taskId) {
        TimeRecord record = timeRecordRepository.findByTaskIdAndEndTimeIsNull(taskId)
                .orElseThrow(() -> new RuntimeException("No hay un temporizador activo para la tarea " + taskId));

        record.setEndTime(LocalDateTime.now());

        // Calcular los minutos transcurridos
        long minutes = Duration.between(record.getStartTime(), record.getEndTime()).toMinutes();
        record.setTotalMinutes(minutes);

        return timeRecordRepository.save(record);
    }

    public List<TimeRecord> getRecordsByTask(Long taskId) {
        return timeRecordRepository.findByTaskId(taskId);
    }
}