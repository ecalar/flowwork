import { useState } from 'react';
import { api } from '../services/api';

export default function KanbanBoard({ tasks, onTaskUpdated }) {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { key: 'TODO', label: 'Pendientes', color: 'bg-slate-100' },
    { key: 'IN_PROGRESS', label: 'En curso', color: 'bg-blue-100' },
    { key: 'DONE', label: 'Completadas', color: 'bg-green-100' },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e, task) => {
    if (task.status === 'DONE') {
      e.preventDefault();
      return;
    }
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
      e.preventDefault();
      if (!draggedTask) return;

      const task = draggedTask;
      const oldStatus = task.status;

      console.log('Intentando mover tarea', task.id, 'de', oldStatus, 'a', newStatus);

      if (oldStatus === 'DONE') return;
      if (oldStatus === 'TODO' && newStatus === 'DONE') return;
      if (oldStatus === newStatus) return;

      try {
        const payload = {
          title: task.title,
          description: task.description || '',
          status: newStatus,
          projectId: task.project ? task.project.id : (task.projectId || 1),
          assigneeId: task.assigneeId || 'Enrique',
          priority: task.priority || 'MEDIUM',
          dueDate: task.dueDate || new Date().toISOString().split('T')[0]
        };
        console.log('Enviando payload:', payload);

        const response = await api.put(`/tasks/${task.id}`, payload);
        console.log('Respuesta del backend:', response.status, response.data);

        if (newStatus === 'DONE') {
          const selectedTaskId = localStorage.getItem('selectedTaskId');
          if (selectedTaskId == task.id) {
            localStorage.removeItem('selectedTaskId');
            window.dispatchEvent(new Event('taskChanged'));
          }
        }

        onTaskUpdated();
      } catch (err) {
        console.error('Error al mover tarea:', err);
        alert('Error al mover la tarea. Revisa la consola.');
      }

      setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    const colors = { 'HIGH': 'border-l-red-500', 'MEDIUM': 'border-l-yellow-500', 'LOW': 'border-l-green-500' };
    return colors[priority] || 'border-l-slate-300';
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {columns.map((column) => (
        <div
          key={column.key}
          className={`${column.color} rounded-2xl p-4 border border-slate-200`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.key)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 text-sm">{column.label}</h3>
            <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-full">
              {getTasksByStatus(column.key).length}
            </span>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {getTasksByStatus(column.key).map((task) => (
              <div
                key={task.id}
                draggable={task.status !== 'DONE'}
                onDragStart={(e) => handleDragStart(e, task)}
                className={`bg-white p-3 rounded-xl shadow-sm border-l-4 ${getPriorityColor(task.priority)} cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                  task.status === 'DONE' ? 'opacity-60 cursor-default' : ''
                }`}
              >
                <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                )}
                {task.dueDate && (
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(task.dueDate).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            ))}
            {getTasksByStatus(column.key).length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Arrastra tareas aqui
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}