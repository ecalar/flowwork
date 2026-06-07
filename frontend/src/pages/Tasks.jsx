import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import { useToast } from '../context/ToastContext';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState(() => {
    return localStorage.getItem('selectedTaskId') || null;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');

  const { addToast } = useToast();

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const handleSelectTask = (taskId) => {
    setSelectedTaskId(taskId);
    localStorage.setItem('selectedTaskId', taskId);
    window.dispatchEvent(new Event('taskChanged'));
  };

  const handleStartProgress = async (taskId) => {
    setSelectedTaskId(taskId);
    localStorage.setItem('selectedTaskId', taskId);
    window.dispatchEvent(new Event('taskChanged'));

    try {
      const task = tasks.find(t => t.id === taskId);
      await api.put(`/tasks/${taskId}`, {
        ...task,
        status: 'IN_PROGRESS',
        projectId: task.projectId || 1,
        assigneeId: task.assigneeId || 'Enrique',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate || new Date().toISOString().split('T')[0]
      });
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t
        )
      );
      addToast('Tarea iniciada', 'info');
    } catch (err) {
      console.error('Error al iniciar tarea:', err);
      addToast('Error al iniciar tarea', 'error');
    }
  };

  const handlePause = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await api.put(`/tasks/${taskId}`, {
        ...task,
        status: 'TODO',
        projectId: task.projectId || 1,
        assigneeId: task.assigneeId || 'Enrique',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate || new Date().toISOString().split('T')[0]
      });
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: 'TODO' } : t
        )
      );
      addToast('Tarea pausada', 'warning');
    } catch (err) {
      console.error('Error al pausar tarea:', err);
      addToast('Error al pausar tarea', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      dueDate: task.dueDate || ''
    });
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
          priority: newTask.priority,
          status: editingTask.status || 'TODO',
          dueDate: newTask.dueDate || new Date().toISOString().split('T')[0]
        });
      } else {
        await api.post('/tasks', {
          title: newTask.title,
          description: newTask.description,
          projectId: 1,
          assigneeId: 'Enrique',
          priority: newTask.priority,
          status: 'TODO',
          dueDate: newTask.dueDate || new Date().toISOString().split('T')[0]
        });
      }
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      setEditingTask(null);
      addToast(editingTask ? 'Tarea actualizada' : 'Tarea creada', 'success');
      loadTasks();
    } catch (err) {
      console.error('Error al guardar:', err);
      addToast('Error al guardar la tarea', 'error');
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
        window.dispatchEvent(new Event('taskChanged'));
      }
      addToast('Tarea completada', 'success');
    } catch (err) {
      console.error('Error al completar:', err);
      addToast('Error al completar tarea', 'error');
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Eliminar esta tarea?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      if (selectedTaskId == taskId) {
        localStorage.removeItem('selectedTaskId');
        setSelectedTaskId(null);
        window.dispatchEvent(new Event('taskChanged'));
      }
      loadTasks();
      addToast('Tarea eliminada', 'error');
    } catch (err) {
      console.error('Error al eliminar:', err);
      addToast('Error al eliminar tarea', 'error');
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

  const getPriorityBadge = (priority) => {
    const styles = {
      'HIGH': 'bg-red-100 text-red-700',
      'MEDIUM': 'bg-yellow-100 text-yellow-700',
      'LOW': 'bg-green-100 text-green-700',
    };
    const labels = { 'HIGH': 'Alta', 'MEDIUM': 'Media', 'LOW': 'Baja' };
    return (
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${styles[priority] || styles['MEDIUM']}`}>
        {labels[priority] || priority}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'DONE') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Gestion de Tareas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Kanban
          </button>
          <button onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-blue-500/30 transition-all">
            + Nueva Tarea
          </button>
        </div>
      </div>

      {viewMode === 'grid' && (
        <>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los estados</option>
                <option value="TODO">Pendientes</option>
                <option value="IN_PROGRESS">En curso</option>
                <option value="DONE">Completadas</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todas las prioridades</option>
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Media</option>
                <option value="LOW">Baja</option>
              </select>
            </div>
            <p className="text-xs text-slate-500">
              Mostrando {filteredTasks.length} de {tasks.length} tareas
            </p>
          </div>

          {selectedTaskId && (
            <div className="bg-indigo-50 text-indigo-700 p-2.5 rounded-xl mb-4 text-xs font-medium border border-indigo-100 flex items-center justify-between">
              <span>Tarea activa: #{selectedTaskId} - El temporizador y el chat usan esta tarea.</span>
              <button
                onClick={() => {
                  localStorage.removeItem('selectedTaskId');
                  setSelectedTaskId(null);
                  window.dispatchEvent(new Event('taskChanged'));
                }}
                className="text-indigo-400 hover:text-indigo-600 font-bold ml-3"
                title="Desseleccionar tarea"
              >
                X
              </button>
            </div>
          )}

          {loading && <p className="text-blue-500 animate-pulse text-sm">Cargando...</p>}
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 mb-4 text-sm">{error}</div>}

          {!loading && filteredTasks.length === 0 && !error && (
            <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-400">
                {tasks.length === 0 ? 'No hay tareas. Crea la primera!' : 'No se encontraron tareas con esos filtros.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div key={task.id}
                onClick={() => {
                  if (task.status !== 'DONE') handleSelectTask(task.id);
                }}
                className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex flex-col ${
                  task.status === 'DONE'
                    ? 'opacity-60 cursor-default border-slate-100'
                    : 'cursor-pointer hover:shadow-md ' + (selectedTaskId == task.id ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-100')
                } ${isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-red-50/30' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-sm truncate flex-1 mr-2">{task.title}</h3>
                  <div className="flex gap-1">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description || 'Sin descripcion'}</p>
                {task.dueDate && (
                  <p className={`text-[10px] mb-2 ${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                    {isOverdue(task.dueDate, task.status) ? 'VENCIDA: ' : 'Vence: '}
                    {new Date(task.dueDate).toLocaleDateString('es-ES')}
                  </p>
                )}

                {task.status !== 'DONE' && (
                  <div className="flex gap-1.5 mt-auto">
                    {task.status === 'TODO' && (
                      <button onClick={(e) => { e.stopPropagation(); handleStartProgress(task.id); }}
                        className="flex-1 text-[9px] bg-indigo-500 hover:bg-indigo-600 text-white px-1 py-2 rounded-lg transition-colors font-bold leading-tight">
                        Iniciar
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); handlePause(task.id); }}
                          className="flex-1 text-[9px] bg-yellow-500 hover:bg-yellow-600 text-white px-1 py-2 rounded-lg transition-colors font-bold leading-tight">
                          Pausar
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleComplete(task.id); }}
                          className="flex-1 text-[9px] bg-green-500 hover:bg-green-600 text-white px-1 py-2 rounded-lg transition-colors font-bold leading-tight">
                          Completar
                        </button>
                      </>
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
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {viewMode === 'kanban' && (
        <div className="flex-1">
          <KanbanBoard tasks={filteredTasks} onTaskUpdated={loadTasks} />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titulo" />
              <textarea value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripcion" rows="3" />
              <div className="flex gap-3">
                <select value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="LOW">Prioridad Baja</option>
                  <option value="MEDIUM">Prioridad Media</option>
                  <option value="HIGH">Prioridad Alta</option>
                </select>
                <input type="date" value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setIsModalOpen(false); setEditingTask(null); setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' }); }}
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