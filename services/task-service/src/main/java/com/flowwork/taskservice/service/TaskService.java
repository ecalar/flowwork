package com.flowwork.taskservice.service;

import com.flowwork.taskservice.model.entity.Project;
import com.flowwork.taskservice.model.entity.Task;
import com.flowwork.taskservice.model.enums.TaskStatus;
import com.flowwork.taskservice.repository.ProjectRepository;
import com.flowwork.taskservice.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public Task createTask(Task task, Long projectId) {
        // 1. Buscamos el proyecto. Si no existe, lanzamos excepción.
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Proyecto con ID " + projectId + " no encontrado"));

        // 2. Asociamos el proyecto a la tarea
        task.setProject(project);

        // 3. Guardamos en base de datos
        // NOTA: En el próximo paso, aquí emitiremos el evento RabbitMQ 'task.created'
        return taskRepository.save(task);
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @Transactional
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea con ID " + taskId + " no encontrada"));

        task.setStatus(newStatus);

        // NOTA: En el próximo paso, si newStatus == DONE, emitiremos el evento a RabbitMQ
        return taskRepository.save(task);
    }
}