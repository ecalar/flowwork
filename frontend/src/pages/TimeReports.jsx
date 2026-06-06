import { useState, useEffect, useCallback } from 'react';

export default function TimeReports() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(() => {
    const token = localStorage.getItem('flowwork_token')?.replace('Bearer ', '');
    setLoading(true);
    fetch('http://localhost:8084/api/time/entries/Enrique', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setEntries(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error cargando reportes:', err);
      setLoading(false);
    });
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Recargar cuando el Timer se detiene
  useEffect(() => {
    const handleTimerStopped = () => loadEntries();
    window.addEventListener('timer-stopped', handleTimerStopped);
    return () => window.removeEventListener('timer-stopped', handleTimerStopped);
  }, [loadEntries]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'En curso';
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const formatDuration = (totalSeconds) => {
      if (!totalSeconds || totalSeconds === 0) return '-';
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 font-bold text-slate-600">Tarea ID</th>
              <th className="text-left p-4 font-bold text-slate-600">Inicio</th>
              <th className="text-left p-4 font-bold text-slate-600">Fin</th>
              <th className="text-left p-4 font-bold text-slate-600">Duración</th>
              <th className="text-left p-4 font-bold text-slate-600">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="text-center p-8 text-slate-400">Cargando...</td></tr>
            )}
            {!loading && entries.length === 0 && (
              <tr><td colSpan="5" className="text-center p-8 text-slate-400">No hay registros de tiempo aún.</td></tr>
            )}
            {!loading && entries.map((entry, index) => (
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
    </div>
  );
}