package com.flowwork.timeservice.repository;

import com.flowwork.timeservice.model.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findByUserIdOrderByStartTimeDesc(String userId);
    List<TimeEntry> findByTaskIdOrderByStartTimeDesc(Long taskId);
    TimeEntry findFirstByUserIdAndEndTimeIsNull(String userId);
}