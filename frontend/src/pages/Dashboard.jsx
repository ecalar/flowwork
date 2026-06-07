import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalTimeSeconds: 0,
    recentMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // Tareas
      const tasksRes = await api.get('/tasks/project/1');
      const tasks = tasksRes.data;
      const completed = tasks.filter(t => t.status === 'DONE').length;
      const pending = tasks.filter(t => t.status !== 'DONE').length;

      // Tiempo
      let totalSeconds = 0;
      try {
        const username = localStorage.getItem('flowwork_username') || 'Enrique';
        const timeRes = await api.get(`/time/entries/${username}`);
        const timeData = timeRes.data;
        totalSeconds = timeData.reduce((sum, entry) => sum + (entry.durationSeconds || 0), 0);
      } catch (err) {
        console.error('Error cargando tiempo:', err);
      }

      // Chat - usar fetch directo al chat-service para evitar CORS del Gateway
      let messageCount = 0;
      try {
        const token = localStorage.getItem('flowwork_token');
        const chatRes = await fetch('http://localhost:8082/api/chat/rooms/1/messages', {
          headers: { 'Authorization': token }
        });
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          messageCount = chatData.length;
        }
      } catch (err) {
        console.error('Error cargando chat:', err);
      }

      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        totalTimeSeconds: totalSeconds,
        recentMessages: messageCount,
      });
    } catch (err) {
      console.error('Error cargando estadisticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const handleUpdate = () => loadStats();
    window.addEventListener('timer-stopped', handleUpdate);
    window.addEventListener('taskChanged', handleUpdate);
    return () => {
      window.removeEventListener('timer-stopped', handleUpdate);
      window.removeEventListener('taskChanged', handleUpdate);
    };
  }, [loadStats]);

  const formatHHMMSS = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cards = [
    { label: 'Tareas Totales', value: stats.totalTasks },
    { label: 'Completadas', value: stats.completedTasks },
    { label: 'Pendientes', value: stats.pendingTasks },
    { label: 'Tiempo Trabajado', value: formatHHMMSS(stats.totalTimeSeconds) },
    { label: 'Mensajes (Chat)', value: stats.recentMessages },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <button
          onClick={loadStats}
          className="text-sm bg-white hover:bg-slate-50 text-slate-600 font-medium px-4 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          Refrescar
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/tasks" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="font-bold text-slate-800">Gestionar Tareas</p>
          <p className="text-xs text-slate-500">Crear, editar y completar tareas</p>
        </a>
        <a href="/chat" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="font-bold text-slate-800">Sala de Chat</p>
          <p className="text-xs text-slate-500">Mensajeria en tiempo real</p>
        </a>
        <a href="/time-reports" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="font-bold text-slate-800">Reportes de Tiempo</p>
          <p className="text-xs text-slate-500">Historial de horas trabajadas</p>
        </a>
      </div>
    </div>
  );
}