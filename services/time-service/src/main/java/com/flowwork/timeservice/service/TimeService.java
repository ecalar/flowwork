package com.flowwork.timeservice.service;

import com.flowwork.timeservice.model.TimeEntry;
import com.flowwork.timeservice.repository.TimeEntryRepository;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeService {

    private final TimeEntryRepository entryRepository;

    public TimeService(TimeEntryRepository entryRepository) {
        this.entryRepository = entryRepository;
    }

    public TimeEntry startTimer(Long taskId, String userId, Long projectId, String description) {
        TimeEntry activeTimer = entryRepository.findFirstByUserIdAndEndTimeIsNull(userId);
        if (activeTimer != null) {
            throw new RuntimeException("Ya tienes un temporizador activo. Detenlo antes de iniciar otro.");
        }

        TimeEntry newEntry = new TimeEntry();
        newEntry.setTaskId(taskId);
        newEntry.setUserId(userId);
        newEntry.setProjectId(projectId);
        newEntry.setStartTime(LocalDateTime.now());
        newEntry.setDescription(description);
        return entryRepository.save(newEntry);
    }

    public TimeEntry stopTimer(String userId) {
        TimeEntry activeEntry = entryRepository.findFirstByUserIdAndEndTimeIsNull(userId);
        if (activeEntry == null) {
            throw new RuntimeException("No tienes un temporizador activo.");
        }

        activeEntry.setEndTime(LocalDateTime.now());
        long seconds = Duration.between(activeEntry.getStartTime(), activeEntry.getEndTime()).getSeconds();
        activeEntry.setDurationSeconds(seconds);
        return entryRepository.save(activeEntry);
    }

    public List<TimeEntry> getUserEntries(String userId) {
        return entryRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    public List<TimeEntry> getProjectEntries(Long projectId) {
        return entryRepository.findByTaskIdOrderByStartTimeDesc(projectId);
    }
}