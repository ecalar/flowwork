package com.flowwork.timeservice.repository;

import com.flowwork.timeservice.model.entity.TimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeRecordRepository extends JpaRepository<TimeRecord, Long> {
    List<TimeRecord> findByTaskId(Long taskId);

    // Buscar un cronómetro que esté corriendo (que no tenga fecha de fin) para una tarea
    Optional<TimeRecord> findByTaskIdAndEndTimeIsNull(Long taskId);
}