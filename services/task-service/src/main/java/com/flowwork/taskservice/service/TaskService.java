package com.flowwork.taskservice.service;

import com.flowwork.taskservice.model.entity.Task;
import com.flowwork.taskservice.model.enums.TaskStatus;
import com.flowwork.taskservice.repository.TaskRepository;
import org.springframework.stereotype.Service;
import com.flowwork.taskservice.dto.CreateTaskRequest;
import com.flowwork.taskservice.model.entity.Project;
import com.flowwork.taskservice.repository.ProjectRepository;
import com.flowwork.taskservice.model.enums.TaskPriority;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    private final ProjectRepository projectRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    }

    public Task createTask(CreateTaskRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(project);
        task.setAssigneeId(request.getAssigneeId());
        task.setPriority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM);
        task.setDueDate(request.getDueDate());
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus(TaskStatus.TODO);

        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task updatedTask) {
        Task task = getTaskById(id);
        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setPriority(updatedTask.getPriority());
        task.setAssigneeId(updatedTask.getAssigneeId());
        task.setStatus(updatedTask.getStatus()); // Añadir esta linea
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public Task completeTask(Long id) {
        Task task = getTaskById(id);
        task.setStatus(TaskStatus.DONE);
        return taskRepository.save(task);
    }
}