package com.flowwork.taskservice.service;

import com.flowwork.taskservice.dto.TaskEventDto;
import com.flowwork.taskservice.model.entity.Project;
import com.flowwork.taskservice.model.entity.Task;
import com.flowwork.taskservice.model.enums.TaskStatus;
import com.flowwork.taskservice.publisher.TaskEventPublisher;
import com.flowwork.taskservice.repository.ProjectRepository;
import com.flowwork.taskservice.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskEventPublisher eventPublisher; // <-- Inyectamos el publicador

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, TaskEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Task createTask(Task task, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Proyecto con ID " + projectId + " no encontrado"));

        task.setProject(project);
        Task savedTask = taskRepository.save(task);


        TaskEventDto event = new TaskEventDto(
                savedTask.getId(),
                savedTask.getTitle(),
                project.getId(),
                savedTask.getAssigneeId()
        );
        eventPublisher.publishTaskCreatedEvent(event);

        return savedTask;
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @Transactional
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea con ID " + taskId + " no encontrada"));

        task.setStatus(newStatus);
        return taskRepository.save(task);
    }
}