import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState(() => {
    return localStorage.getItem('selectedTaskId') || null;
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks/project/1');
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error("Error cargando tareas:", err);
      setError("Error al cargar las tareas.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTask = (taskId) => {
      setSelectedTaskId(taskId);
      localStorage.setItem('selectedTaskId', taskId);
      window.dispatchEvent(new Event('taskChanged'));
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setNewTask({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          title: newTask.title,
          description: newTask.description,
          projectId: editingTask.projectId || 1,
          assigneeId: editingTask.assigneeId || 'Enrique',
          priority: editingTask.priority || 'MEDIUM',
          status: editingTask.status || 'TODO',
          dueDate: editingTask.dueDate || new Date().toISOString().split('T')[0]
        });
      } else {
        await api.post('/tasks', {
          title: newTask.title,
          description: newTask.description,
          projectId: 1,
          assigneeId: 'Enrique',
          priority: 'MEDIUM',
          status: 'TODO',
          dueDate: new Date().toISOString().split('T')[0]
        });
      }
      setIsModalOpen(false);
      setNewTask({ title: '', description: '' });
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      console.error('Error al guardar:', err);
      alert("Error al guardar la tarea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/complete`);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: 'DONE' } : task
        )
      );
      if (selectedTaskId == taskId) {
        localStorage.removeItem('selectedTaskId');
        setSelectedTaskId(null);
      }
    } catch (err) {
      console.error('Error al completar:', err);
      alert("Error al completar la tarea.");
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      if (selectedTaskId == taskId) {
        localStorage.removeItem('selectedTaskId');
        setSelectedTaskId(null);
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert("Error al eliminar la tarea.");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'TODO': 'bg-slate-100 text-slate-600',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'DONE': 'bg-green-100 text-green-700',
      'BACKLOG': 'bg-slate-100 text-slate-600',
    };
    const labels = {
      'TODO': 'Pendiente',
      'IN_PROGRESS': 'En curso',
      'DONE': 'Hecho',
      'BACKLOG': 'Backlog',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status] || styles['TODO']}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="animate-fade-in h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Tareas</h2>
        <button onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-blue-500/30 transition-all">
          + Nueva Tarea
        </button>
      </div>

      {selectedTaskId && (
          <div className="bg-indigo-50 text-indigo-700 p-2.5 rounded-xl mb-4 text-xs font-medium border border-indigo-100 flex items-center justify-between">
            <span>Tarea activa: #{selectedTaskId} — El temporizador y el chat usan esta tarea.</span>
            <button
              onClick={() => {
                  localStorage.removeItem('selectedTaskId');
                  setSelectedTaskId(null);
                  window.dispatchEvent(new Event('taskChanged'));
              }}
              className="text-indigo-400 hover:text-indigo-600 font-bold ml-3"
              title="Desseleccionar tarea"
            >
              x
            </button>
          </div>
      )}

      {loading && <p className="text-blue-500 animate-pulse text-sm">Cargando...</p>}
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 mb-4 text-sm">{error}</div>}

      {!loading && tasks.length === 0 && !error && (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400">No hay tareas. ¡Crea la primera!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id}
            onClick={() => handleSelectTask(task.id, task.status)}
            className={`bg-white p-4 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md flex flex-col ${
              selectedTaskId == task.id ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-100'
            }`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800 text-sm truncate flex-1 mr-2">{task.title}</h3>
              {getStatusBadge(task.status)}
            </div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description || 'Sin descripción'}</p>

            <div className="flex gap-1.5 mt-auto">
              {task.status !== 'DONE' && (
                <button onClick={(e) => { e.stopPropagation(); handleComplete(task.id); }}
                  className="flex-1 text-[9px] bg-green-500 hover:bg-green-600 text-white px-1 py-2 rounded-lg transition-colors font-bold leading-tight">
                  Completar
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                className="flex-1 text-[9px] bg-blue-500 hover:bg-blue-600 text-white px-1 py-2 rounded-lg transition-colors font-bold leading-tight">
                Editar
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                className="flex-1 text-[9px] bg-red-500 hover:bg-red-600 text-white px-1 py-2 rounded-lg transition-colors font-bold leading-tight">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título" />
              <textarea value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción" rows="3" />
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setIsModalOpen(false); setEditingTask(null); setNewTask({ title: '', description: '' }); }}
                  className="flex-1 px-4 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100">Cancelar</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl">
                  {isSubmitting ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}