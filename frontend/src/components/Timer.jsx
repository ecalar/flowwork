import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [taskId, setTaskId] = useState(() => localStorage.getItem('selectedTaskId') || null);

  const { addToast } = useToast();

  useEffect(() => {
    const checkTask = () => {
      const currentTaskId = localStorage.getItem('selectedTaskId') || null;
      setTaskId(prevTaskId => {
        if (currentTaskId !== prevTaskId) {
          if (isRunning) {
            setIsRunning(false);
            setElapsed(0);
          }
          return currentTaskId;
        }
        return prevTaskId;
      });
    };

    const interval = setInterval(checkTask, 1000);
    window.addEventListener('storage', checkTask);
    window.addEventListener('focus', checkTask);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkTask);
      window.removeEventListener('focus', checkTask);
    };
  }, [isRunning]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    const token = localStorage.getItem('flowwork_token')?.replace('Bearer ', '');
    const currentTaskId = localStorage.getItem('selectedTaskId');
    if (!currentTaskId) return;

    try {
      await fetch('http://localhost:8084/api/time/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          taskId: currentTaskId,
          userId: localStorage.getItem('flowwork_username') || 'Enrique',
          projectId: 1,
          description: 'Trabajando en la tarea'
        })
      });
      setIsRunning(true);
      setStartTime(Date.now());
      addToast('Temporizador iniciado', 'info');
    } catch (error) { console.error('Error al iniciar timer:', error); }
  };

  const handleStop = async () => {
    const token = localStorage.getItem('flowwork_token')?.replace('Bearer ', '');
    try {
      await fetch('http://localhost:8084/api/time/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: 'Enrique' })
      });
      setIsRunning(false);
      setElapsed(0);
      window.dispatchEvent(new CustomEvent('timer-stopped'));
      addToast('Temporizador detenido', 'warning');
    } catch (error) { console.error('Error al detener timer:', error); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 w-full animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-sm">Temporizador</h3>
        <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
      </div>
      <div className="text-2xl font-mono font-bold text-center text-slate-800 mb-3">
        {formatTime(elapsed)}
      </div>
      {taskId ? (
        <p className="text-xs text-slate-400 text-center mb-3">Tarea #{taskId}</p>
      ) : (
        <p className="text-xs text-slate-400 text-center mb-3">Sin tarea seleccionada</p>
      )}
      <div className="flex gap-2">
        {!isRunning ? (
          <button onClick={handleStart} disabled={!taskId}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm">
            Iniciar
          </button>
        ) : (
          <button onClick={handleStop}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm">
            Detener
          </button>
        )}
      </div>
    </div>
  );
}