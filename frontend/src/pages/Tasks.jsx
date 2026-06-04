import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Esto se ejecuta automáticamente al abrir la página
    const fetchTasks = async () => {
      try {
        // Hacemos un GET al Task Service (asumiendo que el proyecto ID es 1)
        const response = await api.get('/tasks/project/1');
        setTasks(response.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las tareas. ¿Está el backend encendido y el token vigente?");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Gestión de Tareas</h2>

      {loading && <p className="text-blue-500 animate-pulse font-medium">Cargando datos desde el Gateway...</p>}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {task.status || 'PENDIENTE'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ID: {task.id}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">{task.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
              {task.description || 'Sin descripción...'}
            </p>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700">👤 {task.assigneeId}</span>
              <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Ver detalle →
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && tasks.length === 0 && !error && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400">No hay tareas en este proyecto.</p>
        </div>
      )}
    </div>
  );
}