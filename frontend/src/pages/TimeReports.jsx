import { useState, useEffect, useCallback } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { api } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function TimeReports() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
      setLoading(true);
      try {
        const response = await api.get('/time/entries/Enrique');
        setEntries(response.data);
      } catch (err) {
        console.error('Error cargando reportes:', err);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    const handleTimerStopped = () => loadEntries();
    window.addEventListener('timer-stopped', handleTimerStopped);
    return () => window.removeEventListener('timer-stopped', handleTimerStopped);
  }, [loadEntries]);

  // Datos para el grafico de barras (ultimos 7 dias)
  const getBarChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const dailyHours = last7Days.map(day => {
      const dayEntries = entries.filter(e => e.startTime && e.startTime.startsWith(day));
      return dayEntries.reduce((sum, e) => sum + (e.durationSeconds || 0) / 3600, 0);
    });

    return {
      labels: last7Days.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Horas trabajadas',
        data: dailyHours.map(h => Math.round(h * 100) / 100),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      }],
    };
  };

  // Datos para el grafico circular (por tarea)
  const getPieChartData = () => {
    const taskMap = {};
    entries.forEach(e => {
      const key = `Tarea #${e.taskId}`;
      taskMap[key] = (taskMap[key] || 0) + (e.durationSeconds || 0) / 3600;
    });

    const labels = Object.keys(taskMap);
    const data = Object.values(taskMap).map(v => Math.round(v * 100) / 100);
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0,
      }],
    };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'En curso';
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return '-';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalHours = entries.reduce((sum, e) => sum + (e.durationSeconds || 0) / 3600, 0);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reportes de Tiempo</h2>
        <button
          onClick={loadEntries}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm shadow-md shadow-blue-500/30"
        >
          Refrescar
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Cargando...</p>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-sm text-slate-500">Total de registros</p>
              <p className="text-3xl font-bold text-slate-800">{entries.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-sm text-slate-500">Tiempo total</p>
              <p className="text-3xl font-bold text-slate-800">
                {(() => {
                  const totalSeconds = entries.reduce((sum, e) => sum + (e.durationSeconds || 0), 0);
                  const h = Math.floor(totalSeconds / 3600);
                  const m = Math.floor((totalSeconds % 3600) / 60);
                  const s = totalSeconds % 60;
                  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                })()}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-sm text-slate-500">Tareas distintas</p>
              <p className="text-3xl font-bold text-slate-800">
                {new Set(entries.map(e => e.taskId)).size}
              </p>
            </div>
          </div>

          {/* Graficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">Horas por dia (ultimos 7 dias)</h3>
              <Bar
                data={getBarChartData()}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Horas' } },
                  },
                }}
              />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">Distribucion por tarea</h3>
              <Pie
                data={getPieChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } },
                  },
                }}
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-bold text-slate-600">Tarea ID</th>
                  <th className="text-left p-4 font-bold text-slate-600">Inicio</th>
                  <th className="text-left p-4 font-bold text-slate-600">Fin</th>
                  <th className="text-left p-4 font-bold text-slate-600">Duracion</th>
                  <th className="text-left p-4 font-bold text-slate-600">Descripcion</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr><td colSpan="5" className="text-center p-8 text-slate-400">No hay registros de tiempo aun.</td></tr>
                )}
                {entries.map((entry, index) => (
                  <tr key={index} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium">#{entry.taskId}</td>
                    <td className="p-4 text-sm">{formatDateTime(entry.startTime)}</td>
                    <td className="p-4 text-sm">{formatDateTime(entry.endTime)}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                        {formatDuration(entry.durationSeconds)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{entry.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}