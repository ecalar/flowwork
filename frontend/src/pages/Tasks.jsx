import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Llamada limpia usando params
        const response = await api.get('/tasks', {
          params: { projectId: 1 }
        });
        setTasks(response.data);
      } catch (err) {
        console.error("Error cargando tareas:", err);
        setError("Error al cargar las tareas. Revisa la consola.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/tasks', {
        title: newTask.title,
        description: newTask.description,
        projectId: 1,
        assigneeId: 'Enrique',
        priority: 'MEDIUM', // Añadimos valor por defecto para no romper el backend
        dueDate: new Date().toISOString().split('T')[0] // Fecha hoy
      });

      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '' });
    } catch (err) {
      console.error(err);
      alert("Error al crear la tarea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in relative h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Tareas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-500/30"
        >
          + Nueva Tarea
        </button>
      </div>

      {loading && <p className="text-blue-500 animate-pulse font-medium">Cargando...</p>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
            <p className="text-sm text-slate-500">{task.description}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Crear Nueva Tarea</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                placeholder="Título"
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                placeholder="Descripción"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}